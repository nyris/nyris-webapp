import "core-js/stable";
import "regenerator-runtime/runtime";

import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App, { AppProps, Screen } from "./App";
import NyrisAPI, {
  elementToCanvas,
  getRectSize,
  getThumbSizeLongestEdge,
  ImageSearchOptions,
  NyrisAPISettings,
  OfferNyrisResult,
  RectCoords,
  Region,
  SearchResult,
  selectFirstCenteredRegion,
  urlOrBlobToCanvas,
} from "@nyris/nyris-api";
import { ResultProps } from "./Result";
import { makeFileHandler } from "@nyris/nyris-react-components";

interface NyrisSettings extends NyrisAPISettings {
  instantRedirectPatterns: string[];
  initiatorElementId: string;
}

class Nyris {
  private nyrisApi: NyrisAPI;
  private screen: Screen = Screen.Hidden;
  private results: ResultProps[] = [];
  private readonly mountPoint: HTMLElement;

  private image: HTMLCanvasElement = document.createElement("canvas");
  private thumbImageUrl: string = "";
  private err: string = "";
  private regions: Region[] = [];
  private selection: RectCoords = { x1: 0, x2: 1, y1: 0, y2: 1 };
  private readonly instantRedirectPatterns: string[];
  private loading: boolean = false;

  constructor(settings: NyrisSettings) {
    this.nyrisApi = new NyrisAPI(settings);
    this.instantRedirectPatterns = settings.instantRedirectPatterns || [];

    let mountPoint = document.getElementById("nyris-mount-point");
    if (!mountPoint) {
      console.warn("#nyris-mount-point not found. Attaching widget to body");
      mountPoint = document.body;
    }
    this.mountPoint = mountPoint;

    this.showScreen(Screen.Hidden);

    if (settings.initiatorElementId) {
      document.body.addEventListener("click", (event) => {
        // @ts-ignore
        const isVisualSearchElement = event?.target?.closest(
          `#${settings.initiatorElementId}`
        );

        if (isVisualSearchElement) {
          this.toggleNyris();
        }
      });
    }
  }

  render() {
    let appProps: AppProps = {
      image: this.image,
      errorMessage: this.err,
      showScreen: this.screen,
      onRestart: () => this.restart(),
      onClose: () => this.closeAndReset(),
      onRefine: () => this.refineSelection(),
      onToggle: () => this.toggleNyris(),
      onAcceptCrop: (s) => this.acceptCrop(s),
      onFile: makeFileHandler((f: any) => this.handleFile(f)),
      onFileDropped: (f) => this.handleFile(f),
      results: this.results,
      regions: this.regions,
      selection: this.selection,
      thumbnailUrl: this.thumbImageUrl,
      showVisualSearchIcon: window.nyrisSettings.initiatorElementId
        ? false
        : true,
      onSimilarSearch: (f) => this.handleFile(f),
      loading: this.loading,
    };
    ReactDOM.render(
      <React.StrictMode>
        <App {...appProps} />
      </React.StrictMode>,
      this.mountPoint
    );
  }

  closeAndReset() {
    this.showScreen(Screen.Hidden);
  }

  restart() {
    this.showScreen(Screen.Hello);
    // TODO this.dom.window.removeClass('nyris__main--wide');
  }

  async updateThumbnail() {
    const { w, h } = getRectSize(this.selection);
    let scaledSize = getThumbSizeLongestEdge(100, 100, w, h);
    this.thumbImageUrl = elementToCanvas(
      this.image,
      scaledSize,
      this.selection
    ).toDataURL();
  }

  async acceptCrop(s: RectCoords) {
    this.selection = s;
    await this.updateThumbnail();
    await this.startProcessing();
  }

  async showRefineSearch(regions: Region[]) {
    if (regions.length === 0) {
      this.regions.push({
        normalizedRect: { x1: 0.1, x2: 0.9, y1: 0.1, y2: 0.9 },
      });
    }
    await this.selectRegion(this.regions[0]);
    this.showScreen(Screen.Refine);
  }

  async selectRegion(selectedRegion: Region) {
    this.selection = selectedRegion.normalizedRect;
  }

  async refineSelection() {
    try {
      await this.showRefineSearch(this.regions);
    } catch (err: any) {
      this.err = err.toString();
      this.showScreen(Screen.Fail);
    }
  }

  async handleFile(f: File | string) {
    this.image = await urlOrBlobToCanvas(f);
    this.regions = [];

    this.showScreen(Screen.Wait);

    try {
      this.regions = await this.nyrisApi.findRegions(this.image);
    } catch (e) {
      console.warn("Could not get regions", e);
    }

    this.selection = this.preselectDefaultRegion(this.regions);

    await this.startProcessing();
  }

  showScreen(s: Screen) {
    this.screen = s;
    this.render();
  }

  toggleNyris() {
    this.showScreen(
      this.screen === Screen.Hidden ? Screen.Hello : Screen.Hidden
    );
  }

  renderResults(results: OfferNyrisResult[]) {
    this.results = results.map((offer: any) => ({
      title: offer.title,
      imageUrl: offer?.image,
      links: offer.links,
      sku: offer.sku,
    }));

    this.showScreen(Screen.Result);
  }

  preselectDefaultRegion(regions: Region[]) {
    const defaultRect = { x1: 0.1, x2: 0.9, y1: 0.1, y2: 0.9 };
    return selectFirstCenteredRegion(regions, 0.3, defaultRect);
  }

  async startProcessing() {
    // this.showScreen(Screen.Wait);
    this.loading = true;
    this.render();
    try {
      await this.updateThumbnail();

      let options: ImageSearchOptions = {
        cropRect: this.selection,
      };

      const searchResult = await this.nyrisApi.find(options, this.image);
      if (
        searchResult.results.length === 1 &&
        this.shouldRedirect(searchResult)
      ) {
        // @ts-ignore
        window.location.href = searchResult.results[0].l;
        return;
      }
      this.loading = false;
      this.renderResults(searchResult.results);
    } catch (e: any) {
      this.loading = false;
      this.err = e.toString();
      return this.showScreen(Screen.Fail);
    }
  }

  private shouldRedirect(searchResult: SearchResult): boolean {
    const firstLink = searchResult.results[0].l || "";
    const instantRedirectPatterns = this.instantRedirectPatterns;
    return (
      instantRedirectPatterns.find((r) => new RegExp(r).test(firstLink)) !==
      undefined
    );
  }
}

declare global {
  interface Window {
    nyrisSettings: NyrisSettings;
  }
}

window.addEventListener("load", (e) => {
  console.log("loading widget");
  let div = document.createElement("div");
  div.id = "nyris-mount-point";
  document.body.appendChild(div);
  const nyris = new Nyris(window.nyrisSettings);
});

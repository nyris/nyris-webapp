import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React, { ChangeEvent } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
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
  urlOrBlobToCanvas,
} from '@nyris/nyris-api';
import packageJson from '../package.json';
import { FeedbackStatus } from './type';
import { AppProps, NyrisSettings, ResultProps, WidgetScreen } from './types';

const DEFAULT_RECT = { x1: 0, x2: 1, y1: 0, y2: 1 };

class Nyris {
  private nyrisApi: NyrisAPI;
  private screen: WidgetScreen = WidgetScreen.Hidden;
  private results: ResultProps[] = [];
  private readonly mountPoint: HTMLElement;

  private image: HTMLCanvasElement = document.createElement('canvas');
  private thumbImageUrl: string = '';
  private err: string = '';
  private regions: Region[] = [];
  private selection: RectCoords = { x1: 0, x2: 1, y1: 0, y2: 1 };
  private readonly instantRedirectPatterns: string[];
  private loading: boolean = false;
  private firstSearchImage: HTMLCanvasElement =
    document.createElement('canvas');
  private firstSearchResults: ResultProps[] = [];

  private feedbackStatus: FeedbackStatus;
  private requestId = '';

  constructor(nyrisSettings: NyrisSettings) {
    this.nyrisApi = new NyrisAPI({ ...nyrisSettings });
    this.instantRedirectPatterns = nyrisSettings.instantRedirectPatterns || [];
    this.feedbackStatus = 'hidden';
    let mountPoint = document.getElementById('nyris-mount-point');
    if (!mountPoint) {
      console.warn('#nyris-mount-point not found. Attaching widget to body');
      mountPoint = document.body;
    }
    this.mountPoint = mountPoint;

    this.showScreen(WidgetScreen.Hidden);

    if (nyrisSettings.initiatorElementId) {
      console.log('Nyris.widget.VERSION:', packageJson.version);

      document.body.addEventListener('click', event => {
        let isVisualSearchElement = false;
        if (typeof nyrisSettings.initiatorElementId === 'object') {
          isVisualSearchElement = nyrisSettings.initiatorElementId.some(id => {
            // @ts-ignore
            if (event?.target?.id === id && id != '') return true;
            return false;
          });
        }
        if (typeof nyrisSettings.initiatorElementId === 'string') {
          // @ts-ignore
          isVisualSearchElement = event?.target?.closest(
            `#${nyrisSettings.initiatorElementId}`,
          );
        }
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
      onAcceptCrop: (s, preFilter) => this.acceptCrop(s, preFilter),
      onFile: (e: ChangeEvent | DragEvent, preFilter) => {
        const changeEvent = e as ChangeEvent;
        let file = null;

        if (changeEvent && changeEvent.target) {
          const fileInput = changeEvent.target as HTMLInputElement;
          if (fileInput.files && fileInput.files[0]) {
            file = fileInput.files[0];
          }

          // reset input
          if (fileInput.value) {
            fileInput.value = '';
          }
          if (file) {
            this.handleFile(file, true, preFilter);
          }
        }

        const dragEvent = e as DragEvent;
        if (dragEvent) {
          file = dragEvent.dataTransfer && dragEvent.dataTransfer.files[0];
        }

        if (file) {
          this.handleFile(file, true, preFilter);
        }
      },
      onFileDropped: (f, preFilter) => {
        this.handleFile(f, true, preFilter);
      },
      onGoBack: () => this.onGoBack(),
      results: this.results,
      regions: this.regions,
      selection: this.selection,
      thumbnailUrl: this.thumbImageUrl,
      showVisualSearchIcon: !window.nyrisSettings.initiatorElementId,
      onSimilarSearch: (f, preFilter) => this.handleFile(f, false, preFilter),
      firstSearchImage: this.firstSearchImage,
      loading: this.loading,
      cadenasScriptStatus: 'disabled',
      submitFeedback: data => this.submitFeedback(data),
      feedbackStatus: this.feedbackStatus,
      setFeedbackStatus: (status: FeedbackStatus) =>
        this.setFeedbackStatus(
          this.feedbackStatus === 'submitted' ? 'submitted' : status,
        ),
      getPreFilters: () => this.getPreFilters(),
      searchFilters: (key: any, value: string) =>
        this.searchFilters(key, value),
    };
    ReactDOM.render(
      <React.StrictMode>
        <App {...appProps} />
      </React.StrictMode>,
      this.mountPoint,
    );
  }

  closeAndReset() {
    this.showScreen(WidgetScreen.Hidden);
  }

  restart() {
    this.showScreen(WidgetScreen.Hello);
    // TODO this.dom.window.removeClass('nyris__main--wide');
  }

  setFeedbackStatus(status: FeedbackStatus) {
    this.feedbackStatus = status;

    this.render();
  }

  async submitFeedback(data: boolean) {
    this.nyrisApi.sendFeedback({
      requestId: this.requestId,
      payload: {
        event: 'feedback',
        data: { success: data },
      },
    });
  }

  async updateThumbnail() {
    const { w, h } = getRectSize(this.selection);
    let scaledSize = getThumbSizeLongestEdge(100, 100, w, h);
    this.thumbImageUrl = elementToCanvas(
      this.image,
      scaledSize,
      this.selection,
    ).toDataURL();
  }

  async acceptCrop(s: RectCoords, preFilter?: string[]) {
    this.selection = s;
    await this.updateThumbnail();
    await this.startProcessing(false, preFilter);
  }

  async showRefineSearch(regions: Region[]) {
    if (regions.length === 0) {
      this.regions.push({
        normalizedRect: DEFAULT_RECT,
      });
    }
    await this.selectRegion(this.regions[0]);
    this.showScreen(WidgetScreen.Refine);
  }

  async selectRegion(selectedRegion: Region) {
    this.selection = selectedRegion.normalizedRect;
  }

  async refineSelection() {
    try {
      await this.showRefineSearch(this.regions);
    } catch (err: any) {
      this.err = err.toString();
      this.showScreen(WidgetScreen.Fail);
    }
  }

  async handleFile(
    f: File | string,
    isFirstSearch: boolean,
    preFilter?: string[],
  ) {
    this.image = await urlOrBlobToCanvas(f);
    if (isFirstSearch) {
      this.firstSearchImage = this.image;
    }
    this.regions = [];

    this.showScreen(WidgetScreen.Wait);

    try {
      const foundRegions = await this.nyrisApi.findRegions(this.image);
      this.regions = foundRegions;
      this.selection = this.getRegionByMaxConfidence(foundRegions);
    } catch (e) {
      console.warn('Could not get regions', e);
    }

    await this.startProcessing(isFirstSearch, preFilter);
  }

  async getPreFilters() {
    return this.nyrisApi
      .getFilters(1000)
      .then(res => {
        const arrResult =
          res.find(
            value => value.key === window.nyrisSettings.searchCriteriaKey,
          )?.values || [];

        const newResult = arrResult.sort().reduce((a: any, c: any) => {
          if (!c[0]) return a;
          let k = c[0]?.toLocaleUpperCase();
          if (a[k]) a[k].push(c);
          else a[k] = [c];
          return a;
        }, {});

        return newResult;

        // setResultFilter(newResult);
        // setColumns(Object.keys(newResult).length);
      })
      .catch((e: any) => {
        console.log('err getDataFilterDesktop', e);
      })
      .finally(() => {});
  }

  async searchFilters(key: any = '', value: string) {
    const newValue = value ? value : '';
    return this.nyrisApi.searchFilters(key, newValue).then(res => {
      return { [res[0][0].toLocaleUpperCase()]: res };
    });
  }

  showScreen(s: WidgetScreen) {
    this.screen = s;
    this.render();
  }

  toggleNyris() {
    this.showScreen(
      this.screen === WidgetScreen.Hidden
        ? WidgetScreen.Hello
        : WidgetScreen.Hidden,
    );
  }

  renderResults(results: OfferNyrisResult[], isFirstSearch: boolean) {
    this.results = results.map((result: any) => ({
      title: result.title,
      imageUrl: result?.image,
      links: result.links,
      sku: result.sku,
      metadata: result.metadata,
      filters: result.filters,
    }));
    if (isFirstSearch) {
      this.firstSearchResults = JSON.parse(JSON.stringify(this.results));
    }

    this.showScreen(WidgetScreen.Result);
  }

  onGoBack = () => {
    this.results = JSON.parse(JSON.stringify(this.firstSearchResults));
    this.image = this.firstSearchImage;
    this.setFeedbackStatus('submitted');

    this.render();
  };

  getRegionByMaxConfidence = (regions: Region[]) => {
    if (regions.length === 0) {
      return DEFAULT_RECT;
    }
    const regionWithMaxConfidence = regions.reduce((prev, current) => {
      prev.confidence = prev.confidence || 0;
      current.confidence = current.confidence || 0;
      return prev.confidence >= current.confidence ? prev : current;
    });
    return regionWithMaxConfidence.normalizedRect;
  };

  extractPreFilterFromUrl(url: string) {
    const regex = /\/ip40_([^\/]+)\/#/;
    const match = url.match(regex);
    return match && match[1] ? match[1] : null;
  }

  async startProcessing(
    isFirstSearch: boolean,
    selectedPreFilters: string[] = [],
  ) {
    // this.showScreen(WidgetScreen.Wait);
    this.setFeedbackStatus('hidden');
    this.loading = true;
    this.render();

    try {
      await this.updateThumbnail();
      const prefilterFromUrl = this.extractPreFilterFromUrl(
        window.location.href,
      );

      let prefilters;

      if (
        selectedPreFilters.length > 0 &&
        window.nyrisSettings.searchCriteriaKey
      ) {
        prefilters = [
          {
            key: window.nyrisSettings.searchCriteriaKey,
            values: selectedPreFilters,
          },
        ];
      }

      if (prefilterFromUrl) {
        prefilters = [
          { key: 'brand', values: [prefilterFromUrl.toLocaleUpperCase()] },
        ];
      }

      let options: ImageSearchOptions = {
        cropRect: this.selection,
      };

      const searchResult = await this.nyrisApi.find(
        options,
        this.image,
        prefilters,
      );

      this.requestId = searchResult.id;

      if (
        searchResult.results.length === 1 &&
        this.shouldRedirect(searchResult)
      ) {
        // @ts-ignore
        window.location.href = searchResult.results[0].l;
        return;
      }
      this.loading = false;
      if (window.nyrisSettings.feedback && searchResult.results.length > 0) {
        setTimeout(() => {
          // window.removeEventListener('scroll', handleScroll, { capture: true });
          if (this.feedbackStatus === 'hidden') {
            this.setFeedbackStatus('visible');
          }
        }, 2500);
      }
      this.renderResults(searchResult.results, isFirstSearch);
    } catch (e: any) {
      this.loading = false;
      this.err = e.toString();
      return this.showScreen(WidgetScreen.Fail);
    }
  }

  private shouldRedirect(searchResult: SearchResult): boolean {
    const firstLink = searchResult.results[0].l || '';
    const instantRedirectPatterns = this.instantRedirectPatterns;
    return (
      instantRedirectPatterns.find(r => new RegExp(r).test(firstLink)) !==
      undefined
    );
  }
}

declare global {
  interface Window {
    nyrisSettings: NyrisSettings;
  }
}

(window as any).loadWidget = () => {
  let div = document.createElement('div');
  div.id = 'nyris-mount-point';
  document.body.appendChild(div);
  if (!window.nyrisSettings.language) {
    window.nyrisSettings.language = 'en';
  }
  const nyris = new Nyris(window.nyrisSettings);
};

window.addEventListener('load', e => {
  let div = document.createElement('div');
  div.id = 'nyris-mount-point';
  document.body.appendChild(div);
  if (!window.nyrisSettings.language) {
    window.nyrisSettings.language = 'en';
  }
  const nyris = new Nyris(window.nyrisSettings);
});

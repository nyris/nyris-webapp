import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App, {AppProps, Screen} from './App';
import NyrisAPI, {
    urlOrBlobToCanvas,
    getElementSize, getThumbSizeLongestEdge,
    NyrisAPISettings,
    RectCoords,
    Region,
    SearchResult,
    OfferNyrisResult, elementToCanvas, ImageSearchOptions
} from "@nyris/nyris-api";
import {ResultProps} from "./Result";
import {makeFileHandler} from "@nyris/nyris-react-components";


interface NyrisSettings extends NyrisAPISettings {
    instantRedirectPatterns: string[]
}

class Nyris {
    private nyrisApi: NyrisAPI;
    private screen: Screen = Screen.Hidden;
    private results: ResultProps[] = [];
    private readonly mountPoint: HTMLElement;
    private image: HTMLCanvasElement = document.createElement('canvas');
    private thumbImageUrl: string = '';
    private err: string = '';
    private regions: Region[] = [];
    private selection: RectCoords = {x1: 0, x2: 1, y1: 0, y2: 1};
    private readonly instantRedirectPatterns: string[];


    constructor(settings: NyrisSettings) {
        this.nyrisApi = new NyrisAPI(settings);
        this.instantRedirectPatterns = settings.instantRedirectPatterns || [];

        let mountPoint = document.getElementById('nyris-mount-point');
        if (!mountPoint) {
            console.warn("#nyris-mount-point not found. Attaching widget to body");
            mountPoint = document.body;
        }
        this.mountPoint = mountPoint;

        this.showScreen(Screen.Hidden);
    }

    render() {
        let appProps : AppProps = {
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
        const originalSize = getElementSize(this.image);
        let scaledSize = getThumbSizeLongestEdge(100, 100, originalSize.w, originalSize.h);

        this.thumbImageUrl = elementToCanvas(this.image, scaledSize, this.selection).toDataURL();
    }

    async acceptCrop(s: RectCoords) {
        this.selection = s;
        await this.updateThumbnail();
        await this.startProcessing();
    }

    async showRefineSearch(regions: Region[]) {
        if (regions.length === 0) {
            this.regions.push({normalizedRect: { x1: 0.1, x2: 0.9, y1: 0.1, y2: 0.9 }});
        }
        await this.selectRegion(this.regions[0]);
        this.showScreen(Screen.Refine);
    }

    async selectRegion(selectedRegion: Region) {
        this.selection = selectedRegion.normalizedRect;
    }

    async refineSelection() {
        this.showScreen(Screen.Wait);
        try {
            const regions = await this.nyrisApi.findRegions(this.image);
            this.regions = regions;
            await this.showRefineSearch(regions);
        } catch (err) {
            this.err = err.toString();
            this.showScreen(Screen.Fail);
        }
    }


    async handleFile(f: File) {
        this.image = await urlOrBlobToCanvas(f);
        await this.startProcessing();
    }

    showScreen(s: Screen) {
        this.screen = s;
        this.render();
    }

    toggleNyris() {
        this.showScreen(this.screen === Screen.Hidden ? Screen.Hello : Screen.Hidden);
    }

    renderResults(results: OfferNyrisResult[]) {
        this.results = results.map((offer:any) => ({
            title: offer.title,
            imageUrl: offer.img.url,
            link: offer.l,
            price:  offer.p ? `${(offer.p.vi / 100).toFixed(2)} ${offer.p.c}` : ''
        }));

        this.showScreen(Screen.Result);
    }

    async startProcessing() {
        this.showScreen(Screen.Wait);
        try {
            await this.updateThumbnail();
            let options : ImageSearchOptions = {
                cropRect: this.selection
            };
            const searchResult = await this.nyrisApi.findByImage(this.image, options);
            if (searchResult.results.length === 1 && this.shouldRedirect(searchResult)) {
                const firstLink = searchResult.results[0].l;
                // @ts-ignore
                window.location.href = firstLink;
                return;
            }
            this.renderResults(searchResult.results);
        } catch (e) {
            this.err = e.toString();
            return this.showScreen(Screen.Fail);
        }
    }

    private shouldRedirect(searchResult: SearchResult): boolean {
        const firstLink = searchResult.results[0].l || '';
        const instantRedirectPatterns = this.instantRedirectPatterns;
        return instantRedirectPatterns
            .find(r => new RegExp(r).test(firstLink)) !== undefined;
    }
}

declare global {
    interface Window {
        nyrisSettings: NyrisSettings
    }
}

window.addEventListener("load", (e) => {
    console.log("loading widget");
    let div = document.createElement('div');
    div.id = 'nyris-mount-point';
    document.body.prepend(div);

    const nyris = new Nyris(window.nyrisSettings);
});



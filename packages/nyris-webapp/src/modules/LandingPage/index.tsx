import React, { useCallback, useEffect, useState } from "react";
import {
    RectCoords,
    cadExtensions,
    isCadFile,
    isImageFile,
} from "@nyris/nyris-api";

import { useAppDispatch, useAppSelector } from "Store/Store";
import {
    loadCadFileLoad,
    setSearchResults,
    loadingActionResults,
    searchFileImageNonRegion, selectionChanged, setRequestImage, setRegions, setSelectedRegion,
} from "Store/Search";
import {
    feedbackNegative,
    feedbackSubmitPositive,
    hideFeedback,
    showCamera,
    showFeedback,
    showResults,
    showStart,
} from "Store/Nyris";
import {createImage, findByImage, findRegions} from "services/image";
import { debounce } from "lodash";
import {feedbackClickEpic, feedbackRegionEpic, feedbackSuccessEpic} from "services/Feedback";
import AppMD from "./AppMD";
import App from "./App";
import {AppHandlers, AppProps} from "./propsType";
import {defaultMdSettings} from "../../defaults";

const LandingPageApp = () => {
    const dispatch = useAppDispatch();
    const searchState = useAppSelector((state) => state);
    const defaultSelection = {x1: 0.1, x2: 0.9, y1: 0.1, y2: 0.9};
    const [selection, setSelection] = useState<RectCoords>(defaultSelection);

    const { settings, search, nyris } = searchState;
    const {
        fetchingRegions,
        fetchingResults,
        requestImage,
        selectedRegion,
    } = search;
    const { showPart } = nyris;

    // update selection, if it is not the default one
    useEffect(() => {
        if (selectedRegion) {
            setSelection(selectedRegion);
        } else {
            setSelection(defaultSelection);
        }
    }, [selectedRegion, defaultSelection]);

    const acceptTypes = ["image/*"]
        .concat(settings.cadSearch ? cadExtensions : [])
        .join(",");


    function scrollTop() {
        // TODO might require polyfill for ios and edge
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }

    const onLinkClick = (_position: number, url: string) => {
        feedbackClickEpic(searchState, _position).catch(console.warn);
        if (url) {
            window.open(url);
        }
    };
    // TODO: search image file home page
    const searchByFile = async (file: File | HTMLCanvasElement | string) => {
        dispatch(loadingActionResults());
        dispatch(showResults());
        dispatch(showFeedback());
        if ((file instanceof File && isImageFile(file)) || typeof file === "string") {
            let image = await createImage(file);
            dispatch(setRequestImage(image));
            let searchRegion : RectCoords | undefined;
            if (settings.regions) {
                let {
                    regions: foundRegions,
                    selectedRegion: suggestedRegion
                } = await findRegions(image, settings);
                searchRegion = suggestedRegion;
                dispatch(setRegions(foundRegions));
                dispatch(setSelectedRegion(searchRegion))
            }
            return findByImage(image, searchState.settings, searchRegion).then((res) => {
                dispatch(setSearchResults(res));
            });
        }
        if (file instanceof File && isCadFile(file)) {
            return dispatch(loadCadFileLoad(file));
        }
    };
    //

    const searchByUrl = async (url: string, position?: number) => {
        dispatch(loadingActionResults());
        dispatch(showResults());
        if (position) {
            feedbackClickEpic(searchState, position);
        }

        let image = await createImage(url);
        dispatch(setRequestImage(image));

        let searchRegion : RectCoords | undefined;
        if (settings.regions) {
            let {
                regions: foundRegions,
                selectedRegion: suggestedRegion
            } = await findRegions(image, settings);
            searchRegion = suggestedRegion;
            dispatch(setRegions(foundRegions));
            dispatch(setSelectedRegion(searchRegion));
        }
        findByImage(image, searchState.settings, searchRegion).then((res) => {
            dispatch(setSearchResults(res));
            dispatch(showFeedback());
        });
    };

    const debouncedSetRectCoords = useCallback(
        debounce(value => {
            dispatch(selectionChanged(value));
            feedbackRegionEpic(searchState, value);
            findByImage(requestImage!!.canvas, settings, value).then((res) => {
                dispatch(searchFileImageNonRegion(res));
                dispatch(showFeedback());
            }).catch(e => console.warn('catch', e));
        }, 1200),
        [requestImage, searchState]
    );

    const handlers : AppHandlers = {
        onExampleImageClick: url => searchByUrl(url),
        onCameraClick: () => dispatch(showCamera),
        onCaptureCanceled: () => dispatch(showStart),
        onCaptureComplete: (i) => searchByFile(i),
        onCloseFeedback: () => dispatch(hideFeedback),
        onFileDropped: (f) => searchByFile(f),
        onImageClick: (position, url) => searchByUrl(url, position),
        onLinkClick: onLinkClick,
        onPositiveFeedback: () => {
            dispatch(feedbackSubmitPositive());
            feedbackSuccessEpic(searchState, true);
        },
        onNegativeFeedback: () => {
            dispatch(feedbackNegative());
            feedbackSuccessEpic(searchState, false);
        },
        onSelectFile: (f) => searchByFile(f),
        onSelectionChange: r => {
            setSelection(r);
            debouncedSetRectCoords(r);
        },
        onShowStart: () => {
            dispatch(showStart());
            scrollTop();
        }
    };

    let props : AppProps = {
        search: {
            ...search,
            previewSelection: selection
        },
        settings,
        previewImage: search.requestImage,
        acceptTypes,
        showPart,
        handlers,
        loading: fetchingRegions || fetchingResults,
        mdSettings: settings.themePage.materialDesign || defaultMdSettings,
        feedbackState: nyris.feedbackState,

    };

    return settings.themePage.materialDesign?.active? <AppMD {...props}/> : <App {...props}/>;

};

export default LandingPageApp;

import React, { useCallback, useEffect, useState } from "react";
import {
    RectCoords,
    cadExtensions,
    isCadFile,
    isImageFile,
    ImageSearchOptions,
} from "@nyris/nyris-api";

import { useAppDispatch, useAppSelector } from "Store/Store";
import {
    loadCadFileLoad,
    setSearchResults,
    loadFileSelectRegion,
    loadingActionRegions,
    loadingActionResults,
    searchFileImageNonRegion,
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
import { serviceImage, serviceImageNonRegion } from "services/image";
import { findByImage } from "services/findByImage";
import { debounce, isEmpty } from "lodash";
import { feedbackClickEpic } from "services/Feedback";
import AppMD from "./AppMD";
import App from "./App";
import {AppHandlers, AppProps} from "./propsType";
import {defaultMdSettings} from "../../defaults";

const LandingPageApp = () => {
    const dispatch = useAppDispatch();
    const searchState = useAppSelector((state) => state);
    const [rectCoords, setRectCoords] = useState<any>();
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

    const isDefaultRect = (r: RectCoords) => r.x1 === 0 && r.x2 === 1 && r.y1 === 0 && r.y2 === 1;

    // update selection, if it is not the default one
    useEffect(() => {
        if (!isDefaultRect(selectedRegion)) {
            setSelection(selectedRegion);
        }
    }, [selectedRegion]);


    useEffect(() => {
        if (isEmpty(rectCoords)) {
            return;
        }
        onSearchOffersForImage(rectCoords);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rectCoords]);

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
    const isCheckImageFile = (file: any) => {
        dispatch(loadingActionResults());
        dispatch(showResults());
        dispatch(showFeedback());
        if (isImageFile(file) || typeof file === "string") {
            return serviceImage(file, searchState.settings).then((res) => {
                dispatch(setSearchResults(res));
            });
        }
        if (isCadFile(file)) {
            return dispatch(loadCadFileLoad(file));
        }
    };
    //

    const searchByUrl = (url: string, position?: number) => {
        dispatch(loadingActionResults());
        dispatch(showResults());
        if (position) {
            feedbackClickEpic(searchState, position);
        }

        if (settings.regions) {
            serviceImage(url, searchState.settings).then((res) => {
                dispatch(setSearchResults(res));
                dispatch(showFeedback());
            });
        } else {
            serviceImageNonRegion(url, searchState, rectCoords).then((res) => {
                dispatch(searchFileImageNonRegion(res));
                dispatch(showFeedback());
            });
        }
    };

    const handlerRectCoords = debounce((value) => {
        return setRectCoords(value);
    }, 1200);

    const debouncedSetRectCoords = useCallback(
        (value) => handlerRectCoords(value),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const onSearchOffersForImage = (r: RectCoords) => {
        const { canvas }: any = requestImage;
        let options: ImageSearchOptions = {
            cropRect: r,
        };
        dispatch(loadingActionRegions());
        return findByImage(canvas, options, settings).then((res) => {
            dispatch(loadFileSelectRegion(res));
            return dispatch(showFeedback());
        });
    };

    const handlers : AppHandlers = {
        onExampleImageClick: url => searchByUrl(url),
        onCameraClick: () => dispatch(showCamera),
        onCaptureCanceled: () => dispatch(showStart),
        onCaptureComplete: (i) => isCheckImageFile(i),
        onCloseFeedback: () => dispatch(hideFeedback),
        onFileDropped: (f) => isCheckImageFile(f),
        onImageClick: (position, url) => searchByUrl(url, position),
        onLinkClick: onLinkClick,
        onPositiveFeedback: () => {
            dispatch(feedbackSubmitPositive());
            // TODO submit positive feedback to the api
        },
        onNegativeFeedback: () => {
            dispatch(feedbackNegative());
            // TODO submit negative feedback to the api
        },
        onSelectFile: (f) => isCheckImageFile(f),
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

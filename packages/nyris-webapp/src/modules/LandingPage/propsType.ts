import {CategoryPrediction, Code, RectCoords, Region} from "@nyris/nyris-api";
import {AppSettings, CanvasWithId, MDSettings} from "../../types";
import {NyrisAppPart, NyrisFeedbackState} from "../../Store/Nyris";

export interface AppHandlers {
    onExampleImageClick: (url: string) => void;
    onImageClick: (position: number, url: string) => void;
    onLinkClick: (position: number, url: string) => void;
    onFileDropped: (file: File) => void;
    onCaptureComplete: (image: HTMLCanvasElement) => void;
    onCaptureCanceled: () => void;
    onSelectFile: (f: File) => void;
    onCameraClick: () => void;
    onShowStart: () => void;
    onSelectionChange: (r: RectCoords) => void;
    onPositiveFeedback: () => void;
    onNegativeFeedback: () => void;
    onCloseFeedback: () => void;
}


export interface AppProps {
    search: {
        results: any[];
        requestId?: string;
        duration?: number;
        categoryPredictions: CategoryPrediction[];
        codes: Code[];
        filterOptions: string[];
        errorMessage?: string;
        regions: Region[];
        previewSelection: RectCoords;
        toastErrorMessage?: string;
    };
    acceptTypes: string,
    previewImage?: CanvasWithId;
    settings: AppSettings;
    loading: boolean;
    showPart: NyrisAppPart;
    feedbackState: NyrisFeedbackState;
    handlers: AppHandlers;
    mdSettings: MDSettings;
}

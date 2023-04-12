import {ChangeEvent} from "react";

export type FileHandler = (f: File) => void;

export const makeFileHandler = (fh: FileHandler) => (e: ChangeEvent | DragEvent) => {
    let file = null;

    const changeEvent = e as ChangeEvent;
    if (changeEvent && changeEvent.target) {
        const fileInput = changeEvent.target as HTMLInputElement;
        if (fileInput.files && fileInput.files[0]) {
            file = fileInput.files[0];
        }

        // reset input
        if (fileInput.value) {
            fileInput.value = "";
        }
        if (file) {
            return fh(file);
        }
    }

    const dragEvent = e as DragEvent;
    if (dragEvent) {
        file = (dragEvent.dataTransfer && dragEvent.dataTransfer.files[0]);
    }

    if (file) {
        return fh(file);
    }
};

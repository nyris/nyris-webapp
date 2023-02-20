import {isEmpty} from "lodash";

export const prepareImageList = (dataItem: any) => {
    let valueKey = [];
    const newObject = dataItem;

    if (!dataItem) {
        return [];
    }

    for (let key in newObject) {
        if (key?.includes('recognition_image_link')) {
            if (!isEmpty(newObject[key])) {
                valueKey.push({
                    url: newObject[key],
                });
            }
        } else {
            if (key === 'main_image_link') {
                valueKey.push({
                    url: newObject[key],
                });
            }
        }
    }
    return valueKey;
};
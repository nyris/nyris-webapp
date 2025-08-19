import { isEmpty } from 'lodash';

export const prepareImageList = (dataItem: any) => {
  let valueKey = [];
  const newObject = dataItem;

  if (!dataItem) {
    return [];
  }

  for (let key in newObject) {
    if (
      key?.includes('image(recognition)') ||
      key?.includes('additional_image_link')
    ) {
      if (!isEmpty(newObject[key])) {
        if (newObject[key]) {
          valueKey.push({
            url: newObject[key],
          });
        }
      }
    } else {
      if (
        key === 'image(main_similarity)' ||
        key === 'main_image_link' ||
        key === 'images'
      ) {
        if (newObject[key]) {
          valueKey.push({
            url: newObject[key],
          });
        }
      }
    }
  }
  return valueKey;
};

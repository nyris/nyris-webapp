import { isEmpty } from 'lodash';

export const prepareImageList = (dataItem: any) => {
  let valueKey = [];
  const newObject = dataItem;

  if (!dataItem) {
    return [];
  }

  for (let key in newObject) {
    if (key?.includes('image(recognition)')) {
      if (!isEmpty(newObject[key])) {
        valueKey.push({
          url: newObject[key],
        });
      }
    } else {
      if (key === 'image(main_similarity)') {
        valueKey.push({
          url: newObject[key],
        });
      }
    }
  }
  return valueKey;
};

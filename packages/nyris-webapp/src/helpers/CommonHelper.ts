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
      if (key === 'image(main_similarity)' || key === 'main_image_link') {
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

export const isHEIC = (file: File) => {
  if (!file) return false;
  if (!file.name) return false;
  // Check extension (case insensitive)
  const ext =
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif');

  // Check MIME type
  const mime =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.type === 'image/heic-sequence';

  return ext || mime;
};

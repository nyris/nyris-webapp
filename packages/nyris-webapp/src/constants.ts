import img1 from 'common/assets/images/imageCaptureHelp/img-1-1.png';
import img2 from 'common/assets/images/imageCaptureHelp/img-1-2.png';
import img3 from 'common/assets/images/imageCaptureHelp/img2-1.png';
import img4 from 'common/assets/images/imageCaptureHelp/img2-2.png';
import img5 from 'common/assets/images/imageCaptureHelp/img3-1.png';
import img6 from 'common/assets/images/imageCaptureHelp/img3-2.png';
import img7 from 'common/assets/images/imageCaptureHelp/img4-1.png';
import img8 from 'common/assets/images/imageCaptureHelp/img4-2.png';
import img9 from 'common/assets/images/imageCaptureHelp/img5-1.png';
import img10 from 'common/assets/images/imageCaptureHelp/img5-2.png';
import img11 from 'common/assets/images/imageCaptureHelp/img6-1.png';
import img12 from 'common/assets/images/imageCaptureHelp/img6-2.png';

export const DEFAULT_REGION = { x1: 0, x2: 1, y1: 0, y2: 1 };

export const visualSearchHelp = [
  {
    title: 'SELECT THE RIGHT IMAGE AREA',
    description:
      'The main object should occupy the major part of the image. Use the cropping tool available to crop the image and remove excess background.',
    imageLeft: img1,
    imageRight: img2,
  },
  {
    title: 'PICTURE CLARITY',
    description: 'The image should not be blurred or out of focus.',
    imageLeft: img3,
    imageRight: img4,
  },
  {
    title: 'OPTIMAL LIGHTING',
    description:
      'The images should be taken in a bright area or use your camera’s flash to take a well-lit picture.',
    imageLeft: img5,
    imageRight: img6,
  },
  {
    title: 'MONOCHROME BACKGROUND',
    description:
      'The object should be placed on a plain and light background and patterned background should be avoided.',
    imageLeft: img7,
    imageRight: img8,
  },
  {
    title: 'VISIBILITY OF THE OBJECT',
    description:
      'Click an image encapsulating most of the object’s key components.',
    imageLeft: img9,
    imageRight: img10,
  },
  {
    title: 'OCR CAPTURE',
    description:
      'It is recommended to take a clear picture of the text on the typeplate etc, to ensure that the model can detect the text and give accurate results.',
    imageLeft: img11,
    imageRight: img12,
  },
];

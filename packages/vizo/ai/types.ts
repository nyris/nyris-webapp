export const TOOL = {
  IMAGE_ANALYSIS: 'IMAGE_ANALYSIS',
  IMAGE_ASSESSMENT: 'IMAGE_ASSESSMENT',
  OCR_DETECTION: 'OCR_DETECTION',
} as const;

export interface OcrAssessmentDataType {
  hasOcrContent?: boolean;
  ocrContent?: string;
  brandName?: string;
  productName?: string;
  sku?: string;
}

export interface ImageAssessmentDataType extends OcrAssessmentDataType {
  imageQuality?: string;
  hasValidObject?: boolean;
  numOfObjects?: string;
  objectVisibility?: string;
  isRelevantObject?: boolean;
}

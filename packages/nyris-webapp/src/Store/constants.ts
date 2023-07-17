import { AppSettings } from '../types';

export const defaultSettings: AppSettings = {
  xOptions: false,
  apiKey: 'UNSET',
  preview: true,
  regions: false,
  maxWidth: 500,
  maxHeight: 500,
  jpegQuality: 0.92,
  baseUrl: 'https://api.nyris.io',
  instantRedirectPatterns: [
    '^https?://(www.)?youtube.com/',
    '^https?://(www.)?youtu.be/',
    '^https?://(www.)?vimeo.com/',
    '^https?://(www.)?dailymotion.com/',
    '^https?://(www.)?dai.ly/',
  ],
  theme: {},
  field: {
    ctaLinkField: '',
    productName: '',
    productDetails: '',
    manufacturerNumber: '',
    productTag: '',
    warehouseNumber: '',
    warehouseNumberValue: '',
    warehouseShelfNumber: '',
    warehouseShelfNumberValue: '',
    warehouseStock: '',
    warehouseStockValue: '',
  },
};

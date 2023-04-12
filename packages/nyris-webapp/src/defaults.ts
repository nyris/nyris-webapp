import { AppSettings } from './types';

export const defaultSettings: AppSettings = {
  xOptions: false,
  apiKey: 'UNSET',
  exampleImages: [],
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
};

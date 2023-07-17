var settings = {
  apiKey: 'xxx',
  maxWidth: 500,
  maxHeight: 500,
  jpegQuality: 0.9,
  regions: true,
  preview: true,
  baseUrl: 'https://api.nyris.io',
  xOptions: '',
  instantRedirectPatterns: [
    '^https?://(www.)?youtube.com/',
    '^https?://(www.)?youtu.be/',
    '^https?://(www.)?vimeo.com/',
    '^https?://(www.)?dailymotion.com/',
    '^https?://(www.)?dai.ly/',
  ],
};
settings['customSearchRequest'] = null;
settings['responseHook'] = null;

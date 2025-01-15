var settings = {
  auth0: {
    enabled: '',
    domain: '',
    clientId: '',
    supportEmail: '',
  },
  algolia: {
    apiKey: '',
    appId: '',
    indexName: '',
  },
  alogoliaFilterField: 'keyword',
  refinements: [
    {
      attribute: 'brand',
      header: 'Brands',
    },
    {
      attribute: 'keyword_0',
      header: 'Category',
    },
  ],
  // Nyris - visual search
  apiKey: '',
  baseUrl: 'https://api.nyris.io',
  jpegQuality: 0.9,
  maxHeight: 1024,
  maxWidth: 1024,
  regions: true,
  responseFormat: 'application/offers.complete+json',
  visualSearchFilterKey: '',
  shouldUseUserMetadata: '',
  // UI - theme
  theme: {
    appBarLogoUrl: '',
    headerColor: '',
    logoHeight: '',
    logoWidth: '',
    primaryColor: '',
    secondaryColor: '',
  },
  // Card Results
  mainTitle: '',
  secondaryTitle: '',
  productDetails: 'keyword_1',
  attributes: {
    attributeOneLabelValue: '',
    attributeOneValue: '',
    attributeTwoLabelValue: '',
    attributeTwoValue: '',
    attributeThreeLabelValue: '',
    attributeThreeValue: '',
    attributeFourLabelValue: '',
    attributeFourValue: '',
  },
  secondaryCTAButton: {
    secondaryCTAButton: '',
    secondaryCTAButtonText: '',
    secondaryCTAButtonTextColor: '',
    secondaryCTAButtonColor: '',
    secondaryCTAIcon: '',
    secondaryCTALinkField: '',
  },
  CTAButton: {
    CTAButton: true,
    CTAButtonText: '',
    CTAButtonTextColor: '',
    CTAButtonColor: '',
    CTAIcon: '',
    CTALinkField: '',
  },
  language: 'en',
  // productDetailsAttribute
  productDetailsAttribute: [
    {
      propertyName: '',
      value: '',
    },
  ],
  // features
  showPoweredByNyris: '',
  postFilterOption: '',
  preFilterOption: '',
  experienceVisualSearch: false,
  experienceVisualSearchImages: [],
  simpleCardView: false,
  noSimilarSearch: false,
  showFeedback: false,
  rfq: {
    enabled: '',
    emailTemplateId: '',
  },
  support: {
    enabled: '',
    emailInquiry: '',
    emailTemplateId: '',
    supportNumber: '',
    description: '',
    prefilterFieldName: '',
  },
  cadenas: {
    catalog: '',
    cadenasAPIKey: '',
    cadenas3dWebView: '',
  },
  //UI - labels
  appTitle: '',
  headerText: '',
  preFilterTitle: '',
};
settings['customSearchRequest'] = null;
settings['responseHook'] = null;

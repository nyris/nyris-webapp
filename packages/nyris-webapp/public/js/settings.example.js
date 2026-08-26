var settings = {
  auth0: {
    enabled: '',
    domain: '',
    clientId: '',
    supportEmail: '',
  },
  algolia: {
    enabled: false,
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
  // When auth0.enabled is true, leave apiKey empty — the app uses Auth0 claim
  apiKey: '',
  aiApiKey: '',
  baseUrl: 'https://api.nyris.io',
  jpegQuality: 0.9,
  maxHeight: 1024,
  maxWidth: 1024,
  regions: true,
  responseFormat: 'application/offers.complete+json',
  visualSearchFilterKey: '',
  shouldUseUserMetadata: '',
  requestContentType: 'multipart/form-data', // use 'image/jpeg' for elastic search
  textSearchScoring: {
    sku: { exactMatch: 50, startsWith: 30 },
    customIds: { exactMatch: 40, startsWith: 6, partial: 2 },
    title: { exactMatch: 25, partial: 10 },
    brand: { exactMatch: 15, startsWith: 6, partial: 2 },
    links: { searchable: false },
    'customIds.gtin': { searchable: false }, // for nested fields use dot notation
    otherFields: { exactMatch: 8, startsWith: 6, partial: 2 },
  },
  vizo: {
    groundingEnabled: false,
    fallbackToElasticSearch: false,
    chat: true,
    findRelatedParts: true,
  },
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
  cart: {
    enabled: true,
    buttonText: 'Add to cart',
    emailTemplateId: 'template_h3rt2pi',
  },
  showPoweredByNyris: '',
  postFilterOption: '',
  preFilterOption: '',
  experienceVisualSearch: false,
  experienceVisualSearchImages: [],
  simpleCardView: false,
  noSimilarSearch: false,
  useSmartFilters: false,
  showFeedback: false,
  geoLocation: false,
  geoLocationMessage: '',
  showImageDetails: false,
  supportButtonLabel: 'Request a Quote',
  rfq: {
    enabled: '',
    emailTemplateId: '',
  },
  scopeFilter: true,
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

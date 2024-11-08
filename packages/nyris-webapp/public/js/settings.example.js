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
    CTAButtonColor: '',
    CTAButtonTextColor: '',
    secondaryCTAButtonColor: '',
    mainTextColor: '',
    brandFieldBackground: '',
    brandFieldPadding: '',
  },
  language: 'en',
  // features
  showPoweredByNyris: '',
  warehouseVariant: false,
  postFilterOption: '',
  preFilterOption: '',
  experienceVisualSearch: false,
  experienceVisualSearchImages: [],
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
  },
  cadenas: {
    catalog: '',
    cadenasAPIKey: '',
    cadenas3dWebView: '',
  },
  //UI - labels
  appTitle: '',
  brandName: '',
  headerText: '',
  itemIdLabel: 'SKU',
  preFilterTitle: '',
  CTAButtonText: 'View More',
  secondaryCTAButtonText: 'Configure Now',

  //field mappins
  field: {
    ctaLinkField: 'main_offer_link',
    secondaryCTALinkField: 'main_offer_link',
    productName: 'title',
    productDetails: 'keyword_1',
    manufacturerNumber: 'keyword_0',
    productTag: 'brand',
    //WarehouseVariant
    warehouseNumber: 'custom_id_key_2',
    warehouseNumberValue: 'custom_id_value_2',
    warehouseShelfNumber: 'custom_id_key_1',
    warehouseShelfNumberValue: 'custom_id_value_1',
    warehouseStock: 'custom_id_key_3',
    warehouseStockValue: 'custom_id_value_3',
  },
};
settings['customSearchRequest'] = null;
settings['responseHook'] = null;

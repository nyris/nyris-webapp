var settings = {
  apiKey: "ZKbb76cwHmBUoXR4uqwD5PqaJK3wobdZ",
  // apiKeyDMGMori: 'nlLoWoR4GqT1BVbdkYiVsp85oMokpzMS',
  maxWidth: 300,
  maxHeight: 300,
  jpegQuality: 0.9,
  regions: true,
  preview: true,
  useRecommendations: false,
  xOptions:
    "default +estimated-category similarity.threshold=0.05 similarity.threshold.discard=0.05 exact.threshold.perfect=200 similarity.threshold.perfect=2 scoring.indicative-min-hits=1 scoring.promo-min-hits=20 scoring.interpolation-cutoff=0 +barcode +barcode-detection",
  baseUrl: "https://api.i.nyris.io",
  resultTemplate: "default",
  responseFormat: "application/offers.complete+json",
  exampleImages: [
    "https://storage.googleapis.com/nyris/share/examples_search/example_1.jpg",
    "https://storage.googleapis.com/nyris/share/examples_search/example_2.jpg",
    "https://storage.googleapis.com/nyris/share/examples_search/example_3.jpg",
    "https://storage.googleapis.com/nyris/share/examples_search/example_4.jpg",
  ],
  deactivated: false,
  cadSearch: false,
  themePage: {
    default: {
      active: false,
    },
    materialDesign: {
      active: false,
      appBarLogoUrl: "https://nyris.io/wp-content/themes/nyris/img/logo.svg",
      appBarTitle: "",
      appBarCustomBackgroundColor: "black",
      appBarCustomTextColor: "white",

      primaryColor: "#e31b5d",
      secondaryColor: "#ccc",
      resultFirstRowProperty: "title",
      resultSecondRowProperty: "price",
      resultLinkText: "show",
      resultLinkIcon: "eye",
    },
    searchSuite: {
      active: true,
      moreInfoText: "more info",
    },
  },
  imageMatchingUrl: "https://api.nyris.io/find/v1",
  imageMatchingUrlBySku: "https://api.nyris.io/recommend/v1",
  imageMatchingSubmitManualUrl: "https://api.nyris.io/find/v1/manual",
  regionProposalUrl: "https://api.nyris.io/find/v1/regions",
  feedbackUrl: "https://api.nyris.io/feedback/v1",
  algolia: {
    apiKey: "6d20d5463452614ea94aae323d8d038e",
    appId: "HBDJYUK5G4",
    indexName: "dmg-mori",
  },
  refinements: [
    {
      type: "list",
      header: "Brands",
      attribute: "brand",
    },
    {
      type: "list",
      header: "Norm",
      attribute: "keyword_0",
      options: {
        searchable: true,
      },
    },
    {
      type: "list",
      header: "Category",
      attribute: "custom_category",
    },
  ],
  autocompleteSearchConfig: {
    placeholders: ["brand", "keyword_0", "custom_category"],
    debouncing: 800,
    detachedMediaQuery: "(max-width: 776px)",
  },
  filterType:'machineType'
};
settings["customSearchRequest"] = null;
settings["responseHook"] = null;

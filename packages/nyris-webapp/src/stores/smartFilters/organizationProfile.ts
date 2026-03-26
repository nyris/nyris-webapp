/**
 * Organization Profile
 *
 * Defines the structure for per-organization prompt customization.
 * Each profile stores frozen (pre-tested) prompts for P2, P3, P5.
 * If p2Prompt/p3Prompt/p5Prompt are set, they are used directly.
 * If empty, prompts are dynamically generated from profile fields as fallback.
 */

import {
  RS_P2_PROMPT, RS_P3_PROMPT, RS_P5_PROMPT,
  GC_P2_PROMPT, GC_P3_PROMPT, GC_P5_PROMPT,
} from './frozenPrompts';

export interface OrganizationProfile {
  /** Organization display name (e.g. "RS Components") */
  orgName: string;
  /** nyris API key for this customer's index */
  nyrisApiKey: string;
  /** Product domain description (e.g. "industrial electrical components and spare parts") */
  productDomain: string;
  /** Comma-separated example product types (e.g. "light blocks, contactors, bearings") */
  exampleProducts: string;
  /** Comma-separated example brand names (e.g. "Schneider Electric, Siemens, ABB") */
  exampleBrands: string;
  /** Comma-separated key differentiating attributes (e.g. "voltage, current rating, IP rating") */
  keyAttributes: string;
  /** Filter priority order (e.g. "VOLTAGE > BRAND > TYPE > DIMENSIONS > MATERIAL") */
  filterPriority: string;
  /** Example P2 good result description (1-2 sentences) */
  exampleGoodResult: string;
  /** Example P2 bad result description (1-2 sentences) */
  exampleBadResult: string;
  /** Example P3 filter-narrowing response (1-2 sentences) */
  exampleFilterNarrow: string;
  /** Pipe-separated brand terms for regex extraction (e.g. "SIEMENS|BOSCH|SKF") */
  brandRegexTerms: string;
  /** Pipe-separated product type terms for regex extraction (e.g. "bearing|housing|spindle") */
  productTypeRegexTerms: string;
  /** Frozen P2 system prompt (Result Evaluator). If empty, dynamically generated from profile fields. */
  p2Prompt: string;
  /** Frozen P3 system prompt (Good Results Chat). If empty, dynamically generated from profile fields. */
  p3Prompt: string;
  /** Frozen P5 system prompt (Bad Results Recovery). If empty, dynamically generated from profile fields. */
  p5Prompt: string;
  /** Customer-specific overrides merged into window.settings on load (apiKey, attributes, theme, labels, etc.) */
  settingsOverrides: Record<string, any>;
}

export const RS_COMPONENTS_PRESET: OrganizationProfile = {
  orgName: 'RS Components',
  nyrisApiKey: 'hVxjODlsbdgFMZ3XTktUralCrjVM58zi',
  productDomain: 'industrial electrical components and spare parts',
  exampleProducts: 'light blocks, contactors, bearings, relays, motors, sensors, fans, controllers',
  exampleBrands: 'Schneider Electric, Siemens, ABB, Phoenix Contact, Bosch, SKF',
  keyAttributes: 'voltage, current rating, IP rating, material, dimensions',
  filterPriority: 'VOLTAGE > BRAND > TYPE > DIMENSIONS > MATERIAL',
  exampleGoodResult: 'I see a Schneider Electric ZBV-B6 light block — this is an LED indicator module typically used in industrial push button assemblies. Found 20 matching parts across different voltage ratings and series. You can filter by voltage, brand, or model.',
  exampleBadResult: 'This appears to be a precision bearing ring, commonly used in rotating machinery. The results show various industrial parts that may not be an exact match. Try filtering by product type or material to find closer alternatives.',
  exampleFilterNarrow: 'I\'ve filtered the results to show only light blocks — these are the LED/lamp modules used inside Schneider Electric push button assemblies. Showing 14 light blocks out of the original 20 results. You can narrow further by voltage rating or specific model series.',
  brandRegexTerms: 'DMG|MORI|SIEMENS|FANUC|HAAS|MAZAK|OKUMA|HEIDENHAIN|BOSCH|SKF|NSK|FAG|INA|TIMKEN',
  productTypeRegexTerms: 'spacer\\s*ring|rotor[- ]?ring|bearing|housing|ring|deckel|lid|spindle|mandrino|chuck|collet|tool\\s*holder',
  p2Prompt: RS_P2_PROMPT,
  p3Prompt: RS_P3_PROMPT,
  p5Prompt: RS_P5_PROMPT,
  settingsOverrides: {
    apiKey: 'hVxjODlsbdgFMZ3XTktUralCrjVM58zi',
    appTitle: 'RS Components Visual Search',
    headerText: 'RS Components Visual Search',
    language: 'en',
    theme: {
      appBarLogoUrl: 'https://storage.googleapis.com/product-data-public/RS%20Components/logo/RS_LOGO_CMYK_reversed.jpg',
      headerColor: '#ffffff',
      logoHeight: '54px',
      logoWidth: '100px',
      primaryColor: '#ef0000',
      secondaryColor: '#32000F',
    },
    attributes: {
      productAttributes: true,
      attributeOneLabelValue: 'MPN',
      attributeOneValue: 'ids.mpn',
      attributeTwoLabelValue: 'MPM Original',
      attributeTwoValue: 'ids.mpn_original',
      attributeThreeLabelValue: 'GTIN',
      attributeThreeValue: 'ids.gtin',
      attributeFourLabelValue: 'UPC',
      attributeFourValue: 'ids.gtin_upc',
    },
  },
};

export const GC_GRUPPE_PRESET: OrganizationProfile = {
  orgName: 'GC Gruppe',
  nyrisApiKey: 'fxIhhQAZlhQ8aZYJaQbysZGJ69J4hwGl',
  productDomain: 'plumbing, heating, sanitary, and building installation products',
  exampleProducts: 'faucets, shower enclosures, radiators, thermostats, pumps, water heaters, washbasins, toilets, valves, pressure reducers, pipes, boilers, heat exchangers, drainage systems',
  exampleBrands: 'Dornbracht, Villeroy & Boch, Hansgrohe, KSB, AEG, Wilo, Grohe, Geberit, Viessmann, Buderus, Grundfos, Stiebel Eltron, BOYSEN',
  keyAttributes: 'brand, product type, material, dimensions, connection size, flow rate, pressure rating, energy rating',
  filterPriority: 'BRAND > TYPE > DIMENSIONS > MATERIAL > CONNECTION SIZE',
  exampleGoodResult: 'I see a Dornbracht basin mixer tap — this is a bathroom faucet used for washbasins. Found 20 matching products across different brands and series. You can filter by brand, type, or connection size.',
  exampleBadResult: 'This appears to be a plumbing fixture. The results show various sanitary/heating products that may not be an exact match. Try filtering by product type or brand to find closer alternatives.',
  exampleFilterNarrow: 'I\'ve filtered the results to show only basin mixer taps. Showing 8 matching faucets out of the original 20 results. You can narrow further by brand or connection size.',
  brandRegexTerms: 'DORNBRACHT|HANSGROHE|GROHE|GEBERIT|VILLEROY|V&B|KSB|AEG|WILO|VIESSMANN|BUDERUS|GRUNDFOS|STIEBEL|BOYSEN|RADA|MONDIAL|VAILLANT|JUNKERS|WOLF|KERMI|OVENTROP|FLAMCO|REFLEX|HONEYWELL|CALEFFI|DANFOSS',
  productTypeRegexTerms: 'armatur|mischer|brause|dusch|wasch|becken|wanne|thermostat|ventil|pumpe|speicher|heiz|kessel|filter|regler|ablauf|siphon|rohr|fitting|faucet|mixer|shower|basin|toilet|radiator|valve|pump|boiler|heater',
  p2Prompt: GC_P2_PROMPT,
  p3Prompt: GC_P3_PROMPT,
  p5Prompt: GC_P5_PROMPT,
  settingsOverrides: {
    apiKey: 'fxIhhQAZlhQ8aZYJaQbysZGJ69J4hwGl',
    appTitle: 'GC Gruppe Visual Search',
    headerText: 'GC Gruppe Visual Search',
    language: 'de',
    theme: {
      appBarLogoUrl: 'https://storage.googleapis.com/product-data-public/RS%20Components/logo/RS_LOGO_CMYK_reversed.jpg',
      headerColor: '#ffffff',
      logoHeight: '54px',
      logoWidth: '100px',
      primaryColor: '#4a2d7a',
      secondaryColor: '#2B2C46',
    },
    attributes: {
      productAttributes: true,
      attributeOneLabelValue: 'Brand',
      attributeOneValue: 'brand',
      attributeTwoLabelValue: 'Category',
      attributeTwoValue: 'ids.categoryGroup',
      attributeThreeLabelValue: 'Brand Code',
      attributeThreeValue: 'ids.brandCode',
      attributeFourLabelValue: 'MPN',
      attributeFourValue: 'ids.mpn',
    },
  },
};

export const GENERIC_PRESET: OrganizationProfile = {
  orgName: 'Product Search',
  nyrisApiKey: '',
  productDomain: 'products and components',
  exampleProducts: '',
  exampleBrands: '',
  keyAttributes: 'brand, type, size, material, color',
  filterPriority: 'BRAND > TYPE > SIZE > MATERIAL > COLOR',
  exampleGoodResult: 'I found products matching your image. You can use the filters below to narrow down the results by brand, type, or other attributes.',
  exampleBadResult: 'The results may not be an exact match for your image. Try filtering by product type or brand to find closer alternatives.',
  exampleFilterNarrow: 'Filtered the results based on your selection. You can continue narrowing by other attributes.',
  brandRegexTerms: '',
  productTypeRegexTerms: '',
  p2Prompt: '',
  p3Prompt: '',
  p5Prompt: '',
  settingsOverrides: {},
};

export const DEFAULT_ORG_PROFILE: OrganizationProfile = RS_COMPONENTS_PRESET;

/** All available presets for the admin UI dropdown */
export const ORG_PRESETS: { label: string; value: OrganizationProfile }[] = [
  { label: 'RS Components (Industrial Electrical)', value: RS_COMPONENTS_PRESET },
  { label: 'GC Gruppe (Plumbing, Heating & Sanitary)', value: GC_GRUPPE_PRESET },
  { label: 'Generic (Product Agnostic)', value: GENERIC_PRESET },
];

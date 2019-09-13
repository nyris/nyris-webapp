import {SearchServiceSettings} from "./types";

export const defaultSettings : SearchServiceSettings = {

    xOptions: false,
    apiKey: 'UNSET',
    exampleImages: [],
    preview: true,
    regions: false,
};

export const defaultMdSettings = {
    appBarLogoUrl: 'images/windmoeller-and-hoelscher-kg-vector-logo.svg',
    appBarCustomBackgroundColor: '#f4f4f4',
    appBarCustomTextColor: '#ccc',
    appBarTitle: '',
    primaryColor: '#e2001a',
    secondaryColor: '#777777',

    resultFirstRowProperty: 'title',
    resultSecondRowProperty: 'sku',
    resultLinkText: 'Info',

    customFontFamily: 'Helvetica',
};
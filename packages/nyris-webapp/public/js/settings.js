
var settings = {
  "apiKey": "j4r4qe8GHkznhBmQDsPQ5qajFbUWvHvU",
  "maxWidth": 500,
  "maxHeight": 500,
  "jpegQuality": 0.9,
  "regions": true,
  "preview": true,
  "xOptions": "",
  "baseUrl": "https://api.nyris.io",
  "exampleImages": [
    "https://img.nyris.io/demo/everybag/kissen.jpg",
    "https://img.nyris.io/demo/everybag/aspirin.jpg",
    "https://img.nyris.io/demo/everybag/lego.jpg",
    "https://img.nyris.io/demo/everybag/wdr_add_2.jpg",
    "https://img.nyris.io/demo/everybag/mb-dle-4.jpg",
    "https://img.nyris.io/demo/everybag/1.jpg",
    "https://img.nyris.io/demo/everybag/5.jpg",
    "https://img.nyris.io/demo/everybag/6.jpg"
  ],
  /*
  "materialDesign": {
    "appBarLogoUrl": "https://nyris.io/wp-content/themes/nyris/img/logo.svg",
    "appBarTitle": "",
    "appBarCustomBackgroundColor": "black",
    "appBarCustomTextColor": "white",

    "primaryColor": "#e31b5d",
    "secondaryColor": "#ccc",
    "resultFirstRowProperty": "title",
    "resultSecondRowProperty": "price",
    "resultLinkText": "show",
    "resultLinkIcon": "eye"
  },
   */
  "instantRedirectPatterns": [
    new RegExp('^https?://(www.)?youtube.com/'),
    new RegExp('^https?://(www.)?youtu.be/'),
    new RegExp('^https?://(www.)?vimeo.com/'),
    new RegExp('^https?://(www.)?dailymotion.com/'),
    new RegExp('^https?://(www.)?dai.ly/')
  ]
};
settings["customSearchRequest"] = null;
settings["responseHook"] =  null;


# nyris-widget

Embed the widget to use nyris search on your website.

## Usage

Inside your HTML (best just before the closing ```</body>``` tag), add the following code to embed the Nyris widget script and configure widget settings:

```html
<script>
    window.nyrisSettings = {
        apiKey: '', // nyris Api key
        initiatorElementId: ['id-1','id-2'], // IDs of HTML elements that trigger the widget; array with a single ID or multiple IDs
        primaryColor: '#3E36DC', // Main color of logo and buttons
        cameraIconColour: '#2B2C46', // Color for camera button
        browseGalleryButtonColor: '#E4E3FF', // Color for 'browse gallery' button on mobile view
        customerLogo: '', // Url for logo, if this property is empty default logo will be used
        logoWidth: 256, // Width for customer logo in pixels, works only with customerLogo
        ctaButtonText: 'View more', // Text of the button on result tile to go to product
        language: 'en', // Language. 
        navigatePreference: '_blank' // Behaviour of click to CTA button, open in current/new tab
        cadenasAPIKey: '', // API key provided by cadenas
        cadenasCatalog: '', // catalog provided  by cadenas
        feedback: false , // Enables feedback; Always a boolean value   
    };
    var s = document.createElement("script");
    s.src = "https://assets.nyris.io/nyris-widget/v1/widget.js";
    document.getElementsByTagName('head')[0].appendChild(s);
</script>

```

## Building a custom version

Follow the steps on [main README](../../README.md) initialize all packages.
Then in this directory, run `npm start` for a local development server or  `npm run build` to build a minified `widget.js`.

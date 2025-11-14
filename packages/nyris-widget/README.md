# nyris-widget

Embed the widget to use nyris search on your website.

## Usage

Inside your HTML (best just before the closing ```</body>``` tag), add the following code to embed the Nyris widget script and configure widget settings:

```html
<script>
    window.nyrisSettings = {
        apiKey: '', // nyris API key
        initiatorElementId: ['id-1','id-2'], // IDs of HTML elements that trigger the widget; array with a single ID or multiple IDs
        primaryColor: '#3E36DC', // Color for the logo and buttons (other than camera  and browse gallery buttons)
        cameraIconColour: '#2B2C46', // Color for camera button
        browseGalleryButtonColor: '#E4E3FF', // Color of 'Browse Gallery' button in mobile view
        customerLogo: '', // URL to display customer logo
        logoWidth: 256, // Width for customer logo in pixels, works only with customerLogo
        ctaButtonText: 'View more', // Button text on result card linking to product details web page
        language: 'en', // Widget display language
        navigatePreference: '_blank' // Routing behaviour of the CTA button, open in current/new tab
        cadenasAPIKey: '', // API key provided by cadenas
        cadenasCatalog: '', // Catalog ID provided by Cadenas
        feedback: false , // Enables feedback; Always a boolean value   
        searchCriteriaLabel: 'Select a machine', // Define the text for search criteria pop-up
        searchCriteriaKey: '', // Define the attribute where filter values are stored
        filter: [] // Define attributes and labels for search Refinements e.g. [{label: 'Brand', field: 'brand' }]
        emailTemplateId: '', // emailjs template id for sending inquiry support email
        productLinkBaseURL: '', // Base URL for constructing product links. If provided, product links will be constructed as baseURL + sku instead of using links from search results. Example: 'https://example.com/products'

    };
    var s = document.createElement("script");
    s.src = "https://assets.nyris.io/nyris-widget/v1/widget.js";
    document.getElementsByTagName('head')[0].appendChild(s);
</script>

```

## Building a custom version

Follow the steps on [main README](../../README.md) initialize all packages.
Then in this directory, run `npm start` for a local development server or  `npm run build` to build a minified `widget.js`.

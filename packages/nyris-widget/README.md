# nyris-widget

Embed the widget to use nyris search on your website.

## Usage

```shell script
npm install @nyris/nyris-widget
```

Embed `widget.js` in your website and provide
a `nyrisSettings` object.

```html
<script>
window.nyrisSettings = {
    // Required
    apiKey: '<YOUR_API_KEY>',

    // Optional
    xOptions: 'default', // See "general request options" https://docs.nyris.io/#general-request-options
    baseUrl: '', // Use different server URL
    jpegQuality: 0.9, // Quality of the scaled image sent to the api
    maxWidth: 500, // Maximal size of the scaled image
    maxHeight: 500,
    responseFormat: 'application/offers.complete+json', // See "response type" https://docs.nyris.io/#response-type
    instantRedirectPatterns: [ 'mysite.com' ] // If exactly one result is returned and it contains `mysite.com`,go directly to the link.
}
</script>
<script src="node_modules/@nyris/nyris-widget/dist/widget.js"></script>
```


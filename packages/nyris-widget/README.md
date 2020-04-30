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
    apiKey: '<YOUR_API_KEY>',
    instantRedirectPatterns: [ 'mysite.com' ] // If exactly one result is returned and it contains `mysite.com`,go directly to the link.
};
</script>
<scrpt src="node_modules/@nyris/nyris-widget/dist/widget.js"></scrpt>
```


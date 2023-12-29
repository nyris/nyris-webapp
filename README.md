# nyris-webapp

## Contents

This repository is home to the nyris webapp and the 
related projects:
 
* [nyris-api](./packages/nyris-api/README.md) - Handle images and communicate with the nyris API.
* [nyris-react-components](./packages/nyris-react-components/README.md) - React components to reuse in your own projects.
* [nyris-widget](./packages/nyris-widget/README.md) - Embed nyris search on your website.
* [nyris-webapp](./packages/nyris-webapp/README.md) - A complete mobile friendly webapp based on the nyris API.


## Setting up the repository for development

1. Set up dependencies by running `npm ci` followed by `npx lerna bootstrap`
2. Build packages `npx lerna run build`


## Bumping versions

```shell script
npx lerna version patch --no-push --no-git-tag-version
```

## Force update versions
```shell script
npx lerna version patch --no-push --no-git-tag-version --force-publish
```
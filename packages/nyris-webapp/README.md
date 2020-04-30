# nyris-webapp

This repository is home to the related nyris-api, nyris-webapp and nyris-widget packages.

## nyris-webapp

## Getting started

1. Create a `settings.js` file in `public/js/`
2. run `npm ci` (clean install)
3. run `npm start`
3. Go to http://localhost:3000

(Optional) Install the following browser extensions for developing:

* React Developer Tools
* Redux DevTools

## Configuration

The configuration file is `public/js/settings.js`. You can use the example file as a guide.
Look at `SearchServiceSettings` in `src/types.ts` for a complete list.

## Architecture

The main components are `App` and `AppMD` with `index.tsx` as the composition root.

### redux & state handling

Actions are data structures, which describe events, that take place.

To change the state of the app, redurcers are used. A reducer takes a
state and an action and produces calculates a new state.

The files are in `src/actions/`

Neither actions nor reducers have any side effects (e.g. sending a request to a server).
Epics introduced by [redux-observable](https://redux-observable.js.org/) library handle side effects.
They listen for a specific action produce themselves new actions asynchronously.

The files are in `src/epics/`



## Available Scripts

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.


### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run mockserver`

Start a server for local testing. Change the URLs prefix to `http://localhost:8080` in your `settings.js` to use it.


## Additional packages

### nyris-api

#### Usage

Install the api package from npm
```shell
npm install --save nyris-api
```

```typescript
import NyrisAPI, { urlOrBlobToCanvas} from '@nyris/nyris-api';
const nyrisApi = new NyrisAPI({
    apiKey: '<API_KEY>'
});
const image = urlOrBlobToCanvas("URL");
nyrisApi.findByImage(image, {}).then(searchResults => {
    console.log(searchResults);
});
```

For further details, see [nyris-api](./packages/nyris-api).

### nyris-react-components

#### Usage

Install the component library from npm in your react project.
```shell script
npm install --save nyris-react-components
```

Import a component to use it.
```tsx
import {Preview} from '@nyris/nyris-react-components';

export default App = () => (
    <div>
        <Preview .../>
    </div>
);
```

For more details, see [nyris-react-components](./packages/nyris-react-components).



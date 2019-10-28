webpack-imported
======
We'll get your asses imported in a right way.

> 📝 stats-webpack-plugin and 💩webpack-flush-chunks had a baby!

> code splitting, prefetching, and resource management.

WebpackPlugin + ServerSide API + React Components(separate entrypoint)

# Server side API
## Webpack plugin
```js
const {ImportedPlugin} = require('webpack-imported');

module.exports = {
  plugins: [
    new ImportedPlugin('imported.json')
  ]
};
```
This will output `imported.json` as a one of the emitted assets, with all the information carefully sorted.

## Stat.json
If you have only `stat.json` generated somehow you can convert into into "imported" format
```js
import {importStats} from "webpack-imported";
import stats from 'build/stats.json';

const importedStat = importStats(stats);
``` 

## SSR API
- `importedAssets(stats, chunks, [tracker])` - return all assets associated with provided chunks.
Could be provided a `tracker` to prevent duplications between runs.
- `createImportedTracker()` - creates a duplication prevention tracker

```js
import {importedAssets} from "webpack-imported";
import importedStat from "build/imported.json"; // this file has to be generated

const relatedAssets = importedAssets(importedStat, ['main']); // main is your "main" bundle

relatedAssets.scripts.load // list scripts to load
relatedAssets.scripts.preload // list scripts to preload
relatedAssets.styles.load // list styles to load
relatedAssets.styles.preload // list styles to preload

importedStat.config.publicPath // public path used at build time
```

with tracking
```js
import {importedAssets, createImportedTracker} from "webpack-imported";
import importedStat from "build/imported.json"; // this file has to be generated

const tracker = createImportedTracker();
const relatedAssets1 = importedAssets(importedStat, ['main'], tracker);
// use scripts and styles

const relatedAssets2 = importedAssets(importedStat, ['home'], tracker);
// render only new scripts and styles
```

# Client side API

## React bindings (for SSR)
- `createImportedTracker()` - creates a duplication prevention tracker
- `WebpackImportedProvider` - wires tracker down to React context
- `WebpackImport` - chunk importer
- `processImportedStyles` - helper for critical styles.
```js
import {createImportedTracker, WebpackImportedProvider, WebpackImport} from "webpack-imported/react";
import importedStat from "build/imported.json";

const tracker = createImportedTracker();// this is optional, only needed if your render is multipart(head/body)

<WebpackImportedProvider tracker={tracker}>
  <WebpackImport stats={importedStat} chunks={['main']} />
</WebpackImportedProvider>  
```

`WebpackImport` has many props:
- [`preload`=false] - only preloads resources. If preload is set resources would be loaded via network, but not executed. 
Never use this option for the main chunk.
- [`anonymous`=false] - should it be loaded as anonymous 
- [`async`=true] - loads scripts with `async` attribute, uses `deferred` in other case.
- [`module`=false] - loads scripts with `module` attribute
- [`critical-styles`=false] - enabled critical styles handling. No styles would be loaded or prefetched,
but system will leave extra markup to prevent `MiniCssExtractPlugin` from adding them by itself.
With this option enabled __you have to call__ `processImportedStyles` after the application starts to load the missing styles. 


# Related
### Get stats from webpack
- [stats-webpack-plugin](https://github.com/unindented/stats-webpack-plugin)
- [loadable components webpack plugin](https://github.com/smooth-code/loadable-components/tree/master/packages/webpack-plugin)

### Handle chunks dependencies
- [webpack-flush-chunks](https://github.com/faceyspacey/webpack-flush-chunks)

### React Lazy Loading
- [react-imported-component](https://github.com/theKashey/react-imported-component)

### CSS Critical extraction
- [used-styles](https://github.com/theKashey/used-styles)

# Licence 
MIT

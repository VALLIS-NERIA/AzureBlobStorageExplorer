# AzureBlobStorageExplorer
completely front-end explorer of Azure blob storage

## How to build
* compile
```
npm install
webpack src/index.tsx --config webpack-config.js --watch
```
* put your SAS url into index.html
* or you can hardcode in index.tsx
```
ReactDOM.render(<MainRouter url="https://YOUR-SAS-URL" />, document.getElementById("root"));
```

## How to use
* 2 versions of URL param: 
```
 http://localhost:3000/index.html?container=CONTAINER&path=DIR%2FSUBDIR
 http://localhost:3000/CONTAINER/DIR/SUBDIR
```
* you can directly open index.html in browser
* or run a web server
```
cd dist
npx tsc server.ts
node server.js
```
* to use /CONTAINER/DIR/SUBDIR route, the web server must routes any path to /index.html, except /static, where scripts are located.

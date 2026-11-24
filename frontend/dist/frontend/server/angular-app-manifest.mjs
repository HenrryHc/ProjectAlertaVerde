
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  baseHref: "/",
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/inicio",
    "relativeRedirect": true,
    "route": "/"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-qes30a6N.js",
      "chunk-Ba4Zow8B.js",
      "chunk-DfD1Dk-5.js"
    ],
    "route": "/login"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-C2Oq2hox.js",
      "chunk-Ba4Zow8B.js",
      "chunk-BidfKY5s.js",
      "chunk-DfD1Dk-5.js"
    ],
    "route": "/registro"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-BBskWoe4.js",
      "chunk-CzPVskIq.js",
      "chunk-BidfKY5s.js",
      "chunk-CVbzcV4P.js"
    ],
    "route": "/inicio"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-BdJ55A9Y.js",
      "chunk-BA4UHMko.js",
      "chunk-CzPVskIq.js",
      "chunk-BidfKY5s.js",
      "chunk-CVbzcV4P.js"
    ],
    "route": "/reportes"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-59ADj3o5.js",
      "chunk-Ba4Zow8B.js",
      "chunk-BA4UHMko.js",
      "chunk-CzPVskIq.js",
      "chunk-BidfKY5s.js"
    ],
    "route": "/reportes/nuevo"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-59ADj3o5.js",
      "chunk-Ba4Zow8B.js",
      "chunk-BA4UHMko.js",
      "chunk-CzPVskIq.js",
      "chunk-BidfKY5s.js"
    ],
    "route": "/reportes/*/editar"
  },
  {
    "renderMode": 2,
    "redirectTo": "/inicio",
    "relativeRedirect": true,
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    "index.csr.html": {size: 4781, hash: "9e56d029f1a5b78c", text: () => import("./assets-chunks/index_csr_html.mjs").then(m => m.default)},
    "index.server.html": {size: 5321, hash: "374ea764fc567f70", text: () => import("./assets-chunks/index_server_html.mjs").then(m => m.default)}
  },
};

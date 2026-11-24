import './polyfills.server.mjs';
import{tb as i}from"./chunk-JO544H6X.mjs";function c(n){if(n instanceof i){let e=n.error?.detail;if(typeof e=="string"&&e.trim())return e;if(Array.isArray(e)){let o=e.map(r=>{let t=Array.isArray(r.loc)?r.loc.filter(s=>s!=="body").join("."):"";return t?`${t}: ${r.msg??"valor inv\xE1lido"}`:r.msg}).filter(r=>!!r);if(o.length>0)return o.join(`
`)}return n.status===0?"No se pudo conectar con el backend. Verifica que est\xE9 activo.":n.message||`Error ${n.status}.`}return"Ocurri\xF3 un error inesperado."}export{c as a};

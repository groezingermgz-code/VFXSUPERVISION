// Zentrale Versionsangabe für die App
// Version wird zur Build-Zeit injiziert (siehe vite.config.js)
const __FALLBACK_VERSION__ = '0.0.0';
// Priorität: VITE_APP_VERSION (falls gesetzt) > __APP_VERSION__ (aus package.json) > Fallback
const APP_VERSION = (import.meta?.env?.VITE_APP_VERSION) || (typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : __FALLBACK_VERSION__);
export { APP_VERSION };
export const APP_VERSION_LABEL = `Alpha ${APP_VERSION}`;
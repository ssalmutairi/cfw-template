export const i18next = require("i18next");
export const i18nextMiddleware = require("i18next-http-middleware");
const Backend = require("i18next-fs-backend");
i18next.use(Backend).use(i18nextMiddleware.LanguageDetector);

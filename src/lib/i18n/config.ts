import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";

const isDev = process.env.NODE_ENV === "development";

// Single synchronous init before any React render — same bundle on server & client (no async load).
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: { en: { translation: en } },
    lng: "en",
    fallbackLng: "en",
    load: "languageOnly",
    interpolation: { escapeValue: false },
    debug: isDev,
    react: {
      useSuspense: false,
    },
  });
}

export default i18n;

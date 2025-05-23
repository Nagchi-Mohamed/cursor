import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// You might also use LanguageDetector, Backend for loading translations, etc.

// Example minimal translations (replace with your actual structure)
const resources = {
  en: {
    translation: {
      "app.title": "MathSphere App (EN)",
      "solver.inputPlaceholder": "Enter problem (EN)...",
      // ... other keys
    }
  },
  es: {
    translation: {
      "app.title": "MathSphere App (ES)",
      "solver.inputPlaceholder": "Ingrese problema (ES)...",
      // ... other keys
    }
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    // debug: true, // Enable for debugging i18n loading
  });

export default i18n;

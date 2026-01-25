import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from '../locales/en.json';
import zhtwTranslation from '../locales/zh-TW.json';
import zhcnTranslation from '../locales/zh-CN.json';
import jaTranslation from '../locales/ja.json';
import koTranslation from '../locales/ko.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      'zh-TW': { translation: zhtwTranslation },
      'zh-CN': { translation: zhcnTranslation },
      ja: { translation: jaTranslation },
      ko: { translation: koTranslation }
    },
    fallbackLng: ['en', 'zh-TW'],
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['cookie', 'localStorage', 'navigator'],
      caches: ['cookie'],
      cookieMinutes: 60 * 24 * 31 * 6,
      cookieDomain: window.location.hostname
    }
  });

export default i18n;

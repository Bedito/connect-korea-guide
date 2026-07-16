import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en.json";
import ko from "@/locales/ko.json";

export const SUPPORTED_LANGS = ["en", "ko"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];
export const STORAGE_KEY = "chingubase.lang";

function detectInitialLang(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "ko") return stored;
    const nav = (navigator.language || "").toLowerCase();
    if (nav.startsWith("ko")) return "ko";
  } catch {
    // ignore
  }
  return "en";
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      ko: { translation: ko },
    },
    lng: "en", // start with 'en' on server; client will switch after mount
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    returnNull: false,
  });
}

export function initClientLanguage() {
  if (typeof window === "undefined") return;
  const lang = detectInitialLang();
  if (i18n.language !== lang) i18n.changeLanguage(lang);
  try {
    document.documentElement.lang = lang;
  } catch {
    // ignore
  }
}

export function setLanguage(lang: Lang) {
  i18n.changeLanguage(lang);
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  } catch {
    // ignore
  }
}

export default i18n;

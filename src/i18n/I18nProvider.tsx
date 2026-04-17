import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { AppLocale } from "@/types";
import { DEFAULT_LOCALE, translations } from "./translations";

type TranslationParams = Record<string, string | number>;

type I18nContextValue = {
  locale: AppLocale;
  t: (key: string, params?: TranslationParams) => string;
};

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  t: (key: string) => key,
});

function interpolate(template: string, params?: TranslationParams) {
  if (!params) {
    return template;
  }
  return template.replace(/\{\{(.*?)\}\}/g, (_, rawKey: string) => {
    const key = rawKey.trim();
    return String(params[key] ?? "");
  });
}

type I18nProviderProps = {
  locale: AppLocale;
  children: ReactNode;
};

export function I18nProvider({ locale, children }: I18nProviderProps) {
  const value = useMemo<I18nContextValue>(() => {
    const normalizedLocale = translations[locale] ? locale : DEFAULT_LOCALE;
    return {
      locale: normalizedLocale,
      t: (key: string, params?: TranslationParams) => {
        const message =
          translations[normalizedLocale][key] ??
          translations[DEFAULT_LOCALE][key] ??
          key;
        return interpolate(message, params);
      },
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

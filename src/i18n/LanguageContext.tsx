import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { Language, Translations } from './types';
import { ko } from './ko';
import { en } from './en';

const translations: Record<Language, Translations> = { ko, en };

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  playerName: (nameKo: string, id: string) => string;
  pitchName: (code: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLang(): Language {
  const stored = localStorage.getItem('wbc-lang');
  if (stored === 'ko' || stored === 'en') return stored;
  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith('ko') ? 'ko' : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(getInitialLang);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('wbc-lang', newLang);
  }, []);

  const t = useCallback((key: string): string => {
    return translations[lang][key] ?? translations['ko'][key] ?? key;
  }, [lang]);

  const playerName = useCallback((nameKo: string, id: string): string => {
    if (lang === 'en') {
      return translations['en']['player.' + id] || nameKo;
    }
    return nameKo;
  }, [lang]);

  const pitchName = useCallback((code: string): string => {
    return translations[lang]['pitchName.' + code] || code;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t, playerName, pitchName }), [lang, setLang, t, playerName, pitchName]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

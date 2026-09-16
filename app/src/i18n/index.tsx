import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { en } from './en';
import { vi, type Dict } from './vi';

type Lang = 'vi' | 'en';

const I18nContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof Dict) => string;
}>({ lang: 'vi', setLang: () => {}, t: (k) => vi[k] });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('vi');
  const value = useMemo(() => {
    const dict = lang === 'en' ? en : vi;
    return { lang, setLang, t: (k: keyof Dict) => dict[k] };
  }, [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

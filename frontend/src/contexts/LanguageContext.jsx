import { useState, useEffect } from 'react';
import th from '../locales/th.json';
import en from '../locales/en.json';
import { LanguageContext } from './LanguageContextBase';

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'TH';
  });

  const translations = {
    TH: th,
    EN: en
  };

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'TH' ? 'EN' : 'TH');
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  const ct = (th, en) => {
    if (language === 'EN') {
      return en || th
    }
    return th;
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t , ct}}>
      {children}
    </LanguageContext.Provider>
  );
};

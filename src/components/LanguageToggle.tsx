import { useLanguage } from '../i18n/LanguageContext';

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="fixed top-3 right-3 z-[60] flex items-center bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-full px-1 py-0.5">
      <button
        onClick={() => setLang('ko')}
        className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${
          lang === 'ko' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white'
        }`}
      >
        KR
      </button>
      <button
        onClick={() => setLang('en')}
        className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${
          lang === 'en' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white'
        }`}
      >
        EN
      </button>
    </div>
  );
}

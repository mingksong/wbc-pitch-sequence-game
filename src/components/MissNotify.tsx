import { useEffect } from 'react';
import type { Zone } from '../data/types';
import { useLanguage } from '../i18n/LanguageContext';

interface MissNotifyProps {
  targetZone: Zone;
  actualZone: Zone;
  onDone: () => void;
}

function getZoneLabel(zone: Zone, t: (key: string) => string): string {
  return t('zone.' + zone) || `Zone ${zone}`;
}

export default function MissNotify({ targetZone, actualZone, onDone }: MissNotifyProps) {
  const { t } = useLanguage();

  // Auto-dismiss after 1.5 seconds
  useEffect(() => {
    const timer = setTimeout(onDone, 1500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 cursor-pointer"
      onClick={onDone}
    >
      <div className="bg-red-900/60 border-2 border-red-500/50 rounded-2xl p-8 max-w-sm w-full text-center animate-bounce">
        <p className="text-4xl mb-3">&#x1F62C;</p>
        <h2 className="text-2xl font-black text-red-300 mb-2">
          {t('miss.title')}
        </h2>
        <p className="text-slate-300 text-sm mb-4">
          {t('miss.subtitle')}
        </p>
        <div className="bg-slate-900/50 rounded-lg px-4 py-3">
          <div className="flex items-center justify-center gap-3 text-sm">
            <div>
              <p className="text-slate-500 text-xs">{t('miss.target')}</p>
              <p className="text-slate-300 font-medium">{getZoneLabel(targetZone, t)}</p>
            </div>
            <span className="text-red-400 text-lg">&#x2192;</span>
            <div>
              <p className="text-slate-500 text-xs">{t('miss.actual')}</p>
              <p className="text-red-400 font-bold">{getZoneLabel(actualZone, t)}</p>
            </div>
          </div>
        </div>
      </div>
      <p className="text-slate-600 text-xs mt-4">{t('miss.tapToContinue')}</p>
    </div>
  );
}

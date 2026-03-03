import React from 'react';
import { ExternalOption } from '@/app/lib/api/trips';

interface Props {
  option: ExternalOption;
  lang: string;
}

export default function ExternalTransportCard({ option, lang }: Props) {
  // Encontrar el primer trayecto que no sea caminar (ej: RAIL, BUS)
  const mainLeg = option.legs?.find(leg => leg.mode !== 'WALK') || option.legs?.[0];
  
  if (!mainLeg) return null;

  const getIcon = (mode: string) => {
    switch (mode?.toUpperCase()) {
      case 'RAIL':
      case 'SUBWAY':
      case 'TRAM':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="7" y="5" width="10" height="14" rx="2" strokeWidth={2} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l3-3 3 3" />
          </svg>
        );
      case 'BUS':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 4h8m-8 4h4m12-4a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getModeLabel = (mode: string) => {
    const labels: Record<string, Record<string, string>> = {
      fi: { RAIL: 'Juna', BUS: 'Bussi', SUBWAY: 'Metro', TRAM: 'Ratikka', WALK: 'Kävely' },
      es: { RAIL: 'Tren', BUS: 'Autobús', SUBWAY: 'Metro', TRAM: 'Tranvía', WALK: 'Caminar' },
      en: { RAIL: 'Train', BUS: 'Bus', SUBWAY: 'Subway', TRAM: 'Tram', WALK: 'Walk' },
    };
    return labels[lang]?.[mode?.toUpperCase()] || mode;
  };

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  return (
    <div className="group relative bg-white/5 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 hover:border-brand-purple/20 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-purple/5 overflow-hidden">
      <div className="absolute inset-0 bg-hacker-dots opacity-5 pointer-events-none"></div>
      
      <div className="relative flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="flex-shrink-0 text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-brand-purple/20 blur-xl rounded-full scale-110"></div>
            <div className="relative w-20 h-20 rounded-full bg-brand-dark border-2 border-white/10 flex items-center justify-center text-brand-purple">
              {getIcon(mainLeg.mode)}
            </div>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-brand-gray/60">
            Digitransit FI
          </div>
        </div>

        <div className="flex-1 space-y-6 w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3 text-brand-purple font-black text-xs uppercase tracking-[0.2em] mb-2">
                <span>{getModeLabel(mainLeg.mode)}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/10"></span>
                <span>{new Date(option.start_time).toLocaleDateString(lang, { day: 'numeric', month: 'short' })}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tightest flex items-center gap-4">
                {mainLeg.from}
                <svg className="w-6 h-6 text-brand-gray/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                {mainLeg.to}
              </h2>
            </div>
            
            <div className="text-right flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-0">
              <p className="text-3xl font-black text-white tracking-tightest">
                {option.price ? `€${Number(option.price).toFixed(2)}` : '--'}
              </p>
              <p className="text-xs font-black text-brand-gray uppercase tracking-widest leading-none">
                {lang === 'fi' ? 'Hinta alkaen' : (lang === 'es' ? 'Desde' : 'From')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 bg-black/20 rounded-3xl p-5 border border-white/5 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-black text-brand-gray/70 uppercase tracking-widest">
                {lang === 'fi' ? 'Lähtö' : (lang === 'es' ? 'Salida' : 'Departure')}
              </p>
              <p className="text-sm font-bold text-white italic">
                {formatTime(option.start_time)} HS
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black text-brand-gray/70 uppercase tracking-widest">
                {lang === 'fi' ? 'Saapuminen' : (lang === 'es' ? 'Llegada' : 'Arrival')}
              </p>
              <p className="text-sm font-bold text-white">
                {formatTime(option.end_time)} HS
              </p>
            </div>
          </div>

          {/* Muestra los tramos si hay más de uno */}
          {option.legs?.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {option.legs.map((leg, idx) => (
                <React.Fragment key={idx}>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                    leg.mode === 'WALK' ? 'bg-white/5 text-brand-gray' : 'bg-brand-purple/20 text-brand-purple'
                  }`}>
                    {getModeLabel(leg.mode)}
                  </span>
                  {idx < option.legs.length - 1 && <span className="text-white/20">›</span>}
                </React.Fragment>
              ))}
            </div>
          )}

          <div className="flex pt-2">
            <a 
              href="https://www.reittiopas.fi/" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-white/5 text-white border border-white/10 px-8 py-4 rounded-2xl hover:bg-brand-purple hover:border-transparent transition-all shadow-xl font-black uppercase tracking-[0.2em] text-xs text-center"
            >
              {lang === 'fi' ? 'Varaa liput' : (lang === 'es' ? 'Comprar billetes' : 'Book tickets')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

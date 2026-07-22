import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertOctagon, Globe, ExternalLink, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { ExternalVerificationResult } from '../types';

interface ExternalVerificationBadgeProps {
  query: string;
  className?: string;
  compact?: boolean;
}

export const ExternalVerificationBadge: React.FC<ExternalVerificationBadgeProps> = ({
  query,
  className = '',
  compact = false
}) => {
  const [result, setResult] = useState<ExternalVerificationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResult(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const timer = setTimeout(() => {
      fetch(`/api/verify-external-name?query=${encodeURIComponent(trimmed)}`)
        .then((res) => res.json())
        .then((data: ExternalVerificationResult) => {
          if (isMounted) {
            setResult(data);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.warn('Error fetching external verification:', err);
          if (isMounted) setLoading(false);
        });
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query]);

  if (!query.trim() || query.trim().length < 2) {
    return null;
  }

  if (loading) {
    return (
      <div className={`p-3 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 flex items-center gap-2.5 text-xs animate-pulse ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
        <span>Verificando disponibilidad en tiempo real (Base Maestra, mueblesmacrumo.com.pe y Falabella Perú)...</span>
      </div>
    );
  }

  if (!result) return null;

  const { isAvailable, matches, channelsChecked } = result;

  // Group matches by source
  const webMatches = matches.filter((m) => m.source.includes('Web Propia'));
  const falabellaMatches = matches.filter((m) => m.source.includes('Falabella'));
  const masterMatches = matches.filter((m) => m.source.includes('Base Maestra'));

  if (compact) {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        {isAvailable ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-xs shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Nombre disponible</span>
          </span>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 font-bold text-xs shadow-xs">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Nombre ya en uso / Colisión detectada</span>
            </span>
            {masterMatches.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[11px] font-semibold">
                Encontrado en Base Maestra
              </span>
            )}
            {webMatches.length > 0 && (
              <a
                href={channelsChecked.webMacrumo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[11px] font-semibold hover:underline flex items-center gap-1"
              >
                <span>Encontrado en Web Propia (mueblesmacrumo.com.pe)</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
            {falabellaMatches.length > 0 && (
              <a
                href={channelsChecked.falabella.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[11px] font-semibold hover:underline flex items-center gap-1"
              >
                <span>Encontrado en Falabella Perú</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-2xl border text-xs space-y-3 transition-all ${
        isAvailable
          ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
          : 'bg-rose-50/90 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/80 text-rose-900 dark:text-rose-200'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-bold text-sm">
          {isAvailable ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Nombre disponible</span>
            </>
          ) : (
            <>
              <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>Nombre ya en uso / Colisión detectada</span>
            </>
          )}
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold opacity-75 flex items-center gap-1">
          <Globe className="w-3 h-3" /> Fuentes Consultadas
        </span>
      </div>

      <p className="text-[11px] leading-relaxed">
        {isAvailable
          ? 'El nombre consultado está completamente libre. No existen registros ni publicaciones activas en la Base Maestra, la web oficial mueblesmacrumo.com.pe ni en Falabella Perú.'
          : 'Se han encontrado coincidencias exactas o similares en una o más fuentes monitoreadas. Revisa las coincidencias por canal:'}
      </p>

      {/* Channels Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
        {/* Base Maestra */}
        <div
          className={`p-2.5 rounded-xl border text-[11px] space-y-1 ${
            masterMatches.length > 0
              ? 'bg-rose-100/70 dark:bg-rose-900/40 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200'
              : 'bg-emerald-100/50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
          }`}
        >
          <div className="font-bold flex items-center justify-between">
            <span>Base Maestra</span>
            {masterMatches.length > 0 ? (
              <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px]">
                {masterMatches.length} Ocupado
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px]">Libre</span>
            )}
          </div>
          {masterMatches.length > 0 && (
            <div className="text-[10px] text-rose-700 dark:text-rose-300 font-mono">
              Registrado: {masterMatches.map((m) => m.foundName).join(', ')}
            </div>
          )}
        </div>

        {/* Web Propia */}
        <div
          className={`p-2.5 rounded-xl border text-[11px] space-y-1 ${
            webMatches.length > 0
              ? 'bg-rose-100/70 dark:bg-rose-900/40 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200'
              : 'bg-emerald-100/50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
          }`}
        >
          <div className="font-bold flex items-center justify-between">
            <span className="truncate">Web Propia</span>
            {webMatches.length > 0 ? (
              <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] shrink-0">
                Encontrado
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] shrink-0">Libre</span>
            )}
          </div>
          <a
            href={channelsChecked.webMacrumo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-neutral-600 dark:text-neutral-300 hover:underline flex items-center gap-1 font-mono"
          >
            <span>mueblesmacrumo.com.pe</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
          {webMatches.length > 0 && (
            <div className="text-[10px] text-rose-700 dark:text-rose-300 font-semibold">
              Item: {webMatches.map((m) => m.foundName).join(', ')}
            </div>
          )}
        </div>

        {/* Falabella Perú */}
        <div
          className={`p-2.5 rounded-xl border text-[11px] space-y-1 ${
            falabellaMatches.length > 0
              ? 'bg-rose-100/70 dark:bg-rose-900/40 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200'
              : 'bg-emerald-100/50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
          }`}
        >
          <div className="font-bold flex items-center justify-between">
            <span className="truncate">Falabella Perú</span>
            {falabellaMatches.length > 0 ? (
              <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] shrink-0">
                Encontrado
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] shrink-0">Libre</span>
            )}
          </div>
          <a
            href={channelsChecked.falabella.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-neutral-600 dark:text-neutral-300 hover:underline flex items-center gap-1 font-mono"
          >
            <span>Catálogo Macrumo</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
          {falabellaMatches.length > 0 && (
            <div className="text-[10px] text-rose-700 dark:text-rose-300 font-semibold">
              Item: {falabellaMatches.map((m) => m.foundName).join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

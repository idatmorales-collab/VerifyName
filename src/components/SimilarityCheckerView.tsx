import React, { useState } from 'react';
import {
  SearchCode,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  PlusCircle,
  Volume2,
  Info,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { FurnitureName, FurnitureCategory, SimilarityCheckResponse } from '../types';
import { checkNameSimilarity, getPhoneticKey } from '../utils/similarity';
import { ExternalVerificationBadge } from './ExternalVerificationBadge';

interface SimilarityCheckerViewProps {
  names: FurnitureName[];
  initialCandidateName?: string;
  onOpenNewModalWithQuery: (initialName: string, category?: string) => void;
  onNavigateToAiStudio: (initialPrompt?: string) => void;
  onSelectName: (name: FurnitureName) => void;
  onBack?: () => void;
  onNavigate?: (view: string) => void;
}

export const SimilarityCheckerView: React.FC<SimilarityCheckerViewProps> = ({
  names,
  initialCandidateName = '',
  onOpenNewModalWithQuery,
  onNavigateToAiStudio,
  onSelectName,
  onBack,
  onNavigate
}) => {
  const [candidateName, setCandidateName] = useState(initialCandidateName);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else if (onNavigate) {
      onNavigate('inicio');
    }
  };

  React.useEffect(() => {
    if (initialCandidateName) {
      setCandidateName(initialCandidateName);
    }
  }, [initialCandidateName]);

  const categories: FurnitureCategory[] = [
    'Sofás',
    'Mesas',
    'Sillas',
    'Camas',
    'Armarios',
    'Muebles TV',
    'Estanterías',
    'Exterior',
    'Decoración',
    'Iluminación'
  ];

  const report: SimilarityCheckResponse | null = candidateName.trim().length >= 2
    ? checkNameSimilarity(candidateName, names, selectedCategory !== 'Todas' ? selectedCategory : undefined)
    : null;

  const phoneticKey = candidateName.trim() ? getPhoneticKey(candidateName) : '';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-start gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={handleGoBack}
          className="p-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:border-amber-400/50 transition-all shadow-xs cursor-pointer shrink-0 mt-1"
          title="Volver al Panel General"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1.5">
            <SearchCode className="w-3.5 h-3.5" />
            <span>Motor de Detección en Tiempo Real</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
            Identifica Nombre
          </h1>
          <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
            Analiza instantáneamente marcas candidatas contra la Base Maestra de Muebles Macrumo utilizando algoritmos de Levenshtein, fonética adaptada e inspección de categoría.
          </p>
        </div>
      </div>

      {/* Main Analysis Input Box */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
              <span>Nombre Comercial Candidato:</span>
              {phoneticKey && (
                <span className="text-[11px] font-mono font-normal text-neutral-400 flex items-center gap-1">
                  <Volume2 className="w-3 h-3" />
                  Clave Fonética: <code className="text-neutral-800 dark:text-neutral-200 font-bold">{phoneticKey}</code>
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Escribe el nombre a verificar (Ej: Velveto, Lumina, Koa...)"
                className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-base font-mono font-bold text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                autoFocus
              />
              {candidateName && (
                <button
                  onClick={() => setCandidateName('')}
                  className="absolute right-3 top-3.5 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-neutral-400" />
              <span>Categoría Destino:</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs font-medium text-neutral-800 dark:text-neutral-200 focus:outline-none"
            >
              <option value="Todas">Todas las Categorías</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Real-time External Sources Check Badge (mueblesmacrumo.com.pe + Falabella Perú) */}
        {candidateName.trim().length >= 2 && (
          <div className="pt-2">
            <ExternalVerificationBadge query={candidateName} />
          </div>
        )}

        {/* Real-time Results Card */}
        {report ? (
          <div className="space-y-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 animate-in fade-in duration-200">
            {/* Risk Index Meter */}
            <div className="p-6 rounded-2xl border bg-neutral-50/50 dark:bg-neutral-950/50 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Índice de Riesgo de Colisión
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-extrabold font-mono tracking-tight text-neutral-900 dark:text-white">
                      {report.riskScore}%
                    </div>
                    {report.risk === 'CRITICAL' && (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 flex items-center gap-1.5">
                        <AlertOctagon className="w-4 h-4" />
                        CONFLICTO CRÍTICO
                      </span>
                    )}
                    {report.risk === 'HIGH' && (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        ALTO RIESGO
                      </span>
                    )}
                    {report.risk === 'MEDIUM' && (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400 flex items-center gap-1.5">
                        <Info className="w-4 h-4" />
                        RIESGO MODERADO
                      </span>
                    )}
                    {report.risk === 'LOW' && (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400 flex items-center gap-1.5">
                        <Info className="w-4 h-4" />
                        BAJO RIESGO
                      </span>
                    )}
                    {report.risk === 'SAFE' && (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        DISPONIBLE Y ÚNICO
                      </span>
                    )}
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="flex items-center gap-2">
                  {report.isAvailable ? (
                    <button
                      onClick={() => onOpenNewModalWithQuery(candidateName, selectedCategory)}
                      className="px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-xs shadow-md hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Registrar "{candidateName}"</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigateToAiStudio(candidateName)}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs shadow-md hover:bg-amber-400 transition-colors flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Generar Alternativas con IA</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="h-2 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    report.risk === 'CRITICAL'
                      ? 'bg-rose-500'
                      : report.risk === 'HIGH'
                      ? 'bg-amber-500'
                      : report.risk === 'MEDIUM'
                      ? 'bg-yellow-500'
                      : report.risk === 'LOW'
                      ? 'bg-sky-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.max(5, report.riskScore)}%` }}
                />
              </div>

              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                {report.recommendation}
              </p>
            </div>

            {/* Matches Breakdown List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                Coincidencias Registradas ({report.matches.length})
              </h3>

              {report.matches.length === 0 ? (
                <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center text-xs text-neutral-500">
                  Sin colisiones encontradas. El nombre es apto para registro en Muebles Macrumo.
                </div>
              ) : (
                <div className="space-y-2">
                  {report.matches.map((match) => (
                    <div
                      key={match.targetName.id}
                      onClick={() => onSelectName(match.targetName)}
                      className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-neutral-900 dark:text-white">
                            {match.targetName.name}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                            {match.targetName.category}
                          </span>
                          <span className="text-[10px] text-neutral-400">• {match.targetName.line}</span>
                        </div>
                        <p className="text-xs text-neutral-500">{match.reason}</p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-100 dark:border-neutral-800">
                        <div className="text-right">
                          <div className="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono">
                            {match.similarityPercentage}% Similar
                          </div>
                          <div className="text-[10px] font-semibold text-neutral-400">{match.matchType}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-10 rounded-2xl bg-neutral-50 dark:bg-neutral-950/50 border border-dashed border-neutral-200 dark:border-neutral-800 text-center space-y-2">
            <SearchCode className="w-8 h-8 text-neutral-400 mx-auto" />
            <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Escribe un nombre comercial para iniciar la simulación
            </div>
            <p className="text-[11px] text-neutral-400 max-w-sm mx-auto">
              Comprobará variaciones ortográficas, similitud de vocales, prefijos comerciales y colisiones de categoría.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

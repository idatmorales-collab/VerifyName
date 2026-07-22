import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Palette,
  Globe,
  Tag,
  Copy,
  Check,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { FurnitureCategory, FurnitureLine, AINameSuggestion } from '../types';

interface AiGeneratorViewProps {
  onRegisterAiSuggestion: (suggestion: AINameSuggestion, category: string, line: string) => void;
  currentUser: string;
  onBack?: () => void;
  onNavigate?: (view: string) => void;
}

export const AiGeneratorView: React.FC<AiGeneratorViewProps> = ({
  onRegisterAiSuggestion,
  currentUser,
  onBack,
  onNavigate
}) => {
  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else if (onNavigate) {
      onNavigate('inicio');
    }
  };
  const [category, setCategory] = useState<FurnitureCategory>('Sofás');
  const [line, setLine] = useState<FurnitureLine>('Lujo Contemporáneo');
  const [materials, setMaterials] = useState<string>('Nogal Español, Terciopelo Sedoso, Latón Cepillado');
  const [styleMood, setStyleMood] = useState<string>('Elegante, Orgánico, Atemporal, Líneas Suaves');
  const [languageOrigin, setLanguageOrigin] = useState<string>('Italiano / Latín');
  const [targetCount, setTargetCount] = useState<number>(6);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AINameSuggestion[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const lines: FurnitureLine[] = [
    'Colección Atemporal',
    'Línea Moderna',
    'Artesanal Macrumo',
    'Escandinavo Orgánico',
    'Minimalista Urbano',
    'Lujo Contemporáneo'
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          line,
          materials: materials.split(',').map((s) => s.trim()),
          styleMood,
          languageOrigin,
          targetCount,
          user: currentUser
        })
      });

      if (!res.ok) {
        throw new Error('Error al generar sugerencias con el motor de IA.');
      }

      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (err: any) {
      setError(err.message || 'Error inesperado en la conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (name: string, id: string) => {
    navigator.clipboard.writeText(name);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generador IA de Naming</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
            Generador IA
          </h1>
          <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
            Generación semántica y fonética asistida por Gemini para la marca Muebles Macrumo. Evaluación e inspección de marcas en tiempo real.
          </p>
        </div>
      </div>

      {/* Generator Form Controls */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Categoría */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-neutral-400" />
              <span>Categoría de Producto</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FurnitureCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Colección */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-neutral-400" />
              <span>Colección / Línea</span>
            </label>
            <select
              value={line}
              onChange={(e) => setLine(e.target.value as FurnitureLine)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none"
            >
              {lines.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Origen Lingüístico */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-neutral-400" />
              <span>Inspiración Lingüística</span>
            </label>
            <input
              type="text"
              value={languageOrigin}
              onChange={(e) => setLanguageOrigin(e.target.value)}
              placeholder="Ej: Español, Latín, Italiano, Nórdico..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 focus:outline-none"
            />
          </div>

          {/* Materiales Clave */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-neutral-400" />
              <span>Combinación de Materiales Clave</span>
            </label>
            <input
              type="text"
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
              placeholder="Ej: Nogal Español, Terciopelo, Mármol Calacatta, Latón..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 focus:outline-none"
            />
          </div>

          {/* Cantidad */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Propuestas por Lote</label>
            <select
              value={targetCount}
              onChange={(e) => setTargetCount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none"
            >
              <option value={4}>4 Nombres</option>
              <option value={6}>6 Nombres</option>
              <option value={8}>8 Nombres</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-2 flex items-center justify-between">
          <div className="text-[11px] text-neutral-400">
            Conectado al servidor con la API de Gemini
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs shadow-md hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>Generando Propuestas...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Generar Nombres con IA Macrumo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Results Grid */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              Propuestas Generadas ({suggestions.length})
            </h2>
            <span className="text-xs text-neutral-400">Verificadas contra la Base Maestra</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((sug) => (
              <div
                key={sug.id}
                className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-xs hover:border-neutral-400 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xl font-bold font-mono tracking-tight text-neutral-900 dark:text-white">
                      {sug.name}
                    </h3>
                    {sug.similarityRisk === 'SAFE' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 shrink-0">
                        Libre (0%)
                      </span>
                    )}
                    {sug.similarityRisk === 'LOW' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400 shrink-0">
                        Bajo Riesgo
                      </span>
                    )}
                    {sug.similarityRisk === 'MEDIUM' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400 shrink-0">
                        Revisar
                      </span>
                    )}
                    {(sug.similarityRisk === 'HIGH' || sug.similarityRisk === 'CRITICAL') && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 shrink-0">
                        Cercano: {sug.closestMatch}
                      </span>
                    )}
                  </div>

                  <div className="text-xs italic text-neutral-600 dark:text-neutral-300 font-medium">
                    "{sug.tagline}"
                  </div>

                  <p className="text-xs text-neutral-500 leading-relaxed">{sug.etymology}</p>

                  <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 text-[11px] text-neutral-600 dark:text-neutral-400">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">Concepto Estético: </span>
                    {sug.styleNote}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleCopy(sug.name, sug.id)}
                    className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Copiar nombre"
                  >
                    {copiedId === sug.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => onRegisterAiSuggestion(sug, category, line)}
                    className="px-3 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Registrar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Sparkles,
  SearchCode,
  Star,
  ShieldCheck,
  ArrowRight,
  Search,
  Plus
} from 'lucide-react';
import { UserRole, FurnitureName } from '../types';
import { checkNameSimilarity } from '../utils/similarity';
import { ExternalVerificationBadge } from './ExternalVerificationBadge';

interface InicioViewProps {
  onNavigate: (module: string) => void;
  currentUser: string;
  currentRole: UserRole;
  totalNames: number;
  duplicatePrevented: number;
  favoritesCount: number;
  names?: FurnitureName[];
  onOpenCommandMenu?: () => void;
  onOpenNewModalWithQuery?: (initialName: string) => void;
  onOpenNewModal?: () => void;
  onStartValidationQuery?: (query: string) => void;
}

export const InicioView: React.FC<InicioViewProps> = ({
  onNavigate,
  currentUser,
  currentRole,
  totalNames,
  duplicatePrevented,
  favoritesCount,
  names = [],
  onOpenCommandMenu,
  onOpenNewModalWithQuery,
  onOpenNewModal,
  onStartValidationQuery
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const quickReport = searchQuery.trim().length >= 2 && names.length > 0
    ? checkNameSimilarity(searchQuery, names)
    : null;

  const handleValidate = () => {
    if (!searchQuery.trim()) return;
    if (onStartValidationQuery) {
      onStartValidationQuery(searchQuery.trim());
    } else {
      onNavigate('naming-ai');
    }
  };

  const handleRegisterNew = () => {
    if (onOpenNewModalWithQuery) {
      onOpenNewModalWithQuery(searchQuery.trim());
    } else if (onOpenNewModal) {
      onOpenNewModal();
    } else {
      onNavigate('database');
    }
  };
  const modules = [
    {
      id: 'naming-ai',
      title: 'Identifica Nombre',
      subtitle: 'Validación en Tiempo Real',
      description: 'Verifica y valida nombres comerciales detectando colisiones fonéticas y léxicas antes de registrar.',
      icon: SearchCode,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-500 dark:text-amber-400',
      badge: `${duplicatePrevented} colisiones prevenidas`
    },
    {
      id: 'ai-studio',
      title: 'Generador IA',
      subtitle: 'Asistente Creativo de Naming',
      description: 'Genera conceptos de nombres sofisticados con IA Gemini alineados al catálogo de Muebles Macrumo.',
      icon: Sparkles,
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-500 dark:text-purple-400',
      badge: 'Gemini 3.6 Flash'
    },
    {
      id: 'favorites',
      title: 'Historial y Guardados',
      subtitle: 'Favoritos & Actividad',
      description: 'Consulta tus nombres destacados guardados, colecciones seleccionadas y el registro de actividad.',
      icon: Star,
      color: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30 text-yellow-500 dark:text-yellow-400',
      badge: `${favoritesCount} guardados`
    }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 p-8 text-white shadow-xl space-y-6">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800/80 border border-neutral-700/80 text-xs font-mono text-neutral-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Muebles Macrumo • Macrumo Studio v1.0</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Bienvenido, {currentUser}
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl">
            Plataforma centralizada para la creación, registro, validación y administración de nombres comerciales de productos de mobiliario.
          </p>
        </div>

        {/* Prominent Search & Validation Bar inside Welcome Card */}
        <div className="relative z-10 space-y-3">
          <div className="p-2 rounded-2xl bg-neutral-950/90 border border-neutral-800 shadow-inner flex flex-col xl:flex-row items-stretch xl:items-center gap-2.5">
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-neutral-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    handleValidate();
                  }
                }}
                placeholder="Escribe un nombre para buscar o validar (ej. Cama Siena)..."
                className="w-full pl-11 pr-20 py-3.5 rounded-xl bg-neutral-900 border border-neutral-700/80 text-white placeholder-neutral-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/80 transition-all"
              />
              {onOpenCommandMenu && (
                <button
                  type="button"
                  onClick={onOpenCommandMenu}
                  className="absolute right-3 px-2 py-1 rounded bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                  title="Abrir menú de comandos rápido (⌘K)"
                >
                  <span>⌘K</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
              {/* 1. Botón "Validar Nombre" (secundario o amarillo) */}
              <button
                type="button"
                onClick={handleValidate}
                disabled={!searchQuery.trim()}
                className="px-4 py-3.5 rounded-xl bg-amber-400/90 hover:bg-amber-300 disabled:opacity-50 text-neutral-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <SearchCode className="w-4 h-4 text-neutral-950" />
                <span>Validar Nombre</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* 2. Botón "+ Registrar Nuevo Nombre" (botón principal destacado) */}
              <button
                type="button"
                onClick={handleRegisterNew}
                className="px-5 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 border border-amber-300/60"
              >
                <Plus className="w-4 h-4 text-neutral-950 stroke-[2.5]" />
                <span>+ Registrar Nuevo Nombre</span>
              </button>

              {/* 3. Botón "Generar con IA" (botón con estilo secundario/púrpura) */}
              <button
                type="button"
                onClick={() => onNavigate('ai-studio')}
                className="px-4 py-3.5 rounded-xl bg-purple-950/70 hover:bg-purple-900/90 text-purple-200 font-semibold text-xs border border-purple-500/40 hover:border-purple-400 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Generar con IA</span>
              </button>
            </div>
          </div>

          {/* Real-Time Live External Verification Feedback */}
          {searchQuery.trim().length >= 2 && (
            <div className="p-4 rounded-2xl bg-neutral-950/95 border border-neutral-800 text-neutral-100 shadow-2xl space-y-3 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-semibold text-neutral-300">
                  Verificación en tiempo real para: <span className="text-amber-400 font-mono font-bold">"{searchQuery.trim()}"</span>
                </span>
                <button
                  type="button"
                  onClick={handleValidate}
                  className="text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Abrir detector completo de similitud</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* External sources badge (Base Maestra, Web Macrumo, Falabella Perú) */}
              <ExternalVerificationBadge query={searchQuery.trim()} />

              {/* Quick Risk Score pill if names exist */}
              {quickReport && (
                <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">Riesgo en Base Maestra:</span>
                    <span className={`px-2 py-0.5 rounded font-bold font-mono ${
                      quickReport.risk === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                      quickReport.risk === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      quickReport.risk === 'MEDIUM' ? 'bg-yellow-950 text-yellow-400 border border-yellow-800' :
                      'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {quickReport.riskScore}% {quickReport.risk}
                    </span>
                  </div>
                  {quickReport.isAvailable && onOpenNewModalWithQuery && (
                    <button
                      type="button"
                      onClick={() => onOpenNewModalWithQuery(searchQuery.trim())}
                      className="px-3 py-1 rounded-lg bg-emerald-500 text-neutral-950 text-xs font-bold hover:bg-emerald-400 transition-colors cursor-pointer"
                    >
                      Registrar "{searchQuery.trim()}"
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-10 -bottom-20 w-80 h-80 rounded-full bg-gradient-to-br from-amber-500/15 to-purple-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Studio Overview Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
              Módulos de Macrumo Studio
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Selecciona una herramienta para acceder al flujo de trabajo correspondiente.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => onNavigate(mod.id)}
                className="group relative rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 p-6 hover:shadow-xl hover:border-amber-400/50 dark:hover:border-amber-400/50 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`p-3.5 rounded-xl bg-gradient-to-br ${mod.color} border shadow-xs`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      {mod.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-neutral-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {mod.title}
                  </h3>
                  <div className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 mb-2.5">
                    {mod.subtitle}
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs font-bold text-neutral-500 dark:text-neutral-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  <span>Acceder al módulo</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

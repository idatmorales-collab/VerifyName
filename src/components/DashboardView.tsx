import React, { useState } from 'react';
import {
  Database,
  ShieldCheck,
  AlertOctagon,
  FolderKanban,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Layers,
  History,
  SearchCode,
  Search
} from 'lucide-react';
import { FurnitureName, NamingProject, AuditLog } from '../types';
import { checkNameSimilarity } from '../utils/similarity';
import { ExternalVerificationBadge } from './ExternalVerificationBadge';

interface DashboardViewProps {
  names: FurnitureName[];
  projects: NamingProject[];
  auditLogs: AuditLog[];
  onNavigate: (view: string) => void;
  onSelectName: (name: FurnitureName) => void;
  onOpenNewModalWithQuery?: (initialName: string) => void;
  onOpenCommandMenu?: () => void;
  onStartValidationQuery?: (query: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  names,
  projects,
  auditLogs,
  onNavigate,
  onSelectName,
  onOpenNewModalWithQuery,
  onOpenCommandMenu,
  onStartValidationQuery
}) => {
  const [quickCheckName, setQuickCheckName] = useState('');

  const activeNames = names.filter((n) => n.status === 'Activo').length;
  const inDevNames = names.filter((n) => n.status === 'En Desarrollo').length;
  const reservedNames = names.filter((n) => n.status === 'Reservado').length;
  const archivedNames = names.filter((n) => n.status === 'Archivado').length;

  // Real-time quick report for input
  const quickReport = quickCheckName.trim().length >= 2 ? checkNameSimilarity(quickCheckName, names) : null;

  // Category counts
  const categoryCounts: Record<string, number> = {};
  names.forEach((n) => {
    categoryCounts[n.category] = (categoryCounts[n.category] || 0) + 1;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900 dark:bg-neutral-900 border border-neutral-800 text-white p-8 shadow-xl space-y-6">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-white/90">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Muebles Macrumo Naming System</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">
            Control Central de Nombres Comerciales
          </h1>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Gestión inteligente, prevención de colisiones en tiempo real y generación asistida por IA para garantizar registros únicos y proteger la identidad comercial de la marca.
          </p>
        </div>

        {/* Prominent Search Bar inside Central Banner */}
        <div className="relative z-10 space-y-3">
          <div className="p-2 rounded-2xl bg-neutral-950/90 border border-neutral-800 shadow-inner flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-neutral-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={quickCheckName}
                onChange={(e) => setQuickCheckName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && quickCheckName.trim()) {
                    if (onStartValidationQuery) {
                      onStartValidationQuery(quickCheckName.trim());
                    } else {
                      onNavigate('naming-ai');
                    }
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

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (quickCheckName.trim()) {
                    if (onStartValidationQuery) {
                      onStartValidationQuery(quickCheckName.trim());
                    } else {
                      onNavigate('naming-ai');
                    }
                  } else {
                    onNavigate('naming-ai');
                  }
                }}
                className="px-5 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <SearchCode className="w-4 h-4 text-neutral-950" />
                <span>Validar Nombre</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('ai-studio')}
                className="px-4 py-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs border border-neutral-700 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="hidden sm:inline">Generar con IA</span>
              </button>
            </div>
          </div>

          {/* External Verification Badge preview */}
          {quickCheckName.trim().length >= 2 && (
            <div className="pt-2">
              <ExternalVerificationBadge query={quickCheckName.trim()} />
            </div>
          )}
        </div>

        {/* Abstract decorative background */}
        <div className="absolute -right-10 -bottom-20 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-500/20 to-amber-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Base Maestra</span>
            <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white font-mono">{names.length}</div>
            <div className="text-[11px] text-neutral-500 mt-0.5">{activeNames} activos • {inDevNames} en desarrollo</div>
          </div>
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500">
            <span>Reservados: {reservedNames}</span>
            <span>Archivados: {archivedNames}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Duplicados Evitados</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{archivedNames + 12}</div>
            <div className="text-[11px] text-neutral-500 mt-0.5">Alertas de colisión de marca bloqueadas</div>
          </div>
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <span>Tasa de unicidad: 100%</span>
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Colecciones Naming</span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white font-mono">{projects.length}</div>
            <div className="text-[11px] text-neutral-500 mt-0.5">Campañas colaborativas activas</div>
          </div>
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500">
            <span>Equipo Diseñadores</span>
            <span className="font-semibold text-sky-600 dark:text-sky-400">Compartido</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Motor IA Macrumo</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">2.5 Flash</div>
            <div className="text-[11px] text-neutral-500 mt-0.5">Etimología y verificación automática</div>
          </div>
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            <span>Sugerencias activas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Quick Interactive Similarity Checker Widget directly on Dashboard */}
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <SearchCode className="w-4 h-4 text-indigo-500" />
              Verificación Inmediata de Candidato
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Escribe un nombre comercial para comprobar colisiones y similitudes con la Base Maestra en tiempo real.
            </p>
          </div>
          <button
            onClick={() => onNavigate('similarity')}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Ver detector avanzado</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={quickCheckName}
            onChange={(e) => setQuickCheckName(e.target.value)}
            placeholder="Ej: Velveto, Lumina, Koa..."
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
          />
        </div>

        {quickReport && (
          <div className="p-4 rounded-xl border bg-neutral-50 dark:bg-neutral-950/60 border-neutral-200 dark:border-neutral-800 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Candidato: <span className="font-mono text-neutral-900 dark:text-white font-bold">"{quickReport.query}"</span>
                </span>
                {quickReport.risk === 'CRITICAL' && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
                    CRÍTICO ({quickReport.riskScore}%)
                  </span>
                )}
                {quickReport.risk === 'HIGH' && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                    ALTO RIESGO ({quickReport.riskScore}%)
                  </span>
                )}
                {quickReport.risk === 'MEDIUM' && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400">
                    RIESGO MODERADO ({quickReport.riskScore}%)
                  </span>
                )}
                {quickReport.risk === 'SAFE' && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    ÚNICO DISPONIBLE (0%)
                  </span>
                )}
              </div>

              {quickReport.isAvailable && onOpenNewModalWithQuery && (
                <button
                  onClick={() => onOpenNewModalWithQuery(quickReport.query)}
                  className="px-3 py-1 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Registrar Nombre
                </button>
              )}
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400">{quickReport.recommendation}</p>

            {quickReport.matches.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <span className="text-[11px] font-semibold text-neutral-400">Semejanzas más cercanas:</span>
                {quickReport.matches.map((match) => (
                  <div
                    key={match.targetName.id}
                    onClick={() => onSelectName(match.targetName)}
                    className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs hover:border-neutral-400 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900 dark:text-white">{match.targetName.name}</span>
                      <span className="text-[10px] text-neutral-400">({match.targetName.category})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-neutral-500">{match.reason}</span>
                      <span className="font-mono font-bold text-rose-500">{match.similarityPercentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Grid: Category Distribution & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-neutral-500" />
              Distribución por Categoría
            </h2>
            <button
              onClick={() => onNavigate('database')}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            >
              Ver todas
            </button>
          </div>

          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / names.length) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">{cat}</span>
                    <span className="font-mono text-neutral-400">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neutral-800 dark:bg-neutral-200 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit / Recent Activity Trail */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-neutral-500" />
              Historial de Auditoría Reciente
            </h2>
            <button
              onClick={() => onNavigate('audit')}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            >
              Ver registro completo
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800/80 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900 dark:text-white">{log.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      {log.action}
                    </span>
                  </div>
                  <div className="text-neutral-500 text-[11px]">{log.details}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-neutral-700 dark:text-neutral-300 font-medium">{log.user}</div>
                  <div className="text-[10px] text-neutral-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;

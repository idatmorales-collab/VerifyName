import React from 'react';
import { History, ShieldCheck, Palette, FileText, Sparkles, Filter, ArrowLeft } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditViewProps {
  auditLogs: AuditLog[];
  onBack?: () => void;
  onNavigate?: (view: string) => void;
}

export const AuditView: React.FC<AuditViewProps> = ({ auditLogs, onBack, onNavigate }) => {
  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else if (onNavigate) {
      onNavigate('inicio');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
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
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
            Historial y Auditoría de Cambios
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Registro inmutable de acciones realizadas en la Base Maestra de Nombres de Muebles Macrumo.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-semibold text-neutral-500">
          <span>Transacciones Registradas ({auditLogs.length})</span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            Integridad Verificada
          </span>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-950/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 shrink-0 mt-0.5">
                  {log.action === 'REGISTRATION' && <FileText className="w-4 h-4 text-emerald-500" />}
                  {log.action === 'UPDATE' && <FileText className="w-4 h-4 text-sky-500" />}
                  {log.action === 'DELETE' && <FileText className="w-4 h-4 text-rose-500" />}
                  {log.action === 'AI_GENERATED' && <Sparkles className="w-4 h-4 text-amber-500" />}
                  {log.action === 'STATUS_CHANGE' && <History className="w-4 h-4 text-indigo-500" />}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-neutral-900 dark:text-white">{log.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">{log.details}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center gap-1.5 justify-end text-xs font-medium text-neutral-800 dark:text-neutral-200">
                  {log.role === 'Administrador' ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                      <ShieldCheck className="w-3 h-3" />
                      {log.user}
                    </span>
                  ) : (
                    <span className="text-sky-600 dark:text-sky-400 flex items-center gap-1 text-[11px]">
                      <Palette className="w-3 h-3" />
                      {log.user}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-neutral-400">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

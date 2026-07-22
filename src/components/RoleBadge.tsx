import React from 'react';
import { UserRole } from '../types';
import { ShieldCheck, Palette, ChevronDown } from 'lucide-react';

interface RoleBadgeProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentUser: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ currentRole, onRoleChange, currentUser }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all text-xs font-medium text-neutral-800 dark:text-neutral-200"
      >
        <div className="flex items-center gap-1.5">
          {currentRole === 'Administrador' ? (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </span>
          ) : (
            <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-semibold">
              <Palette className="w-3.5 h-3.5" />
              Diseñador
            </span>
          )}
          <span className="text-neutral-400 dark:text-neutral-500">|</span>
          <span className="text-neutral-600 dark:text-neutral-300 max-w-[100px] truncate">{currentUser}</span>
        </div>
        <ChevronDown className="w-3 h-3 text-neutral-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Cambiar Rol de Usuario
            </div>
            <div className="py-1 space-y-1">
              <button
                onClick={() => {
                  onRoleChange('Administrador');
                  setOpen(false);
                }}
                className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-left transition-colors text-xs ${
                  currentRole === 'Administrador'
                    ? 'bg-neutral-100 dark:bg-neutral-800 font-medium text-neutral-900 dark:text-white'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100">Administrador</div>
                  <div className="text-[10px] text-neutral-500">Acceso total, edición, eliminación y auditoría.</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onRoleChange('Diseñador');
                  setOpen(false);
                }}
                className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-left transition-colors text-xs ${
                  currentRole === 'Diseñador'
                    ? 'bg-neutral-100 dark:bg-neutral-800 font-medium text-neutral-900 dark:text-white'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }`}
              >
                <Palette className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100">Diseñador</div>
                  <div className="text-[10px] text-neutral-500">Consulta, detector de similitudes, IA y favoritos.</div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

import React from 'react';
import { Search, ShieldAlert, RefreshCw, LogOut, Shield } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { UserRole } from '../types';
import { getUserAvatarByUsername } from '../data/avatars';

interface HeaderProps {
  onOpenCommandMenu: () => void;
  currentRole: UserRole;
  currentUser: string;
  currentAvatarUrl?: string;
  onOpenEditProfile?: () => void;
  totalNames: number;
  duplicatePrevented: number;
  onRefreshData: () => void;
  isLoading: boolean;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCommandMenu,
  currentRole,
  currentUser,
  currentAvatarUrl,
  onOpenEditProfile,
  totalNames,
  duplicatePrevented,
  onRefreshData,
  isLoading,
  onLogout
}) => {
  return (
    <header className="h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between gap-4">
      {/* Studio Title Branding */}
      <div className="flex items-center gap-3">
        <div className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2 font-display">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Macrumo Studio</span>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400 hidden sm:inline">Sistema de Naming Comercial</span>
        </div>
      </div>

      {/* Header controls & user status */}
      <div className="flex items-center gap-3">
        {/* Quick Stats Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80 text-xs text-neutral-600 dark:text-neutral-300">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-neutral-900 dark:text-white">{totalNames}</span>
            <span className="text-neutral-400">nombres</span>
          </div>
          <span className="text-neutral-300 dark:text-neutral-700">•</span>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{duplicatePrevented} colisiones evitadas</span>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefreshData}
          disabled={isLoading}
          className="p-2 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors"
          title="Sincronizar Base Maestra"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
        </button>

        <ThemeToggle />

        {/* User Badge & Logout */}
        <div className="flex items-center gap-3 pl-2 border-l border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={onOpenEditProfile}
            className="flex items-center gap-2.5 text-left group cursor-pointer p-1 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-850 transition-colors"
            title="Cambiar foto de perfil / icono"
          >
            <div className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs overflow-hidden border border-amber-500/30 dark:border-amber-500/50 shadow-xs group-hover:scale-105 transition-transform">
              <img
                src={getUserAvatarByUsername(currentUser, currentAvatarUrl)}
                alt={currentUser}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="hidden sm:flex flex-col text-xs">
              <span className="font-bold text-neutral-900 dark:text-white leading-tight">{currentUser}</span>
              <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                <Shield className="w-3 h-3 text-amber-500" />
                {currentRole}
              </span>
            </div>
          </button>

          <button
            onClick={onLogout}
            className="p-2 rounded-lg text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors border border-neutral-200 dark:border-neutral-800 cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};

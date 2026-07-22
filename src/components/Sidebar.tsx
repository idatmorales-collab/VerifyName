import React from 'react';
import {
  Home,
  Database,
  SearchCode,
  Sparkles,
  FolderKanban,
  History,
  Download,
  Upload,
  Users,
  Settings,
  Info,
  PlusCircle,
  LogOut,
  Shield,
  Camera,
  UserCog,
  CalendarCheck
} from 'lucide-react';
import { UserRole } from '../types';
import { getUserAvatarByUsername } from '../data/avatars';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenNewModal: () => void;
  currentRole: UserRole;
  currentUser: string;
  currentAvatarUrl?: string;
  onOpenEditProfile?: () => void;
  totalNamesCount: number;
  duplicatePreventedCount: number;
  favoritesCount: number;
  dailyReportCount?: number;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onOpenNewModal,
  currentRole,
  currentUser,
  currentAvatarUrl,
  onOpenEditProfile,
  totalNamesCount,
  duplicatePreventedCount,
  favoritesCount,
  dailyReportCount = 3,
  onLogout
}) => {
  const mainMenuNav = [
    {
      id: 'inicio',
      label: 'Panel General',
      icon: Home,
      badge: null
    },
    {
      id: 'database',
      label: 'Base Maestra',
      icon: Database,
      badge: totalNamesCount
    },
    {
      id: 'naming-ai',
      label: 'Identifica Nombre',
      icon: SearchCode,
      badge: `${duplicatePreventedCount} evita.`
    },
    {
      id: 'ai-studio',
      label: 'Estudio Naming IA',
      icon: Sparkles,
      badge: 'IA'
    },
    {
      id: 'favorites',
      label: 'Colecciones',
      icon: FolderKanban,
      badge: favoritesCount > 0 ? favoritesCount : null
    },
    {
      id: 'audit',
      label: 'Auditoría',
      icon: History,
      badge: null
    }
  ];

  const adminMenuNav = [
    {
      id: 'importations',
      label: 'Importaciones',
      icon: Upload,
      badge: null
    },
    {
      id: 'exportations',
      label: 'Exportaciones',
      icon: Download,
      badge: null
    }
  ];

  if (currentRole === 'Administrador') {
    adminMenuNav.unshift({
      id: 'daily-report',
      label: 'Reporte Diario',
      icon: CalendarCheck,
      badge: dailyReportCount > 0 ? `+${dailyReportCount} hoy` : '0 hoy'
    });
    adminMenuNav.push({
      id: 'users',
      label: 'Usuarios',
      icon: Users,
      badge: 'Admin'
    });
  }

  adminMenuNav.push({
    id: 'settings',
    label: 'Configuración',
    icon: Settings,
    badge: null
  });

  const secondaryNavItems = [
    {
      id: 'about',
      label: 'Acerca de',
      icon: Info
    }
  ];

  return (
    <aside className="w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex flex-col shrink-0 h-screen sticky top-0 select-none z-20">
      {/* Brand Header */}
      <div className="p-4 border-b border-neutral-100 dark:border-neutral-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center font-extrabold text-sm shadow-md">
            M
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-tight text-neutral-900 dark:text-white flex items-center gap-1.5">
              MACRUMO
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 uppercase">
                STUDIO
              </span>
            </div>
            <div className="text-[11px] text-neutral-400">Plataforma Interna 1.0</div>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="p-3">
        <button
          onClick={onOpenNewModal}
          className="w-full py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 rounded-xl font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-all group"
        >
          <PlusCircle className="w-4 h-4 text-white dark:text-neutral-900 group-hover:scale-110 transition-transform" />
          <span>Registrar Nombre</span>
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        <div className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
          MENÚ PRINCIPAL
        </div>
        {mainMenuNav.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isActive
                      ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                      : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-500'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
          ADMINISTRACIÓN
        </div>
        {adminMenuNav.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isActive
                      ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                      : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-500'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
          SISTEMA
        </div>
        {secondaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Active User Footer & Logout */}
      <div className="p-3 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/30 space-y-2">
        <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {/* User Avatar Circle */}
            <div className="relative shrink-0 group">
              <div className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs overflow-hidden border border-amber-500/30 dark:border-amber-500/50 shadow-xs">
                <img
                  src={getUserAvatarByUsername(currentUser, currentAvatarUrl)}
                  alt={currentUser}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              {onOpenEditProfile && (
                <button
                  type="button"
                  onClick={onOpenEditProfile}
                  className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-amber-500 text-neutral-950 hover:scale-110 transition-transform cursor-pointer shadow-xs"
                  title="Cambiar foto de perfil / icono"
                >
                  <Camera className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            <div className="overflow-hidden">
              <div className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                {currentUser}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                <Shield className="w-3 h-3 text-amber-500 shrink-0" />
                <span>{currentRole}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            {onOpenEditProfile && (
              <button
                type="button"
                onClick={onOpenEditProfile}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                title="Editar perfil de usuario / icono"
              >
                <UserCog className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </aside>
  );
};

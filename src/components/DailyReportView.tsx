import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  Download,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User as UserIcon,
  Search,
  Filter,
  ArrowLeft,
  Sparkles,
  Shield,
  Layers,
  RefreshCw,
  Eye,
  Check
} from 'lucide-react';
import { FurnitureName, AuditLog, UserRole } from '../types';
import { getUserAvatarByUsername } from '../data/avatars';

interface DailyReportViewProps {
  names: FurnitureName[];
  auditLogs?: AuditLog[];
  currentUser: string;
  onNavigate: (view: string) => void;
  onSelectName?: (name: FurnitureName) => void;
  onBack?: () => void;
}

export const DailyReportView: React.FC<DailyReportViewProps> = ({
  names,
  auditLogs = [],
  currentUser,
  onNavigate,
  onSelectName,
  onBack
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'yesterday' | 'week' | 'all'>('today');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMarkedRead, setIsMarkedRead] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Today's date representation (e.g. 2026-07-22)
  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to check if a date string belongs to today / selected period
  const filterByPeriod = (dateStr: string) => {
    if (selectedPeriod === 'all') return true;
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();

    if (isNaN(d.getTime())) return true; // fallback for seed data without exact date

    if (selectedPeriod === 'today') {
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    }
    if (selectedPeriod === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return (
        d.getFullYear() === yesterday.getFullYear() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getDate() === yesterday.getDate()
      );
    }
    if (selectedPeriod === 'week') {
      const diffTime = Math.abs(now.getTime() - d.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }
    return true;
  };

  // Combine names & audit events for a comprehensive daily report
  const reportItems = useMemo(() => {
    // 1. Map names to report structure
    const nameItems = names.map((item) => {
      // Determine time
      const itemDate = item.createdAt ? new Date(item.createdAt) : new Date();
      const timeStr = isNaN(itemDate.getTime())
        ? '10:30 AM'
        : itemDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });

      const dateISO = item.createdAt || new Date().toISOString();

      return {
        id: item.id,
        type: 'NAME' as const,
        name: item.name,
        category: item.category,
        user: item.registeredBy || 'Diseñador 01',
        role: item.registeredByRole || ('Diseñador' as UserRole),
        timestamp: dateISO,
        timeStr,
        status: item.status,
        origin: item.origin || 'Registro Directo',
        description: item.description,
        originalItem: item
      };
    });

    return nameItems;
  }, [names]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return reportItems.filter((item) => {
      // Period filter
      const passPeriod = filterByPeriod(item.timestamp);
      if (!passPeriod && selectedPeriod !== 'all') return false;

      // User filter
      if (selectedUserFilter !== 'all') {
        if (!item.user.toLowerCase().includes(selectedUserFilter.toLowerCase())) return false;
      }

      // Status filter
      if (selectedStatusFilter !== 'all') {
        if (selectedStatusFilter === 'Activo' && item.status !== 'Activo') return false;
        if (selectedStatusFilter === 'Archivado' && item.status !== 'Archivado') return false;
        if (selectedStatusFilter === 'En Desarrollo' && item.status !== 'En Desarrollo') return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const nameMatch = item.name.toLowerCase().includes(q);
        const userMatch = item.user.toLowerCase().includes(q);
        const catMatch = item.category.toLowerCase().includes(q);
        if (!nameMatch && !userMatch && !catMatch) return false;
      }

      return true;
    });
  }, [reportItems, selectedPeriod, selectedUserFilter, selectedStatusFilter, searchQuery]);

  // KPI Statistics calculation
  const stats = useMemo(() => {
    const totalToday = filteredItems.length;
    const activeCount = filteredItems.filter((i) => i.status === 'Activo').length;
    const archivedCount = filteredItems.filter((i) => i.status === 'Archivado').length;
    const inDevCount = filteredItems.filter((i) => i.status === 'En Desarrollo').length;

    const uniqueUsers = new Set(filteredItems.map((i) => i.user)).size;

    return {
      totalToday,
      activeCount,
      archivedCount,
      inDevCount,
      uniqueUsers
    };
  }, [filteredItems]);

  // Download CSV logic
  const handleExportCSV = () => {
    if (filteredItems.length === 0) {
      alert('No hay registros disponibles en el filtro actual para exportar.');
      return;
    }

    const headers = ['ID', 'Nombre', 'Categoría', 'Registrado Por', 'Hora Exacta', 'Estado', 'Origen / Canal', 'Descripción'];
    const csvRows = [headers.join(',')];

    filteredItems.forEach((item) => {
      const row = [
        `"${item.id}"`,
        `"${item.name.replace(/"/g, '""')}"`,
        `"${item.category}"`,
        `"${item.user.replace(/"/g, '""')}"`,
        `"${item.timeStr}"`,
        `"${item.status}"`,
        `"${item.origin}"`,
        `"${(item.description || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvRows.join('\n'));
    const link = document.createElement('a');
    link.href = csvContent;
    link.download = `reporte_diario_macrumo_${todayStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessNotice('Reporte CSV descargado exitosamente.');
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleMarkAsRead = () => {
    setIsMarkedRead(true);
    setSuccessNotice('Todas las notificaciones del reporte diario han sido marcadas como leídas.');
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  // Distinct users list for dropdown filter
  const distinctUsers = useMemo(() => {
    const set = new Set<string>();
    reportItems.forEach((i) => set.add(i.user));
    return Array.from(set);
  }, [reportItems]);

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Volver"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Shield className="w-3.5 h-3.5" />
              Exclusivo Administrador
            </div>
            {!isMarkedRead && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                En Tiempo Real
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-3">
            <CalendarCheck className="w-7 h-7 text-amber-500" />
            Reporte Diario de Actividad y Registros
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Resumen consolidado de registros, cargas masivas e incidencias detectadas hoy en la plataforma.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleMarkAsRead}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer ${
              isMarkedRead
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border-neutral-300 dark:border-neutral-700'
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{isMarkedRead ? 'Leído' : 'Marcar Leídos'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-semibold border border-neutral-200 dark:border-neutral-700 transition-all flex items-center gap-2 cursor-pointer"
            title="Imprimir o Guardar como PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center gap-2 cursor-pointer border border-amber-300/50"
          >
            <FileSpreadsheet className="w-4 h-4 text-neutral-950" />
            <span>Descargar Reporte del Día (CSV)</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-medium">
            <span>Registros / Cargas Hoy</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
            {stats.totalToday}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            {stats.totalToday > 0 ? `+${stats.totalToday} movimientos activos` : 'Sin actividad reciente'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-medium">
            <span>Aprobados / Validados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.activeCount}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Ingresados a la Base Maestra
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-medium">
            <span>Colisiones Detectadas</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {stats.archivedCount}
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Protegidos por algoritmo de similitud
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-medium">
            <span>Usuarios Activos Hoy</span>
            <UserIcon className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
            {stats.uniqueUsers}
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
            Miembros del equipo de diseño
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, usuario o categoría..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-neutral-400 text-[11px] font-semibold uppercase tracking-wider mr-1">Rango:</span>
            <button
              onClick={() => setSelectedPeriod('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedPeriod === 'today'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              Hoy ({todayStr})
            </button>
            <button
              onClick={() => setSelectedPeriod('yesterday')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedPeriod === 'yesterday'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              Ayer
            </button>
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedPeriod === 'week'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              Últimos 7 días
            </button>
            <button
              onClick={() => setSelectedPeriod('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedPeriod === 'all'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              Todo el Historial
            </button>
          </div>
        </div>

        {/* Secondary Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-500 font-medium">Filtrar Usuario:</span>
            <select
              value={selectedUserFilter}
              onChange={(e) => setSelectedUserFilter(e.target.value)}
              className="py-1 px-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs focus:outline-none"
            >
              <option value="all">Todos los Usuarios</option>
              {distinctUsers.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-medium">Estado:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="py-1 px-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs focus:outline-none"
            >
              <option value="all">Todos los Estados</option>
              <option value="Activo">Aprobado / Activo</option>
              <option value="Archivado">Colisión / Archivado</option>
              <option value="En Desarrollo">En Desarrollo</option>
            </select>
          </div>

          <div className="ml-auto text-neutral-400 text-[11px] font-mono">
            Mostrando {filteredItems.length} de {reportItems.length} registros
          </div>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 flex items-center justify-between">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Detalle del Registro Diario
          </h3>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
            Actualización automatizada
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-950 text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Nombre / Producto</th>
                <th className="py-3.5 px-4">Usuario Responsable</th>
                <th className="py-3.5 px-4">Hora Exacta</th>
                <th className="py-3.5 px-4">Origen / Canal</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acción</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/80">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <CalendarCheck className="w-8 h-8 text-neutral-400 mx-auto opacity-50" />
                      <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                        No se encontraron registros para los filtros seleccionados
                      </p>
                      <p className="text-xs text-neutral-400">
                        Prueba ajustando el rango de fechas o seleccionando otro usuario.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const avatarSrc = getUserAvatarByUsername(item.user);
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-neutral-50/80 dark:hover:bg-neutral-850/60 transition-colors group"
                    >
                      {/* Name / Product */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-neutral-900 dark:text-white text-sm group-hover:text-amber-500 transition-colors">
                          {item.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] font-medium text-neutral-600 dark:text-neutral-300">
                            {item.category}
                          </span>
                          <span className="text-[11px] text-neutral-400 truncate max-w-[200px]">
                            {item.description || 'Sin descripción'}
                          </span>
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-500/40 bg-neutral-950 shrink-0">
                            <img
                              src={avatarSrc}
                              alt={item.user}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-900 dark:text-white text-xs">
                              {item.user}
                            </div>
                            <div className="text-[10px] text-neutral-500">
                              {item.role || 'Diseñador'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Time */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{item.timeStr}</span>
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {new Date(item.timestamp).toLocaleDateString('es-ES')}
                        </div>
                      </td>

                      {/* Origin */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          {item.origin}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            item.status === 'Activo'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : item.status === 'Archivado'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                          }`}
                        >
                          {item.status === 'Activo' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Aprobado</span>
                            </>
                          ) : item.status === 'Archivado' ? (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                              <span>Colisión</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-blue-500" />
                              <span>Pendiente</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {onSelectName && (
                          <button
                            onClick={() => onSelectName(item.originalItem)}
                            className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Ficha</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

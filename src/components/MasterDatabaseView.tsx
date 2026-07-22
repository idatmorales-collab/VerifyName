import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Star,
  Trash2,
  Eye,
  FileSpreadsheet,
  FileJson,
  CheckCircle2,
  Clock,
  Archive,
  AlertCircle,
  MoreVertical,
  LayoutGrid,
  List,
  RotateCcw,
  AlertTriangle,
  X
} from 'lucide-react';
import { FurnitureName, FurnitureCategory, FurnitureLine, NameStatus, UserRole } from '../types';
import { ExternalVerificationBadge } from './ExternalVerificationBadge';

interface MasterDatabaseViewProps {
  names: FurnitureName[];
  activeCategoryFilter: string;
  onSelectCategoryFilter: (category: string) => void;
  onSelectName: (name: FurnitureName) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteName: (id: string) => void;
  onOpenNewModal: () => void;
  onOpenImportModal?: () => void;
  onResetDatabase?: () => void;
  currentRole: UserRole;
}

export const MasterDatabaseView: React.FC<MasterDatabaseViewProps> = ({
  names,
  activeCategoryFilter,
  onSelectCategoryFilter,
  onSelectName,
  onToggleFavorite,
  onDeleteName,
  onOpenNewModal,
  onOpenImportModal,
  onResetDatabase,
  currentRole
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [lineFilter, setLineFilter] = useState<string>('Todas');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'category'>('date');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const isAdmin = currentRole === 'Administrador' || (currentRole as string) === 'admin';

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

  const statuses: NameStatus[] = ['Activo', 'En Desarrollo', 'Reservado', 'Archivado'];

  // Filtered & Sorted items
  const filteredNames = useMemo(() => {
    return names
      .filter((item) => {
        if (activeCategoryFilter !== 'Todas' && item.category !== activeCategoryFilter) return false;
        if (statusFilter !== 'Todos' && item.status !== statusFilter) return false;
        if (lineFilter !== 'Todas' && item.line !== lineFilter) return false;
        if (onlyFavorites && !item.favorite) return false;

        if (search.trim()) {
          const q = search.toLowerCase();
          return (
            item.name.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.line.toLowerCase().includes(q) ||
            item.materials.some((m) => m.toLowerCase().includes(q)) ||
            item.tags.some((t) => t.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'category') return a.category.localeCompare(b.category);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [names, activeCategoryFilter, statusFilter, lineFilter, onlyFavorites, search, sortBy]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Nombre', 'Categoría', 'Línea', 'Materiales', 'Estado', 'Registrado Por', 'Fecha'];
    const rows = filteredNames.map((n) => [
      n.id,
      `"${n.name}"`,
      `"${n.category}"`,
      `"${n.line}"`,
      `"${n.materials.join(', ')}"`,
      `"${n.status}"`,
      `"${n.registeredBy}"`,
      `"${new Date(n.createdAt).toLocaleDateString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Macrumo_Nombres_Master_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredNames, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Macrumo_Nombres_Master_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
            Base de Datos Maestra
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Catálogo centralizado de nombres registrados para Muebles Macrumo ({filteredNames.length} registros).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && onResetDatabase && (
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Restablecer base de datos a su estado original"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer Base</span>
            </button>
          )}

          {onOpenImportModal && (
            <button
              onClick={onOpenImportModal}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Importar catálogo desde Excel, CSV, Word o PDF"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Importar Base</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Exportar archivo CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Exportar archivo JSON"
          >
            <FileJson className="w-3.5 h-3.5 text-sky-500" />
            <span>JSON</span>
          </button>

          <button
            onClick={onOpenNewModal}
            className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-xs shadow-sm hover:opacity-90 flex items-center gap-1.5 transition-opacity cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Nombre</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs">
        {/* Row 1: Search & Toggles */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar o verificar disponibilidad en tiempo real (Ej: Cama Siena, Velvet, Koa)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          {search.trim().length >= 2 && (
            <div className="w-full pt-1">
              <ExternalVerificationBadge query={search} compact />
            </div>
          )}

          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            {/* Favorites Toggle */}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                onlyFavorites
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>Favoritos</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-700'
                }`}
                title="Vista en Tabla"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-700'
                }`}
                title="Vista en Tarjetas"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Category & Status Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mr-1">Categoría:</span>
            <button
              onClick={() => onSelectCategoryFilter('Todas')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategoryFilter === 'Todas'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeCategoryFilter === cat
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-700 dark:text-neutral-300 focus:outline-none"
            >
              <option value="Todos">Todos los Estados</option>
              {statuses.map((st) => (
                <option key={st} value={st}>
                  Estado: {st}
                </option>
              ))}
            </select>

            <select
              value={lineFilter}
              onChange={(e) => setLineFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-700 dark:text-neutral-300 focus:outline-none"
            >
              <option value="Todas">Todas las Colecciones</option>
              {lines.map((ln) => (
                <option key={ln} value={ln}>
                  {ln}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table or Card Grid */}
      {filteredNames.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
          <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto" />
          <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            No se encontraron registros
          </div>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Prueba ajustando los filtros de búsqueda o registra una nueva propuesta comercial en la base de datos.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-950/80 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5 w-10 text-center">★</th>
                  <th className="p-3.5">Nombre Comercial</th>
                  <th className="p-3.5">Categoría</th>
                  <th className="p-3.5">Colección / Línea</th>
                  <th className="p-3.5">Materiales Clave</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5">Registrado Por</th>
                  <th className="p-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {filteredNames.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors group"
                  >
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => onToggleFavorite(item.id)}
                        className="p-1 text-neutral-300 hover:text-amber-400 transition-colors"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            item.favorite ? 'fill-amber-400 text-amber-400' : 'text-neutral-300 dark:text-neutral-700'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="p-3.5 font-bold text-neutral-900 dark:text-white">
                      <button
                        onClick={() => onSelectName(item)}
                        className="hover:underline text-left font-mono text-sm tracking-tight"
                      >
                        {item.name}
                      </button>
                    </td>
                    <td className="p-3.5 text-neutral-700 dark:text-neutral-300">{item.category}</td>
                    <td className="p-3.5 text-neutral-500 text-[11px]">{item.line}</td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {item.materials.slice(0, 2).map((m) => (
                          <span
                            key={m}
                            className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[10px]"
                          >
                            {m}
                          </span>
                        ))}
                        {item.materials.length > 2 && (
                          <span className="text-[10px] text-neutral-400">+{item.materials.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5">
                      {item.status === 'Activo' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Activo
                        </span>
                      )}
                      {item.status === 'En Desarrollo' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400">
                          <Clock className="w-3 h-3" />
                          En Desarrollo
                        </span>
                      )}
                      {item.status === 'Reservado' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                          <Clock className="w-3 h-3" />
                          Reservado
                        </span>
                      )}
                      {item.status === 'Archivado' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                          <Archive className="w-3 h-3" />
                          Archivado
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-neutral-500 text-[11px]">{item.registeredBy}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectName(item)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                          title="Ver Ficha Técnica"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {currentRole === 'Administrador' && (
                          <button
                            onClick={() => onDeleteName(item.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                            title="Eliminar Registro (Solo Admin)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNames.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectName(item)}
              className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 transition-all cursor-pointer space-y-3 group shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-neutral-400">{item.category}</div>
                  <h3 className="text-lg font-bold font-mono tracking-tight text-neutral-900 dark:text-white group-hover:underline">
                    {item.name}
                  </h3>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(item.id);
                  }}
                  className="p-1.5 text-neutral-300 hover:text-amber-400"
                >
                  <Star
                    className={`w-4 h-4 ${
                      item.favorite ? 'fill-amber-400 text-amber-400' : 'text-neutral-300 dark:text-neutral-700'
                    }`}
                  />
                </button>
              </div>

              <div className="text-xs text-neutral-500 line-clamp-2">{item.description}</div>

              <div className="flex flex-wrap gap-1 pt-1">
                {item.materials.map((m) => (
                  <span
                    key={m}
                    className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] text-neutral-600 dark:text-neutral-400"
                  >
                    {m}
                  </span>
                ))}
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                <span>{item.line}</span>
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Restablecer Base de Datos
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  ¿Estás seguro de eliminar los datos cargados? Esta acción restaurará la base de datos a su estado original y no se puede deshacer.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-[11px] text-rose-700 dark:text-rose-300">
              ⚠ <strong>Atención:</strong> Se restaurará el conjunto de datos por defecto de la Base Maestra ({names.length} registros actualmente).
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onResetDatabase) {
                    onResetDatabase();
                  }
                  setIsResetModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sí, eliminar todos los datos</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

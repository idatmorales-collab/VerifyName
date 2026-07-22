import React, { useState, useMemo } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileCode,
  FileText,
  Filter,
  CheckCircle2,
  Calendar,
  Database,
  Layers,
  Sparkles,
  FileCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { FurnitureName, FurnitureCategory, FurnitureLine, NameStatus } from '../types';

interface ExportationsViewProps {
  names: FurnitureName[];
}

export const ExportationsView: React.FC<ExportationsViewProps> = ({ names }) => {
  const [selectedFormat, setSelectedFormat] = useState<'xlsx' | 'csv' | 'pdf'>('xlsx');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas');
  const [originFilter, setOriginFilter] = useState<string>('Todos');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [lineFilter, setLineFilter] = useState<string>('Todas');
  const [dateFilter, setDateFilter] = useState<string>('Todas');

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

  const origins = ['Todos', 'Macrumo', 'Falabella (Muebles Macrumo)', 'Archivos Internos', 'Importado / Catálogo'];
  const statuses: NameStatus[] = ['Activo', 'En Desarrollo', 'Reservado', 'Archivado'];
  const lines: FurnitureLine[] = [
    'Colección Atemporal',
    'Línea Moderna',
    'Artesanal Macrumo',
    'Escandinavo Orgánico',
    'Minimalista Urbano',
    'Lujo Contemporáneo'
  ];

  // Filter Matching Records
  const filteredNames = useMemo(() => {
    return names.filter((item) => {
      if (categoryFilter !== 'Todas' && item.category !== categoryFilter) return false;
      if (statusFilter !== 'Todos' && item.status !== statusFilter) return false;
      if (lineFilter !== 'Todas' && item.line !== lineFilter) return false;

      if (originFilter !== 'Todos') {
        const itemOrigin = item.origin || 'Macrumo';
        if (originFilter === 'Macrumo' && !/macrumo/i.test(itemOrigin)) return false;
        if (originFilter === 'Falabella (Muebles Macrumo)' && !/falabella/i.test(itemOrigin)) return false;
        if (originFilter === 'Archivos Internos' && !/interno/i.test(itemOrigin)) return false;
      }

      if (dateFilter !== 'Todas') {
        const itemDate = new Date(item.createdAt);
        const now = new Date();
        if (dateFilter === '30days') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (itemDate < thirtyDaysAgo) return false;
        } else if (dateFilter === '2026') {
          if (itemDate.getFullYear() !== 2026) return false;
        }
      }

      return true;
    });
  }, [names, categoryFilter, originFilter, statusFilter, lineFilter, dateFilter]);

  // Handle Export Action
  const handleExport = () => {
    if (filteredNames.length === 0) {
      alert('No hay registros coincidentes para exportar.');
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];

    if (selectedFormat === 'xlsx') {
      const exportData = filteredNames.map((n) => ({
        ID: n.id,
        'Nombre Comercial': n.name,
        Categoría: n.category,
        'Colección / Línea': n.line,
        Origen: n.origin || 'Macrumo',
        Materiales: n.materials.join(', '),
        Estado: n.status,
        'Registrado Por': n.registeredBy,
        'Fecha Registro': new Date(n.createdAt).toLocaleDateString('es-ES')
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Base Maestra');
      XLSX.writeFile(workbook, `Macrumo_Base_Maestra_${timestamp}.xlsx`);
    } else if (selectedFormat === 'csv') {
      const headers = ['ID', 'Nombre Comercial', 'Categoría', 'Línea', 'Origen', 'Materiales', 'Estado', 'Registrado Por', 'Fecha'];
      const rows = filteredNames.map((n) => [
        n.id,
        `"${n.name}"`,
        `"${n.category}"`,
        `"${n.line}"`,
        `"${n.origin || 'Macrumo'}"`,
        `"${n.materials.join(', ')}"`,
        `"${n.status}"`,
        `"${n.registeredBy}"`,
        `"${new Date(n.createdAt).toLocaleDateString('es-ES')}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Macrumo_Base_Maestra_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (selectedFormat === 'pdf') {
      const doc = new jsPDF();

      // Header
      doc.setFillColor(15, 15, 15);
      doc.rect(0, 0, 210, 30, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text('CATÁLOGO OFICIAL DE NOMBRES - MUEBLES MACRUMO', 14, 18);

      doc.setFontSize(9);
      doc.text(`Base Maestra Exportada (${filteredNames.length} registros) - ${new Date().toLocaleDateString('es-ES')}`, 14, 24);

      // Table rows
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(9);

      let y = 40;
      doc.setFontSize(8);
      doc.setFillColor(240, 240, 240);
      doc.rect(14, y, 182, 8, 'F');
      doc.text('NOMBRE', 18, y + 6);
      doc.text('CATEGORÍA', 65, y + 6);
      doc.text('LÍNEA', 110, y + 6);
      doc.text('ESTADO', 165, y + 6);

      y += 12;

      filteredNames.forEach((item, idx) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(9);
        doc.text(item.name, 18, y);
        doc.text(item.category, 65, y);
        doc.text(item.line, 110, y);
        doc.text(item.status, 165, y);

        y += 7;
      });

      doc.save(`Macrumo_Catalogo_Base_Maestra_${timestamp}.pdf`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-display flex items-center gap-2">
          <span>📤 Exportaciones</span>
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Generación de reportes y exportación masiva de la Base Maestra con filtros avanzados.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Formats & Filters */}
        <div className="lg:col-span-2 space-y-6">
          {/* Format Selector */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              1. Formato de Exportación
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedFormat('xlsx')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  selectedFormat === 'xlsx'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-500 shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <FileSpreadsheet className="w-6 h-6 text-emerald-500 shrink-0" />
                <div>
                  <div className="font-bold text-xs">Excel (.xlsx)</div>
                  <div className="text-[10px] text-neutral-400">Hoja de cálculo estructurada</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat('csv')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  selectedFormat === 'csv'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-500 shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <FileCode className="w-6 h-6 text-sky-500 shrink-0" />
                <div>
                  <div className="font-bold text-xs">CSV (.csv)</div>
                  <div className="text-[10px] text-neutral-400">Texto separado por comas</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat('pdf')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  selectedFormat === 'pdf'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-500 shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <FileText className="w-6 h-6 text-rose-500 shrink-0" />
                <div>
                  <div className="font-bold text-xs">PDF (.pdf)</div>
                  <div className="text-[10px] text-neutral-400">Catálogo imprimible en PDF</div>
                </div>
              </button>
            </div>
          </div>

          {/* Filters Form */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-xs">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              <span>2. Filtros Avanzados de Selección</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Categoría
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Todas">Todas las categorías</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Origen / Colección Fuente
                </label>
                <select
                  value={originFilter}
                  onChange={(e) => setOriginFilter(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {origins.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Colección / Línea
                </label>
                <select
                  value={lineFilter}
                  onChange={(e) => setLineFilter(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Todas">Todas las colecciones</option>
                  {lines.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Estado
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Todos">Todos los estados</option>
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Rango de Fecha
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Todas">Todas las fechas (Histórico completo)</option>
                  <option value="30days">Últimos 30 días</option>
                  <option value="2026">Año 2026</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Summary & Action */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-neutral-900 text-white border border-neutral-800 space-y-5 shadow-xl">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Conteo en Vivo</span>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-extrabold tracking-tight font-mono text-amber-400">
                {filteredNames.length}
              </div>
              <div className="text-xs text-neutral-400">
                Se exportarán <span className="text-white font-bold">{filteredNames.length}</span> registros coincidentes con los filtros seleccionados.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-800/80 border border-neutral-700 space-y-2 text-xs text-neutral-300">
              <div className="flex justify-between">
                <span className="text-neutral-400">Formato:</span>
                <span className="font-bold text-white uppercase">{selectedFormat}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Categoría:</span>
                <span className="font-bold text-white">{categoryFilter}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Origen:</span>
                <span className="font-bold text-white">{originFilter}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Estado:</span>
                <span className="font-bold text-white">{statusFilter}</span>
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={filteredNames.length === 0}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[3]" />
              <span>Descargar Archivo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

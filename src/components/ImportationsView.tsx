import React, { useState } from 'react';
import {
  Upload,
  Plus,
  FileSpreadsheet,
  FileText,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Download,
  Trash2,
  Clock,
  User as UserIcon,
  Database,
  Filter,
  X,
  FileCheck,
  Building2,
  Layers
} from 'lucide-react';
import { ImportRecord, FurnitureName, UserRole } from '../types';
import jsPDF from 'jspdf';

interface ImportationsViewProps {
  importHistory: ImportRecord[];
  onOpenImportModal: () => void;
  onDeleteImportRecord: (id: string) => void;
  existingNames: FurnitureName[];
  currentRole: UserRole;
}

export const ImportationsView: React.FC<ImportationsViewProps> = ({
  importHistory,
  onOpenImportModal,
  onDeleteImportRecord,
  existingNames,
  currentRole
}) => {
  const [selectedRecord, setSelectedRecord] = useState<ImportRecord | null>(null);

  // Compute stats
  const totalFiles = importHistory.length;
  const totalProcessed = importHistory.reduce((acc, curr) => acc + curr.totalCount, 0);
  const totalNew = importHistory.reduce((acc, curr) => acc + curr.newCount, 0);
  const totalDuplicates = importHistory.reduce((acc, curr) => acc + curr.duplicateCount, 0);

  // Download PDF Report for a specific import
  const handleDownloadPDFReport = (record: ImportRecord) => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(15, 15, 15);
    doc.rect(0, 0, 210, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('MACRUMO STUDIO - REPORTES DE IMPORTACIÓN', 14, 18);

    doc.setFontSize(9);
    doc.text('Auditoría e Historial de Ingesta Masiva de Nombres', 14, 24);

    // Record info
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(12);
    doc.text(`Archivo: ${record.fileName}`, 14, 42);

    doc.setFontSize(10);
    doc.text(`Usuario: ${record.user}`, 14, 50);
    doc.text(`Fecha: ${new Date(record.date).toLocaleString('es-ES')}`, 14, 56);
    doc.text(`Estado: ${record.status}`, 14, 62);

    // Metrics table
    doc.setFillColor(245, 245, 245);
    doc.rect(14, 70, 182, 30, 'F');

    doc.setFontSize(10);
    doc.text(`Total Procesados: ${record.totalCount}`, 20, 82);
    doc.text(`Nuevos Incorporados: ${record.newCount}`, 20, 90);
    doc.text(`Duplicados Omitidos: ${record.duplicateCount}`, 110, 82);
    doc.text(`Registros con Similitud: ${record.similarCount}`, 110, 90);

    // Details section
    doc.setFontSize(11);
    doc.text('Resumen de Limpieza de Marca:', 14, 112);

    doc.setFontSize(9);
    let y = 120;
    if (record.details.skippedNames && record.details.skippedNames.length > 0) {
      doc.text(`Nombres duplicados omitidos (${record.details.skippedNames.length}):`, 14, y);
      y += 6;
      record.details.skippedNames.forEach((name) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(`• ${name}`, 20, y);
        y += 5;
      });
    } else {
      doc.text('No se detectaron duplicados omitidos.', 14, y);
    }

    doc.save(`Macrumo_Reporte_Importacion_${record.id}.pdf`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-display flex items-center gap-2">
            <span>📥 Importaciones</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Gestión e historial de importaciones masivas de catálogos y bases de datos.
          </p>
        </div>

        <button
          onClick={onOpenImportModal}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nueva Importación</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Archivos Importados</span>
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-neutral-900 dark:text-white">{totalFiles}</div>
          <p className="text-[11px] text-neutral-500">Historial de catálogos procesados</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Registros Procesados</span>
            <Database className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-extrabold text-neutral-900 dark:text-white">{totalProcessed}</div>
          <p className="text-[11px] text-neutral-500">Evaluados por el motor fonético</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Nuevos Incorporados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{totalNew}</div>
          <p className="text-[11px] text-neutral-500">Agregados a la Base Maestra</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Duplicados Omitidos</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{totalDuplicates}</div>
          <p className="text-[11px] text-neutral-500">Protección de identidad de marca (100%)</p>
        </div>
      </div>

      {/* Import History Table */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
            Historial de Cargas Masivas
          </h2>
          <span className="text-xs text-neutral-500">
            {importHistory.length} registros guardados
          </span>
        </div>

        {importHistory.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 space-y-3">
            <Upload className="w-8 h-8 text-neutral-400 mx-auto" />
            <div className="text-sm font-semibold">No hay importaciones registradas</div>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Haz clic en "Nueva Importación" para cargar tu primer archivo Excel, CSV, Word o PDF.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-950/80 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Archivo / Formato</th>
                  <th className="p-3.5">Usuario</th>
                  <th className="p-3.5">Fecha y Hora</th>
                  <th className="p-3.5">Registros (Total / Nuevos / Dup)</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {importHistory.map((rec) => (
                  <tr
                    key={rec.id}
                    className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="p-3.5 font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <div>{rec.fileName}</div>
                        <div className="text-[10px] text-neutral-400 font-normal">{rec.fileType}</div>
                      </div>
                    </td>
                    <td className="p-3.5 text-neutral-700 dark:text-neutral-300">
                      <span className="inline-flex items-center gap-1">
                        <UserIcon className="w-3 h-3 text-neutral-400" />
                        {rec.user}
                      </span>
                    </td>
                    <td className="p-3.5 text-neutral-500 text-[11px]">
                      {new Date(rec.date).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold" title="Total procesados">
                          {rec.totalCount}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold" title="Nuevos incorporados">
                          +{rec.newCount}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 font-bold" title="Duplicados omitidos">
                          -{rec.duplicateCount}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        {rec.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedRecord(rec)}
                          className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Ver detalle de importación"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detalle</span>
                        </button>

                        <button
                          onClick={() => handleDownloadPDFReport(rec)}
                          className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                          title="Descargar reporte PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {currentRole === 'Administrador' && (
                          <button
                            onClick={() => onDeleteImportRecord(rec.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                            title="Eliminar registro de historial"
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
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Detalle de Importación
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-sm font-bold text-neutral-900 dark:text-white">
                  <span>{selectedRecord.fileName}</span>
                  <span className="text-emerald-500 font-mono text-xs">{selectedRecord.status}</span>
                </div>
                <div className="text-neutral-500 space-y-0.5">
                  <div>Usuario responsable: <strong className="text-neutral-800 dark:text-neutral-200">{selectedRecord.user}</strong></div>
                  <div>Fecha y hora: <strong className="text-neutral-800 dark:text-neutral-200">{new Date(selectedRecord.date).toLocaleString('es-ES')}</strong></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <div className="text-[10px] uppercase font-bold">Nuevos Nombres</div>
                  <div className="text-lg font-extrabold">{selectedRecord.newCount}</div>
                </div>

                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                  <div className="text-[10px] uppercase font-bold">Duplicados Omitidos</div>
                  <div className="text-lg font-extrabold">{selectedRecord.duplicateCount}</div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                  <div className="text-[10px] uppercase font-bold">Similares Revisados</div>
                  <div className="text-lg font-extrabold">{selectedRecord.similarCount}</div>
                </div>
              </div>

              {selectedRecord.details.skippedNames && selectedRecord.details.skippedNames.length > 0 && (
                <div className="space-y-2">
                  <div className="font-bold text-neutral-800 dark:text-neutral-200">
                    Nombres Duplicados Omitidos por la Plataforma ({selectedRecord.details.skippedNames.length}):
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                    {selectedRecord.details.skippedNames.map((n, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 font-mono text-[10px]">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-950/50">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400"
              >
                Cerrar
              </button>

              <button
                onClick={() => handleDownloadPDFReport(selectedRecord)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Reporte PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

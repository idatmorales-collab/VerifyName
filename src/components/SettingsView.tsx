import React, { useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  Database,
  Shield,
  Moon,
  Sun,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { UserRole } from '../types';

interface SettingsViewProps {
  currentRole: UserRole;
  currentUser: string;
  onRefreshData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentRole,
  currentUser,
  onRefreshData
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportDB = async () => {
    try {
      const res = await fetch('/api/db/export');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `macrumo-studio-db-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error al exportar la base de datos.');
    }
  };

  const handleImportDB = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (currentRole !== 'Administrador') {
      alert('Solo los administradores pueden importar bases de datos.');
      return;
    }

    setIsImporting(true);
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonContent = JSON.parse(event.target?.result as string);
        const res = await fetch('/api/db/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...jsonContent,
            adminUser: currentUser
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al importar');

        setImportStatus(`Importación completada: ${data.totalNames} nombres cargados.`);
        onRefreshData();
      } catch (err: any) {
        setImportStatus(`Error de importación: ${err.message}`);
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-1">
          <Settings className="w-4 h-4" />
          <span>Configuración Global</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Configuración de Macrumo Studio
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Gestión de datos, copias de seguridad e información del sistema.
        </p>
      </div>

      {/* Database Import / Export Section */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
              Gestión de Base de Datos
            </h3>
            <p className="text-xs text-neutral-500">
              Exportación e importación de la Base Maestra en formato JSON completo.
            </p>
          </div>
        </div>

        {importStatus && (
          <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{importStatus}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Export Button */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-xs text-neutral-800 dark:text-neutral-200">
              <Download className="w-4 h-4 text-blue-500" />
              <span>Exportar Copia de Seguridad</span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Descarga un archivo JSON estructurado con todos los nombres, líneas, auditorías y proyectos registrados.
            </p>
            <button
              onClick={handleExportDB}
              className="w-full py-2 px-3 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar DB (JSON)</span>
            </button>
          </div>

          {/* Import Button */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-xs text-neutral-800 dark:text-neutral-200">
              <Upload className="w-4 h-4 text-amber-500" />
              <span>Importar Base de Datos</span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Carga una base de datos externa en formato JSON. Se requiere rol de Administrador.
            </p>
            {currentRole === 'Administrador' ? (
              <label className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-neutral-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>{isImporting ? 'Cargando...' : 'Seleccionar Archivo JSON'}</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportDB}
                  disabled={isImporting}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="p-2 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-[11px] text-neutral-500 text-center">
                Opción restringida a Administradores
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
              Estado de la Plataforma
            </h3>
            <p className="text-xs text-neutral-500">
              Información del servidor e integración de Inteligencia Artificial.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
            <div className="text-neutral-400 text-[10px] uppercase font-mono">Entorno de Servidor</div>
            <div className="font-bold text-neutral-800 dark:text-neutral-200 mt-1">Node.js Express API</div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
            <div className="text-neutral-400 text-[10px] uppercase font-mono">Motor de IA</div>
            <div className="font-bold text-neutral-800 dark:text-neutral-200 mt-1">Gemini 3.6 Flash API</div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
            <div className="text-neutral-400 text-[10px] uppercase font-mono">Encriptación de Usuarios</div>
            <div className="font-bold text-neutral-800 dark:text-neutral-200 mt-1">bcrypt Hashing Engine</div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { X, AlertOctagon, AlertTriangle, CheckCircle2, ShieldCheck, Plus, Sparkles } from 'lucide-react';
import { FurnitureName, FurnitureCategory, FurnitureLine, NameStatus, UserRole } from '../types';
import { checkNameSimilarity } from '../utils/similarity';
import { ExternalVerificationBadge } from './ExternalVerificationBadge';

interface NameRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingNames: FurnitureName[];
  onSubmitName: (newFurnitureName: Partial<FurnitureName>) => Promise<void>;
  currentUser: string;
  currentRole: UserRole;
  initialQuery?: string;
  initialCategory?: string;
}

export const NameRegistrationModal: React.FC<NameRegistrationModalProps> = ({
  isOpen,
  onClose,
  existingNames,
  onSubmitName,
  currentUser,
  currentRole,
  initialQuery = '',
  initialCategory = 'Sofás'
}) => {
  const [name, setName] = useState(initialQuery);
  const [category, setCategory] = useState<FurnitureCategory>((initialCategory as FurnitureCategory) || 'Sofás');
  const [line, setLine] = useState<FurnitureLine>('Lujo Contemporáneo');
  const [materialsInput, setMaterialsInput] = useState('Nogal Español, Terciopelo');
  const [status, setStatus] = useState<NameStatus>('Activo');
  const [description, setDescription] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuery) setName(initialQuery);
    if (initialCategory && initialCategory !== 'Todas') setCategory(initialCategory as FurnitureCategory);
  }, [initialQuery, initialCategory]);

  if (!isOpen) return null;

  // Real-time similarity report
  const simReport = name.trim().length >= 2 ? checkNameSimilarity(name, existingNames, category) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('El nombre comercial es obligatorio.');
      return;
    }

    if (simReport && simReport.risk === 'CRITICAL' && currentRole !== 'Administrador') {
      setError('Bloqueo de colisión: Un nombre idéntico o indistinguible ya existe en el catálogo. Un administrador debe autorizar el registro.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitName({
        name: name.trim(),
        category,
        line,
        materials: materialsInput.split(',').map((s) => s.trim()).filter(Boolean),
        status,
        description: description.trim(),
        dimensions: dimensions.trim(),
        tags: tagsInput.split(',').map((s) => s.trim()).filter(Boolean),
        registeredBy: currentUser,
        registeredByRole: currentRole
      });

      // Reset and close
      setName('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al registrar el nombre.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-neutral-400">Base de Datos Maestra</div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white font-display">
              Registrar Nuevo Nombre Comercial
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Candidate Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              Nombre Comercial Propuesto <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Cama Siena, Velvet, Koa, Lumina..."
              className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 font-mono font-bold text-base text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
              required
            />
          </div>

          {/* Real-time External Verification Badge (Web Propia + Falabella Perú + Base Maestra) */}
          <ExternalVerificationBadge query={name} />

          {/* Real-time Collision Feedback Badge */}
          {simReport && (
            <div
              className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                simReport.risk === 'CRITICAL'
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                  : simReport.risk === 'HIGH'
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  {simReport.risk === 'CRITICAL' && <AlertOctagon className="w-4 h-4 text-rose-500" />}
                  {simReport.risk === 'HIGH' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  {simReport.risk === 'SAFE' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  <span>{simReport.recommendation}</span>
                </span>
                <span className="font-mono">{simReport.riskScore}% riesgo</span>
              </div>
            </div>
          )}

          {/* Category & Line */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FurnitureCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none"
              >
                <option value="Sofás">Sofás</option>
                <option value="Mesas">Mesas</option>
                <option value="Sillas">Sillas</option>
                <option value="Camas">Camas</option>
                <option value="Armarios">Armarios</option>
                <option value="Muebles TV">Muebles TV</option>
                <option value="Estanterías">Estanterías</option>
                <option value="Exterior">Exterior</option>
                <option value="Decoración">Decoración</option>
                <option value="Iluminación">Iluminación</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Colección / Línea</label>
              <select
                value={line}
                onChange={(e) => setLine(e.target.value as FurnitureLine)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none"
              >
                <option value="Colección Atemporal">Colección Atemporal</option>
                <option value="Línea Moderna">Línea Moderna</option>
                <option value="Artesanal Macrumo">Artesanal Macrumo</option>
                <option value="Escandinavo Orgánico">Escandinavo Orgánico</option>
                <option value="Minimalista Urbano">Minimalista Urbano</option>
                <option value="Lujo Contemporáneo">Lujo Contemporáneo</option>
              </select>
            </div>
          </div>

          {/* Materials & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Materiales Clave</label>
              <input
                type="text"
                value={materialsInput}
                onChange={(e) => setMaterialsInput(e.target.value)}
                placeholder="Ej: Nogal, Terciopelo, Latón"
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Estado Inicial</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as NameStatus)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none"
              >
                <option value="Activo">Activo (Catálogo Principal)</option>
                <option value="Reservado">Reservado (Propuesta de Proyecto)</option>
                <option value="En Desarrollo">En Desarrollo (Prototipo)</option>
                <option value="Archivado">Archivado</option>
              </select>
            </div>
          </div>

          {/* Dimensions & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Dimensiones (Opcional)</label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="Ej: 240 x 95 x 82 cm"
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Etiquetas (Opcional)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Ej: Salón, Modular, Premium"
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Descripción del Producto</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles sobre el diseño, acabado y uso previsto..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none"
            />
          </div>

          {error && <div className="text-xs text-rose-500 font-medium">{error}</div>}

          {/* Buttons */}
          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div className="text-[11px] text-neutral-400">
              Registrado por: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{currentUser}</span> ({currentRole})
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs shadow-md hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {submitting ? 'Guardando...' : 'Confirmar Registro'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

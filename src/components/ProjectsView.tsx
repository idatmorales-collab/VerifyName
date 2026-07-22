import React, { useState } from 'react';
import { FolderKanban, Plus, Calendar, Tag, User, Layers, ArrowRight, CheckCircle2 } from 'lucide-react';
import { NamingProject, FurnitureName, FurnitureCategory } from '../types';

interface ProjectsViewProps {
  projects: NamingProject[];
  names: FurnitureName[];
  onCreateProject: (project: Partial<NamingProject>) => void;
  onSelectName: (name: FurnitureName) => void;
  currentUser: string;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  names,
  onCreateProject,
  onSelectName,
  currentUser
}) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FurnitureCategory>('Sofás');
  const [targetDate, setTargetDate] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onCreateProject({
      title,
      description,
      category,
      targetDate: targetDate || new Date().toISOString().split('T')[0],
      designer: currentUser
    });
    setTitle('');
    setDescription('');
    setShowModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
            Colecciones y Proyectos
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Organización por campañas de lanzamiento y grupos de mobiliario colaborativos.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-xs shadow-sm hover:opacity-90 flex items-center gap-1.5 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Colección</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => {
          const projNames = names.filter((n) => proj.nameIds.includes(n.id) || n.projectIds?.includes(proj.id));

          return (
            <div
              key={proj.id}
              className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4 hover:border-neutral-400 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    {proj.category}
                  </span>
                  <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {proj.targetDate}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{proj.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{proj.description}</p>
              </div>

              {/* Contained Names List */}
              <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Nombres Asignados ({projNames.length})
                </div>
                {projNames.length === 0 ? (
                  <div className="text-xs text-neutral-400 italic py-2">
                    Sin nombres asignados aún a esta colección.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {projNames.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => onSelectName(n)}
                        className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 text-xs cursor-pointer hover:border-neutral-300 transition-colors"
                      >
                        <span className="font-mono font-bold text-neutral-900 dark:text-white">{n.name}</span>
                        <span className="text-[10px] text-neutral-400">{n.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer info */}
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
                <span className="flex items-center gap-1 text-neutral-600 dark:text-neutral-300">
                  <User className="w-3 h-3 text-neutral-400" />
                  {proj.designer}
                </span>
                <span className="font-semibold text-indigo-500">{proj.status}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal create project */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Nueva Colección de Naming</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Título de la Colección
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Colección Salón Otoño 2026"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Descripción</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Propósito del proyecto de naming..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Categoría Principal</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FurnitureCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-none"
                >
                  <option value="Sofás">Sofás</option>
                  <option value="Mesas">Mesas</option>
                  <option value="Sillas">Sillas</option>
                  <option value="Camas">Camas</option>
                  <option value="Armarios">Armarios</option>
                  <option value="Muebles TV">Muebles TV</option>
                  <option value="Exterior">Exterior</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Fecha Objetivo</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-xs"
                >
                  Crear Colección
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

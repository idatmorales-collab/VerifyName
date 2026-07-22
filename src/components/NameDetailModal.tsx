import React, { useState } from 'react';
import {
  X,
  Star,
  CheckCircle2,
  Clock,
  Archive,
  MessageSquare,
  Send,
  User,
  ShieldCheck,
  Palette,
  Tag,
  Layers,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { FurnitureName, NameStatus, UserRole } from '../types';

interface NameDetailModalProps {
  nameItem: FurnitureName | null;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: NameStatus) => void;
  onAddComment: (id: string, commentText: string) => Promise<void>;
  currentRole: UserRole;
  currentUser: string;
}

export const NameDetailModal: React.FC<NameDetailModalProps> = ({
  nameItem,
  onClose,
  onToggleFavorite,
  onUpdateStatus,
  onAddComment,
  currentRole,
  currentUser
}) => {
  const [commentText, setCommentText] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  if (!nameItem) return null;

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setAddingComment(true);
    try {
      await onAddComment(nameItem.id, commentText.trim());
      setCommentText('');
    } finally {
      setAddingComment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800/80 flex items-start justify-between bg-neutral-50/50 dark:bg-neutral-950/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                {nameItem.category}
              </span>
              <span className="text-xs text-neutral-400">• {nameItem.line}</span>
            </div>
            <h2 className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-white">
              {nameItem.name}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(nameItem.id)}
              className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-400 hover:text-amber-400"
            >
              <Star
                className={`w-4 h-4 ${
                  nameItem.favorite ? 'fill-amber-400 text-amber-400' : ''
                }`}
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Status & Change Selector */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Estado en la Base Maestra</div>
              <div className="flex items-center gap-2">
                {nameItem.status === 'Activo' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Activo (Catálogo Principal)
                  </span>
                )}
                {nameItem.status === 'En Desarrollo' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400">
                    <Clock className="w-3.5 h-3.5" />
                    En Desarrollo
                  </span>
                )}
                {nameItem.status === 'Reservado' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                    Reservado
                  </span>
                )}
                {nameItem.status === 'Archivado' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                    <Archive className="w-3.5 h-3.5" />
                    Archivado
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Cambiar:</span>
              <select
                value={nameItem.status}
                onChange={(e) => onUpdateStatus(nameItem.id, e.target.value as NameStatus)}
                className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-semibold text-neutral-800 dark:text-neutral-200 focus:outline-none"
              >
                <option value="Activo">Activo</option>
                <option value="En Desarrollo">En Desarrollo</option>
                <option value="Reservado">Reservado</option>
                <option value="Archivado">Archivado</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
              Descripción Comercial
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed bg-neutral-50/50 dark:bg-neutral-950/30 p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800">
              {nameItem.description || 'Sin descripción detallada registrada.'}
            </p>
          </div>

          {/* Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1">
              <div className="text-[11px] font-semibold text-neutral-400">Materiales Especificados</div>
              <div className="flex flex-wrap gap-1 pt-1">
                {nameItem.materials.map((m) => (
                  <span
                    key={m}
                    className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] text-neutral-700 dark:text-neutral-300 font-medium"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1">
              <div className="text-[11px] font-semibold text-neutral-400">Dimensiones / Formato</div>
              <div className="text-xs font-mono font-medium text-neutral-800 dark:text-neutral-200">
                {nameItem.dimensions || 'No especificadas'}
              </div>
            </div>
          </div>

          {/* Registration Meta */}
          <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-neutral-400" />
              <span>Registrado por: <strong className="text-neutral-800 dark:text-neutral-200">{nameItem.registeredBy}</strong></span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span>{new Date(nameItem.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-neutral-400" />
              <span>Observaciones del Equipo ({nameItem.comments?.length || 0})</span>
            </h3>

            {/* Comment List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {(!nameItem.comments || nameItem.comments.length === 0) ? (
                <div className="text-xs text-neutral-400 italic py-2">
                  No hay notas registradas para este nombre. Escribe la primera abajo.
                </div>
              ) : (
                nameItem.comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                        {c.role === 'Administrador' ? (
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Palette className="w-3 h-3 text-sky-500" />
                        )}
                        {c.author}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {new Date(c.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-300">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handlePostComment} className="flex gap-2 pt-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Añadir una nota o comentario de revisión..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={addingComment || !commentText.trim()}
                className="px-3.5 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

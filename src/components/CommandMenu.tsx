import React, { useEffect, useState } from 'react';
import { Search, Sparkles, AlertTriangle, FolderPlus, X, Tag, ArrowRight } from 'lucide-react';
import { FurnitureName } from '../types';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  names: FurnitureName[];
  onSelectName: (name: FurnitureName) => void;
  onNavigateView: (view: string) => void;
  onOpenNewModal: () => void;
}

export const CommandMenu: React.FC<CommandMenuProps> = ({
  isOpen,
  onClose,
  names,
  onSelectName,
  onNavigateView,
  onOpenNewModal
}) => {
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setSearch('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredNames = search.trim()
    ? names
        .filter(
          (n) =>
            n.name.toLowerCase().includes(search.toLowerCase()) ||
            n.category.toLowerCase().includes(search.toLowerCase()) ||
            n.materials.some((m) => m.toLowerCase().includes(search.toLowerCase()))
        )
        .slice(0, 6)
    : names.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="flex items-center px-4 border-b border-neutral-100 dark:border-neutral-800">
          <Search className="w-5 h-5 text-neutral-400 shrink-0 mr-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar nombre, material, categoría o comando..."
            className="w-full py-4 bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Menu Body */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {/* Quick Actions */}
          {!search && (
            <div className="py-2">
              <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Acciones Rápidas
              </div>
              <div className="space-y-1 mt-1">
                <button
                  onClick={() => {
                    onOpenNewModal();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <FolderPlus className="w-4 h-4 text-emerald-500" />
                    <span>Registrar Nuevo Nombre Comercial</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                <button
                  onClick={() => {
                    onNavigateView('similarity');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Verificar Similitud & Duplicados</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                <button
                  onClick={() => {
                    onNavigateView('ai-studio');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>Generar Nombres con IA Macrumo</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                </button>
              </div>
            </div>
          )}

          {/* Search Results */}
          <div className="py-2">
            <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              {search ? 'Resultados del Catálogo' : 'Nombres Recientes'}
            </div>
            {filteredNames.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-neutral-400">
                No se encontraron nombres que coincidan con "{search}"
              </div>
            ) : (
              <div className="space-y-1 mt-1">
                {filteredNames.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectName(item);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-800 dark:text-neutral-200">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                            {item.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                            {item.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400 line-clamp-1">{item.line}</div>
                      </div>
                    </div>
                    <Tag className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 font-mono text-[10px]">ESC</kbd> para cerrar</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 font-mono text-[10px]">⌘K</kbd> alternar</span>
          </div>
          <span className="font-medium text-neutral-500">Muebles Macrumo AI</span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Star, Eye, Tag, Calendar, User, BookmarkX, ArrowLeft, X } from 'lucide-react';
import { FurnitureName } from '../types';

interface FavoritesViewProps {
  favoriteNames: FurnitureName[];
  onSelectName: (name: FurnitureName) => void;
  onToggleFavorite: (id: string) => void;
  onBack?: () => void;
  onNavigate?: (view: string) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favoriteNames,
  onSelectName,
  onToggleFavorite,
  onBack,
  onNavigate
}) => {
  const handleClose = () => {
    if (onBack) {
      onBack();
    } else if (onNavigate) {
      onNavigate('inicio');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header with Close and Back Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-4">
          <button
            onClick={handleClose}
            className="p-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:border-amber-400/50 transition-all shadow-xs cursor-pointer shrink-0"
            title="Volver a la pantalla principal"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-yellow-500 mb-1">
              <Star className="w-4 h-4 fill-yellow-500" />
              <span>Colección Privada</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Nombres Favoritos
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Colección personalizada de nombres comerciales marcados como destacados.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs font-medium text-neutral-600 dark:text-neutral-300 shadow-xs">
            Total guardados: <span className="font-bold text-amber-500">{favoriteNames.length}</span>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all shadow-xs cursor-pointer"
            title="Cerrar vista"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid of Favorites */}
      {favoriteNames.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/50 dark:bg-neutral-900/20 space-y-3">
          <Star className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto" />
          <h3 className="font-semibold text-sm text-neutral-700 dark:text-neutral-300">
            No tienes nombres marcados como favoritos
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Puedes hacer clic en el ícono de estrella en cualquier registro de la Base Maestra o en las sugerencias de la IA para agregarlo a esta sección.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {favoriteNames.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white tracking-tight">
                      {item.name}
                    </h3>
                    <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                      {item.category} • {item.line}
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleFavorite(item.id)}
                    className="p-1.5 rounded-lg text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/40 transition-colors"
                    title="Quitar de favoritos"
                  >
                    <Star className="w-4 h-4 fill-yellow-500" />
                  </button>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 mb-4 leading-relaxed">
                  {item.description || 'Sin descripción detallada disponible.'}
                </p>

                {/* Materials & Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {item.materials.slice(0, 3).map((m, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[10px] font-medium"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>{item.registeredBy}</span>
                </div>
                <button
                  onClick={() => onSelectName(item)}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium text-xs transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Detalle</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

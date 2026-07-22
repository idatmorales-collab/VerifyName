import React, { useState } from 'react';
import { X, Upload, Check, Camera, Sparkles, User, Shield, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { UserRole } from '../types';
import { PRESET_AVATARS } from '../data/avatars';

export { PRESET_AVATARS };

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: string;
  currentRole: UserRole;
  currentAvatarUrl?: string;
  onSaveAvatar: (newAvatarUrl: string) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentRole,
  currentAvatarUrl,
  onSaveAvatar
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatarUrl || PRESET_AVATARS[0].url);
  const [activeTab, setActiveTab] = useState<'presets' | 'upload'>('presets');
  const [customUploadError, setCustomUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setCustomUploadError(null);

    if (!file) return;

    // Check size limit (max 3MB)
    if (file.size > 3 * 1024 * 1024) {
      setCustomUploadError('El archivo excede el tamaño máximo recomendado (3MB).');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setCustomUploadError('Por favor selecciona un archivo de imagen válido (JPG, PNG, SVG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const dataUrl = event.target.result as string;
        setSelectedAvatar(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSaveAvatar(selectedAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-neutral-900 dark:text-white">
                Cambiar Icono de Perfil
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Personaliza la foto de cuenta para {currentUser} ({currentRole})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Real-time Preview Card */}
          <div className="p-4 rounded-2xl bg-neutral-100/80 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center gap-4 shadow-sm">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-500 shadow-md bg-neutral-800 flex items-center justify-center p-0.5">
                <img
                  src={selectedAvatar}
                  alt="Vista previa de perfil"
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-amber-500 text-neutral-950 shadow-sm z-10">
                <Check className="w-3 h-3 font-extrabold" />
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>VISTA PREVIA EN TIEMPO REAL</span>
              </div>
              <div className="font-extrabold text-sm text-neutral-900 dark:text-white">
                {currentUser}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                <span>Rol: {currentRole}</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'presets'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Galería Ilustrada ({PRESET_AVATARS.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'upload'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4 text-blue-500" />
              <span>Cargar Imagen Propia</span>
            </button>
          </div>

          {/* Preset Gallery */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
                <span>Selecciona tu icono ilustrado a todo color:</span>
                <span className="font-mono text-[11px] text-amber-500 font-bold">Resaltado HD</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = selectedAvatar === preset.url;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedAvatar(preset.url)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer group flex flex-col items-center gap-2.5 relative ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/20 shadow-lg ring-2 ring-amber-500/50'
                          : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:border-amber-500/50 dark:hover:border-neutral-700'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-2.5 right-2.5 p-1 rounded-full bg-amber-500 text-neutral-950 shadow-md z-10">
                          <Check className="w-3 h-3 font-extrabold" />
                        </span>
                      )}
                      {/* Avatar Wrapper with Contrasting Frame */}
                      <div className="w-16 h-16 rounded-full bg-neutral-800 dark:bg-[#2A2A2A] p-1 flex items-center justify-center border border-neutral-700/60 shadow-inner group-hover:scale-105 transition-transform overflow-hidden">
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover rounded-full"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="text-center">
                        <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 line-clamp-1 block">
                          {preset.name}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-medium">
                          {preset.category}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom File Upload */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-amber-500 dark:hover:border-amber-400 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-neutral-50/50 dark:bg-neutral-950/50 transition-colors group">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs font-bold text-neutral-900 dark:text-white">
                    Haz clic para seleccionar o arrastra una foto desde tu equipo
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Soporta formatos JPG, PNG, WEBP o SVG (Máx. 3MB)
                  </p>
                </div>
              </label>

              {customUploadError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
                  {customUploadError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setSelectedAvatar(PRESET_AVATARS[0].url)}
            className="px-3 py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restablecer avatar por defecto</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-extrabold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Nuevo Icono</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

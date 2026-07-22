import React, { useState } from 'react';
import { Lock, User as UserIcon, Eye, EyeOff, KeyRound, HelpCircle, CheckCircle2, Shield, Sparkles, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: UserProfile, token: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Por favor, ingresa tu usuario y contraseña.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      if (rememberMe) {
        localStorage.setItem('macrumo_session_token', data.token);
      } else {
        sessionStorage.setItem('macrumo_session_token', data.token);
      }

      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Ambient background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-neutral-800/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-neutral-800/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white text-neutral-950 font-extrabold text-xl mb-4 shadow-lg tracking-tight">
            M
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            MACRUMO <span className="text-xs px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 font-mono">STUDIO</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-2 max-w-xs mx-auto">
            Plataforma interna privada para el equipo de diseño y gestión de productos.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-3 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Usuario
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej. renzo o diseno01"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 text-xs focus:outline-none focus:border-neutral-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 text-xs focus:outline-none focus:border-neutral-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-neutral-400 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-neutral-950 border-neutral-800 text-white focus:ring-0 focus:ring-offset-0"
              />
              <span>Recordar sesión</span>
            </label>
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-neutral-400 hover:text-white transition-colors underline decoration-neutral-700 underline-offset-4"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 mt-2 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="animate-pulse">Autenticando...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Ingresar a Macrumo Studio</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Quick-Fill Section */}
        <div className="mt-8 pt-6 border-t border-neutral-800/80">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-neutral-500" />
            <span>Cuentas de prueba rápida</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('renzo', 'admin123')}
              className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 hover:border-neutral-700 text-left transition-all group"
            >
              <div className="text-[11px] font-bold text-white group-hover:text-amber-400 transition-colors flex items-center justify-between">
                <span>Renzo Morales</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950 text-amber-400 font-mono">Admin</span>
              </div>
              <div className="text-[10px] text-neutral-500 font-mono mt-0.5">renzo / admin123</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill('diseno01', 'diseno123')}
              className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 hover:border-neutral-700 text-left transition-all group"
            >
              <div className="text-[11px] font-bold text-white group-hover:text-blue-400 transition-colors flex items-center justify-between">
                <span>Diseñador 01</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-blue-950 text-blue-400 font-mono">Diseño</span>
              </div>
              <div className="text-[10px] text-neutral-500 font-mono mt-0.5">diseno01 / diseno123</div>
            </button>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="mt-6 text-center text-[11px] text-neutral-500 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Servidor privado con encriptación bcrypt</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-neutral-800 text-amber-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Recuperación de Contraseña</h3>
                <p className="text-xs text-neutral-400">Acceso Privado Muebles Macrumo</p>
              </div>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Macrumo Studio es una plataforma de uso interno privado. Si has olvidado tu contraseña de acceso, por favor solicita un restablecimiento directo al Administrador del sistema.
            </p>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 space-y-1">
              <div><strong>Contacto de Administración:</strong> Renzo D. Morales</div>
              <div><strong>Módulo:</strong> Gestión de Usuarios</div>
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 rounded-xl bg-white text-neutral-950 text-xs font-semibold hover:bg-neutral-200 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

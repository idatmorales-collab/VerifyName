import React, { useState } from 'react';

interface LoginViewProps {
  onLoginSuccess: (user: { name: string; role: string }) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('renzo');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);

  const users = [
    { username: 'renzo', password: 'admin123', name: 'Renzo Morales', role: 'admin' },
    { username: 'diseno01', password: 'diseno123', name: 'Diseñador 01', role: 'diseno' }
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const foundUser = users.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      onLoginSuccess({ name: foundUser.name, role: foundUser.role });
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    const foundUser = users.find((user) => user.username === u && user.password === p);
    if (foundUser) {
      onLoginSuccess({ name: foundUser.name, role: foundUser.role });
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center p-4">
      <div className="bg-[#18181b] border border-[#27272a] p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center font-bold text-xl">
            M
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center tracking-tight mb-1">
          MACRUMO <span className="text-xs bg-[#27272a] text-gray-300 px-2 py-0.5 rounded font-mono">STUDIO</span>
        </h1>
        <p className="text-xs text-center text-gray-400 mb-6">
          Plataforma interna privada para el equipo de diseño y gestión de productos.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black font-medium py-2.5 rounded-lg hover:bg-gray-200 transition-colors text-sm mt-2"
          >
            Ingresar a Macrumo Studio
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#27272a]">
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-3">
            Cuentas de prueba rápida
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('renzo', 'admin123')}
              className="bg-[#09090b] border border-[#27272a] p-2.5 rounded-lg text-left hover:border-gray-500 transition-colors"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-white">Renzo Morales</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-mono">Admin</span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">renzo / admin123</span>
            </button>

            <button
              onClick={() => handleQuickLogin('diseno01', 'diseno123')}
              className="bg-[#09090b] border border-[#27272a] p-2.5 rounded-lg text-left hover:border-gray-500 transition-colors"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-white">Diseñador 01</span>
                <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-mono">Diseño</span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">diseno01 / diseno123</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

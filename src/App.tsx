import React, { useState } from 'react';
import LoginView from './components/LoginView';

export function App() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  const handleLogin = (userData: { name: string; role: string }) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <LoginView onLoginSuccess={handleLogin} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center pb-6 border-b border-[#27272a] mb-8">
          <div>
            <h1 className="text-2xl font-bold">Macrumo Studio</h1>
            <p className="text-xs text-gray-400">Bienvenido, {user.name} ({user.role})</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-[#27272a] hover:bg-red-500/20 hover:text-red-400 text-xs text-gray-300 px-4 py-2 rounded-lg transition-colors"
          >
            Cerrar Sesión
          </button>
        </header>

        <main className="bg-[#18181b] border border-[#27272a] rounded-2xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            ✓
          </div>
          <h2 className="text-xl font-semibold mb-2">¡Sesión Iniciada con Éxito!</h2>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Has ingresado correctamente al Panel General de Naming AI en Macrumo Studio.
          </p>
        </main>
      </div>
    </div>
  );
}

export default App;

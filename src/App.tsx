import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { InicioView } from './components/InicioView';
import { FavoritesView } from './components/FavoritesView';
import { UsersView } from './components/UsersView';
import { DailyReportView } from './components/DailyReportView';
import { SettingsView } from './components/SettingsView';
import { AboutView } from './components/AboutView';
import { DashboardView } from './components/DashboardView';
import { MasterDatabaseView } from './components/MasterDatabaseView';
import { SimilarityCheckerView } from './components/SimilarityCheckerView';
import { AiGeneratorView } from './components/AiGeneratorView';
import { AuditView } from './components/AuditView';
import { ImportationsView } from './components/ImportationsView';
import { ExportationsView } from './components/ExportationsView';
import { ImportModal } from './components/ImportModal';
import { CommandMenu } from './components/CommandMenu';
import { NameRegistrationModal } from './components/NameRegistrationModal';
import { NameDetailModal } from './components/NameDetailModal';
import { CustomCursor } from './components/CustomCursor';
import { EditProfileModal } from './components/EditProfileModal';
import { FurnitureName, NamingProject, AuditLog, UserRole, NameStatus, FurnitureCategory, AINameSuggestion, UserProfile } from './types';
import { INITIAL_FURNITURE_NAMES, INITIAL_PROJECTS } from './data/seedNames';

export default function App() {
  // Authentication State
  const [sessionToken, setSessionToken] = useState<string | null>(
    localStorage.getItem('macrumo_session_token') || sessionStorage.getItem('macrumo_session_token')
  );
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // App Navigation State
  const [currentView, setCurrentView] = useState<string>('inicio');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('Todas');

  // App Data State
  const [names, setNames] = useState<FurnitureName[]>(INITIAL_FURNITURE_NAMES);
  const [projects, setProjects] = useState<NamingProject[]>(INITIAL_PROJECTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [importHistory, setImportHistory] = useState<any[]>([]);

  // UI Modals
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState<boolean>(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState<boolean>(false);
  const [selectedNameDetail, setSelectedNameDetail] = useState<FurnitureName | null>(null);

  const [initialQueryModal, setInitialQueryModal] = useState<string>('');
  const [initialCategoryModal, setInitialCategoryModal] = useState<string>('Sofás');
  const [similarityQuery, setSimilarityQuery] = useState<string>('');

  // Active User Avatar URL helper
  const currentAvatarUrl =
    currentUserProfile?.avatarUrl ||
    (currentUserProfile ? localStorage.getItem(`macrumo_avatar_${currentUserProfile.username}`) || undefined : undefined);

  const handleSaveAvatar = async (newAvatarUrl: string) => {
    if (!currentUserProfile) return;

    const updatedUser = { ...currentUserProfile, avatarUrl: newAvatarUrl };
    setCurrentUserProfile(updatedUser);

    // Save locally
    localStorage.setItem(`macrumo_avatar_${currentUserProfile.username}`, newAvatarUrl);

    // Persist to server
    try {
      await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserProfile.id,
          username: currentUserProfile.username,
          avatarUrl: newAvatarUrl
        })
      });
    } catch (err) {
      console.warn('Error saving avatar to server:', err);
    }
  };


  // Categories list
  const categories: FurnitureCategory[] = [
    'Sofás',
    'Mesas',
    'Sillas',
    'Camas',
    'Armarios',
    'Muebles TV',
    'Estanterías',
    'Exterior',
    'Decoración',
    'Iluminación'
  ];

  // Verify Auth Session on Mount
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('macrumo_session_token') || sessionStorage.getItem('macrumo_session_token');
      if (!token) {
        setIsAuthChecking(false);
        return;
      }

      try {
        const res = await fetch(`/api/auth/me?token=${encodeURIComponent(token)}`);
        if (res.ok) {
          const user = await res.json();
          setCurrentUserProfile(user);
          setSessionToken(token);
        } else {
          // Token invalid
          localStorage.removeItem('macrumo_session_token');
          sessionStorage.removeItem('macrumo_session_token');
          setSessionToken(null);
          setCurrentUserProfile(null);
        }
      } catch (err) {
        console.warn('Auth verification fallback:', err);
      } finally {
        setIsAuthChecking(false);
      }
    };

    verifyAuth();
  }, []);

  // Fetch App Data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [namesRes, projRes, auditRes, importsRes] = await Promise.all([
        fetch('/api/names'),
        fetch('/api/projects'),
        fetch('/api/audit-logs'),
        fetch('/api/imports')
      ]);

      if (namesRes.ok) {
        const data = await namesRes.json();
        setNames(data);
      }
      if (projRes.ok) {
        const data = await projRes.json();
        setProjects(data);
      }
      if (auditRes.ok) {
        const data = await auditRes.json();
        setAuditLogs(data);
      }
      if (importsRes.ok) {
        const data = await importsRes.json();
        setImportHistory(data);
      }
    } catch (err) {
      console.warn('Backend endpoint fetch fallback to memory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImportRecord = async (id: string) => {
    if (!currentUserProfile || currentUserProfile.role !== 'Administrador') {
      alert('Solo los administradores pueden eliminar registros de importación.');
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar este registro del historial de importaciones?')) return;

    try {
      await fetch(`/api/imports/${id}?user=${encodeURIComponent(currentUserProfile.fullName)}`, {
        method: 'DELETE'
      });
      await fetchData();
    } catch (err) {
      setImportHistory((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleResetDatabase = async () => {
    if (!currentUserProfile || currentUserProfile.role !== 'Administrador') {
      alert('Esta acción es exclusiva para administradores.');
      return;
    }

    try {
      const res = await fetch('/api/db/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUserProfile.fullName })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.masterDatabase) {
          setNames(data.masterDatabase);
        } else {
          setNames([...INITIAL_FURNITURE_NAMES]);
        }
        if (data.importHistory) {
          setImportHistory(data.importHistory);
        }
        await fetchData();
      } else {
        setNames([...INITIAL_FURNITURE_NAMES]);
        setImportHistory([]);
      }
    } catch (err) {
      setNames([...INITIAL_FURNITURE_NAMES]);
      setImportHistory([]);
    }
  };

  useEffect(() => {
    if (sessionToken && currentUserProfile) {
      fetchData();
    }
  }, [sessionToken, currentUserProfile]);

  const handleLoginSuccess = (user: UserProfile, token: string) => {
    setCurrentUserProfile(user);
    setSessionToken(token);
    setCurrentView('inicio');
    fetchData();
  };

  const handleLogout = async () => {
    if (sessionToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: sessionToken })
        });
      } catch (err) {
        // ignore
      }
    }

    localStorage.removeItem('macrumo_session_token');
    sessionStorage.removeItem('macrumo_session_token');
    setSessionToken(null);
    setCurrentUserProfile(null);
  };

  // Register Name
  const handleRegisterName = async (newFurnitureName: Partial<FurnitureName>) => {
    if (!currentUserProfile) return;

    try {
      const res = await fetch('/api/names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newFurnitureName,
          registeredBy: currentUserProfile.fullName,
          registeredByRole: currentUserProfile.role
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error al registrar el nombre comercial.');
      }

      await fetchData();
    } catch (err: any) {
      // Fallback local memory
      const newId = `mac-${Date.now()}`;
      const created: FurnitureName = {
        id: newId,
        name: newFurnitureName.name || 'Sin Nombre',
        normalizedName: (newFurnitureName.name || '').toLowerCase(),
        category: (newFurnitureName.category as FurnitureCategory) || 'Sofás',
        line: newFurnitureName.line || 'Lujo Contemporáneo',
        materials: newFurnitureName.materials || ['Madera'],
        status: (newFurnitureName.status as NameStatus) || 'Activo',
        registeredBy: currentUserProfile.fullName,
        registeredByRole: currentUserProfile.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: newFurnitureName.description || '',
        dimensions: newFurnitureName.dimensions || '',
        tags: newFurnitureName.tags || [],
        favorite: false,
        comments: []
      };

      setNames((prev) => [created, ...prev]);
    }
  };

  // Delete Name (Admin Only)
  const handleDeleteName = async (id: string) => {
    if (!currentUserProfile || currentUserProfile.role !== 'Administrador') {
      alert('Solo los administradores pueden eliminar nombres de la Base Maestra.');
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar este nombre de la Base Maestra?')) return;

    try {
      await fetch(`/api/names/${id}?role=Administrador&user=${encodeURIComponent(currentUserProfile.fullName)}`, {
        method: 'DELETE'
      });
      await fetchData();
    } catch (err) {
      setNames((prev) => prev.filter((n) => n.id !== id));
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (id: string) => {
    setNames((prev) =>
      prev.map((n) => (n.id === id ? { ...n, favorite: !n.favorite } : n))
    );
    try {
      await fetch(`/api/names/${id}/favorite`, { method: 'POST' });
    } catch (err) {
      // ignore
    }
  };

  // Update Status
  const handleUpdateStatus = async (id: string, newStatus: NameStatus) => {
    if (!currentUserProfile) return;

    setNames((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: newStatus } : n))
    );
    if (selectedNameDetail && selectedNameDetail.id === id) {
      setSelectedNameDetail((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      await fetch(`/api/names/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          updatedBy: currentUserProfile.fullName,
          role: currentUserProfile.role
        })
      });
      await fetchData();
    } catch (err) {
      // ignore
    }
  };

  // Add Comment
  const handleAddComment = async (id: string, text: string) => {
    if (!currentUserProfile) return;

    const newComment = {
      id: `c-${Date.now()}`,
      author: currentUserProfile.fullName,
      role: currentUserProfile.role,
      text,
      date: new Date().toISOString()
    };

    setNames((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const comments = n.comments ? [...n.comments, newComment] : [newComment];
          return { ...n, comments };
        }
        return n;
      })
    );

    if (selectedNameDetail && selectedNameDetail.id === id) {
      setSelectedNameDetail((prev) =>
        prev ? { ...prev, comments: prev.comments ? [...prev.comments, newComment] : [newComment] } : null
      );
    }

    try {
      await fetch(`/api/names/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: currentUserProfile.fullName,
          role: currentUserProfile.role,
          text
        })
      });
    } catch (err) {
      // ignore
    }
  };

  // Register AI Suggestion directly
  const handleRegisterAiSuggestion = async (suggestion: AINameSuggestion, category: string, line: string) => {
    await handleRegisterName({
      name: suggestion.name,
      category: category as FurnitureCategory,
      line: line as any,
      materials: ['Diseño Asistido IA'],
      status: 'Activo',
      description: `${suggestion.etymology} — "${suggestion.tagline}"`,
      tags: ['IA Macrumo', 'Sugerencia']
    });
    alert(`¡El nombre "${suggestion.name}" se ha registrado con éxito en la Base Maestra!`);
  };

  // Open New Modal with Query
  const handleOpenNewModalWithQuery = (query: string, category?: string) => {
    setInitialQueryModal(query);
    if (category) setInitialCategoryModal(category);
    setIsNewModalOpen(true);
  };

  // Render Loading Screen while verifying session
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white text-neutral-950 flex items-center justify-center font-bold text-lg mx-auto animate-pulse">
            M
          </div>
          <div className="text-xs text-neutral-400">Verificando sesión privada en Macrumo Studio...</div>
        </div>
      </div>
    );
  }

  // Render Login Screen if not authenticated
  if (!sessionToken || !currentUserProfile) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const userRole = currentUserProfile.role;
  const userName = currentUserProfile.fullName;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans flex antialiased">
      {/* Custom Precision Follower Cursor */}
      <CustomCursor />

      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenNewModal={() => {
          setInitialQueryModal('');
          setIsNewModalOpen(true);
        }}
        currentRole={userRole}
        currentUser={userName}
        currentAvatarUrl={currentAvatarUrl}
        onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
        totalNamesCount={names.length}
        duplicatePreventedCount={names.filter((n) => n.status === 'Archivado').length + 12}
        favoritesCount={names.filter((n) => n.favorite).length}
        dailyReportCount={
          names.filter((n) => {
            if (!n.createdAt) return false;
            const diffMs = Math.abs(Date.now() - new Date(n.createdAt).getTime());
            return diffMs <= 24 * 60 * 60 * 1000;
          }).length || 3
        }
        onLogout={handleLogout}
      />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <Header
          onOpenCommandMenu={() => setIsCommandMenuOpen(true)}
          currentRole={userRole}
          currentUser={userName}
          currentAvatarUrl={currentAvatarUrl}
          onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
          totalNames={names.length}
          duplicatePrevented={names.filter((n) => n.status === 'Archivado').length + 12}
          onRefreshData={fetchData}
          isLoading={isLoading}
          onLogout={handleLogout}
        />

        <main className="flex-1 pb-12">
          {currentView === 'inicio' && (
            <InicioView
              onNavigate={setCurrentView}
              currentUser={userName}
              currentRole={userRole}
              totalNames={names.length}
              duplicatePrevented={names.filter((n) => n.status === 'Archivado').length + 12}
              favoritesCount={names.filter((n) => n.favorite).length}
              names={names}
              onOpenCommandMenu={() => setIsCommandMenuOpen(true)}
              onOpenNewModalWithQuery={handleOpenNewModalWithQuery}
              onStartValidationQuery={(query) => {
                setSimilarityQuery(query);
                setCurrentView('naming-ai');
              }}
            />
          )}

          {currentView === 'naming-ai' && (
            <div className="p-6 md:p-8 max-w-7xl w-full mx-auto">
              <SimilarityCheckerView
                names={names}
                initialCandidateName={similarityQuery}
                onOpenNewModalWithQuery={handleOpenNewModalWithQuery}
                onNavigateToAiStudio={() => setCurrentView('ai-studio')}
                onSelectName={setSelectedNameDetail}
                onNavigate={setCurrentView}
                onBack={() => setCurrentView('inicio')}
              />
            </div>
          )}

          {currentView === 'database' && (
            <div className="p-6 md:p-8 max-w-7xl w-full mx-auto">
              <MasterDatabaseView
                names={names}
                activeCategoryFilter={activeCategoryFilter}
                onSelectCategoryFilter={setActiveCategoryFilter}
                onSelectName={setSelectedNameDetail}
                onToggleFavorite={handleToggleFavorite}
                onDeleteName={handleDeleteName}
                onOpenNewModal={() => {
                  setInitialQueryModal('');
                  setIsNewModalOpen(true);
                }}
                onOpenImportModal={() => setIsImportModalOpen(true)}
                onResetDatabase={handleResetDatabase}
                currentRole={userRole}
              />
            </div>
          )}

          {currentView === 'importations' && (
            <div className="p-6 md:p-8 max-w-7xl w-full mx-auto">
              <ImportationsView
                importHistory={importHistory}
                onOpenImportModal={() => setIsImportModalOpen(true)}
                onDeleteImportRecord={handleDeleteImportRecord}
                existingNames={names}
                currentRole={userRole}
              />
            </div>
          )}

          {currentView === 'exportations' && (
            <div className="p-6 md:p-8 max-w-7xl w-full mx-auto">
              <ExportationsView names={names} />
            </div>
          )}

          {currentView === 'ai-studio' && (
            <div className="p-6 md:p-8 max-w-7xl w-full mx-auto">
              <AiGeneratorView
                onRegisterAiSuggestion={handleRegisterAiSuggestion}
                currentUser={userName}
                onNavigate={setCurrentView}
                onBack={() => setCurrentView('inicio')}
              />
            </div>
          )}

          {currentView === 'favorites' && (
            <FavoritesView
              favoriteNames={names.filter((n) => n.favorite)}
              onSelectName={setSelectedNameDetail}
              onToggleFavorite={handleToggleFavorite}
              onNavigate={setCurrentView}
              onBack={() => setCurrentView('inicio')}
            />
          )}

          {currentView === 'audit' && (
            <div className="p-6 md:p-8 max-w-7xl w-full mx-auto">
              <AuditView
                auditLogs={auditLogs}
                onNavigate={setCurrentView}
                onBack={() => setCurrentView('inicio')}
              />
            </div>
          )}

          {currentView === 'dashboard' && (
            <div className="p-6 md:p-8 max-w-7xl w-full mx-auto">
              <DashboardView
                names={names}
                projects={projects}
                auditLogs={auditLogs}
                onNavigate={setCurrentView}
                onSelectName={setSelectedNameDetail}
                onOpenNewModalWithQuery={handleOpenNewModalWithQuery}
                onOpenCommandMenu={() => setIsCommandMenuOpen(true)}
                onStartValidationQuery={(query) => {
                  setSimilarityQuery(query);
                  setCurrentView('naming-ai');
                }}
              />
            </div>
          )}

          {currentView === 'daily-report' && userRole === 'Administrador' && (
            <div className="p-6 md:p-8 max-w-7xl w-full mx-auto">
              <DailyReportView
                names={names}
                auditLogs={auditLogs}
                currentUser={userName}
                onNavigate={setCurrentView}
                onSelectName={setSelectedNameDetail}
                onBack={() => setCurrentView('inicio')}
              />
            </div>
          )}

          {currentView === 'users' && userRole === 'Administrador' && (
            <UsersView currentAdminUsername={currentUserProfile.username} />
          )}

          {currentView === 'settings' && (
            <SettingsView
              currentRole={userRole}
              currentUser={userName}
              onRefreshData={fetchData}
            />
          )}

          {currentView === 'about' && <AboutView />}
        </main>
      </div>

      {/* Command Palette Modal */}
      <CommandMenu
        isOpen={isCommandMenuOpen}
        onClose={() => setIsCommandMenuOpen(false)}
        names={names}
        onSelectName={setSelectedNameDetail}
        onNavigateView={setCurrentView}
        onOpenNewModal={() => {
          setInitialQueryModal('');
          setIsNewModalOpen(true);
        }}
      />

      {/* Name Registration Modal */}
      <NameRegistrationModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        existingNames={names}
        onSubmitName={handleRegisterName}
        currentUser={userName}
        currentRole={userRole}
        initialQuery={initialQueryModal}
        initialCategory={initialCategoryModal}
      />

      {/* Name Detail Drawer / Modal */}
      <NameDetailModal
        nameItem={selectedNameDetail}
        onClose={() => setSelectedNameDetail(null)}
        onToggleFavorite={handleToggleFavorite}
        onUpdateStatus={handleUpdateStatus}
        onAddComment={handleAddComment}
        currentRole={userRole}
        currentUser={userName}
      />

      {/* Database Batch Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        existingNames={names}
        currentUser={userName}
        onImportSuccess={fetchData}
      />

      {/* Edit Profile & Avatar Modal */}
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        currentUser={userName}
        currentRole={userRole}
        currentAvatarUrl={currentAvatarUrl}
        onSaveAvatar={handleSaveAvatar}
      />
    </div>
  );
}

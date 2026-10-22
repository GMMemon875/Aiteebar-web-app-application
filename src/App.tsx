import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { Home } from './pages/Home.js';
import { Platform } from './pages/Platform.js';
import { Project } from './pages/Project.js';
import { Team } from './pages/Team.js';
import { Docs } from './pages/Docs.js';
import { Login } from './pages/Login.js';
import { Dashboard } from './pages/Dashboard.js';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('home');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center text-slate-400 font-mono text-xs">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mb-3" />
        <span>INITIALIZING AITEEBAR SECURITY ENGINE...</span>
      </div>
    );
  }

  // Dashboard routing with authentication check
  if (currentPage.startsWith('dashboard')) {
    if (!user) {
      return (
        <Login
          onLoginSuccess={() => setCurrentPage('dashboard')}
          onNavigateHome={() => setCurrentPage('home')}
        />
      );
    }

    const initialSection = currentPage === 'dashboard-team' 
      ? 'team' 
      : (currentPage === 'dashboard-docs' ? 'docs-mgmt' : 'overview');

    return (
      <Dashboard
        initialSection={initialSection}
        onNavigateHome={() => setCurrentPage('home')}
        onPreviewPublicTeam={() => setCurrentPage('team')}
        onPreviewPublicDocs={() => setCurrentPage('docs')}
      />
    );
  }

  // Login page
  if (currentPage === 'login') {
    return (
      <Login
        onLoginSuccess={() => setCurrentPage('dashboard')}
        onNavigateHome={() => setCurrentPage('home')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="flex-1">
        {currentPage === 'home' && <Home onNavigate={setCurrentPage} />}
        {currentPage === 'platform' && <Platform onNavigate={setCurrentPage} />}
        {currentPage === 'capabilities' && <Platform onNavigate={setCurrentPage} />}
        {currentPage === 'project' && <Project onNavigate={setCurrentPage} />}
        {currentPage === 'team' && <Team onNavigate={setCurrentPage} />}
        {currentPage === 'docs' && <Docs onNavigate={setCurrentPage} />}
      </main>

      <Footer onNavigate={setCurrentPage} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

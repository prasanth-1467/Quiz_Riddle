import React, { useState, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import TeamLobbyPage from './pages/TeamLobbyPage';
import ArenaPage from './pages/ArenaPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export function App() {
  const { user, loading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('arena');

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading EnigmaGrid Platform...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main>
        {activeTab === 'arena' && <ArenaPage />}
        {activeTab === 'lobby' && <TeamLobbyPage onTeamSuccess={() => setActiveTab('arena')} />}
        {activeTab === 'admin' && user.role === 'ADMIN' && <AdminDashboardPage />}
      </main>
    </div>
  );
}

export default App;

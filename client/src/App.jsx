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

  const isAdmin = user.role === 'ADMIN';
  const currentTab = isAdmin ? 'admin' : activeTab;

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
      <Navbar activeTab={currentTab} setActiveTab={setActiveTab} />

      <main>
        {!isAdmin && currentTab === 'arena' && <ArenaPage />}
        {!isAdmin && currentTab === 'lobby' && <TeamLobbyPage onTeamSuccess={() => setActiveTab('arena')} onBack={() => setActiveTab('arena')} />}
        {isAdmin && <AdminDashboardPage />}
        {!isAdmin && currentTab === 'admin' && (
          <div className="container" style={{ maxWidth: '600px', marginTop: '3rem' }}>
            <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <h2>Access denied</h2>
              <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>
                Administrative functionality is available only to authorized administrators.
              </p>
              <button className="btn btn-primary" onClick={() => setActiveTab('arena')}>
                Return to Arena
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

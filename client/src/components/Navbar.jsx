import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { Shield, Users, LogOut, Radio, Terminal, Award } from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useContext(AuthContext);
  const { isConnected } = useContext(SocketContext);

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', marginBottom: '2rem' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Terminal size={28} color="#6366f1" />
          <span style={{ fontSize: '1.4rem', fontWeight: 800, background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            EnigmaGrid
          </span>
          <span className={`badge ${isConnected ? 'badge-green' : 'badge-amber'}`} style={{ marginLeft: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Radio size={12} />
            {isConnected ? 'LIVE' : 'CONNECTING'}
          </span>
        </div>

        {user && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              className={`btn ${activeTab === 'arena' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('arena')}
            >
              <Award size={18} /> Arena
            </button>

            {!user.teamId && user.role !== 'ADMIN' && (
              <button
                className={`btn ${activeTab === 'lobby' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('lobby')}
              >
                <Users size={18} /> Team Lobby
              </button>
            )}

            {user.role === 'ADMIN' && (
              <button
                className={`btn ${activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('admin')}
              >
                <Shield size={18} /> Admin Dashboard
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border-color)' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.role}</div>
              </div>
              <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={logout} title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;

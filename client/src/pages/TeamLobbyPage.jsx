import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Users, Plus, Key, CheckCircle, ArrowRight } from 'lucide-react';

export const TeamLobbyPage = ({ onTeamSuccess }) => {
  const { user, refreshUser } = useContext(AuthContext);
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    setLoading(true);
    setErrorMsg('');

    try {
      await axios.post('/api/teams/create', { name: teamName.trim() });
      await refreshUser();
      if (onTeamSuccess) onTeamSuccess();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error creating team');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!teamCode.trim()) return;
    setLoading(true);
    setErrorMsg('');

    try {
      await axios.post('/api/teams/join', { code: teamCode.trim() });
      await refreshUser();
      if (onTeamSuccess) onTeamSuccess();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid team code');
    } finally {
      setLoading(false);
    }
  };

  if (user?.teamId) {
    return (
      <div className="container" style={{ maxWidth: '600px', marginTop: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <CheckCircle size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>You are part of a team!</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Head over to the Arena to start solving riddles and quizzes with your squad.
          </p>
          <button className="btn btn-primary" onClick={onTeamSuccess}>
            Enter Competition Arena <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '900px', marginTop: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Team Formation Lobby</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Create a new team or enter an existing 6-character team access code to join your teammates.
        </p>
      </div>

      {errorMsg && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.5rem', color: '#f87171', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          {errorMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Create Team Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Plus size={24} color="#6366f1" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Create New Team</h2>
          </div>

          <form onSubmit={handleCreateTeam}>
            <div className="form-group">
              <label className="form-label">Team Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. CyberKnights"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              Create Team
            </button>
          </form>
        </div>

        {/* Join Team Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Key size={24} color="#06b6d4" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Join Existing Team</h2>
          </div>

          <form onSubmit={handleJoinTeam}>
            <div className="form-group">
              <label className="form-label">6-Character Team Code</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. X9K2P4"
                maxLength={6}
                style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontFamily: 'var(--font-mono)' }}
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn btn-secondary" style={{ width: '100%' }} disabled={loading}>
              Join Team
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeamLobbyPage;

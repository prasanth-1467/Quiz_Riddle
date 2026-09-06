import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Users, Plus, Key, CheckCircle, ArrowRight, ArrowLeft, UserRound } from 'lucide-react';

export const TeamLobbyPage = ({ onTeamSuccess, onBack }) => {
  const { user, refreshUser } = useContext(AuthContext);
  const [teamName, setTeamName] = useState('');
  const [teammateNames, setTeammateNames] = useState(['']);
  const [teamCode, setTeamCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [participationMode, setParticipationMode] = useState('TEAM');

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    setLoading(true);
    setErrorMsg('');

    try {
      await axios.post('/api/teams/create', {
        name: teamName.trim(),
        teammateNames: teammateNames.map((name) => name.trim()).filter(Boolean),
      });
      await refreshUser();
      if (onTeamSuccess) onTeamSuccess();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error creating team');
    } finally {
      setLoading(false);
    }
  };

  const updateTeammateName = (index, value) => {
    setTeammateNames((currentNames) => currentNames.map((name, nameIndex) => (
      nameIndex === index ? value : name
    )));
  };

  const addTeammateField = () => {
    setTeammateNames((currentNames) => [...currentNames, '']);
  };

  const removeTeammateField = (index) => {
    setTeammateNames((currentNames) => currentNames.filter((_, nameIndex) => nameIndex !== index));
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    const normalizedCode = teamCode.trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(normalizedCode)) {
      setErrorMsg('Team code must be exactly 6 letters or numbers');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    try {
      await axios.post('/api/teams/join', { code: normalizedCode });
      await refreshUser();
      if (onTeamSuccess) onTeamSuccess();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid team code');
    } finally {
      setLoading(false);
    }
  };

  const handleIndividualQuiz = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await axios.post('/api/teams/individual');
      await refreshUser();
      if (onTeamSuccess) onTeamSuccess();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error starting individual quiz');
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
      <button type="button" className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '1rem' }}>
        <ArrowLeft size={18} /> Back
      </button>
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

      <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700 }}>Participate as:</span>
        <button type="button" className={`btn ${participationMode === 'TEAM' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setParticipationMode('TEAM')} disabled={loading}>
          <Users size={18} /> Team
        </button>
        <button type="button" className={`btn ${participationMode === 'INDIVIDUAL' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setParticipationMode('INDIVIDUAL')} disabled={loading}>
          <UserRound size={18} /> Individual
        </button>
      </div>

      {participationMode === 'INDIVIDUAL' && (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', maxWidth: '520px', margin: '0 auto' }}>
          <UserRound size={40} color="#06b6d4" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Play individually</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.75rem 0 1.5rem' }}>Start your own quiz session and compete on the same leaderboard.</p>
          <button type="button" className="btn btn-primary" onClick={handleIndividualQuiz} disabled={loading}>
            Start Individual Quiz <ArrowRight size={18} />
          </button>
        </div>
      )}

      {participationMode === 'TEAM' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
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
            <div className="form-group">
              <label className="form-label">Teammate Names</label>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '-0.35rem' }}>
                Add the names of the teammates joining your team.
              </p>
              {teammateNames.map((name, index) => (
                <div key={`teammate-${index}`} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder={`Teammate ${index + 1}`}
                    value={name}
                    onChange={(e) => updateTeammateName(index, e.target.value)}
                    disabled={loading}
                  />
                  {teammateNames.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => removeTeammateField(index)}
                      disabled={loading}
                      aria-label={`Remove teammate ${index + 1}`}
                    >
                      -
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-secondary" onClick={addTeammateField} disabled={loading}>
                Add Teammate
              </button>
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
                onChange={(e) => setTeamCode(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase())}
                required
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn btn-secondary" style={{ width: '100%' }} disabled={loading}>
              Join Team
            </button>
          </form>
        </div>
      </div>}
    </div>
  );
};

export default TeamLobbyPage;

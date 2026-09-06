import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AdminControls from '../components/AdminControls';
import Leaderboard from '../components/Leaderboard';
import { Shield, ClipboardList, RefreshCw } from 'lucide-react';
import { SocketContext } from '../context/SocketContext';

export const AdminDashboardPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const { socket } = useContext(SocketContext);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get('/api/admin/submissions');
      setSubmissions(res.data.submissions || []);
    } catch (err) {
      console.error('Error fetching submissions', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await axios.get('/api/admin/teams');
      setTeams(res.data.teams || []);
    } catch (err) {
      console.error('Error fetching teams', err);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    fetchTeams();
  }, []);

  useEffect(() => {
    if (!socket) return undefined;
    const refreshAdminData = () => {
      fetchSubmissions();
      fetchTeams();
    };
    socket.on('submission:new', refreshAdminData);
    socket.on('team:update', refreshAdminData);
    return () => {
      socket.off('submission:new', refreshAdminData);
      socket.off('team:update', refreshAdminData);
    };
  }, [socket]);

  const resetTeamProgress = async (teamId) => {
    try {
      await axios.put(`/api/admin/teams/${teamId}/reset`);
      await fetchTeams();
    } catch (error) {
      console.error('Error resetting team progress', error);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield color="#6366f1" size={28} /> Event Admin Command Center
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Manage round access, publish quiz/riddle questions, and audit live submission feeds.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => { fetchSubmissions(); fetchTeams(); }}>
          <RefreshCw size={16} /> Refresh Feed
        </button>
      </div>

      <AdminControls />

      <div style={{ marginTop: '2rem' }}>
        <Leaderboard />
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>Team Progress</h3>
        {teams.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No teams created yet.</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead><tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}><th style={{ padding: '0.75rem 1rem' }}>Team</th><th style={{ padding: '0.75rem 1rem' }}>Team Code</th><th style={{ padding: '0.75rem 1rem' }}>Registered Members</th><th style={{ padding: '0.75rem 1rem' }}>Teammate Names</th><th style={{ padding: '0.75rem 1rem' }}>Current Question</th><th style={{ padding: '0.75rem 1rem' }}>Score</th><th style={{ padding: '0.75rem 1rem' }}>Actions</th></tr></thead>
              <tbody>{teams.map((team) => <tr key={team._id} style={{ borderBottom: '1px solid var(--border-color)' }}><td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{team.name}<div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{team.mode || 'TEAM'}</div></td><td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)' }}>{team.code}</td><td style={{ padding: '0.75rem 1rem' }}>{team.members?.length ? team.members.map((member) => <div key={member._id}>{member.name}<span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}> ({member.email})</span></div>) : 'No registered members'}</td><td style={{ padding: '0.75rem 1rem' }}>{team.teammateNames?.length ? team.teammateNames.join(', ') : 'None added'}</td><td style={{ padding: '0.75rem 1rem' }}>Q{team.currentQuestionOrder}</td><td style={{ padding: '0.75rem 1rem' }}>{team.score} pts</td><td style={{ padding: '0.75rem 1rem' }}><button type="button" className="btn btn-secondary" onClick={() => resetTeamProgress(team._id)}>Reset Progress</button></td></tr>)}</tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submissions Audit Log */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ClipboardList color="#06b6d4" size={20} /> Live Submissions Audit Log
        </h3>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading audit log...</p>
        ) : submissions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No submissions logged yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Time</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Team</th>
                  <th style={{ padding: '0.75rem 1rem' }}>User</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Question</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Answer</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                      {new Date(sub.createdAt || sub.timestamp).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{sub.teamId?.name || 'N/A'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{sub.submittedBy?.name || 'N/A'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      Q{sub.questionId?.order}: {sub.questionId?.title}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)' }}>{sub.submittedAnswer}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`badge ${sub.isCorrect ? 'badge-green' : 'badge-amber'}`}>
                        {sub.isCorrect ? 'CORRECT' : 'INCORRECT'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;

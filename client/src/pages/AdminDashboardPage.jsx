import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminControls from '../components/AdminControls';
import { Shield, ClipboardList, RefreshCw } from 'lucide-react';

export const AdminDashboardPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchSubmissions();
  }, []);

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
        <button className="btn btn-secondary" onClick={fetchSubmissions}>
          <RefreshCw size={16} /> Refresh Feed
        </button>
      </div>

      <AdminControls />

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

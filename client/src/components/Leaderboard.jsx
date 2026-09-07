import React from 'react';
import useLeaderboard from '../hooks/useLeaderboard';
import { Trophy, Medal, Flame } from 'lucide-react';

export const Leaderboard = () => {
  const { leaderboard, loading } = useLeaderboard();

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading live standings...</p>
      </div>
    );
  }

  const getRankBadge = (index) => {
    const rank = index + 1;
    if (index === 0) return <><Trophy size={20} color="#f59e0b" /> <span>#{rank}</span></>;
    if (index === 1) return <><Medal size={20} color="#94a3b8" /> <span>#{rank}</span></>;
    if (index === 2) return <><Medal size={20} color="#b45309" /> <span>#{rank}</span></>;
    return <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{rank}</span>;
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Flame color="#ef4444" size={24} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Live Leaderboard</h2>
        </div>
        <span className="badge badge-purple">Real-Time</span>
      </div>

      {leaderboard.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No teams currently on the leaderboard.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {leaderboard.map((team, index) => (
            <div
              key={team._id || index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1.25rem',
                background: index === 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(15, 23, 42, 0.4)',
                border: index === 0 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-color)',
                borderRadius: '0.5rem',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '28px', textAlign: 'center' }}>{getRankBadge(index)}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{team.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Level {team.currentQuestionOrder || 1}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-accent)', fontFamily: 'var(--font-mono)' }}>
                  {team.score} pts
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import QuestionCard from '../components/QuestionCard';
import SubmissionForm from '../components/SubmissionForm';
import Leaderboard from '../components/Leaderboard';
import { ShieldAlert, Users, Award, Hash, Zap } from 'lucide-react';

export const ArenaPage = () => {
  const { user } = useContext(AuthContext);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [teamDetails, setTeamDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCurrentQuestion = async (orderNumber) => {
    try {
      const res = await axios.get(`/api/questions/order/${orderNumber}`);
      setCurrentQuestion(res.data.question);
    } catch (err) {
      if (err.response?.status === 404) {
        setCurrentQuestion(null);
      } else {
        setErrorMsg('Failed to load current question.');
      }
    }
  };

  const fetchTeamDetails = async () => {
    if (!user?.teamId) {
      setLoading(false);
      return;
    }
    const teamIdStr = typeof user.teamId === 'object' ? user.teamId._id : user.teamId;
    try {
      const res = await axios.get(`/api/teams/${teamIdStr}`);
      setTeamDetails(res.data.team);
      if (res.data.team?.currentQuestionOrder) {
        await fetchCurrentQuestion(res.data.team.currentQuestionOrder);
      }
    } catch (err) {
      setErrorMsg('Error loading team status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamDetails();
  }, [user]);

  const handleSubmissionSuccess = (data) => {
    if (data.currentQuestionOrder) {
      fetchCurrentQuestion(data.currentQuestionOrder);
      fetchTeamDetails();
    }
  };

  if (!user?.teamId && user?.role !== 'ADMIN') {
    return (
      <div className="container" style={{ maxWidth: '600px', marginTop: '3rem' }}>
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <ShieldAlert size={48} color="#f59e0b" style={{ marginBottom: '1rem' }} />
          <h2>No Team Joined</h2>
          <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>
            You must be in a registered team to access the active riddle arena.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Initializing Arena Workspace...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Main Arena Section */}
        <div>
          {teamDetails && (
            <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users color="#6366f1" size={24} />
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{teamDetails.name}</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Team Code: <code style={{ color: 'var(--secondary-accent)', fontFamily: 'var(--font-mono)' }}>{teamDetails.code}</code>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Level</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>#{teamDetails.currentQuestionOrder}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Score</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>{teamDetails.score} pts</div>
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.5rem', color: '#f87171', marginBottom: '1.5rem' }}>
              {errorMsg}
            </div>
          )}

          <QuestionCard question={currentQuestion} />
          <SubmissionForm question={currentQuestion} onSubmissionSuccess={handleSubmissionSuccess} />
        </div>

        {/* Real-Time Leaderboard Sidebar */}
        <aside>
          <Leaderboard />
        </aside>
      </div>
    </div>
  );
};

export default ArenaPage;

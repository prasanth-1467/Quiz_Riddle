import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ToggleLeft, ToggleRight, PlusCircle, RefreshCw, Layers } from 'lucide-react';
import { SocketContext } from '../context/SocketContext';

export const AdminControls = () => {
  const [eventState, setEventState] = useState({ isRoundOpen: true, isLeaderboardFrozen: false });
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState({
    order: 1,
    title: '',
    description: '',
    type: 'RIDDLE',
    options: '',
    correctAnswer: '',
    points: 10,
  });
  const [msg, setMsg] = useState('');
  const [questions, setQuestions] = useState([]);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const { socket } = useContext(SocketContext);

  const fetchState = async () => {
    try {
      const res = await axios.get('/api/admin/state');
      setEventState(res.data.eventState);
    } catch (error) {
      console.error('Error loading event state', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (!socket) return undefined;
    const handleStateUpdate = (updatedState) => setEventState(updatedState);
    socket.on('eventState:update', handleStateUpdate);
    return () => socket.off('eventState:update', handleStateUpdate);
  }, [socket]);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get('/api/questions');
      setQuestions(res.data.questions || []);
    } catch (error) {
      console.error('Error loading questions', error);
    }
  };

  const handleToggleState = async (field, currentValue) => {
    try {
      const updated = { ...eventState, [field]: !currentValue };
      const res = await axios.put('/api/admin/state', updated);
      setEventState(res.data.eventState);
    } catch (error) {
      console.error('Failed to update event state', error);
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const formattedOptions = newQuestion.options
        ? newQuestion.options.split(',').map((opt) => opt.trim())
        : [];

      const questionData = {
        ...newQuestion,
        order: Number(newQuestion.order),
        points: Number(newQuestion.points),
        options: formattedOptions,
      };
      if (editingQuestionId) {
        await axios.put(`/api/questions/${editingQuestionId}`, questionData);
      } else {
        await axios.post('/api/questions', questionData);
      }

      setMsg(editingQuestionId ? 'Question updated successfully!' : 'Question created successfully!');
      setEditingQuestionId(null);
      await fetchQuestions();
      setNewQuestion({
        order: Number(newQuestion.order) + 1,
        title: '',
        description: '',
        type: 'RIDDLE',
        options: '',
        correctAnswer: '',
        points: 10,
      });
    } catch (error) {
      setMsg(`❌ ${error.response?.data?.message || 'Error creating question'}`);
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestionId(question._id);
    setNewQuestion({
      order: question.order,
      title: question.title,
      description: question.description,
      type: question.type,
      options: question.options?.join(', ') || '',
      correctAnswer: question.correctAnswer,
      points: question.points,
    });
    setMsg('Editing selected question');
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      await axios.delete(`/api/questions/${questionId}`);
      setQuestions((currentQuestions) => currentQuestions.filter((question) => question._id !== questionId));
      setMsg('Question deleted successfully!');
    } catch (error) {
      setMsg(`Error deleting question: ${error.response?.data?.message || 'Request failed'}`);
    }
  };

  if (loading) return <div className="glass-panel" style={{ padding: '2rem' }}>Loading controls...</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
      {/* Event Controls Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers color="#6366f1" size={20} /> Event Controls
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '0.5rem' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Round Submissions</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {eventState.isRoundOpen ? 'Open for answers' : 'Submissions locked'}
              </div>
            </div>
            <button
              className="btn btn-secondary"
              style={{ border: 'none', background: 'transparent' }}
              onClick={() => handleToggleState('isRoundOpen', eventState.isRoundOpen)}
            >
              {eventState.isRoundOpen ? <ToggleRight size={36} color="#10b981" /> : <ToggleLeft size={36} color="#94a3b8" />}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '0.5rem' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Freeze Leaderboard</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {eventState.isLeaderboardFrozen ? 'Leaderboard frozen' : 'Real-time updates active'}
              </div>
            </div>
            <button
              className="btn btn-secondary"
              style={{ border: 'none', background: 'transparent' }}
              onClick={() => handleToggleState('isLeaderboardFrozen', eventState.isLeaderboardFrozen)}
            >
              {eventState.isLeaderboardFrozen ? <ToggleRight size={36} color="#ef4444" /> : <ToggleLeft size={36} color="#94a3b8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Question Creation Form */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlusCircle color="#10b981" size={20} /> {editingQuestionId ? 'Edit Question' : 'Add New Question'}
        </h3>

        {msg && <p style={{ marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 600 }}>{msg}</p>}

        <form onSubmit={handleCreateQuestion}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Order #</label>
              <input
                type="number"
                className="input-field"
                value={newQuestion.order}
                onChange={(e) => setNewQuestion({ ...newQuestion, order: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="input-field"
                placeholder="Question title"
                value={newQuestion.title}
                onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Points</label>
              <input
                type="number"
                className="input-field"
                value={newQuestion.points}
                onChange={(e) => setNewQuestion({ ...newQuestion, points: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Prompt</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Question content or riddle statement..."
              value={newQuestion.description}
              onChange={(e) => setNewQuestion({ ...newQuestion, description: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                className="input-field"
                value={newQuestion.type}
                onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}
              >
                <option value="RIDDLE">RIDDLE</option>
                <option value="MCQ">MCQ</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Correct Answer</label>
              <input
                type="text"
                className="input-field"
                placeholder="Exact answer string"
                value={newQuestion.correctAnswer}
                onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                required
              />
            </div>
          </div>

          {newQuestion.type === 'MCQ' && (
            <div className="form-group">
              <label className="form-label">Options (comma-separated)</label>
              <input
                type="text"
                className="input-field"
                placeholder="Option A, Option B, Option C, Option D"
                value={newQuestion.options}
                onChange={(e) => setNewQuestion({ ...newQuestion, options: e.target.value })}
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary">
            {editingQuestionId ? 'Save Question' : 'Publish Question'}
          </button>
          {editingQuestionId && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ marginLeft: '0.75rem' }}
              onClick={() => {
                setEditingQuestionId(null);
                setMsg('');
              }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Question Bank</h3>
        {questions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No questions created yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {questions.map((question) => (
              <div key={question._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}>
                <div>
                  <strong>Q{question.order}: {question.title}</strong>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{question.type} · {question.points} points</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => handleEditQuestion(question)}>Edit</button>
                  <button type="button" className="btn btn-secondary" onClick={() => handleDeleteQuestion(question._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminControls;

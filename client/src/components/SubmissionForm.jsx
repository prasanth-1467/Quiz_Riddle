import React, { useState } from 'react';
import axios from 'axios';
import { Send, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export const SubmissionForm = ({ question, onSubmissionSuccess, isRoundOpen = true }) => {
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!question) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await axios.post('/api/submissions', {
        questionId: question._id,
        answer: answer.trim(),
      });

      if (res.data.isCorrect) {
        setFeedback({ type: 'success', message: '🎉 Correct Answer! Advancing to next level...' });
        setAnswer('');
        if (onSubmissionSuccess) {
          setTimeout(() => {
            onSubmissionSuccess(res.data);
            setFeedback(null);
          }, 1500);
        }
      } else {
        setFeedback({ type: 'error', message: '❌ Incorrect answer. Try again!' });
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || 'Error submitting answer. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Your Answer</label>
          <input
            type="text"
            className="input-field"
            placeholder={question.type === 'MCQ' ? 'Enter option letter or exact text (e.g. A)' : 'Type your answer here...'}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button type="submit" className="btn btn-primary" disabled={submitting || !answer.trim() || !isRoundOpen}>
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <Send size={18} /> Submit Solution
              </>
            )}
          </button>
          {!isRoundOpen && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Round is closed</span>}
        </div>
      </form>

      {feedback && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.85rem 1rem',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: feedback.type === 'success' ? '#34d399' : '#f87171',
            border: feedback.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
};

export default SubmissionForm;

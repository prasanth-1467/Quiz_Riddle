import React from 'react';
import { HelpCircle, Star, Hash } from 'lucide-react';

export const QuestionCard = ({ question }) => {
  if (!question) {
    return (
      <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <HelpCircle size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
        <h3>All Questions Completed!</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Congratulations, your team has completed all available questions in this round.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Hash size={12} /> Question {question.order}
          </span>
          <span className="badge badge-green">{question.type}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24', fontWeight: 700 }}>
          <Star size={16} fill="#fbbf24" />
          <span>{question.points} Points</span>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>{question.title}</h2>

      <p style={{ fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
        {question.description}
      </p>

      {question.type === 'MCQ' && question.options && question.options.length > 0 && (
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {question.options.map((opt, idx) => (
            <div
              key={idx}
              style={{
                padding: '0.85rem 1.25rem',
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: 500,
              }}
            >
              <strong style={{ color: 'var(--primary-accent)', marginRight: '0.5rem' }}>
                {String.fromCharCode(65 + idx)}.
              </strong>{' '}
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;

import React from 'react';
import { IntervalPair } from '../types';
import { usePiano } from '../hooks/usePiano';

interface IntervalGameProps {
  pair1: IntervalPair | null;
  pair2: IntervalPair | null;
  onGuess: (guess: 1 | 2) => void;
  feedback: string;
  score: number;
  totalQuestions: number;
  onNewQuestion: () => void;
  isGameActive: boolean;
}

const IntervalGame: React.FC<IntervalGameProps> = ({
  pair1,
  pair2,
  onGuess,
  feedback,
  score,
  totalQuestions,
  onNewQuestion,
  isGameActive
}) => {
  const { isLoading, isPlaying, playSequence } = usePiano();

  const playBothIntervals = async () => {
    if (!pair1 || !pair2 || isPlaying) return;
    
    const intervals = [
      { baseNote: pair1.baseNote, secondNote: pair1.secondNote },
      { baseNote: pair2.baseNote, secondNote: pair2.secondNote }
    ];
    
    await playSequence(intervals, 1500);
  };

  const getFeedbackClass = () => {
    if (feedback.includes('Correct')) return 'feedback correct';
    if (feedback.includes('Incorrect')) return 'feedback incorrect';
    return 'feedback';
  };

  if (isLoading) {
    return (
      <div className="card">
        <p>Loading piano sounds...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="score">
        Score: {score}/{totalQuestions} 
        {totalQuestions > 0 && ` (${Math.round((score / totalQuestions) * 100)}%)`}
      </div>

      {pair1 && pair2 && (
        <>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <button 
              className="button" 
              onClick={playBothIntervals}
              disabled={isPlaying || !isGameActive}
            >
              {isPlaying ? 'Playing...' : 'Play Intervals'}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1.1rem' }}>
            <p>Which interval is <strong>larger</strong>?</p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              First interval: {pair1.interval.name} ({pair1.interval.semitones} semitones)<br/>
              Second interval: {pair2.interval.name} ({pair2.interval.semitones} semitones)
            </p>
          </div>

          {isGameActive && (
            <div className="interval-buttons">
              <button 
                className="button secondary" 
                onClick={() => onGuess(1)}
                disabled={isPlaying}
              >
                First Interval
              </button>
              <button 
                className="button secondary" 
                onClick={() => onGuess(2)}
                disabled={isPlaying}
              >
                Second Interval
              </button>
            </div>
          )}

          <div className={getFeedbackClass()}>
            {feedback}
          </div>

          {!isGameActive && (
            <div style={{ textAlign: 'center' }}>
              <button 
                className="button" 
                onClick={onNewQuestion}
              >
                Next Question
              </button>
            </div>
          )}
        </>
      )}

      {!pair1 || !pair2 ? (
        <div style={{ textAlign: 'center' }}>
          <button 
            className="button" 
            onClick={onNewQuestion}
          >
            Start Game
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default IntervalGame;
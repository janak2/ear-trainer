import React, { useEffect, useCallback, useRef } from "react";
import { IntervalPair } from "../types";
import { usePiano } from "../hooks/usePiano";

interface IntervalGameProps {
  pair1: IntervalPair | null;
  pair2: IntervalPair | null;
  onGuess: (guess: 1 | 2) => void;
  feedback: string;
  score: number;
  totalQuestions: number;
  onNewQuestion: () => void;
  isGameActive: boolean;
  tempoBpm: number;
}

const IntervalGame: React.FC<IntervalGameProps> = ({
  pair1,
  pair2,
  onGuess,
  feedback,
  score,
  totalQuestions,
  onNewQuestion,
  isGameActive,
  tempoBpm,
}) => {
  const { isLoading, isPlaying, playSequence, playSingleInterval } = usePiano();
  const hasPlayedRef = useRef<string | null>(null);

  const playBothIntervals = useCallback(async () => {
    if (!pair1 || !pair2 || isPlaying) return;

    const beatMs = 60000 / tempoBpm;
    const noteDurationMs = Math.round(beatMs);
    const gapBetweenNotesMs = Math.round(0.25 * beatMs);
    const gapBetweenIntervalsMs = Math.round(2 * beatMs);

    const intervals = [
      { baseNote: pair1.baseNote, secondNote: pair1.secondNote },
      { baseNote: pair2.baseNote, secondNote: pair2.secondNote },
    ];

    await playSequence(intervals, {
      noteDurationMs,
      gapBetweenNotesMs,
      gapBetweenIntervalsMs,
    });
  }, [pair1, pair2, isPlaying, playSequence, tempoBpm]);

  const playFirstInterval = useCallback(async () => {
    if (!pair1 || isPlaying) return;
    const beatMs = 60000 / tempoBpm;
    await playSingleInterval(
      pair1.baseNote,
      pair1.secondNote,
      Math.round(beatMs),
      Math.round(0.25 * beatMs)
    );
  }, [pair1, isPlaying, playSingleInterval, tempoBpm]);

  const playSecondInterval = useCallback(async () => {
    if (!pair2 || isPlaying) return;
    const beatMs = 60000 / tempoBpm;
    await playSingleInterval(
      pair2.baseNote,
      pair2.secondNote,
      Math.round(beatMs),
      Math.round(0.25 * beatMs)
    );
  }, [pair2, isPlaying, playSingleInterval, tempoBpm]);

  // Auto-play intervals when new question starts
  useEffect(() => {
    if (pair1 && pair2 && isGameActive && !isLoading) {
      // Create a unique key for this question
      const questionKey = `${pair1.baseNote.midiNumber}-${pair1.interval.semitones}-${pair2.baseNote.midiNumber}-${pair2.interval.semitones}`;

      // Only play if this is a new question
      if (hasPlayedRef.current !== questionKey) {
        hasPlayedRef.current = questionKey;

        // Small delay to ensure audio context is ready
        const timer = setTimeout(() => {
          playBothIntervals();
        }, 500);

        return () => clearTimeout(timer);
      }
    }
  }, [pair1, pair2, isGameActive, isLoading, playBothIntervals]);

  const getFeedbackClass = () => {
    if (feedback.includes("Correct")) return "feedback correct";
    if (feedback.includes("Incorrect")) return "feedback incorrect";
    return "feedback";
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
        {totalQuestions > 0 &&
          ` (${Math.round((score / totalQuestions) * 100)}%)`}
      </div>

      {pair1 && pair2 && (
        <>
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <button
              className="button"
              onClick={playBothIntervals}
              disabled={isPlaying}
              style={{
                fontSize: "1.1rem",
                padding: "0.75rem 2rem",
                marginBottom: "1rem",
              }}
            >
              {isPlaying ? "🔊 Playing..." : "🔊 Replay Both Intervals"}
            </button>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                marginBottom: "1rem",
              }}
            >
              <button
                className="button secondary"
                onClick={playFirstInterval}
                disabled={isPlaying}
                style={{ fontSize: "0.9rem" }}
              >
                🔊 First Only
              </button>
              <button
                className="button secondary"
                onClick={playSecondInterval}
                disabled={isPlaying}
                style={{ fontSize: "0.9rem" }}
              >
                🔊 Second Only
              </button>
            </div>
          </div>

          <div
            style={{
              textAlign: "center",
              marginBottom: "1rem",
              fontSize: "1.1rem",
            }}
          >
            <p>
              Which interval is <strong>larger</strong>?
            </p>
            <p style={{ fontSize: "0.9rem", color: "#666" }}>
              Listen carefully and compare the two intervals
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

          <div className={getFeedbackClass()}>{feedback}</div>

          {/* Show the actual notes of each interval after the user submits an answer */}
          {!isGameActive && feedback && pair1 && pair2 && (
            <div
              style={{
                marginTop: "0.5rem",
                textAlign: "center",
                fontSize: "0.95rem",
                color: "#333",
              }}
            >
              <div style={{ marginBottom: "0.25rem" }}>
                <strong>Notes:</strong>
              </div>
              <div>
                First: {`${pair1.baseNote.name}${pair1.baseNote.octave}`} →{" "}
                {`${pair1.secondNote.name}${pair1.secondNote.octave}`} (
                {pair1.interval.name})
              </div>
              <div>
                Second: {`${pair2.baseNote.name}${pair2.baseNote.octave}`} →{" "}
                {`${pair2.secondNote.name}${pair2.secondNote.octave}`} (
                {pair2.interval.name})
              </div>
            </div>
          )}

          {!isGameActive && (
            <div style={{ textAlign: "center" }}>
              <button className="button" onClick={onNewQuestion}>
                Next Question
              </button>
            </div>
          )}
        </>
      )}

      {!pair1 || !pair2 ? (
        <div style={{ textAlign: "center" }}>
          <button className="button" onClick={onNewQuestion}>
            Start Game
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default IntervalGame;

import React, { useState, useCallback } from "react";
import { Note, IntervalPair, GameState } from "./types";
import {
  DEFAULT_MIN_NOTE,
  DEFAULT_MAX_NOTE,
  INTERVALS,
  getValidBaseNotes,
  addInterval,
} from "./utils/noteUtils";
import NoteRangeSelector from "./components/NoteRangeSelector";
import IntervalGame from "./components/IntervalGame";

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    minNote: DEFAULT_MIN_NOTE,
    maxNote: DEFAULT_MAX_NOTE,
    currentPair1: null,
    currentPair2: null,
    correctAnswer: null,
    score: 0,
    totalQuestions: 0,
    feedback: "",
    tempoBpm: 100,
    isPlaying: false,
  });

  const generateSpecificInterval = useCallback(
    (
      minNote: Note,
      maxNote: Note,
      intervalType: "minor" | "major",
      excludeBaseNote?: Note
    ): IntervalPair | null => {
      const interval = intervalType === "minor" ? INTERVALS[0] : INTERVALS[1]; // minor = 1 semitone, major = 2 semitones

      // Get valid base notes for this interval
      const validBaseNotes = getValidBaseNotes(minNote, maxNote, interval);

      // If we need to exclude a base note (to ensure different base notes), filter it out
      const availableBaseNotes = excludeBaseNote
        ? validBaseNotes.filter(
            (note) => note.midiNumber !== excludeBaseNote.midiNumber
          )
        : validBaseNotes;

      if (availableBaseNotes.length === 0) {
        return null;
      }

      // Select random base note
      const baseNote =
        availableBaseNotes[
          Math.floor(Math.random() * availableBaseNotes.length)
        ];
      const secondNote = addInterval(baseNote, interval);

      return {
        baseNote,
        interval,
        secondNote,
      };
    },
    []
  );

  const generateNewQuestion = useCallback(() => {
    const { minNote, maxNote } = gameState;

    // Randomly decide which interval comes first
    const firstIsMinor = Math.random() < 0.5;

    // Generate first interval (minor or major)
    const pair1 = generateSpecificInterval(
      minNote,
      maxNote,
      firstIsMinor ? "minor" : "major"
    );
    if (!pair1) {
      console.error("Could not generate first interval");
      return;
    }

    // Generate second interval (opposite type, with different base note)
    const pair2 = generateSpecificInterval(
      minNote,
      maxNote,
      firstIsMinor ? "major" : "minor",
      pair1.baseNote
    );
    if (!pair2) {
      console.error("Could not generate second interval");
      return;
    }

    // Determine which interval is larger (major second is always larger)
    const correctAnswer: 1 | 2 =
      pair1.interval.semitones > pair2.interval.semitones ? 1 : 2;

    setGameState((prev) => ({
      ...prev,
      currentPair1: pair1,
      currentPair2: pair2,
      correctAnswer,
      feedback: "",
      isPlaying: false,
    }));
  }, [generateSpecificInterval, gameState]);

  const handleGuess = useCallback(
    (guess: 1 | 2) => {
      const { correctAnswer, currentPair1, currentPair2 } = gameState;

      if (!correctAnswer || !currentPair1 || !currentPair2) return;

      const isCorrect = guess === correctAnswer;
      const newScore = isCorrect ? gameState.score + 1 : gameState.score;
      const newTotal = gameState.totalQuestions + 1;

      const pair1Info = `${currentPair1.interval.name} (${currentPair1.interval.semitones} semitones)`;
      const pair2Info = `${currentPair2.interval.name} (${currentPair2.interval.semitones} semitones)`;

      const feedback = isCorrect
        ? `Correct! The ${
            correctAnswer === 1 ? "first" : "second"
          } interval was larger.`
        : `Incorrect. The ${
            correctAnswer === 1 ? "first" : "second"
          } interval (${
            correctAnswer === 1 ? pair1Info : pair2Info
          }) was larger.`;

      setGameState((prev) => ({
        ...prev,
        score: newScore,
        totalQuestions: newTotal,
        feedback,
        isPlaying: false,
      }));
    },
    [gameState]
  );

  const handleMinNoteChange = useCallback((note: Note) => {
    setGameState((prev) => ({
      ...prev,
      minNote: note,
      currentPair1: null,
      currentPair2: null,
      correctAnswer: null,
      feedback: "",
    }));
  }, []);

  const handleMaxNoteChange = useCallback((note: Note) => {
    setGameState((prev) => ({
      ...prev,
      maxNote: note,
      currentPair1: null,
      currentPair2: null,
      correctAnswer: null,
      feedback: "",
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      score: 0,
      totalQuestions: 0,
      currentPair1: null,
      currentPair2: null,
      correctAnswer: null,
      feedback: "",
    }));
  }, []);

  // Check if we can generate valid intervals with current note range
  const canGenerateIntervals = useCallback(() => {
    const { minNote, maxNote } = gameState;
    const minorSecondValidNotes = getValidBaseNotes(
      minNote,
      maxNote,
      INTERVALS[0]
    );
    const majorSecondValidNotes = getValidBaseNotes(
      minNote,
      maxNote,
      INTERVALS[1]
    );

    // We need at least 2 valid notes for each interval type to ensure different base notes
    return (
      minorSecondValidNotes.length >= 1 &&
      majorSecondValidNotes.length >= 1 &&
      minorSecondValidNotes.length + majorSecondValidNotes.length >= 2
    );
  }, [gameState]);

  const isGameActive =
    gameState.currentPair1 && gameState.currentPair2 && !gameState.feedback;

  return (
    <div className="container">
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>
        Ear Trainer - Interval Recognition
      </h1>

      <NoteRangeSelector
        minNote={gameState.minNote}
        maxNote={gameState.maxNote}
        onMinNoteChange={handleMinNoteChange}
        onMaxNoteChange={handleMaxNoteChange}
      />

      <div className="card" style={{ marginTop: "1rem" }}>
        <label
          htmlFor="tempo"
          style={{ display: "block", marginBottom: "0.5rem" }}
        >
          Tempo: <strong>{gameState.tempoBpm} BPM</strong>
        </label>
        <input
          id="tempo"
          type="range"
          min={40}
          max={200}
          step={1}
          value={gameState.tempoBpm}
          onChange={(e) =>
            setGameState((prev) => ({
              ...prev,
              tempoBpm: Number(e.target.value),
            }))
          }
          style={{ width: "100%" }}
        />
      </div>

      {!canGenerateIntervals() && (
        <div
          className="card"
          style={{ backgroundColor: "#fff3cd", border: "1px solid #ffeaa7" }}
        >
          <p>
            ⚠️ The selected note range is too narrow to generate different
            intervals with different base notes. Please expand the range.
          </p>
        </div>
      )}

      <IntervalGame
        pair1={gameState.currentPair1}
        pair2={gameState.currentPair2}
        onGuess={handleGuess}
        feedback={gameState.feedback}
        score={gameState.score}
        totalQuestions={gameState.totalQuestions}
        onNewQuestion={generateNewQuestion}
        isGameActive={!!isGameActive}
        tempoBpm={gameState.tempoBpm}
      />

      {gameState.totalQuestions > 0 && (
        <div style={{ textAlign: "center" }}>
          <button className="button secondary" onClick={resetGame}>
            Reset Score
          </button>
        </div>
      )}

      <div className="card">
        <h3>How to Play</h3>
        <ol>
          <li>Select your preferred note range using the dropdowns above</li>
          <li>Click "Start Game" - both intervals will play automatically</li>
          <li>Each interval consists of two notes played in sequence</li>
          <li>
            Use replay buttons to hear them again:
            <ul>
              <li>
                <strong>"🔊 Replay Both Intervals"</strong> - plays both in
                sequence
              </li>
              <li>
                <strong>"🔊 First Only"</strong> - plays just the first interval
              </li>
              <li>
                <strong>"🔊 Second Only"</strong> - plays just the second
                interval
              </li>
            </ul>
          </li>
          <li>
            Listen carefully and decide which interval is{" "}
            <strong>larger</strong> (more semitones)
          </li>
          <li>
            Click "First Interval" or "Second Interval" to make your guess
          </li>
          <li>
            The app will tell you if you're correct and show the interval types
          </li>
        </ol>
        <p>
          <strong>Interval Types:</strong>
        </p>
        <ul>
          <li>
            <strong>Minor Second:</strong> 1 semitone (e.g., C to C#)
          </li>
          <li>
            <strong>Major Second:</strong> 2 semitones (e.g., C to D)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default App;

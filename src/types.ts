export interface Note {
  name: string;
  octave: number;
  midiNumber: number;
}

export interface Interval {
  name: string;
  semitones: number;
}

export interface IntervalPair {
  baseNote: Note;
  interval: Interval;
  secondNote: Note;
}

export interface GameState {
  minNote: Note;
  maxNote: Note;
  currentPair1: IntervalPair | null;
  currentPair2: IntervalPair | null;
  correctAnswer: 1 | 2 | null;
  score: number;
  totalQuestions: number;
  feedback: string;
  tempoBpm: number;
  isPlaying: boolean;
}

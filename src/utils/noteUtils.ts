import { Note, Interval } from '../types';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const INTERVALS: Interval[] = [
  { name: 'Minor Second', semitones: 1 },
  { name: 'Major Second', semitones: 2 }
];

export const createNote = (name: string, octave: number): Note => {
  const noteIndex = NOTE_NAMES.indexOf(name);
  const midiNumber = (octave + 1) * 12 + noteIndex;
  return { name, octave, midiNumber };
};

export const midiToNote = (midiNumber: number): Note => {
  const octave = Math.floor(midiNumber / 12) - 1;
  const noteIndex = midiNumber % 12;
  const name = NOTE_NAMES[noteIndex];
  return { name, octave, midiNumber };
};

export const getAllNotesInRange = (minNote: Note, maxNote: Note): Note[] => {
  const notes: Note[] = [];
  for (let midi = minNote.midiNumber; midi <= maxNote.midiNumber; midi++) {
    notes.push(midiToNote(midi));
  }
  return notes;
};

export const getRandomNoteInRange = (minNote: Note, maxNote: Note): Note => {
  const notes = getAllNotesInRange(minNote, maxNote);
  return notes[Math.floor(Math.random() * notes.length)];
};

export const canPlayInterval = (baseNote: Note, interval: Interval, maxNote: Note): boolean => {
  return baseNote.midiNumber + interval.semitones <= maxNote.midiNumber;
};

export const getValidBaseNotes = (minNote: Note, maxNote: Note, interval: Interval): Note[] => {
  const validNotes: Note[] = [];
  for (let midi = minNote.midiNumber; midi <= maxNote.midiNumber; midi++) {
    const note = midiToNote(midi);
    if (canPlayInterval(note, interval, maxNote)) {
      validNotes.push(note);
    }
  }
  return validNotes;
};

export const addInterval = (baseNote: Note, interval: Interval): Note => {
  return midiToNote(baseNote.midiNumber + interval.semitones);
};

// Predefined notes for the selector
export const AVAILABLE_NOTES: Note[] = [
  // C2 to B5 range
  createNote('C', 2), createNote('C#', 2), createNote('D', 2), createNote('D#', 2),
  createNote('E', 2), createNote('F', 2), createNote('F#', 2), createNote('G', 2),
  createNote('G#', 2), createNote('A', 2), createNote('A#', 2), createNote('B', 2),
  
  createNote('C', 3), createNote('C#', 3), createNote('D', 3), createNote('D#', 3),
  createNote('E', 3), createNote('F', 3), createNote('F#', 3), createNote('G', 3),
  createNote('G#', 3), createNote('A', 3), createNote('A#', 3), createNote('B', 3),
  
  createNote('C', 4), createNote('C#', 4), createNote('D', 4), createNote('D#', 4),
  createNote('E', 4), createNote('F', 4), createNote('F#', 4), createNote('G', 4),
  createNote('G#', 4), createNote('A', 4), createNote('A#', 4), createNote('B', 4),
  
  createNote('C', 5), createNote('C#', 5), createNote('D', 5), createNote('D#', 5),
  createNote('E', 5), createNote('F', 5), createNote('F#', 5), createNote('G', 5),
  createNote('G#', 5), createNote('A', 5), createNote('A#', 5), createNote('B', 5)
];

export const DEFAULT_MIN_NOTE = createNote('C', 2);
export const DEFAULT_MAX_NOTE = createNote('B', 5);
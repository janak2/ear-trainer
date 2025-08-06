import React from 'react';
import { Note } from '../types';
import { AVAILABLE_NOTES } from '../utils/noteUtils';

interface NoteRangeSelectorProps {
  minNote: Note;
  maxNote: Note;
  onMinNoteChange: (note: Note) => void;
  onMaxNoteChange: (note: Note) => void;
}

const NoteRangeSelector: React.FC<NoteRangeSelectorProps> = ({
  minNote,
  maxNote,
  onMinNoteChange,
  onMaxNoteChange
}) => {
  const formatNoteName = (note: Note) => `${note.name}${note.octave}`;

  const handleMinNoteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedNote = AVAILABLE_NOTES.find(
      note => formatNoteName(note) === event.target.value
    );
    if (selectedNote) {
      onMinNoteChange(selectedNote);
    }
  };

  const handleMaxNoteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedNote = AVAILABLE_NOTES.find(
      note => formatNoteName(note) === event.target.value
    );
    if (selectedNote) {
      onMaxNoteChange(selectedNote);
    }
  };

  // Filter available max notes to only show notes >= minNote
  const availableMaxNotes = AVAILABLE_NOTES.filter(
    note => note.midiNumber >= minNote.midiNumber
  );

  // Filter available min notes to only show notes <= maxNote
  const availableMinNotes = AVAILABLE_NOTES.filter(
    note => note.midiNumber <= maxNote.midiNumber
  );

  return (
    <div className="card">
      <h3>Note Range</h3>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Minimum Note:</label>
          <select 
            value={formatNoteName(minNote)} 
            onChange={handleMinNoteChange}
          >
            {availableMinNotes.map(note => (
              <option key={formatNoteName(note)} value={formatNoteName(note)}>
                {formatNoteName(note)}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Maximum Note:</label>
          <select 
            value={formatNoteName(maxNote)} 
            onChange={handleMaxNoteChange}
          >
            {availableMaxNotes.map(note => (
              <option key={formatNoteName(note)} value={formatNoteName(note)}>
                {formatNoteName(note)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default NoteRangeSelector;
import { useState, useEffect, useCallback } from "react";
import { Note } from "../types";
import { SplendidGrandPiano } from "smplr";

export const usePiano = () => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [piano, setPiano] = useState<SplendidGrandPiano | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const initializeAudio = async () => {
      try {
        const ctx = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        setAudioContext(ctx);
        const instrument = new SplendidGrandPiano(ctx);
        await instrument.load;
        setPiano(instrument);
      } catch (error) {
        console.error("Failed to initialize piano:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAudio();
  }, []);

  const noteToMidiName = useCallback((note: Note): string => {
    return `${note.name}${note.octave}`;
  }, []);

  const playNote = useCallback(
    async (note: Note, duration: number = 1000) => {
      if (!audioContext || !piano) return;

      if (audioContext.state !== "running") {
        try {
          await audioContext.resume();
        } catch {}
      }

      const midiName = noteToMidiName(note);
      piano.start({ note: midiName, velocity: 90 });
      // Let the note ring; we just wait the duration for sequencing purposes
      await new Promise((resolve) => setTimeout(resolve, duration));
    },
    [audioContext, piano, noteToMidiName]
  );

  const playInterval = useCallback(
    async (
      baseNote: Note,
      secondNote: Note,
      noteDuration: number = 1000,
      gap: number = 100
    ) => {
      if (!piano || isPlaying) return;

      setIsPlaying(true);

      try {
        await playNote(baseNote, noteDuration);
        await new Promise((resolve) => setTimeout(resolve, noteDuration + gap));
        await playNote(secondNote, noteDuration);
        await new Promise((resolve) => setTimeout(resolve, noteDuration));
      } finally {
        setIsPlaying(false);
      }
    },
    [piano, isPlaying, playNote]
  );

  const playSequence = useCallback(
    async (
      intervals: Array<{ baseNote: Note; secondNote: Note }>,
      sequenceGap: number = 1000
    ) => {
      if (!piano || isPlaying) return;

      setIsPlaying(true);

      try {
        for (let i = 0; i < intervals.length; i++) {
          const { baseNote, secondNote } = intervals[i];
          await playNote(baseNote, 800);
          await new Promise((resolve) => setTimeout(resolve, 900));
          await playNote(secondNote, 800);
          if (i < intervals.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, sequenceGap));
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 800));
      } finally {
        setIsPlaying(false);
      }
    },
    [piano, isPlaying, playNote]
  );

  const playSingleInterval = useCallback(
    async (
      baseNote: Note,
      secondNote: Note,
      noteDuration: number = 1000,
      gap: number = 100
    ) => {
      if (!piano || isPlaying) return;

      setIsPlaying(true);

      try {
        await playNote(baseNote, noteDuration);
        await new Promise((resolve) => setTimeout(resolve, noteDuration + gap));
        await playNote(secondNote, noteDuration);
        await new Promise((resolve) => setTimeout(resolve, noteDuration));
      } finally {
        setIsPlaying(false);
      }
    },
    [piano, isPlaying, playNote]
  );

  return {
    isLoading,
    isPlaying,
    playNote,
    playInterval,
    playSingleInterval,
    playSequence,
  };
};

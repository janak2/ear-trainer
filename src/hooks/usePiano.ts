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
      // Ensure fixed note length using duration (in seconds)
      piano.start({ note: midiName, velocity: 90, duration: duration / 1000 });
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
        // Hard stop to avoid lingering tail
        piano.stop();
      } finally {
        setIsPlaying(false);
      }
    },
    [piano, isPlaying, playNote]
  );

  const playSequence = useCallback(
    async (
      intervals: Array<{ baseNote: Note; secondNote: Note }>,
      options?:
        | number
        | {
            noteDurationMs?: number;
            gapBetweenNotesMs?: number;
            gapBetweenIntervalsMs?: number;
          }
    ) => {
      if (!piano || isPlaying) return;

      const noteDurationMs =
        typeof options === "object" && options?.noteDurationMs !== undefined
          ? options.noteDurationMs
          : 800;
      const gapBetweenNotesMs =
        typeof options === "object" && options?.gapBetweenNotesMs !== undefined
          ? options.gapBetweenNotesMs
          : 900;
      const gapBetweenIntervalsMs =
        typeof options === "number"
          ? options
          : typeof options === "object" &&
            options?.gapBetweenIntervalsMs !== undefined
          ? options.gapBetweenIntervalsMs
          : 1000;

      setIsPlaying(true);

      try {
        for (let i = 0; i < intervals.length; i++) {
          const { baseNote, secondNote } = intervals[i];
          await playNote(baseNote, noteDurationMs);
          await new Promise((resolve) =>
            setTimeout(resolve, gapBetweenNotesMs)
          );
          await playNote(secondNote, noteDurationMs);
          if (i < intervals.length - 1) {
            await new Promise((resolve) =>
              setTimeout(resolve, gapBetweenIntervalsMs)
            );
          }
        }
        // Hard stop to avoid lingering tail after the full sequence
        piano.stop();
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
        // Hard stop to avoid lingering tail
        piano.stop();
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

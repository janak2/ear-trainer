import { useState, useEffect, useCallback } from "react";
import { Note } from "../types";
import * as Tone from "tone";

export const usePiano = () => {
  const [synth, setSynth] = useState<Tone.Synth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const initializeAudio = async () => {
      try {
        const synthInstance = new Tone.Synth({
          oscillator: { type: "sine" },
          envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.8 },
        }).toDestination();
        setSynth(synthInstance);
      } catch (error) {
        console.error("Failed to initialize synth:", error);
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
      if (!synth) return;

      if (Tone.getContext().state !== "running") {
        await Tone.start();
      }

      const midiName = noteToMidiName(note);
      const durationSeconds = duration / 1000;
      synth.triggerAttackRelease(midiName, durationSeconds);
    },
    [synth, noteToMidiName]
  );

  const playInterval = useCallback(
    async (
      baseNote: Note,
      secondNote: Note,
      noteDuration: number = 1000,
      gap: number = 100
    ) => {
      if (!synth || isPlaying) return;

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
    [synth, isPlaying, playNote]
  );

  const playSequence = useCallback(
    async (
      intervals: Array<{ baseNote: Note; secondNote: Note }>,
      sequenceGap: number = 1000
    ) => {
      if (!synth || isPlaying) return;

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
    [synth, isPlaying, playNote]
  );

  const playSingleInterval = useCallback(
    async (
      baseNote: Note,
      secondNote: Note,
      noteDuration: number = 1000,
      gap: number = 100
    ) => {
      if (!synth || isPlaying) return;

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
    [synth, isPlaying, playNote]
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

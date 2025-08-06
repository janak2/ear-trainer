import { useState, useEffect, useCallback } from 'react';
import { Note } from '../types';

export const usePiano = () => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const initializeAudio = () => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(ctx);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize audio:', error);
        setIsLoading(false);
      }
    };

    initializeAudio();
  }, []);

  const noteToFrequency = useCallback((note: Note): number => {
    // Convert MIDI number to frequency using A4 = 440 Hz as reference
    return 440 * Math.pow(2, (note.midiNumber - 69) / 12);
  }, []);

  const playNote = useCallback(async (note: Note, duration: number = 1000) => {
    if (!audioContext) return;

    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const frequency = noteToFrequency(note);
    const now = audioContext.currentTime;
    const durationInSeconds = duration / 1000;

    // Create oscillator for the tone
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Set up oscillator
    oscillator.type = 'triangle'; // Piano-like timbre
    oscillator.frequency.setValueAtTime(frequency, now);

    // Set up envelope (ADSR)
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.02); // Attack
    gainNode.gain.exponentialRampToValueAtTime(0.1, now + 0.3); // Decay/Sustain
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + durationInSeconds); // Release

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Start and stop
    oscillator.start(now);
    oscillator.stop(now + durationInSeconds);
  }, [audioContext, noteToFrequency]);

  const playInterval = useCallback(async (baseNote: Note, secondNote: Note, noteDuration: number = 1000, gap: number = 100) => {
    if (!audioContext || isPlaying) return;
    
    setIsPlaying(true);
    
    try {
      // Play first note
      await playNote(baseNote, noteDuration);
      
      // Wait for gap between notes
      await new Promise(resolve => setTimeout(resolve, noteDuration + gap));
      
      // Play second note
      await playNote(secondNote, noteDuration);
      
      // Wait for second note to finish
      await new Promise(resolve => setTimeout(resolve, noteDuration));
    } finally {
      setIsPlaying(false);
    }
  }, [audioContext, isPlaying, playNote]);

  const playSequence = useCallback(async (intervals: Array<{ baseNote: Note; secondNote: Note }>, sequenceGap: number = 1000) => {
    if (!audioContext || isPlaying) return;
    
    setIsPlaying(true);
    
    try {
      for (let i = 0; i < intervals.length; i++) {
        const { baseNote, secondNote } = intervals[i];
        
        // Play the interval
        await playNote(baseNote, 800);
        await new Promise(resolve => setTimeout(resolve, 900));
        await playNote(secondNote, 800);
        
        // Wait between intervals (except after the last one)
        if (i < intervals.length - 1) {
          await new Promise(resolve => setTimeout(resolve, sequenceGap));
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 800));
    } finally {
      setIsPlaying(false);
    }
  }, [audioContext, isPlaying, playNote]);

  const playSingleInterval = useCallback(async (baseNote: Note, secondNote: Note, noteDuration: number = 1000, gap: number = 100) => {
    if (!audioContext || isPlaying) return;
    
    setIsPlaying(true);
    
    try {
      // Play first note
      await playNote(baseNote, noteDuration);
      
      // Wait for gap between notes
      await new Promise(resolve => setTimeout(resolve, noteDuration + gap));
      
      // Play second note
      await playNote(secondNote, noteDuration);
      
      // Wait for second note to finish
      await new Promise(resolve => setTimeout(resolve, noteDuration));
    } finally {
      setIsPlaying(false);
    }
  }, [audioContext, isPlaying, playNote]);

  return {
    audioContext,
    isLoading,
    isPlaying,
    playNote,
    playInterval,
    playSingleInterval,
    playSequence
  };
};
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an ear trainer React TypeScript application for interval recognition training. Users can select note ranges and practice identifying whether the first or second of two played intervals is larger (minor second vs major second).

## Development Commands

- `pnpm install` - Install dependencies
- `pnpm start` or `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm test` - Run tests

## Architecture

### Core Components
- `App.tsx` - Main application component with game state management
- `NoteRangeSelector.tsx` - Component for selecting min/max note ranges (C2-B5)
- `IntervalGame.tsx` - Game interface for playing intervals and handling guesses

### Key Modules
- `types.ts` - TypeScript interfaces for Note, Interval, IntervalPair, GameState
- `utils/noteUtils.ts` - Note manipulation utilities and interval generation
- `hooks/usePiano.ts` - Custom hook for Web Audio API integration

### Audio System
- Uses Web Audio API with synthesized piano-like sounds
- Triangle wave oscillator with ADSR envelope for realistic timbre
- Plays ascending intervals (two notes in sequence)
- Supports minor second (1 semitone) and major second (2 semitones)
- Different base notes for each interval pair to ensure variety

### Game Logic
- Users select note range (default C2 to B5)
- App generates two intervals with different base notes within range
- Intervals automatically play when new question starts
- Users can replay intervals using the replay button
- User identifies which interval is larger
- Scoring system tracks correct/total answers with percentage
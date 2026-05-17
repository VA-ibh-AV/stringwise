# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # dev server (Vite HMR)
npm run build    # production build → dist/
npm run preview  # serve dist/ locally
```

No test runner or linter is configured.

## Architecture

React 18 + Vite SPA. No router library — navigation is a single `page` state string in `App.jsx`. No backend; all data is static mock in `src/mockData.js`.

**Page routing** (`App.jsx`): `page` ∈ `'dashboard' | 'batches' | 'students' | 'lessons' | 'editor'`. Pages receive `{ onNavigate, t, setTweak }` props. The editor is rendered inline in App rather than as a separate page component.

**Tab editor data model** (`TabEditor.jsx`):
- Hierarchy: Section → Measure → Beat → String cell
- Each beat is an array of 6 strings (index 0 = high e, index 5 = low E), value = fret number as string or `''`
- 8 beats per measure (constant `BEATS_PER_MEASURE`)
- `makeSeedSections()` builds the initial demo tab state

**Audio** (`audio.js`): Attempts to load a remote FluidR3_GM steel guitar sampler from `gleitz.github.io`. On failure, falls back to per-string `Tone.PluckSynth` instances. State machine: `idle → loading → ready | failed`. Call `preloadAudio()` on mount, `playFret(stringIdx, fret)` to trigger a note.

**Theming**: CSS custom properties `--accent`, `--accent-dim`, `--accent-glow`, `--accent-ink` set on `<html>` by App. `data-theme` (`dark`/`light`) and `data-density` (`comfortable`/`compact`) attributes drive CSS variant selectors in `index.css`. The `TweaksPanel` (floating overlay) also sends `postMessage` events to parent frame — this is for claude.ai/design integration, not app logic.

**`useTweaks`** hook (`TweaksPanel.jsx`): wraps `useState` for `{ accent, theme, density }` and fires `postMessage`+`CustomEvent` on every change for design-tool sync.

**`mockData.js`** exports: `BATCHES`, `STUDENTS`, `LESSONS`, `UPCOMING`, `ACCENT_OPTIONS`. All pages derive their data from these directly.

## musiclessons/ directory

Design handoff bundle from claude.ai/design. Contains HTML prototype files and chat transcripts showing the intended UI. Read `musiclessons/chats/` transcripts before implementing anything from this directory — intent lives in the chat, not just the HTML output.

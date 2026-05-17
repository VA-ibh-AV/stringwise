# Stringwise — Guitar Studio Manager

Web app for a guitar teacher to manage batches, students, and lessons — including guitar tab authoring with audio playback.

---

## Current State

React 18 + Vite SPA. No backend. All data is static mock (`src/mockData.js`). Fully client-side.

**Dev:**
```bash
npm run dev      # Vite HMR dev server
npm run build    # production build → dist/
npm run preview  # serve dist/ locally
```

---

## Planned Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 18 + Vite | Current |
| Database | Supabase (Postgres) | Replace mock data |
| Auth | Supabase Auth | Teacher + student login |
| Audio / file storage | Cloudflare R2 | 10GB free, zero egress fees |
| R2 upload signing | Cloudflare Worker | Generates presigned URLs for browser uploads |
| Video | YouTube (manual) + in-app guide | No API — teacher uploads to YT, pastes URL |

---

## Auth Model

**Teacher**
- Logs in via Supabase Auth
- Creates and manages batches, students, lessons
- Uploads audio to R2, adds YouTube URLs to lessons

**Student**
- Gets login credentials when teacher adds them
- Can log in to view their batch's content

---

## Features

### Live (mock data)
- Dashboard — upcoming sessions, recent lessons, stats
- Batches — class schedule management
- Students — roster with batch assignment
- Lessons — lesson list per batch
- Tab Editor — guitar tab grid with fretboard, per-section playback via Tone.js

### Planned

**YouTube guide panel** (in tab editor)
- Step-by-step instructions inline: upload to YouTube Studio → set unlisted → paste URL
- Replaces bare URL input with guided flow

**Audio upload (R2)**
- File picker in lesson editor → presigned URL from Cloudflare Worker → direct browser-to-R2 upload
- Stored per student: `/students/{id}/audio/`
- Audio player embedded in lesson view

**Supabase integration**
- Tables: `batches`, `students`, `lessons`, `sections`, `audio_files`
- Row-level security: students see only their batch's data
- Teacher has full read/write; students read-only

---

## Storage Layout (R2)

```
/students/{student_id}/
  audio/        ← backing tracks, practice recordings
  attachments/  ← PDFs, chord sheets
```

---

## Why These Choices

- **No self-hosted infra** — zero server cost goal
- **YouTube over R2 for video** — R2 video streaming unreliable; YouTube is free, already implemented
- **Cloudflare R2 over S3** — zero egress fees; S3 charges per GB downloaded
- **Supabase over Firebase** — Postgres preferred; row-level security fits teacher/student access model cleanly
- **YouTube API upload skipped** — 6 uploads/day default quota; manual upload + guide is simpler and quota-free

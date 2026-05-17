import { useState, useEffect, useMemo } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Section, makeSeedSections, STRING_NAMES, STRINGS } from './TabEditor'
import {
  TweaksPanel, useTweaks, TweakSection, TweakColor, TweakRadio,
} from './TweaksPanel'
import { ACCENT_OPTIONS } from './mockData'
import { hexA, badgeStyle } from './utils'
import DashboardPage from './pages/DashboardPage'
import BatchesPage from './pages/BatchesPage'
import StudentsPage from './pages/StudentsPage'
import LessonsPage from './pages/LessonsPage'
import LoginPage from './LoginPage'
import StudentApp from './StudentApp'
import { useAuth } from './AuthContext'
import { api } from './api'

const PAGE_PATHS = { dashboard: '/', batches: '/batches', students: '/students', lessons: '/lessons' }

export default function App() {
  const { session, role } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const activePage = location.pathname === '/' ? 'dashboard'
    : location.pathname === '/batches' ? 'batches'
    : location.pathname === '/students' ? 'students'
    : 'lessons'

  const TWEAK_DEFAULTS = { accent: '#E8A020', theme: 'dark', density: 'comfortable' }
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS)

  const [batches, setBatches] = useState([])
  const [students, setStudents] = useState([])
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = t.theme
    document.documentElement.dataset.density = t.density
    document.documentElement.style.setProperty('--accent', t.accent)
    document.documentElement.style.setProperty('--accent-dim', hexA(t.accent, 0.1))
    document.documentElement.style.setProperty('--accent-glow', hexA(t.accent, 0.45))
    document.documentElement.style.setProperty(
      '--accent-ink',
      t.theme === 'light' ? '#1a1610' : '#0a0a0a'
    )
  }, [t.theme, t.density, t.accent])

  async function loadAllData() {
    setLoading(true)
    try {
      const [b, s, l] = await Promise.all([
        api.getBatches(),
        api.getStudents(),
        api.getLessons(),
      ])
      setBatches(b || [])
      setStudents(s || [])
      setLessons(l || [])
    } catch (e) {
      console.error('load data failed', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      loadAllData()
    } else {
      setBatches([])
      setStudents([])
      setLessons([])
    }
  }, [session?.access_token])

  // Editor state
  const [lessonId, setLessonId] = useState(null)
  const [title, setTitle] = useState('')
  const [batchId, setBatchId] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [sections, setSections] = useState(makeSeedSections)
  const [dirty, setDirty] = useState(false)
  const [saveState, setSaveState] = useState('idle')
  const [videoHidden, setVideoHidden] = useState(false)

  const batch = batches.find((b) => b.id === batchId) || batches[0]
  const ytId = useMemo(() => extractYouTubeId(youtubeUrl), [youtubeUrl])

  function markDirty() { setDirty(true); setSaveState('idle') }

  async function save() {
    if (!lessonId) return
    setSaveState('saving')
    try {
      await api.updateLesson(lessonId, {
        title,
        batch_id: batchId || batches[0]?.id,
        youtube_url: youtubeUrl || null,
        notes: notes || null,
        sections: sections.map((s) => ({
          id: s.id,
          name: s.name,
          position: s.position ?? 0,
          tempo: s.tempo ?? 80,
          loop: s.loop ?? false,
          verse: s.verse ?? '',
          measures: (s.measures || []).map((m) => ({
            id: m.id,
            beats: m.beats,
          })),
        })),
      })
      api.getLessons().then((l) => setLessons(l || []))
      setSaveState('saved')
      setDirty(false)
      setTimeout(() => setSaveState('idle'), 1500)
    } catch (e) {
      console.error('save failed', e)
      setSaveState('idle')
    }
  }

  async function loadLesson(id) {
    const full = await api.getLesson(id)
    setLessonId(full.id)
    setTitle(full.title)
    setBatchId(full.batch_id)
    setYoutubeUrl(full.youtube_url || '')
    setNotes(full.notes || '')
    setSections(full.sections?.length ? full.sections : makeSeedSections())
    setDirty(false)
    setSaveState('idle')
  }

  async function openLesson(lesson) {
    try {
      await loadLesson(lesson.id)
      navigate(`/lessons/${lesson.id}`)
    } catch (e) {
      console.error('open lesson failed', e)
    }
  }

  async function newLesson() {
    if (!batches.length) return
    try {
      const lesson = await api.createLesson({
        batch_id: batches[0].id,
        title: 'New Lesson',
      })
      setLessonId(lesson.id)
      setTitle(lesson.title)
      setBatchId(lesson.batch_id)
      setYoutubeUrl('')
      setNotes('')
      setSections(makeSeedSections())
      setDirty(false)
      setSaveState('idle')
      navigate(`/lessons/${lesson.id}`)
      api.getLessons().then((l) => setLessons(l || []))
    } catch (e) {
      console.error('create lesson failed', e)
    }
  }

  const totalMeasures = sections.reduce((a, s) => a + (s.measures?.length || 0), 0)
  const filledNotes = sections.reduce(
    (acc, s) => acc + (s.measures || []).reduce(
      (a, m) => a + m.beats.reduce((aa, b) => aa + b.filter((v) => v !== '').length, 0), 0
    ), 0
  )

  function updateSection(idx, next) {
    setSections((prev) => prev.map((s, i) => (i === idx ? next : s)))
  }
  function removeSection(idx) {
    if (sections.length <= 1) return
    setSections((prev) => prev.filter((_, i) => i !== idx))
    markDirty()
  }
  function moveSection(idx, dir) {
    setSections((prev) => {
      const j = idx + dir
      if (j < 0 || j >= prev.length) return prev
      const next = prev.slice()
      ;[next[idx], next[j]] = [next[j], next[idx]]
      return next
    })
    markDirty()
  }
  function addSection() {
    setSections((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: `Section ${prev.length + 1}`,
        position: 0,
        tempo: 80,
        loop: false,
        verse: '',
        measures: [{ id: crypto.randomUUID(), beats: Array.from({ length: 8 }, () => ['', '', '', '', '', '']) }],
      },
    ])
    markDirty()
  }

  if (session === undefined || (session && role === undefined)) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
        Loading…
      </div>
    )
  }
  if (!session) return <LoginPage />
  if (role === 'student') return <StudentApp />

  const commonProps = {
    onNavigate: (id) => navigate(PAGE_PATHS[id] || '/'),
    onOpenLesson: openLesson,
    onNewLesson: newLesson,
    t,
    setTweak,
    batches,
    students,
    lessons,
    loading,
    refreshData: loadAllData,
  }

  const editorContent = (
    <>
      <div className="statusbar">
        <div className="left">
          <a href="/lessons" className="btn btn--ghost btn--sm" onClick={(e) => { e.preventDefault(); navigate('/lessons') }}>
            ← All lessons
          </a>
                <span className="crumbs">
                  <span>Lessons</span>
                  <span className="sep">/</span>
                  <span className="here">Editor</span>
                </span>
              </div>
              <div className="right">
                <button
                  className="btn btn--ghost btn--sm theme-toggle-btn"
                  onClick={() => setTweak('theme', t.theme === 'dark' ? 'light' : 'dark')}
                  title={t.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {t.theme === 'dark' ? <IconSun /> : <IconMoon />}
                </button>
                <span className="tab-hint" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span className={`dirty-dot ${dirty ? 'dirty' : ''}`} />
                  {dirty ? 'Unsaved changes' : 'All changes saved'}
                </span>
              </div>
            </div>

            <div className="topbar">
              <input
                className="title-input"
                value={title}
                onChange={(e) => { setTitle(e.target.value); markDirty() }}
                placeholder="Lesson title"
              />
              <button
                className={`btn btn--md ${saveState === 'saved' ? 'btn--saved' : 'btn--primary'}`}
                onClick={save}
                disabled={saveState === 'saving'}
              >
                {saveState === 'saved' ? '✓ Saved' : saveState === 'saving' ? 'Saving…' : 'Save Lesson'}
              </button>
            </div>

            <div className="field-row">
              <div className="field">
                <label className="label">Batch</label>
                <select className="select" value={batchId} onChange={(e) => { setBatchId(e.target.value); markDirty() }}>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} — {b.schedule}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="label">YouTube URL</label>
                <input
                  className="input"
                  value={youtubeUrl}
                  onChange={(e) => { setYoutubeUrl(e.target.value); markDirty() }}
                  placeholder="https://youtube.com/watch?v=…"
                />
              </div>
            </div>

            <div className={`split ${videoHidden ? 'split--full' : ''}`}>
              {!videoHidden && <div className="panel">
                <div className="panel-head">
                  <div className="panel-title">Lesson Video</div>
                  <div className="panel-actions">
                    {batch && (
                      <span className="badge" style={badgeStyle(batch.color)}>
                        <span className="swatch" />
                        {batch.name}
                      </span>
                    )}
                    <button className="btn btn--ghost btn--sm panel-hide-btn" onClick={() => setVideoHidden(true)} title="Hide video panel">
                      <IconEyeOff />
                    </button>
                  </div>
                </div>

                <div className="video-frame">
                  {ytId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}`}
                      title="Lesson video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="video-empty">
                      <div>
                        <div className="play">
                          <svg width="20" height="20" viewBox="0 0 20 20">
                            <polygon points="6,4 16,10 6,16" fill="currentColor" />
                          </svg>
                        </div>
                        Paste a YouTube URL above
                        <div className="hint">Video will embed here</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="video-meta">
                  <span>16:9 · auto-embed</span>
                  <span className="dot">•</span>
                  <span>{ytId ? 'Source linked' : 'No video yet'}</span>
                  {batch && <>
                    <span className="dot">•</span>
                    <span>{batch.schedule}</span>
                  </>}
                </div>

                <div style={{ height: 6 }} />

                <div className="panel-head">
                  <div className="panel-title">Lesson Notes</div>
                  <div className="panel-actions">
                    <span className="tab-hint">
                      {notes.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                </div>
                <textarea
                  className="textarea"
                  value={notes}
                  onChange={(e) => { setNotes(e.target.value); markDirty() }}
                  placeholder="Practice tips, technique notes, things to listen for…"
                  style={{ minHeight: 140 }}
                />
              </div>}

              <div className="panel panel--tabs">
                <div className="panel-head">
                  <div className="panel-title">Guitar Tab · Sections</div>
                  <div className="panel-actions">
                    {videoHidden && (
                      <button className="btn btn--ghost btn--sm panel-hide-btn" onClick={() => setVideoHidden(false)} title="Show video panel">
                        <IconEye />
                        <span style={{ marginLeft: 4 }}>Video</span>
                      </button>
                    )}
                    <span className="tab-hint">
                      {sections.length} section{sections.length !== 1 ? 's' : ''} ·{' '}
                      {totalMeasures} bar{totalMeasures !== 1 ? 's' : ''} ·{' '}
                      {filledNotes} note{filledNotes !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="sections-stack">
                  {sections.map((s, i) => (
                    <Section
                      key={s.id}
                      section={s}
                      index={i}
                      total={sections.length}
                      onChange={(next) => { updateSection(i, next); markDirty() }}
                      onRemove={removeSection}
                      onMove={moveSection}
                      onDirty={markDirty}
                    />
                  ))}
                </div>

                <button className="btn btn--outline btn--md add-section-btn" onClick={addSection}>
                  + Add Section
                </button>

                <div style={{ height: 4 }} />

                <div className="panel-head">
                  <div className="panel-title">String Guide</div>
                  <div className="panel-actions">
                    <span className="tab-hint">Standard tuning · EADGBe</span>
                  </div>
                </div>
                <div className="string-guide">
                  {STRINGS.map((s, i) => (
                    <div className="sg-item" key={i}>
                      <div className="sg-letter">{s}</div>
                      <div className="sg-name">{STRING_NAMES[i]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ height: 32 }} />
    </>
  )

  return (
    <div className="app">
      <Sidebar active={activePage} onNavigate={(id) => navigate(PAGE_PATHS[id] || '/')} />

      <div className="main">
        <div className="content">
          <Routes>
            <Route path="/"         element={<DashboardPage {...commonProps} />} />
            <Route path="/batches"  element={<BatchesPage   {...commonProps} />} />
            <Route path="/students" element={<StudentsPage  {...commonProps} />} />
            <Route path="/lessons"  element={<LessonsPage   {...commonProps} />} />
            <Route path="/lessons/:id" element={
              <LessonEditorShell lessonId={lessonId} onLoad={loadLesson}>
                {editorContent}
              </LessonEditorShell>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Accent">
          <TweakColor
            label="Color"
            value={t.accent}
            options={ACCENT_OPTIONS}
            onChange={(v) => setTweak('accent', v)}
          />
        </TweakSection>
        <TweakSection label="Theme">
          <TweakRadio
            label="Mode"
            value={t.theme}
            options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }]}
            onChange={(v) => setTweak('theme', v)}
          />
          <TweakRadio
            label="Density"
            value={t.density}
            options={[{ value: 'comfortable', label: 'Comfy' }, { value: 'compact', label: 'Compact' }]}
            onChange={(v) => setTweak('density', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  )
}

function LessonEditorShell({ lessonId, onLoad, children }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (lessonId !== id) {
      setLoading(true)
      onLoad(id)
        .then(() => setLoading(false))
        .catch(() => navigate('/lessons', { replace: true }))
    }
  }, [id])

  if (loading || !lessonId) {
    return <div style={{ padding: 40, color: 'var(--text-muted)', fontSize: 14 }}>Loading lesson…</div>
  }
  return children
}

function IconSun() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function IconMoon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function IconEyeOff() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function IconEye() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function extractYouTubeId(url) {
  if (!url) return null
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/) || url.match(/^([A-Za-z0-9_-]{11})$/)
  return m ? m[1] : null
}

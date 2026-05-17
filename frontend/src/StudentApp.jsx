import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useTweaks, TweaksPanel, TweakSection, TweakColor, TweakRadio } from './TweaksPanel'
import { ACCENT_OPTIONS } from './mockData'
import { hexA } from './utils'
import { useAuth } from './AuthContext'
import { api } from './api'
import StudentSidebar from './StudentSidebar'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentLessons from './pages/student/StudentLessons'
import StudentLessonViewer from './pages/student/StudentLessonViewer'
import StudentPractice from './pages/student/StudentPractice'
import StudentSongEditor from './pages/student/StudentSongEditor'

const TWEAK_DEFAULTS = { accent: '#E8A020', theme: 'dark', density: 'comfortable' }

export default function StudentApp() {
  const { session, signOut } = useAuth()
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS)

  const [studentRecord, setStudentRecord] = useState(undefined) // undefined=loading, null=not enrolled
  const [lessons, setLessons] = useState([])
  const [batch, setBatch] = useState(null)
  const [practiceSongs, setPracticeSongs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.documentElement.dataset.theme = t.theme
    document.documentElement.dataset.density = t.density
    document.documentElement.style.setProperty('--accent', t.accent)
    document.documentElement.style.setProperty('--accent-dim', hexA(t.accent, 0.1))
    document.documentElement.style.setProperty('--accent-glow', hexA(t.accent, 0.45))
    document.documentElement.style.setProperty('--accent-ink', t.theme === 'light' ? '#1a1610' : '#0a0a0a')
  }, [t.theme, t.density, t.accent])

  useEffect(() => {
    if (!session) return
    setLoading(true)
    Promise.all([
      api.getStudentMe().catch(() => null),
      api.getLessons().catch(() => []),
      api.getBatches().catch(() => []),
      api.getPracticeSongs().catch(() => []),
    ]).then(([student, ls, batches, songs]) => {
      setStudentRecord(student)
      setLessons(ls || [])
      if (student) {
        const b = (batches || []).find(b => b.id === student.batch_id)
        setBatch(b || null)
      }
      setPracticeSongs(songs || [])
    }).finally(() => setLoading(false))
  }, [session?.access_token])

  // Not enrolled screen
  if (studentRecord === null) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, color: 'var(--text-muted)', textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>You're not enrolled yet</div>
        <div style={{ fontSize: 13, maxWidth: 340, lineHeight: 1.6 }}>
          Ask your teacher to add your Google account email to your student profile in StringWise.
        </div>
        <button className="btn btn--outline btn--md" onClick={signOut} style={{ marginTop: 8 }}>Sign out</button>
      </div>
    )
  }

  // Loading
  if (studentRecord === undefined || loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
        Loading…
      </div>
    )
  }

  const commonProps = { t, setTweak, studentRecord, batch, lessons, practiceSongs, setPracticeSongs, loading }

  return (
    <div className="app">
      <StudentSidebar />
      <div className="main">
        <div className="content">
          <Routes>
            <Route path="/" element={<StudentDashboard {...commonProps} />} />
            <Route path="/lessons" element={<StudentLessons {...commonProps} />} />
            <Route path="/lessons/:id" element={<StudentLessonViewer />} />
            <Route path="/practice" element={<StudentPractice {...commonProps} />} />
            <Route path="/practice/:id" element={<StudentSongEditor setPracticeSongs={setPracticeSongs} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
      <TweaksPanel t={t} setTweak={setTweak}>
        <TweakSection label="Accent color">
          {ACCENT_OPTIONS.map(o => <TweakColor key={o.value} label={o.label} value={o.value} current={t.accent} onChange={v => setTweak('accent', v)} />)}
        </TweakSection>
        <TweakSection label="Theme">
          <TweakRadio name="theme" options={['dark','light']} value={t.theme} onChange={v => setTweak('theme', v)} />
        </TweakSection>
        <TweakSection label="Density">
          <TweakRadio name="density" options={['comfortable','compact']} value={t.density} onChange={v => setTweak('density', v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  )
}

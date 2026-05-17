import OnboardingModal, { useOnboarding } from './OnboardingModal'

const STEPS = [
  {
    title: "Welcome to StringWise",
    desc: "Your personal practice space. Your teacher posts lessons here — tabs, YouTube videos, and notes. You can also write your own songs and share them with other students.",
    visual: (
      <div className="ob-vis-center">
        <svg width="56" height="56" viewBox="0 0 32 32">
          <rect width="32" height="32" rx="7" fill="#f0a830"/>
          <line x1="6" y1="10" x2="26" y2="10" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="6" y1="15" x2="26" y2="15" stroke="#0a0a0a" strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="6" y1="20" x2="26" y2="20" stroke="#0a0a0a" strokeWidth="2.9" strokeLinecap="round"/>
          <line x1="6" y1="25" x2="26" y2="25" stroke="#0a0a0a" strokeWidth="3.6" strokeLinecap="round"/>
        </svg>
        <div className="ob-vis-label">StringWise Student</div>
      </div>
    ),
  },
  {
    title: 'My Lessons — from your teacher',
    desc: "Go to My Lessons in the sidebar. You'll see everything your teacher has published for your batch — click any lesson to open it, view the tab, and play it back.",
    visual: (
      <div className="ob-vis-ui">
        <div className="ob-ui-row ob-ui-row--highlight">
          <span className="ob-ui-pill ob-ui-pill--accent">BATCH A</span>
          <span style={{ flex: 1 }}>Smoke on the Water — Intro</span>
          <span className="ob-ui-muted">May 14</span>
        </div>
        <div className="ob-ui-row">
          <span className="ob-ui-pill ob-ui-pill--accent">BATCH A</span>
          <span style={{ flex: 1 }}>Power Chords — Open Position</span>
          <span className="ob-ui-muted">May 10</span>
        </div>
        <div className="ob-ui-row">
          <span className="ob-ui-pill ob-ui-pill--accent">BATCH A</span>
          <span style={{ flex: 1 }}>Em Pentatonic Scale</span>
          <span className="ob-ui-muted">May 5</span>
        </div>
      </div>
    ),
  },
  {
    title: 'Practice — write your own songs',
    desc: 'Go to Practice to create your own songs. Use the same tab editor your teacher uses — write out a riff, set a tempo, and play it back. Great for saving ideas.',
    visual: (
      <div className="ob-vis-ui">
        <div className="ob-ui-row ob-ui-row--highlight">
          <span style={{ flex: 1 }}>My first riff</span>
          <span className="ob-ui-pill" style={{ background: 'rgba(240,168,48,0.15)', color: 'var(--accent)', border: '1px solid rgba(240,168,48,0.3)' }}>Public</span>
        </div>
        <div className="ob-ui-row">
          <span style={{ flex: 1 }}>Jam idea — Tuesday</span>
          <span className="ob-ui-pill">Private</span>
        </div>
        <div className="ob-ui-add ob-ui-row">+ New Song</div>
      </div>
    ),
  },
  {
    title: 'The tab editor — quick overview',
    desc: "Click any cell to select it, then type a fret number (0–24). Use the fretboard above to toggle notes visually. Hit ▶ Play to hear the section. We'll show you the full tutorial when you first open a song.",
    visual: (
      <div className="ob-vis-tab">
        <div className="ob-tab-header">
          <span className="ob-tab-section">Verse 1</span>
          <span className="ob-tab-bpm">♩ 80 bpm</span>
          <span className="ob-tab-play">▶ Play</span>
        </div>
        <div className="ob-tab-grid">
          {['e','B','G','D','A','E'].map((s, i) => (
            <div key={i} className="ob-tab-row">
              <span className="ob-tab-str">{s}</span>
              {['–','–',5,'–',7,'–','–',5].map((v, j) => (
                <span key={j} className={`ob-tab-cell ${v !== '–' ? 'ob-tab-cell--filled' : ''} ${i === 4 && j === 2 ? 'ob-tab-cell--sel' : ''}`}>{v}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: 'Trending — discover & share',
    desc: 'Public practice songs from all students appear on the Trending page. Make your song Public to share it. Like songs you enjoy. Anyone can play them back — even without an account.',
    visual: (
      <div className="ob-vis-ui">
        {[
          { name: 'Priya K', title: 'Blinding Lights intro', likes: 8 },
          { name: 'Arjun M', title: 'Hotel California solo', likes: 5 },
          { name: 'Neha R', title: 'Stairway — first 8 bars', likes: 3 },
        ].map((s, i) => (
          <div key={i} className="ob-ui-row">
            <span className="ob-ui-avatar">{s.name[0]}</span>
            <span style={{ flex: 1, fontSize: 12 }}>{s.title}</span>
            <span className="ob-ui-muted" style={{ fontSize: 11 }}>👍 {s.likes}</span>
          </div>
        ))}
      </div>
    ),
  },
]

export default function StudentTour() {
  const [show, dismiss] = useOnboarding('tour_student_v1')
  if (!show) return null
  return <OnboardingModal steps={STEPS} onDone={dismiss} />
}

import OnboardingModal, { useOnboarding } from './OnboardingModal'

const STEPS = [
  {
    title: 'Welcome to StringWise',
    desc: 'Your focused studio for guitar teaching. Manage students, write tab lessons, and track progress — all in one place. This quick tour takes 60 seconds.',
    visual: (
      <div className="ob-vis-center">
        <svg width="56" height="56" viewBox="0 0 32 32">
          <rect width="32" height="32" rx="7" fill="#f0a830"/>
          <line x1="6" y1="10" x2="26" y2="10" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="6" y1="15" x2="26" y2="15" stroke="#0a0a0a" strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="6" y1="20" x2="26" y2="20" stroke="#0a0a0a" strokeWidth="2.9" strokeLinecap="round"/>
          <line x1="6" y1="25" x2="26" y2="25" stroke="#0a0a0a" strokeWidth="3.6" strokeLinecap="round"/>
        </svg>
        <div className="ob-vis-label">StringWise</div>
      </div>
    ),
  },
  {
    title: 'Create your first Batch',
    desc: 'A batch is a class group — e.g. "Monday 6pm Beginners". Each batch has a schedule and its own colour tag. Go to Batches → + New Batch to get started.',
    visual: (
      <div className="ob-vis-ui">
        <div className="ob-ui-row ob-ui-row--highlight">
          <span className="ob-ui-dot" style={{ background: '#4dd0e1' }}/>
          <span>Monday 6pm · Beginners</span>
          <span className="ob-ui-pill">3 students</span>
        </div>
        <div className="ob-ui-row">
          <span className="ob-ui-dot" style={{ background: '#f06292' }}/>
          <span>Saturday 10am · Intermediate</span>
          <span className="ob-ui-pill">5 students</span>
        </div>
        <div className="ob-ui-row ob-ui-add">+ New Batch</div>
      </div>
    ),
  },
  {
    title: 'Add your students',
    desc: 'Go to Students → + Add Student. Enter their name, Google email, and assign them to a batch. They can log in with that Google account to see their lessons.',
    visual: (
      <div className="ob-vis-ui">
        <div className="ob-ui-form">
          <div className="ob-ui-field"><span className="ob-ui-label">Name</span><span className="ob-ui-val">Rahul Sharma</span></div>
          <div className="ob-ui-field"><span className="ob-ui-label">Email</span><span className="ob-ui-val">rahul@gmail.com</span></div>
          <div className="ob-ui-field"><span className="ob-ui-label">Batch</span><span className="ob-ui-val ob-ui-val--accent">Monday 6pm</span></div>
          <div className="ob-ui-field"><span className="ob-ui-label">Level</span><span className="ob-ui-val">Beginner</span></div>
        </div>
      </div>
    ),
  },
  {
    title: 'Write a lesson with guitar tabs',
    desc: 'Go to Lessons → + New Lesson. Type a title, paste a YouTube URL if you have one, then write your tab in the editor below. Each section has its own tempo and loop setting.',
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
              {[5,7,'–','–',5,'–','–',7].map((v, j) => (
                <span key={j} className={`ob-tab-cell ${v !== '–' ? 'ob-tab-cell--filled' : ''}`}>{v}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: 'Students see lessons instantly',
    desc: "Once you save a lesson, students in that batch can log in to view it, play the tab, and practise. They can also create their own practice songs and share them publicly.",
    visual: (
      <div className="ob-vis-center" style={{ gap: 12 }}>
        <div className="ob-flow">
          <div className="ob-flow-step">You write tab</div>
          <div className="ob-flow-arrow">→</div>
          <div className="ob-flow-step">Student views</div>
          <div className="ob-flow-arrow">→</div>
          <div className="ob-flow-step ob-flow-step--accent">Student practises</div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>No PDFs. No WhatsApp. Just the link.</div>
      </div>
    ),
  },
]

export default function TeacherTour() {
  const [show, dismiss] = useOnboarding('tour_teacher_v1')
  if (!show) return null
  return <OnboardingModal steps={STEPS} onDone={dismiss} />
}

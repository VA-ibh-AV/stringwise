import { useNavigate } from 'react-router-dom'
import { badgeStyle } from '../../utils'

function fmtDay(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function StudentDashboard({ studentRecord, batch, lessons, practiceSongs, t, setTweak }) {
  const navigate = useNavigate()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const recentLessons = [...(lessons || [])].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 4)
  const recentPractice = [...(practiceSongs || [])].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 3)

  return (
    <>
      <div className="statusbar">
        <div className="left">
          <span className="crumbs">
            <span className="here">Dashboard</span>
          </span>
        </div>
        <div className="right">
          <button
            className="btn btn--ghost btn--sm theme-toggle-btn"
            onClick={() => setTweak('theme', t.theme === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
          >
            {t.theme === 'dark' ? <IconSun /> : <IconMoon />}
          </button>
        </div>
      </div>

      <div className="dash-greeting">
        <h2 className="greeting-text">{greeting}, {studentRecord?.name?.split(' ')[0] || 'there'}</h2>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        <div className="stat-card" style={{ '--stat-color': batch?.color || 'var(--accent)' }}>
          <div className="stat-value">{batch?.name || '—'}</div>
          <div className="stat-label">Your Batch</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--accent)' }}>
          <div className="stat-value">{studentRecord?.level || '—'}</div>
          <div className="stat-label">Level</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--accent)' }}>
          <div className="stat-value">{lessons?.length ?? 0}</div>
          <div className="stat-label">Lessons</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--accent)' }}>
          <div className="stat-value">{practiceSongs?.length ?? 0}</div>
          <div className="stat-label">Practice Songs</div>
        </div>
      </div>

      <div className="dash-grid" style={{ marginTop: 24 }}>
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Recent Lessons</span>
            <button className="btn btn--ghost btn--sm" onClick={() => navigate('/lessons')}>View all →</button>
          </div>
          <div className="recent-list">
            {recentLessons.length === 0
              ? <div className="empty-state" style={{ padding: '24px 0', textAlign: 'center', opacity: 0.5, fontSize: 13 }}>No lessons yet</div>
              : recentLessons.map(l => (
                <div key={l.id} className="recent-item" onClick={() => navigate(`/lessons/${l.id}`)} style={{ cursor: 'pointer' }}>
                  <div className="ri-color" style={{ background: batch?.color || 'var(--accent)' }} />
                  <span className="ri-title">{l.title}</span>
                  <span className="ri-date">{fmtDay(l.updated_at)}</span>
                </div>
              ))
            }
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Recent Practice</span>
            <button className="btn btn--ghost btn--sm" onClick={() => navigate('/practice')}>View all →</button>
          </div>
          <div className="recent-list">
            {recentPractice.length === 0
              ? <div className="empty-state" style={{ padding: '24px 0', textAlign: 'center', opacity: 0.5, fontSize: 13 }}>No practice songs yet</div>
              : recentPractice.map(s => (
                <div key={s.id} className="recent-item" onClick={() => navigate(`/practice/${s.id}`)} style={{ cursor: 'pointer' }}>
                  <div className="ri-color" style={{ background: s.visibility === 'public' ? 'var(--accent)' : 'var(--border)' }} />
                  <span className="ri-title">{s.title}</span>
                  <span className="ri-date">{fmtDay(s.updated_at)}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {batch && (
        <div className="panel" style={{ marginTop: 20 }}>
          <div className="panel-head">
            <span className="panel-title">Batch Schedule</span>
          </div>
          <div style={{ padding: '12px 0', display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            {batch.day && <div style={{ fontSize: 13 }}><span style={{ opacity: 0.5, marginRight: 6 }}>Day</span><strong>{batch.day}</strong></div>}
            {batch.time && <div style={{ fontSize: 13 }}><span style={{ opacity: 0.5, marginRight: 6 }}>Time</span><strong>{batch.time}</strong></div>}
            {batch.duration_minutes && <div style={{ fontSize: 13 }}><span style={{ opacity: 0.5, marginRight: 6 }}>Duration</span><strong>{batch.duration_minutes} min</strong></div>}
            {batch.schedule && <div style={{ fontSize: 13 }}><span style={{ opacity: 0.5, marginRight: 6 }}>Schedule</span><strong>{batch.schedule}</strong></div>}
          </div>
        </div>
      )}

      <div style={{ height: 32 }} />
    </>
  )
}

function IconSun() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

function IconMoon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

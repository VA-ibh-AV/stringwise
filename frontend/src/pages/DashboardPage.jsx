import { badgeStyle } from '../utils'
import { DashboardSkeleton } from '../Skeleton'

const DAY_ORDER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getUpcoming(batches) {
  const today = new Date().getDay()
  return batches
    .filter(b => b.day)
    .map(b => {
      const bDay = DAY_ORDER.indexOf(b.day)
      const diff = (bDay - today + 7) % 7
      return { batch: b, diff, isToday: diff === 0 }
    })
    .sort((a, b) => a.diff - b.diff)
    .slice(0, 6)
}

export default function DashboardPage({ onNavigate, onOpenLesson, onNewLesson, t, setTweak, batches, students, lessons, loading }) {
  if (loading) return <DashboardSkeleton />
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const batchStudentCount = Object.fromEntries(
    batches.map(b => [b.id, students.filter(s => s.batch_id === b.id).length])
  )
  const upcoming = getUpcoming(batches)
  const recentLessons = lessons.slice(0, 5)

  const todayDay = DAY_ORDER[new Date().getDay()]
  const nextBatch = batches.find(b => b.day === todayDay) || batches[0]

  return (
    <>
      <div className="statusbar">
        <div className="left">
          <span className="crumbs"><span className="here">Dashboard</span></span>
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
        <div>
          <h1 className="dash-hello">{greeting}</h1>
          <p className="dash-sub">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · Guitar Studio</p>
        </div>
        <button className="btn btn--primary btn--md" onClick={onNewLesson}>
          + New Lesson
        </button>
      </div>

      <div className="stat-grid">
        <StatCard val={String(students.length)} label="Students" color="#5088CC" />
        <StatCard val={String(batches.length)}  label="Active Batches" color="#44AA77" />
        <StatCard val={String(lessons.length)}  label="Total Lessons" color="#E8A020" />
        <StatCard
          val={nextBatch ? 'Today' : '—'}
          label="Next Session"
          delta={nextBatch ? `${nextBatch.name} · ${nextBatch.time}` : 'No sessions'}
          color="#CC5577"
        />
      </div>

      <div className="dash-grid">
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Upcoming Sessions</div>
            <span className="tab-hint">This week</span>
          </div>
          <div className="session-list">
            {upcoming.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '12px 0' }}>
                No batches yet. Add batches to see your schedule.
              </div>
            )}
            {upcoming.map(({ batch, isToday }, i) => (
              <div className="session-item" key={i}>
                <span className={`session-day${isToday ? ' today' : ''}`}>{isToday ? 'Today' : batch.day}</span>
                <span className="session-dot" style={{ background: batch.color }} />
                <span className="session-name">{batch.name}</span>
                <span className="session-time">{batch.time}</span>
                <span className="session-count">{batchStudentCount[batch.id] || 0} students</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Recent Lessons</div>
            <button className="btn btn--ghost btn--sm" onClick={() => onNavigate('lessons')}>
              View all →
            </button>
          </div>
          <div className="recent-list">
            {recentLessons.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '12px 0' }}>
                No lessons yet. Create your first lesson.
              </div>
            )}
            {recentLessons.map(l => {
              const batch = batches.find(b => b.id === l.batch_id)
              return (
                <div className="recent-item" key={l.id} onClick={() => onOpenLesson(l)}>
                  {batch && (
                    <span className="badge" style={badgeStyle(batch.color)}>
                      {batch.name.split(' ')[0]}
                    </span>
                  )}
                  <span className="recent-title">{l.title}</span>
                  <span className="recent-date">{fmtDay(l.updated_at)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ height: 32 }} />
    </>
  )
}

function fmtDay(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function StatCard({ val, label, delta, color }) {
  return (
    <div className="stat-card" style={{ '--stat-color': color }}>
      <div className="stat-val">{val}</div>
      <div className="stat-label">{label}</div>
      {delta && <div className="stat-delta">{delta}</div>}
    </div>
  )
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

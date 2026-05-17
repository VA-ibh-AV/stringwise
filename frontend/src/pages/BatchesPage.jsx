import { useState } from 'react'
import { badgeStyle } from '../utils'
import { api } from '../api'
import { BatchesSkeleton } from '../Skeleton'

const COLORS = ['#E8A020','#44AA77','#5088CC','#CC5577','#9966CC','#E06040','#40A0B0','#A08060']
const DAYS   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const LEVELS = ['Beginner','Intermediate','Advanced']

export default function BatchesPage({ onNavigate, t, setTweak, batches, students, lessons, refreshData, loading }) {
  const [showModal, setShowModal] = useState(false)
  if (loading) return <BatchesSkeleton />
  const studentCount = Object.fromEntries(batches.map(b => [b.id, students.filter(s => s.batch_id === b.id).length]))
  const lessonCount  = Object.fromEntries(batches.map(b => [b.id, lessons.filter(l => l.batch_id === b.id).length]))

  return (
    <>
      <div className="statusbar">
        <div className="left">
          <span className="crumbs">
            <span>Studio</span>
            <span className="sep">/</span>
            <span className="here">Batches</span>
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

      <div className="page-header">
        <div>
          <span className="page-title">Batches</span>
          <span className="page-title-sub">{batches.length} active</span>
        </div>
        <div className="page-actions">
          <button className="btn btn--outline btn--md" onClick={() => setShowModal(true)}>+ New Batch</button>
        </div>
      </div>

      {batches.length === 0 && (
        <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '24px 0' }}>
          No batches yet. Create your first batch to get started.
        </div>
      )}

      <div className="batch-grid">
        {batches.map(b => (
          <div className="batch-card" key={b.id}>
            <div className="batch-card-stripe" style={{ background: b.color }} />
            <div className="batch-card-body">
              <div>
                <div className="batch-card-name">{b.name}</div>
                <div className="batch-card-schedule">{b.schedule}</div>
              </div>
              <div className="batch-card-stats">
                <div className="batch-stat">
                  <div className="batch-stat-val">{studentCount[b.id] || 0}</div>
                  <div className="batch-stat-lbl">Students</div>
                </div>
                <div className="batch-stat">
                  <div className="batch-stat-val">{lessonCount[b.id] || 0}</div>
                  <div className="batch-stat-lbl">Lessons</div>
                </div>
                <div className="batch-stat">
                  <div className="batch-stat-val">{b.duration_minutes}m</div>
                  <div className="batch-stat-lbl">Session</div>
                </div>
              </div>
            </div>
            <div className="batch-card-footer">
              <button className="btn btn--ghost btn--sm" onClick={() => onNavigate('students')}>Roster</button>
              <button className="btn btn--outline btn--sm" onClick={() => onNavigate('lessons')}>Lessons</button>
              <div style={{ flex: 1 }} />
              <span className="batch-card-dot" style={{ background: b.color }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 32 }} />

      {showModal && (
        <NewBatchModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); refreshData() }}
        />
      )}
    </>
  )
}

function NewBatchModal({ onClose, onCreated }) {
  const [name, setName]         = useState('')
  const [color, setColor]       = useState(COLORS[0])
  const [day, setDay]           = useState('Mon')
  const [time, setTime]         = useState('6:00 PM')
  const [duration, setDuration] = useState(60)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!name.trim()) return setError('Name is required')
    setSaving(true)
    setError('')
    try {
      await api.createBatch({
        name: name.trim(),
        color,
        day,
        time,
        schedule: `${day} ${time}`,
        duration_minutes: Number(duration),
      })
      onCreated()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">New Batch</span>
          <button className="modal-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="modal-field">
            <label className="modal-label">Batch Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Beginners Monday" autoFocus />
          </div>

          <div className="modal-field">
            <label className="modal-label">Color</label>
            <div className="color-swatches">
              {COLORS.map(c => (
                <div
                  key={c}
                  className={`color-swatch${color === c ? ' selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className="modal-row">
            <div className="modal-field">
              <label className="modal-label">Day</label>
              <select className="select" value={day} onChange={e => setDay(e.target.value)}>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="modal-field">
              <label className="modal-label">Time</label>
              <input className="input" value={time} onChange={e => setTime(e.target.value)} placeholder="6:00 PM" />
            </div>
          </div>

          <div className="modal-field">
            <label className="modal-label">Duration (minutes)</label>
            <input className="input" type="number" min="15" max="240" value={duration} onChange={e => setDuration(e.target.value)} />
          </div>

          {error && <div className="modal-error">{error}</div>}

          <div className="modal-footer">
            <button type="button" className="btn btn--ghost btn--md" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary btn--md" disabled={saving}>
              {saving ? 'Creating…' : 'Create Batch'}
            </button>
          </div>
        </form>
      </div>
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

import { useState } from 'react'
import { badgeStyle, hexA, fmtMonthYear } from '../utils'
import { api } from '../api'
import { StudentsSkeleton } from '../Skeleton'

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

export default function StudentsPage({ onNavigate, t, setTweak, batches, students, refreshData, loading }) {
  const [filterBatch, setFilterBatch] = useState('all')
  const [showModal, setShowModal]     = useState(false)
  if (loading) return <StudentsSkeleton />

  const visible = filterBatch === 'all'
    ? students
    : students.filter(s => s.batch_id === filterBatch)

  return (
    <>
      <div className="statusbar">
        <div className="left">
          <span className="crumbs">
            <span>Studio</span>
            <span className="sep">/</span>
            <span className="here">Students</span>
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
          <span className="page-title">Students</span>
          <span className="page-title-sub">{visible.length} of {students.length}</span>
        </div>
        <div className="page-actions">
          <select
            className="select"
            value={filterBatch}
            onChange={e => setFilterBatch(e.target.value)}
            style={{ width: 'auto', minWidth: 180 }}
          >
            <option value="all">All Batches</option>
            {batches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <button className="btn btn--outline btn--md" onClick={() => setShowModal(true)}>+ Add Student</button>
        </div>
      </div>

      {visible.length === 0 && (
        <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '24px 0' }}>
          No students yet. Add students to track their progress.
        </div>
      )}

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Batch</th>
              <th>Level</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(s => {
              const batch = batches.find(b => b.id === s.batch_id)
              const bColor = batch?.color || '#888'
              return (
                <tr key={s.id}>
                  <td>
                    <div className="st-name-cell">
                      <div className="st-avatar" style={{ background: hexA(bColor, 0.25), color: bColor }}>
                        {s.initials}
                      </div>
                      <span className="st-name">{s.name}</span>
                    </div>
                  </td>
                  <td>
                    {batch && (
                      <span className="badge" style={badgeStyle(batch.color)}>{batch.name}</span>
                    )}
                  </td>
                  <td>
                    <span className={`level-pill ${s.level.toLowerCase()}`}>{s.level}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontFamily: '"Fira Code", monospace', fontSize: 12 }}>
                    {fmtMonthYear(s.joined_date)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{ height: 32 }} />

      {showModal && (
        <AddStudentModal
          batches={batches}
          defaultBatchId={filterBatch !== 'all' ? filterBatch : batches[0]?.id || ''}
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); refreshData() }}
        />
      )}
    </>
  )
}

function AddStudentModal({ batches, defaultBatchId, onClose, onCreated }) {
  const [name, setName]       = useState('')
  const [initials, setInitials] = useState('')
  const [batchId, setBatchId] = useState(defaultBatchId)
  const [level, setLevel]     = useState('Beginner')
  const [email, setEmail]     = useState('')
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  function handleNameChange(val) {
    setName(val)
    const parts = val.trim().split(/\s+/)
    if (parts.length >= 2) {
      setInitials((parts[0][0] + parts[1][0]).toUpperCase())
    } else if (parts[0]) {
      setInitials(parts[0].slice(0, 2).toUpperCase())
    } else {
      setInitials('')
    }
  }

  async function submit(e) {
    e.preventDefault()
    if (!name.trim()) return setError('Name is required')
    if (!batchId)     return setError('Select a batch')
    setSaving(true)
    setError('')
    try {
      await api.createStudent({
        name: name.trim(),
        initials: initials || name.slice(0, 2).toUpperCase(),
        batch_id: batchId,
        level,
        ...(email.trim() ? { email: email.trim() } : {}),
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
          <span className="modal-title">Add Student</span>
          <button className="modal-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="modal-field">
            <label className="modal-label">Full Name</label>
            <input className="input" value={name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Rahul Sharma" autoFocus />
          </div>

          <div className="modal-row">
            <div className="modal-field">
              <label className="modal-label">Initials</label>
              <input className="input" value={initials} onChange={e => setInitials(e.target.value.toUpperCase().slice(0,2))} placeholder="RS" maxLength={2} />
            </div>
            <div className="modal-field">
              <label className="modal-label">Level</label>
              <select className="select" value={level} onChange={e => setLevel(e.target.value)}>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="modal-field">
            <label className="modal-label">Batch</label>
            <select className="select" value={batchId} onChange={e => setBatchId(e.target.value)}>
              <option value="">— select batch —</option>
              {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div className="modal-field">
            <label className="modal-label">Email for student login <span style={{ fontWeight: 400, opacity: 0.55 }}>(optional)</span></label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="student@example.com" />
          </div>

          {error && <div className="modal-error">{error}</div>}

          <div className="modal-footer">
            <button type="button" className="btn btn--ghost btn--md" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary btn--md" disabled={saving}>
              {saving ? 'Adding…' : 'Add Student'}
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

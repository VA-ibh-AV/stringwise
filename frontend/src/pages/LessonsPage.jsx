import { useState } from 'react'
import { badgeStyle } from '../utils'
import { LessonsSkeleton } from '../Skeleton'

function fmtDay(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function LessonsPage({ onNavigate, onOpenLesson, onNewLesson, t, setTweak, batches, lessons, loading }) {
  const [filterBatch, setFilterBatch] = useState('all')
  if (loading) return <LessonsSkeleton />

  const visible = filterBatch === 'all'
    ? lessons
    : lessons.filter(l => l.batch_id === filterBatch)

  return (
    <>
      <div className="statusbar">
        <div className="left">
          <span className="crumbs">
            <span>Studio</span>
            <span className="sep">/</span>
            <span className="here">Lessons</span>
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
          <span className="page-title">Lessons</span>
          <span className="page-title-sub">{visible.length} of {lessons.length}</span>
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
          <button className="btn btn--primary btn--md" onClick={onNewLesson}>
            + New Lesson
          </button>
        </div>
      </div>

      {visible.length === 0 && (
        <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '24px 0' }}>
          {lessons.length === 0 ? 'No lessons yet. Create your first lesson.' : 'No lessons for this batch.'}
        </div>
      )}

      <div className="lesson-list">
        {visible.map(l => {
          const batch = batches.find(b => b.id === l.batch_id)
          return (
            <div className="lesson-card" key={l.id} onClick={() => onOpenLesson(l)}>
              <div className="lesson-card-color" style={{ background: batch?.color || '#888' }} />
              <div className="lesson-card-body">
                <div className="lesson-card-title">{l.title}</div>
                <div className="lesson-card-meta">
                  {l.section_count > 0 ? `${l.section_count} section${l.section_count !== 1 ? 's' : ''}` : 'No sections'}{' · '}
                  {l.measure_count > 0 ? `${l.measure_count} bar${l.measure_count !== 1 ? 's' : ''}` : '0 bars'}
                </div>
              </div>
              <div className="lesson-card-right">
                {batch && <span className="badge" style={badgeStyle(batch.color)}>{batch.name}</span>}
                <span className="lesson-date">{fmtDay(l.updated_at)}</span>
                <button
                  className="btn btn--outline btn--sm"
                  onClick={e => { e.stopPropagation(); onOpenLesson(l) }}
                >
                  Open →
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ height: 32 }} />
    </>
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

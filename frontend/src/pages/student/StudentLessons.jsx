import { useNavigate } from 'react-router-dom'
import { badgeStyle } from '../../utils'

function fmtDay(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function StudentLessons({ lessons, batch, loading }) {
  const navigate = useNavigate()

  if (loading) return null

  return (
    <>
      <div className="statusbar">
        <div className="left">
          <span className="crumbs">
            <span className="here">My Lessons</span>
          </span>
        </div>
        <div className="right">
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lessons.length} lesson{lessons.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <span className="page-title">My Lessons</span>
          {batch && <span className="badge" style={badgeStyle(batch.color)}>{batch.name}</span>}
        </div>
      </div>

      <div className="lesson-list">
        {lessons.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
            No lessons yet — check back after your teacher adds some.
          </div>
        ) : (
          lessons.map(l => (
            <div key={l.id} className="lesson-card" onClick={() => navigate(`/lessons/${l.id}`)} style={{ cursor: 'pointer' }}>
              <div className="lesson-card-color" style={{ background: batch?.color || 'var(--accent)' }} />
              <div className="lesson-card-body">
                <div className="lesson-title">{l.title}</div>
                <div className="lesson-meta" style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  {l.section_count > 0 && <span>{l.section_count} section{l.section_count !== 1 ? 's' : ''}</span>}
                  {l.measure_count > 0 && <span style={{ marginLeft: 10 }}>{l.measure_count} bar{l.measure_count !== 1 ? 's' : ''}</span>}
                </div>
              </div>
              <div className="lesson-card-right">
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtDay(l.updated_at)}</span>
                <button className="btn btn--outline btn--sm" onClick={e => { e.stopPropagation(); navigate(`/lessons/${l.id}`) }}>Open →</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ height: 32 }} />
    </>
  )
}

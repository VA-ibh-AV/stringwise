import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'

function fmtDay(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function StudentPractice({ practiceSongs, setPracticeSongs, loading }) {
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  async function newSong() {
    setCreating(true)
    try {
      const song = await api.createPracticeSong({ title: 'Untitled', sections: [], visibility: 'private' })
      setPracticeSongs(prev => [song, ...prev])
      navigate(`/practice/${song.id}`)
    } catch (e) {
      console.error('create practice song failed', e)
    } finally {
      setCreating(false)
    }
  }

  async function deleteSong(id) {
    try {
      await api.deletePracticeSong(id)
      setPracticeSongs(prev => prev.filter(s => s.id !== id))
    } catch (e) {
      console.error('delete failed', e)
    } finally {
      setConfirmDelete(null)
    }
  }

  if (loading) return null

  return (
    <>
      <div className="statusbar">
        <div className="left">
          <span className="crumbs"><span className="here">Practice</span></span>
        </div>
        <div className="right">
          <button className="btn btn--primary btn--sm" onClick={newSong} disabled={creating}>
            {creating ? 'Creating…' : '+ New Song'}
          </button>
        </div>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <span className="page-title">My Practice</span>
          <span className="page-title-sub">{practiceSongs.length} song{practiceSongs.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="lesson-list">
        {practiceSongs.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
            No practice songs yet. Create one to start composing.
          </div>
        ) : (
          practiceSongs.map(s => (
            <div key={s.id} className="lesson-card" onClick={() => navigate(`/practice/${s.id}`)} style={{ cursor: 'pointer' }}>
              <div className="lesson-card-color" style={{ background: s.visibility === 'public' ? 'var(--accent)' : 'var(--border)' }} />
              <div className="lesson-card-body">
                <div className="lesson-title">{s.title}</div>
              </div>
              <div className="lesson-card-right" style={{ gap: 8 }}>
                <span
                  className="badge"
                  style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10,
                    background: s.visibility === 'public' ? 'var(--accent-dim)' : 'var(--surface-2)',
                    color: s.visibility === 'public' ? 'var(--accent)' : 'var(--text-muted)' }}
                >
                  {s.visibility === 'public' ? 'Public' : 'Private'}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtDay(s.updated_at)}</span>
                <button className="btn btn--outline btn--sm" onClick={e => { e.stopPropagation(); navigate(`/practice/${s.id}`) }}>Edit →</button>
                <button
                  className="btn btn--danger btn--sm"
                  onClick={e => { e.stopPropagation(); setConfirmDelete(s.id) }}
                  title="Delete"
                >×</button>
              </div>
            </div>
          ))
        )}
      </div>

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 360 }}>
            <div className="modal-header">
              <span className="modal-title">Delete song?</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '8px 0 20px' }}>This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn--ghost btn--sm" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn--danger btn--sm" onClick={() => deleteSong(confirmDelete)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 32 }} />
    </>
  )
}

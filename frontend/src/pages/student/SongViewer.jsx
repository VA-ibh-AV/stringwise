import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Section } from '../../TabEditor'
import { api } from '../../api'

export default function SongViewer({ standalone = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [song, setSong] = useState(null)
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    Promise.all([
      api.getTrending(),
      api.getTrendingSections(id),
    ]).then(([songs, secs]) => {
      const found = (songs || []).find(s => s.id === id)
      setSong(found || null)
      const parsed = typeof secs === 'string' ? JSON.parse(secs) : secs
      setSections(Array.isArray(parsed) ? parsed : [])
      setLoading(false)
    }).catch(() => { setError(true); setLoading(false) })
  }, [id])

  if (loading) {
    const spinner = (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
        Loading…
      </div>
    )
    if (standalone) return <div className="app" style={{ gridTemplateColumns: '1fr' }}><div className="main"><div className="content">{spinner}</div></div></div>
    return spinner
  }

  if (error || !sections.length) {
    const msg = (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--text-muted)', fontSize: 14 }}>
        <span>Song not found or not public.</span>
        <button className="btn btn--ghost btn--sm" onClick={() => navigate('/trending')}>← Back to Trending</button>
      </div>
    )
    if (standalone) return <div className="app" style={{ gridTemplateColumns: '1fr' }}><div className="main"><div className="content">{msg}</div></div></div>
    return msg
  }

  const content = (
    <>
      <div className="statusbar">
        <div className="left">
          <button className="btn btn--ghost btn--sm" onClick={() => navigate('/trending')}>← Trending</button>
          {song && (
            <span className="crumbs">
              <span>Trending</span>
              <span className="sep">/</span>
              <span className="here">{song.title}</span>
            </span>
          )}
        </div>
        {song && (
          <div className="right" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            by {song.author_name}
          </div>
        )}
      </div>

      <div className="topbar">
        <span className="title-input" style={{ pointerEvents: 'none' }}>{song?.title || 'Song'}</span>
      </div>

      {sections.map((section, idx) => (
        <Section
          key={section.id}
          section={section}
          index={idx}
          total={sections.length}
          onChange={() => {}}
          onRemove={() => {}}
          onMove={() => {}}
          onDirty={() => {}}
          readOnly={true}
        />
      ))}

      <div style={{ height: 32 }} />
    </>
  )

  if (standalone) {
    return (
      <div className="app" style={{ gridTemplateColumns: '1fr' }}>
        <div className="main"><div className="content">{content}</div></div>
      </div>
    )
  }
  return content
}

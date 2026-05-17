import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Section } from '../../TabEditor'
import { api } from '../../api'

export default function StudentLessonViewer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.getLesson(id)
      .then(data => { setLesson(data); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [id])

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
        Loading…
      </div>
    )
  }

  if (error || !lesson) {
    return (
      <div style={{ padding: 32, color: 'var(--text-muted)', fontSize: 14 }}>
        Lesson not found.
      </div>
    )
  }

  return (
    <>
      <div className="statusbar">
        <div className="left">
          <button className="btn btn--ghost btn--sm" onClick={() => navigate('/lessons')}>← My Lessons</button>
          <span className="crumbs">
            <span>Lessons</span>
            <span className="sep">/</span>
            <span className="here">{lesson.title}</span>
          </span>
        </div>
      </div>

      <div className="topbar" style={{ paddingTop: 20, paddingBottom: 8 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{lesson.title}</h2>
      </div>

      {lesson.youtube_url && (
        <div className="youtube-wrap" style={{ marginBottom: 20 }}>
          <iframe
            src={`https://www.youtube.com/embed/${extractYouTubeId(lesson.youtube_url)}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: '100%', aspectRatio: '16/9', border: 'none', borderRadius: 8 }}
          />
        </div>
      )}

      {lesson.notes && (
        <div className="panel" style={{ marginBottom: 20 }}>
          <div className="panel-head"><span className="panel-title">Notes</span></div>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-muted)', margin: 0, padding: '4px 0 8px', whiteSpace: 'pre-wrap' }}>{lesson.notes}</p>
        </div>
      )}

      {(lesson.sections || []).map((section, idx) => (
        <Section
          key={section.id}
          section={section}
          index={idx}
          total={lesson.sections.length}
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
}

function extractYouTubeId(url) {
  if (!url) return ''
  const m = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : url
}

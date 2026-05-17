import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Section, makeSeedSections } from '../../TabEditor'
import { api } from '../../api'

export default function StudentSongEditor({ setPracticeSongs }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [song, setSong] = useState(null)
  const [title, setTitle] = useState('')
  const [sections, setSections] = useState([])
  const [visibility, setVisibility] = useState('private')
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.getPracticeSong(id)
      .then(data => {
        setSong(data)
        setTitle(data.title)
        setVisibility(data.visibility)
        const parsed = typeof data.sections === 'string' ? JSON.parse(data.sections) : data.sections
        setSections(parsed?.length ? parsed : makeSeedSections())
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  function markDirty() { setDirty(true) }

  async function save() {
    setSaving(true)
    setDirty(false)
    try {
      const updated = await api.updatePracticeSong(id, { title, sections, visibility })
      setSong(updated)
      setPracticeSongs(prev => prev.map(s => s.id === id ? { ...s, title, visibility, updated_at: updated.updated_at } : s))
    } catch (e) {
      console.error('save failed', e)
      setDirty(true)
    } finally {
      setSaving(false)
    }
  }

  async function toggleVisibility() {
    const next = visibility === 'private' ? 'public' : 'private'
    setVisibility(next)
    try {
      await api.updatePracticeSong(id, { title, sections, visibility: next })
      setPracticeSongs(prev => prev.map(s => s.id === id ? { ...s, visibility: next } : s))
    } catch (e) {
      setVisibility(visibility) // revert on failure
    }
  }

  function handleSectionChange(idx, updated) {
    setSections(prev => prev.map((s, i) => i === idx ? updated : s))
    markDirty()
  }
  function handleSectionRemove(idx) {
    setSections(prev => prev.filter((_, i) => i !== idx))
    markDirty()
  }
  function handleSectionMove(idx, dir) {
    setSections(prev => {
      const next = [...prev]
      const target = idx + dir
      if (target < 0 || target >= next.length) return next
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
    markDirty()
  }
  function addSection() {
    setSections(prev => [...prev, {
      id: crypto.randomUUID(),
      name: `Section ${prev.length + 1}`,
      position: 0,
      tempo: 80,
      loop: false,
      verse: '',
      measures: [{ id: crypto.randomUUID(), beats: Array.from({ length: 8 }, () => ['', '', '', '', '', '']) }],
    }])
    markDirty()
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
        Loading…
      </div>
    )
  }

  return (
    <>
      <div className="statusbar">
        <div className="left">
          <button className="btn btn--ghost btn--sm" onClick={() => navigate('/practice')}>← My Practice</button>
          <span className="crumbs">
            <span>Practice</span>
            <span className="sep">/</span>
            <span className="here">{title}</span>
          </span>
        </div>
        <div className="right">
          <button
            className="btn btn--ghost btn--sm"
            onClick={toggleVisibility}
            style={{
              fontSize: 11,
              padding: '3px 10px',
              borderRadius: 10,
              background: visibility === 'public' ? 'var(--accent-dim)' : 'var(--surface-2)',
              color: visibility === 'public' ? 'var(--accent)' : 'var(--text-muted)',
              border: visibility === 'public' ? '1px solid var(--accent)' : '1px solid var(--border)',
            }}
            title="Toggle public/private"
          >
            {visibility === 'public' ? 'Public' : 'Private'}
          </button>
          <span className="tab-hint" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span className={`dirty-dot ${dirty ? 'dirty' : ''}`} />
            {saving ? 'Saving…' : dirty ? 'Unsaved changes' : 'All changes saved'}
          </span>
          <button className="btn btn--primary btn--sm" onClick={save} disabled={!dirty || saving}>Save</button>
        </div>
      </div>

      <div className="topbar">
        <input
          className="title-input"
          value={title}
          onChange={e => { setTitle(e.target.value); markDirty() }}
          placeholder="Song title"
        />
      </div>

      {sections.map((section, idx) => (
        <Section
          key={section.id}
          section={section}
          index={idx}
          total={sections.length}
          onChange={updated => handleSectionChange(idx, updated)}
          onRemove={handleSectionRemove}
          onMove={handleSectionMove}
          onDirty={markDirty}
        />
      ))}

      <button className="btn btn--outline btn--md" onClick={addSection} style={{ marginTop: 16 }}>
        + Add Section
      </button>

      <div style={{ height: 32 }} />
    </>
  )
}

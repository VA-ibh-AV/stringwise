import { useState, useEffect, useRef } from 'react'
import { preloadAudio, playFret } from '../audio'

function hashColor(id) {
  let h = 0
  for (let i = 0; i < (id || '').length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return `hsl(${h % 360}, 50%, 42%)`
}

function initials(name) {
  if (!name || name === 'Anonymous') return 'AN'
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}

function shortDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getAppUrl() {
  const env = import.meta.env.VITE_APP_URL
  if (env) return env
  if (typeof window !== 'undefined') {
    const u = new URL(window.location.href)
    u.port = '3000'
    u.pathname = '/'
    return u.origin
  }
  return 'http://localhost:3000'
}

async function playSection(section, signal) {
  await preloadAudio()
  const tempo = section.tempo || 80
  const msPerBeat = (60 / tempo) * 1000
  for (const measure of section.measures || []) {
    if (signal.cancelled) return
    if (measure.audio_file?.url) {
      const audio = new Audio(measure.audio_file.url)
      audio.play().catch(() => {})
      const beats = measure.beats?.length || 8
      for (let b = 0; b < beats; b++) {
        if (signal.cancelled) { audio.pause(); audio.src = ''; return }
        await new Promise(r => setTimeout(r, msPerBeat))
      }
      audio.pause()
      audio.src = ''
    } else {
      for (const beat of measure.beats || []) {
        if (signal.cancelled) return
        beat.forEach((fret, si) => {
          if (fret !== '' && fret !== null && fret !== undefined) {
            playFret(si, parseInt(fret, 10))
          }
        })
        await new Promise(r => setTimeout(r, msPerBeat))
      }
    }
  }
}

function SongRow({ song, playingId, onPlayToggle }) {
  const appUrl = getAppUrl()
  const isPlaying = playingId === song.id
  const signalRef = useRef({ cancelled: false })
  const [loadingPlay, setLoadingPlay] = useState(false)

  async function handlePlay(e) {
    e.preventDefault()
    e.stopPropagation()
    if (isPlaying) {
      signalRef.current.cancelled = true
      onPlayToggle(null)
      return
    }
    signalRef.current = { cancelled: false }
    onPlayToggle(song.id)
    setLoadingPlay(true)
    try {
      const res = await fetch(`/api/v1/trending/${song.id}/sections`)
      const sections = res.ok ? await res.json() : null
      setLoadingPlay(false)
      if (!sections?.length || signalRef.current.cancelled) { onPlayToggle(null); return }
      for (const section of sections) {
        if (signalRef.current.cancelled) break
        await playSection(section, signalRef.current)
      }
    } catch {
      setLoadingPlay(false)
    } finally {
      if (!signalRef.current.cancelled) onPlayToggle(null)
    }
  }

  return (
    <a className={`lc-row${isPlaying ? ' lc-row--playing' : ''}`} href={`${appUrl}/songs/${song.id}`} target="_blank" rel="noopener noreferrer">
      <span className="lc-idx">{String(song._index + 1).padStart(2, '0')}</span>

      <button className={`lc-play${isPlaying ? ' lc-play--active' : ''}`} onClick={handlePlay} title={isPlaying ? 'Stop' : 'Play tab'}>
        {loadingPlay ? (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="9" strokeDasharray="28 56" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.7s" repeatCount="indefinite" />
            </circle>
          </svg>
        ) : isPlaying ? (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
      </button>

      <span className="lc-avatar" style={{ background: hashColor(song.student_user_id) }}>
        {initials(song.author_name)}
      </span>

      <span className="lc-info">
        <span className="lc-title">{song.title}</span>
        <span className="lc-author">{song.author_name}</span>
      </span>

      <span className="lc-sections">{song.sections_count} section{song.sections_count !== 1 ? 's' : ''}</span>

      <span className="lc-likes">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
          <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
        {song.like_count}
      </span>

      <span className="lc-date">{shortDate(song.created_at)}</span>
    </a>
  )
}

export default function Trending() {
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [playingId, setPlayingId] = useState(null)

  useEffect(() => {
    fetch('/api/v1/trending')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setSongs((data || []).slice(0, 8).map((s, i) => ({ ...s, _index: i }))))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const appUrl = getAppUrl()

  return (
    <section className="trending-section">
      <div className="trending-inner">
        <div className="trending-head">
          <h2 className="section-h2">What students are <em>creating</em></h2>
          <p className="section-sub">Real practice songs from real students — public, shareable, playable.</p>
        </div>

        <div className="lc-table">
          {loading && [...Array(5)].map((_, i) => (
            <div key={i} className="lc-row lc-row--skel" />
          ))}

          {!loading && !error && songs.map(s => (
            <SongRow key={s.id} song={s} playingId={playingId} onPlayToggle={setPlayingId} />
          ))}

          {!loading && (error || songs.length === 0) && (
            <div className="lc-empty">No public songs yet — be the first to share one.</div>
          )}
        </div>

        <div className="trending-cta">
          <a href={`${appUrl}/trending`} className="btn-ghost" target="_blank" rel="noopener noreferrer">
            See all · play songs →
          </a>
        </div>
      </div>
    </section>
  )
}

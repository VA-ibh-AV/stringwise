import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { preloadAudio, playFret } from '../audio'

export function hashColor(id) {
  let h = 0
  for (let i = 0; i < (id || '').length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return `hsl(${h % 360}, 55%, 45%)`
}

export function avatarInitials(name) {
  if (!name || name === 'Anonymous') return 'AN'
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}

function shortDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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

export default function SongCard({ song, onReact, session, index, isPlaying, onPlayToggle }) {
  const navigate = useNavigate()
  const [optimistic, setOptimistic] = useState(null)
  const [loadingPlay, setLoadingPlay] = useState(false)
  const signalRef = useRef({ cancelled: false })

  useEffect(() => () => { signalRef.current.cancelled = true }, [])

  const likeCount    = optimistic?.likeCount    ?? song.like_count
  const dislikeCount = optimistic?.dislikeCount ?? song.dislike_count
  const myReaction   = optimistic?.myReaction   ?? song.my_reaction

  async function handleReact(reaction) {
    if (!session) return
    const next = myReaction === reaction ? null : reaction
    const prev = { likeCount, dislikeCount, myReaction }
    setOptimistic({
      myReaction: next,
      likeCount:    next === 'like'    ? likeCount + 1    : myReaction === 'like'    ? likeCount - 1    : likeCount,
      dislikeCount: next === 'dislike' ? dislikeCount + 1 : myReaction === 'dislike' ? dislikeCount - 1 : dislikeCount,
    })
    try {
      const res = await onReact(song.id, next)
      setOptimistic({ myReaction: res.my_reaction, likeCount: res.like_count, dislikeCount: res.dislike_count })
    } catch {
      setOptimistic(prev)
    }
  }

  async function handlePlay() {
    if (isPlaying) {
      signalRef.current.cancelled = true
      onPlayToggle(null)
      return
    }
    signalRef.current = { cancelled: false }
    onPlayToggle(song.id)
    setLoadingPlay(true)
    try {
      const sections = await api.getTrendingSections(song.id)
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

  const canReact = !!session
  const reactTip = canReact ? undefined : 'Sign in to react'

  return (
    <div className={`song-row ${isPlaying ? 'song-row--playing' : ''}`}>
      <div className="song-row-index">{index + 1}</div>

      <button className="song-play-btn" onClick={handlePlay} title={isPlaying ? 'Stop' : 'Play tab'}>
        {loadingPlay ? <SpinIcon /> : isPlaying ? <StopIcon /> : <PlayIcon />}
      </button>

      <div className="song-row-avatar" style={{ background: hashColor(song.student_user_id) }}>
        {avatarInitials(song.author_name)}
      </div>

      <div className="song-row-info">
        <div className="song-row-title">{song.title}</div>
        <div className="song-row-author">{song.author_name}</div>
      </div>

      <div className="song-row-meta">
        <span className="song-row-pill">{song.sections_count} section{song.sections_count !== 1 ? 's' : ''}</span>
      </div>

      <div className="song-row-actions">
        <button
          className={`song-react-btn ${myReaction === 'like' ? 'active' : ''}`}
          onClick={() => handleReact('like')}
          disabled={!canReact}
          title={reactTip}
        >
          <ThumbUp /> {likeCount}
        </button>
        <button
          className={`song-react-btn ${myReaction === 'dislike' ? 'active' : ''}`}
          onClick={() => handleReact('dislike')}
          disabled={!canReact}
          title={reactTip}
        >
          <ThumbDown /> {dislikeCount}
        </button>
      </div>

      <div className="song-row-date">{shortDate(song.created_at)}</div>

      <button
        className="song-expand-btn"
        onClick={() => navigate(`/songs/${song.id}`)}
        title="View full tab"
      >
        <ExpandIcon />
      </button>
    </div>
  )
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  )
}
function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  )
}
function SpinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="9" strokeDasharray="28 56" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.7s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}
function ThumbUp() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  )
}
function ThumbDown() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
      <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
    </svg>
  )
}
function ExpandIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  )
}

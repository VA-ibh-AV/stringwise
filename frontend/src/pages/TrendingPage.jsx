import { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext'
import { api } from '../api'
import SongCard from '../components/SongCard'

export default function TrendingPage({ standalone = false }) {
  const { session } = useAuth()
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [playingId, setPlayingId] = useState(null)

  useEffect(() => {
    api.getTrending()
      .then(data => setSongs(data || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [session?.access_token])

  async function handleReact(id, reaction) {
    const res = await api.reactToSong(id, reaction)
    setSongs(prev => prev.map(s =>
      s.id === id
        ? { ...s, like_count: res.like_count, dislike_count: res.dislike_count, my_reaction: res.my_reaction }
        : s
    ))
    return res
  }

  const content = (
    <div className="trending-page">
      <div className="trending-header">
        <div>
          <h2 className="trending-title">Trending</h2>
          <p className="trending-sub">Public practice songs from students · click ▶ to play the tab</p>
        </div>
        {!session && (
          <a href="/" className="btn btn--primary btn--sm">Sign in to react</a>
        )}
      </div>

      {loading && (
        <div className="song-list">
          {[...Array(5)].map((_, i) => <div key={i} className="song-row song-row--skel" />)}
        </div>
      )}

      {error && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Failed to load.</p>}

      {!loading && !error && songs.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>
          No public songs yet. Be the first to share one!
        </p>
      )}

      {!loading && !error && songs.length > 0 && (
        <div className="song-list">
          {songs.map((song, i) => (
            <SongCard
              key={song.id}
              song={song}
              index={i}
              onReact={handleReact}
              session={session}
              isPlaying={playingId === song.id}
              onPlayToggle={setPlayingId}
            />
          ))}
        </div>
      )}
    </div>
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

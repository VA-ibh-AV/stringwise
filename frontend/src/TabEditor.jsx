import { useState, useEffect, useRef, useMemo } from 'react'
import { playFret, preloadAudio } from './audio'
import { api } from './api'

export const STRINGS = ['e', 'B', 'G', 'D', 'A', 'E']
export const STRING_NAMES = [
  'High E · 1st',
  'B · 2nd',
  'G · 3rd',
  'D · 4th',
  'A · 5th',
  'Low E · 6th',
]
const BEATS_PER_MEASURE = 8
const FRET_WINDOW = 8

function makeEmptyMeasure(id) {
  return {
    id,
    beats: Array.from({ length: BEATS_PER_MEASURE }, () => STRINGS.map(() => '')),
  }
}

export function makeSeedSections() {
  const v1m1 = makeEmptyMeasure(crypto.randomUUID())
  ;[
    [0, 5, '5'], [1, 5, '8'],
    [2, 4, '5'], [3, 4, '7'],
    [4, 3, '5'], [5, 3, '7'],
    [6, 2, '5'], [7, 2, '7'],
  ].forEach(([b, s, v]) => (v1m1.beats[b][s] = v))

  const v1m2 = makeEmptyMeasure(crypto.randomUUID())
  ;[
    [0, 1, '5'], [1, 1, '8'],
    [2, 0, '5'], [3, 0, '8'],
    [4, 0, '5'], [5, 1, '8'],
    [6, 1, '5'], [7, 2, '7'],
  ].forEach(([b, s, v]) => (v1m2.beats[b][s] = v))

  const c1m1 = makeEmptyMeasure(crypto.randomUUID())
  ;[
    [0, 5, '0'], [1, 4, '0'],
    [2, 3, '2'], [3, 3, '0'],
    [4, 4, '2'], [5, 4, '0'],
    [6, 5, '3'], [7, 5, '0'],
  ].forEach(([b, s, v]) => (c1m1.beats[b][s] = v))

  return [
    {
      id: crypto.randomUUID(),
      name: 'Verse 1',
      position: 5,
      tempo: 80,
      loop: true,
      verse: 'Pick slowly, alternate-picking. Anchor index on 5th fret, pinky on 8th. Listen for evenness between strings.',
      measures: [v1m1, v1m2],
    },
    {
      id: crypto.randomUUID(),
      name: 'Chorus',
      position: 0,
      tempo: 96,
      loop: false,
      verse: 'Resolve to A minor. Let the open strings ring out — no muting on this one.',
      measures: [c1m1],
    },
  ]
}

export function Section({ section, index, total, onChange, onRemove, onMove, onDirty, readOnly = false }) {
  const [sel, setSel] = useState(null)
  const [draft, setDraft] = useState('')
  const [playing, setPlaying] = useState(false)
  const [playhead, setPlayhead] = useState(-1)
  const [loopMeasureIdx, setLoopMeasureIdx] = useState(-1)
  const [stampBeat, setStampBeat] = useState({ mi: 0, bi: 0 })
  useEffect(() => { preloadAudio() }, [])

  const inputRef = useRef(null)
  const rafRef = useRef(null)
  const measuresRef = useRef(section.measures)
  const loopMeasureRef = useRef(-1)
  useEffect(() => { measuresRef.current = section.measures }, [section.measures])
  useEffect(() => { loopMeasureRef.current = loopMeasureIdx }, [loopMeasureIdx])

  const [measureAudio, setMeasureAudio] = useState(() => {
    const init = {}
    section.measures?.forEach(m => {
      if (m.audio_file) {
        init[m.id] = { src: m.audio_file.url, name: m.audio_file.name, audioFileId: m.audio_file.id }
      }
    })
    return init
  })
  const audioRef = useRef(null)
  const lastMeasureIdxRef = useRef(-1)
  const measureAudioRef = useRef({})
  useEffect(() => { measureAudioRef.current = measureAudio }, [measureAudio])
  useEffect(() => () => {
    Object.values(measureAudioRef.current).forEach(a => { if (a.blob) URL.revokeObjectURL(a.src) })
    audioRef.current?.pause()
  }, [])

  function getAudio() {
    if (!audioRef.current) audioRef.current = new Audio()
    return audioRef.current
  }

  // Fret values for the currently focused beat
  const fretSel = useMemo(() => {
    const beat = section.measures[stampBeat.mi]?.beats[stampBeat.bi]
    return beat ? [...beat] : STRINGS.map(() => '')
  }, [stampBeat, section.measures])

  // All (stringIdx, fret) pairs present anywhere in the section — for context overlay
  const sectionNotes = useMemo(() => {
    const s = new Set()
    section.measures.forEach(m =>
      m.beats.forEach(beat =>
        beat.forEach((fret, si) => { if (fret !== '') s.add(`${si}-${fret}`) })
      )
    )
    return s
  }, [section.measures])

  useEffect(() => {
    if (sel && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [sel])

  useEffect(() => {
    if (!playing) {
      setPlayhead(-1)
      lastMeasureIdxRef.current = -1
      cancelAnimationFrame(rafRef.current)
      getAudio().pause()
      return
    }
    const beatMs = (60 / section.tempo) * 500
    let start = performance.now()
    let lastBeat = -1

    const tick = (now) => {
      const measures = measuresRef.current
      const lmi = loopMeasureRef.current
      const elapsed = now - start
      let beat

      if (lmi >= 0) {
        beat = lmi * BEATS_PER_MEASURE + (Math.floor(elapsed / beatMs) % BEATS_PER_MEASURE)
      } else {
        beat = Math.floor(elapsed / beatMs)
        const totalBeats = measures.length * BEATS_PER_MEASURE
        if (beat >= totalBeats) {
          if (section.loop) { start = now; beat = 0 }
          else { setPlaying(false); setPlayhead(-1); return }
        }
      }

      if (beat !== lastBeat) {
        lastBeat = beat
        setPlayhead(beat)
        const mi = Math.floor(beat / BEATS_PER_MEASURE)
        const bi = beat % BEATS_PER_MEASURE

        // Sequential mode: switch audio track when crossing measure boundary
        if (lmi < 0 && mi !== lastMeasureIdxRef.current) {
          lastMeasureIdxRef.current = mi
          const clip = measureAudioRef.current[measures[mi]?.id]
          if (clip) {
            const a = getAudio()
            a.loop = false
            a.src = clip.src
            a.currentTime = 0
            a.play().catch(() => {})
          } else {
            getAudio().pause()
          }
        }

        // Only trigger synth for measures without a recorded audio clip
        if (!measureAudioRef.current[measures[mi]?.id]) {
          measures[mi]?.beats[bi]?.forEach((fret, si) => {
            if (fret !== '') playFret(si, parseInt(fret, 10))
          })
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [playing, section.tempo, section.loop, section.measures.length, loopMeasureIdx])

  function patch(p) {
    onChange({ ...section, ...p })
    onDirty?.()
  }

  function selectCell(mi, bi, si) {
    const cur = section.measures[mi].beats[bi][si] || ''
    setSel({ mi, bi, si })
    setDraft(cur)
    setStampBeat({ mi, bi })
  }

  function setCellValue(mi, bi, si, value) {
    const next = section.measures.map((m, _mi) => {
      if (_mi !== mi) return m
      const beats = m.beats.map((beat, _bi) => {
        if (_bi !== bi) return beat
        const strings = beat.slice()
        strings[si] = value
        return strings
      })
      return { ...m, beats }
    })
    patch({ measures: next })
  }

  function commit() {
    if (!sel) return
    let v = draft.trim()
    if (v !== '') {
      const n = parseInt(v, 10)
      if (Number.isNaN(n) || n < 0 || n > 24) {
        setSel(null); setDraft(''); return
      }
      v = String(n)
      playFret(sel.si, n)
    }
    setCellValue(sel.mi, sel.bi, sel.si, v)
    setSel(null); setDraft('')
  }

  function cancel() { setSel(null); setDraft('') }

  function onKey(e) {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      const wasSel = sel
      commit()
      if (e.key === 'Tab' && wasSel) {
        const next = nextCell(wasSel, section.measures.length, e.shiftKey)
        if (next) {
          const v = section.measures[next.mi].beats[next.bi][next.si] || ''
          setSel(next)
          setDraft(v)
          setStampBeat({ mi: next.mi, bi: next.bi })
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancel()
    }
  }

  function toggleFret(si, f) {
    const fretStr = String(f)
    const cur = fretSel[si]
    const newVal = cur === fretStr ? '' : fretStr
    if (newVal !== '') playFret(si, f)
    setCellValue(stampBeat.mi, stampBeat.bi, si, newVal)
  }

  function addMeasure() {
    patch({ measures: [...section.measures, makeEmptyMeasure(crypto.randomUUID())] })
  }
  function removeMeasure(mi) {
    if (section.measures.length <= 1) return
    patch({ measures: section.measures.filter((_, i) => i !== mi) })
  }
  function clearAll() {
    patch({ measures: section.measures.map((m) => makeEmptyMeasure(m.id)) })
  }

  function removeAudio(mid) {
    setMeasureAudio(prev => {
      const next = { ...prev }
      if (next[mid]) {
        if (next[mid].blob) URL.revokeObjectURL(next[mid].src)
        if (next[mid].audioFileId) api.deleteAudio(next[mid].audioFileId).catch(() => {})
      }
      delete next[mid]
      return next
    })
    patch({ measures: section.measures.map(m => {
      if (m.id !== mid) return m
      const { audio_file, ...rest } = m
      return rest
    })})
    onDirty?.()
  }

  function toggleMeasureLoop(mi) {
    if (playing && loopMeasureIdx === mi) {
      setPlaying(false)
      setLoopMeasureIdx(-1)
    } else {
      setLoopMeasureIdx(mi)
      const clip = measureAudio[section.measures[mi]?.id]
      if (clip) {
        const a = getAudio()
        a.loop = true
        a.src = clip.src
        a.currentTime = 0
        a.play().catch(() => {})
      }
      setPlaying(true)
    }
  }

  const totalBeats = section.measures.length * BEATS_PER_MEASURE

  return (
    <div className="section-card">
      <div className="section-head">
        <div className="section-head-left">
          {!readOnly && <span className="section-grip" title="Drag to reorder">⋮⋮</span>}
          {readOnly
            ? <span className="section-name" style={{ fontWeight: 600 }}>{section.name}</span>
            : <input
                className="section-name"
                value={section.name}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder="Section name (e.g. Verse 1)"
              />
          }
          <span className="section-meta">
            {section.measures.length} bar{section.measures.length !== 1 ? 's' : ''} · {totalBeats} beats
          </span>
        </div>
        <div className="section-head-right">
          {!readOnly && (
            <button
              className={`btn btn--sm ${section.loop ? 'btn--primary' : 'btn--outline'}`}
              onClick={() => patch({ loop: !section.loop })}
              title="Loop this section while playing"
            >
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6V4a2 2 0 0 1 2-2h7l-2-2 m2 2-2 2" />
                <path d="M14 10v2a2 2 0 0 1-2 2H5l2 2 m-2-2 2-2" />
              </svg>
              Loop
            </button>
          )}
          <button
            className={`btn btn--sm ${playing ? 'btn--saved' : 'btn--primary'}`}
            onClick={() => {
              if (playing) { setPlaying(false); setLoopMeasureIdx(-1) }
              else { setLoopMeasureIdx(-1); setPlaying(true) }
            }}
          >
            {playing ? '■ Stop' : '▶ Play'}
          </button>
          {!readOnly && <>
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => onMove(index, -1)}
              disabled={index === 0}
              title="Move up"
            >↑</button>
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => onMove(index, 1)}
              disabled={index === total - 1}
              title="Move down"
            >↓</button>
            <button
              className="btn btn--danger btn--sm"
              onClick={() => onRemove(index)}
              title="Remove section"
            >×</button>
          </>}
        </div>
      </div>

      {readOnly ? (
        <div className="section-controls">
          <div className="ctrl">
            <span className="ctrl-label">Position</span>
            <span className="ctrl-value">{section.position === 0 ? 'Open' : `${section.position}${ord(section.position)} fret`}</span>
          </div>
          <div className="ctrl">
            <span className="ctrl-label">Tempo</span>
            <span className="ctrl-value">{section.tempo} <small>bpm</small></span>
          </div>
        </div>
      ) : (
        <div className="section-controls">
          <div className="ctrl">
            <span className="ctrl-label">Position</span>
            <div className="stepper">
              <button onClick={() => patch({ position: Math.max(0, section.position - 1) })}>−</button>
              <span className="stepper-val">
                {section.position === 0 ? 'Open' : `${section.position}${ord(section.position)} fret`}
              </span>
              <button onClick={() => patch({ position: Math.min(17, section.position + 1) })}>+</button>
            </div>
          </div>
          <div className="ctrl ctrl-grow">
            <span className="ctrl-label">Tempo</span>
            <input
              type="range"
              min="40"
              max="200"
              step="1"
              value={section.tempo}
              onChange={(e) => patch({ tempo: parseInt(e.target.value, 10) })}
              className="tempo-slider"
            />
            <span className="ctrl-value">{section.tempo} <small>bpm</small></span>
          </div>
        </div>
      )}

      <FretboardPanel
        position={section.position}
        stampBeat={stampBeat}
        measures={section.measures}
        playhead={playhead}
        playing={playing}
        fretSel={fretSel}
        sectionNotes={sectionNotes}
        onSelectBeat={(mi, bi) => setStampBeat({ mi, bi })}
        onToggleFret={toggleFret}
      />

      {!readOnly && (
        <div className="tab-controls">
          <button className="btn btn--outline btn--sm" onClick={addMeasure}>+ Measure</button>
          <button className="btn btn--outline btn--sm" onClick={clearAll}>Clear</button>
          <div className="spacer" />
          <span className="tab-hint">
            Select beat above · click fretboard to toggle · or type 0–24 in cell · <kbd>↵</kbd> commit
          </span>
        </div>
      )}

      <div className="tab-scroll">
        <div className="tab-grid">
          <div className="tab-strings" aria-hidden="true">
            <div className="row-spacer" />
            {STRINGS.map((s, i) => (
              <div key={i} className="string-label">{s}</div>
            ))}
          </div>

          {section.measures.map((m, mi) => (
            <div className="measure" key={m.id}>
              <div className="measure-head">
                <div className="measure-head-row">
                  <span>M<span className="m-num">{mi + 1}</span></span>
                  <div className="m-actions">
                  <button
                    className={`m-loop-btn ${playing && loopMeasureIdx === mi ? 'm-loop-btn--active' : ''}`}
                    onClick={() => toggleMeasureLoop(mi)}
                    title={playing && loopMeasureIdx === mi ? 'Stop loop' : 'Loop this measure'}
                  >
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6V4a2 2 0 0 1 2-2h7" /><path d="M13 4l-2-2 2-2" />
                      <path d="M14 10v2a2 2 0 0 1-2 2H5" /><path d="M3 12l2 2-2 2" />
                    </svg>
                  </button>
                  {!readOnly && section.measures.length > 1 && (
                    <span className="m-remove" onClick={() => removeMeasure(mi)}>×</span>
                  )}
                  </div>
                </div>
                <MeasureAudio
                  key={m.id}
                  audio={measureAudio[m.id] || null}
                  measureId={m.id}
                  setMeasureAudio={setMeasureAudio}
                  onRemove={() => removeAudio(m.id)}
                  onUploaded={(mid, audioData) => {
                    patch({ measures: section.measures.map(me => me.id === mid ? { ...me, audio_file: audioData } : me) })
                    onDirty?.()
                  }}
                  readOnly={readOnly}
                />
              </div>
              <div className="measure-body">
                {STRINGS.map((_, si) => (
                  <div className="string-row" key={si}>
                    {m.beats.map((beat, bi) => {
                      const v = beat[si]
                      const isSel = sel && sel.mi === mi && sel.bi === bi && sel.si === si
                      const isStamp = stampBeat.mi === mi && stampBeat.bi === bi
                      const globalBeat = mi * BEATS_PER_MEASURE + bi
                      const isPlay = playing && playhead === globalBeat
                      const cls = [
                        'cell',
                        v === '' && !isSel ? 'empty' : '',
                        isSel ? 'selected' : '',
                        isStamp && !isSel ? 'stamp-col' : '',
                        bi === BEATS_PER_MEASURE - 1 ? 'last-col' : '',
                        si === STRINGS.length - 1 ? 'last-row' : '',
                        bi % 2 === 0 ? 'beat-mark' : '',
                        isPlay ? 'playhead' : '',
                      ].filter(Boolean).join(' ')
                      return (
                        <div key={bi} className={cls} onClick={readOnly ? undefined : () => selectCell(mi, bi, si)}>
                          {!readOnly && isSel ? (
                            <input
                              ref={inputRef}
                              value={draft}
                              onChange={(e) =>
                                setDraft(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))
                              }
                              onKeyDown={onKey}
                              onBlur={commit}
                              inputMode="numeric"
                            />
                          ) : v === '' ? '—' : v}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="verse-block">
        <label className="label">Verse · Lyrics or Phrase Notes</label>
        {readOnly
          ? <div className="textarea" style={{ minHeight: 40, whiteSpace: 'pre-wrap', cursor: 'default' }}>{section.verse || <span style={{ opacity: 0.4 }}>—</span>}</div>
          : <textarea
              className="textarea"
              value={section.verse}
              onChange={(e) => patch({ verse: e.target.value })}
              placeholder="Lyrics, technique notes, or what to listen for in this section…"
              style={{ minHeight: 64 }}
            />
        }
      </div>

    </div>
  )
}

function MeasureAudio({ audio, measureId, setMeasureAudio, onRemove, onUploaded, readOnly = false }) {
  const [mode, setMode] = useState('idle') // idle | menu | recording | preview | uploading
  const [recSeconds, setRecSeconds] = useState(0)
  const [uploadErr, setUploadErr] = useState('')
  const previewBlobRef = useRef(null)
  const previewURLRef = useRef(null)
  const [previewURL, _setPreviewURL] = useState(null)
  const mediaRecRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const fileInputRef = useRef(null)

  function setPreviewURL(url) { previewURLRef.current = url; _setPreviewURL(url) }

  useEffect(() => () => {
    clearInterval(timerRef.current)
    if (previewURLRef.current) URL.revokeObjectURL(previewURLRef.current)
  }, [])

  async function uploadAndAdd(blob, name) {
    const mid = measureId  // capture before any await/re-render
    setMode('uploading')
    setUploadErr('')
    const blobURL = URL.createObjectURL(blob)
    setMeasureAudio(prev => ({ ...prev, [mid]: { src: blobURL, name, blob: true } }))
    try {
      const result = await api.uploadAudio(mid, blob, name)
      setMeasureAudio(prev => ({ ...prev, [mid]: { src: result.public_url, name, audioFileId: result.audio_file_id } }))
      onUploaded?.(mid, { id: result.audio_file_id, url: result.public_url, name })
      URL.revokeObjectURL(blobURL)
    } catch (err) {
      setUploadErr('Upload failed — audio works this session only')
    }
    setMode('idle')
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const mr = new MediaRecorder(stream)
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        previewBlobRef.current = blob
        setPreviewURL(URL.createObjectURL(blob))
        setMode('preview')
        clearInterval(timerRef.current)
      }
      mr.start()
      mediaRecRef.current = mr
      setRecSeconds(0)
      timerRef.current = setInterval(() => setRecSeconds(s => s + 1), 1000)
      setMode('recording')
    } catch {
      alert('Microphone access denied.')
      setMode('idle')
    }
  }

  function stopRecording() { mediaRecRef.current?.stop(); clearInterval(timerRef.current) }

  function saveRecording() {
    const name = `rec-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.webm`
    const blob = previewBlobRef.current
    if (previewURLRef.current) URL.revokeObjectURL(previewURLRef.current)
    setPreviewURL(null)
    previewBlobRef.current = null
    uploadAndAdd(blob, name)
  }

  function discardRecording() {
    if (previewURLRef.current) URL.revokeObjectURL(previewURLRef.current)
    setPreviewURL(null)
    previewBlobRef.current = null
    setMode('idle')
  }

  function triggerUpload() { fileInputRef.current.value = ''; fileInputRef.current.click(); setMode('idle') }

  function onFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    uploadAndAdd(file, file.name)
  }

  const fmtTime = s => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`

  if (readOnly) {
    return audio ? (
      <div className="m-audio-wrap">
        <div className="m-audio-player">
          <audio controls src={audio.src} className="m-audio-el" />
        </div>
      </div>
    ) : null
  }

  return (
    <div className="m-audio-wrap">
      {uploadErr && <div className="m-audio-err">{uploadErr}</div>}
      {audio ? (
        <div className="m-audio-player">
          <audio controls src={audio.src} className="m-audio-el" />
          <button className="m-audio-remove" onClick={onRemove} title="Remove audio">×</button>
        </div>
      ) : mode === 'uploading' ? (
        <div className="m-audio-rec">
          <span className="m-rec-timer" style={{ color: 'var(--text-muted)' }}>Uploading…</span>
        </div>
      ) : mode === 'recording' ? (
        <div className="m-audio-rec">
          <span className="m-rec-dot" />
          <span className="m-rec-timer">{fmtTime(recSeconds)}</span>
          <button className="btn btn--ghost btn--xs m-rec-stop" onClick={stopRecording}>Stop</button>
        </div>
      ) : mode === 'preview' ? (
        <div className="m-audio-preview">
          <audio controls src={previewURL} className="m-audio-el" />
          <button className="btn btn--primary btn--xs" onClick={saveRecording}>Save</button>
          <button className="btn btn--ghost btn--xs" onClick={discardRecording}>Discard</button>
        </div>
      ) : mode === 'menu' ? (
        <div className="m-audio-menu">
          <button className="m-audio-menu-item" onClick={startRecording}>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="5"/></svg>
            Record
          </button>
          <button className="m-audio-menu-item" onClick={triggerUpload}>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 11V3M4 7l4-4 4 4"/><path d="M3 13h10"/></svg>
            Upload
          </button>
          <button className="m-audio-menu-cancel" onClick={() => setMode('idle')}>×</button>
        </div>
      ) : (
        <button className="m-loop-btn m-audio-add-btn" onClick={() => setMode('menu')} title="Add audio for this measure">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
            <path d="M9 2v8.17A3 3 0 1 1 7 13V5H3V2h6z"/>
          </svg>
        </button>
      )}
      <input ref={fileInputRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={onFileChange} />
    </div>
  )
}

function BeatStrip({ measures, stampBeat, playhead, playing, onSelectBeat }) {
  return (
    <div className="beat-strip">
      {measures.map((m, mi) => (
        <div className="beat-strip-measure" key={m.id}>
          <span className="beat-strip-label">M{mi + 1}</span>
          <div className="beat-strip-beats">
            {m.beats.map((beat, bi) => {
              const globalBeat = mi * BEATS_PER_MEASURE + bi
              const hasNotes = beat.some(v => v !== '')
              const isStamp = stampBeat.mi === mi && stampBeat.bi === bi
              const isPlay = playing && playhead === globalBeat
              const cls = [
                'beat-chip',
                bi % 2 === 0 ? 'beat-chip--down' : '',
                hasNotes ? 'beat-chip--has-notes' : '',
                isStamp ? 'beat-chip--stamp' : '',
                isPlay ? 'beat-chip--play' : '',
              ].filter(Boolean).join(' ')
              return (
                <button
                  key={bi}
                  className={cls}
                  onClick={() => onSelectBeat(mi, bi)}
                  title={`M${mi + 1} Beat ${bi + 1}`}
                >
                  {hasNotes && !isPlay && <span className="beat-chip-dot" />}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function FretboardPanel({ position, stampBeat, measures, playhead, playing, fretSel, sectionNotes, onSelectBeat, onToggleFret }) {
  const frets = Array.from({ length: FRET_WINDOW }, (_, i) => position + i)

  return (
    <div className="fretboard-wrap">
      <div className="fretboard-header">
        <span className="fretboard-label">Fretboard</span>
        <span className="tab-hint">
          M{stampBeat.mi + 1} · Beat {stampBeat.bi + 1} — click to toggle note
        </span>
      </div>

      <BeatStrip
        measures={measures}
        stampBeat={stampBeat}
        playhead={playhead}
        playing={playing}
        onSelectBeat={onSelectBeat}
      />

      <div className="fretboard">
        <div className="fb-frets">
          <div className="fb-string-label-spacer" />
          {frets.map((f, i) => (
            <div key={i} className={`fb-fret-num ${i === 0 ? 'first' : ''}`}>
              {f === 0 ? '○' : f}
            </div>
          ))}
        </div>
        {STRINGS.map((s, si) => (
          <div key={si} className="fb-string">
            <div className="fb-string-label">{s}</div>
            {frets.map((f, i) => {
              const fretStr = String(f)
              const isSelected = fretSel[si] === fretStr
              const isContext = !isSelected && sectionNotes.has(`${si}-${fretStr}`)
              const isMarker = [3, 5, 7, 9, 12, 15, 17, 19, 21].includes(f) && si === 2
              const isDouble12 = f === 12 && (si === 1 || si === 4)
              const cls = [
                'fb-pos',
                isSelected ? 'fb-pos--selected' : '',
                isContext ? 'fb-pos--context' : '',
              ].filter(Boolean).join(' ')
              return (
                <button
                  key={i}
                  className={cls}
                  onClick={() => onToggleFret(si, f)}
                  title={`${s} string · Fret ${f === 0 ? 'open' : f}`}
                >
                  <span className="fb-line" />
                  {(isMarker || isDouble12) && <span className="fb-dot" />}
                  <span className="fb-hit">{isSelected ? fretStr : ''}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function nextCell(sel, mCount, back) {
  let { mi, bi, si } = sel
  if (back) {
    bi -= 1
    if (bi < 0) { bi = BEATS_PER_MEASURE - 1; mi -= 1; if (mi < 0) return null }
  } else {
    bi += 1
    if (bi >= BEATS_PER_MEASURE) { bi = 0; mi += 1; if (mi >= mCount) return null }
  }
  return { mi, bi, si }
}

function ord(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}

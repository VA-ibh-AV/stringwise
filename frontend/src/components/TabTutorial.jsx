import OnboardingModal, { useOnboarding } from './OnboardingModal'

const STEPS = [
  {
    title: 'The tab grid — your canvas',
    desc: 'Each row is a guitar string. Top row = high e (thinnest), bottom = low E (thickest). Each column is a beat. A number in a cell means "play this fret on this string at this beat."',
    visual: (
      <div className="ob-vis-tab">
        <div className="ob-tab-grid ob-tab-grid--labeled">
          {[
            { s: 'e', vals: ['–','–','–','–','–','–','–','–'], thin: true },
            { s: 'B', vals: ['–','–','–','–','–','–','–','–'] },
            { s: 'G', vals: ['–','–','–','–','–','–','–','–'] },
            { s: 'D', vals: ['–','–','–','–','–','–','–','–'] },
            { s: 'A', vals: [5,'–',7,'–','–',5,'–','–'], highlight: true },
            { s: 'E', vals: ['–','–','–','–','–','–','–','–'], thick: true },
          ].map(({ s, vals, highlight, thin, thick }, i) => (
            <div key={i} className={`ob-tab-row ${highlight ? 'ob-tab-row--hl' : ''}`}>
              <span className={`ob-tab-str ${thin ? 'ob-tab-str--thin' : ''} ${thick ? 'ob-tab-str--thick' : ''}`}>{s}</span>
              {vals.map((v, j) => (
                <span key={j} className={`ob-tab-cell ${v !== '–' ? 'ob-tab-cell--filled' : ''}`}>{v}</span>
              ))}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>← high strings · low strings →</div>
      </div>
    ),
  },
  {
    title: 'Click a cell, type a fret number',
    desc: 'Click any cell to select it (it glows). Type a number 0–24 — fret 0 means open string. Press Tab or → to move to the next beat. Press Enter or ✓ to commit the note.',
    visual: (
      <div className="ob-vis-tab">
        <div className="ob-tab-grid">
          {[
            { s: 'e', vals: ['–','–','–','–','–','–','–','–'] },
            { s: 'B', vals: ['–','–','–','–','–','–','–','–'] },
            { s: 'G', vals: ['–','–','–','–','–','–','–','–'] },
            { s: 'D', vals: ['–','–',5,'–','–','–','–','–'] },
            { s: 'A', vals: ['–','–','–','–','–','–','–','–'] },
            { s: 'E', vals: ['–','–','–','–','–','–','–','–'] },
          ].map(({ s, vals }, i) => (
            <div key={i} className="ob-tab-row">
              <span className="ob-tab-str">{s}</span>
              {vals.map((v, j) => (
                <span key={j} className={`ob-tab-cell ${v !== '–' ? 'ob-tab-cell--filled' : ''} ${i === 3 && j === 3 ? 'ob-tab-cell--sel' : ''}`}>
                  {i === 3 && j === 3 ? <span className="ob-cursor">7_</span> : v}
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="ob-key-hint">
          <span className="ob-key">0–24</span> fret &nbsp;
          <span className="ob-key">Tab</span> next beat &nbsp;
          <span className="ob-key">Enter</span> commit
        </div>
      </div>
    ),
  },
  {
    title: 'Use the fretboard to place notes',
    desc: 'The fretboard above the grid shows your guitar neck. Click any dot to toggle that note on the currently selected beat. Highlighted dots show all notes in the current section.',
    visual: (
      <div className="ob-vis-fretboard">
        <div className="ob-fret-neck">
          {[5,6,7,8,9,10,11,12].map(f => (
            <div key={f} className="ob-fret-col">
              <span className="ob-fret-num">{f}</span>
              {[0,1,2,3,4,5].map(s => (
                <div key={s} className={`ob-fret-dot ${(s === 4 && f === 7) ? 'ob-fret-dot--active' : (s === 2 && f === 9) || (s === 1 && f === 5) ? 'ob-fret-dot--dim' : ''}`} />
              ))}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>Click a dot to place note on selected beat</div>
      </div>
    ),
  },
  {
    title: 'Play it back',
    desc: 'Hit ▶ Play in the section header to hear your tab. The playhead moves beat by beat. Adjust tempo with the BPM slider — slower for learning, faster as you improve. Enable Loop to repeat.',
    visual: (
      <div className="ob-vis-controls">
        <div className="ob-ctrl-row">
          <div className="ob-ctrl-group">
            <span className="ob-ctrl-label">SECTION</span>
            <span className="ob-ctrl-name">Verse 1</span>
          </div>
          <div className="ob-ctrl-group">
            <span className="ob-ctrl-label">TEMPO</span>
            <div className="ob-slider-wrap">
              <div className="ob-slider-track"><div className="ob-slider-fill" style={{ width: '40%' }}/><div className="ob-slider-thumb"/></div>
              <span className="ob-ctrl-bpm">80 bpm</span>
            </div>
          </div>
        </div>
        <div className="ob-ctrl-btns">
          <button className="ob-btn-play">▶ Play</button>
          <button className="ob-btn-loop">⟳ Loop</button>
        </div>
      </div>
    ),
  },
  {
    title: 'Sections, measures, and saving',
    desc: 'Use + Measure to add more bars to a section. Use + Add Section at the bottom to create a new part (Chorus, Bridge, etc.). Changes auto-save when you click Save — look for the dot in the top bar.',
    visual: (
      <div className="ob-vis-ui" style={{ gap: 8 }}>
        <div className="ob-ui-row ob-ui-row--highlight">
          <span className="ob-ui-pill ob-ui-pill--accent">Verse 1</span>
          <span style={{ flex: 1, fontSize: 12 }}>2 bars · 16 beats · 80 bpm</span>
        </div>
        <div className="ob-ui-row">
          <span className="ob-ui-pill">Chorus</span>
          <span style={{ flex: 1, fontSize: 12 }}>1 bar · 8 beats · 96 bpm</span>
        </div>
        <div className="ob-ui-add ob-ui-row" style={{ justifyContent: 'center' }}>+ Add Section</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 4 }}>
          Top bar shows <span style={{ color: 'var(--accent)' }}>●</span> Unsaved changes → click Save
        </div>
      </div>
    ),
  },
]

export default function TabTutorial() {
  const [show, dismiss] = useOnboarding('tour_tab_v1')
  if (!show) return null
  return <OnboardingModal steps={STEPS} onDone={dismiss} accentColor="var(--accent)" />
}

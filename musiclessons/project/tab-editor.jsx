/* global React */
const { useState: useStateTab, useEffect: useEffectTab, useRef: useRefTab } = React;

const STRINGS = ["e", "B", "G", "D", "A", "E"];
const STRING_NAMES = [
  "High E · 1st",
  "B · 2nd",
  "G · 3rd",
  "D · 4th",
  "A · 5th",
  "Low E · 6th",
];
const BEATS_PER_MEASURE = 8;
const FRET_WINDOW = 8; // starting fret + 7 more

function makeEmptyMeasure(id) {
  return {
    id,
    beats: Array.from({ length: BEATS_PER_MEASURE }, () =>
      STRINGS.map(() => "")
    ),
  };
}

// Seed three sections — each is a "box" with name, position, tempo, loop, verse, measures.
function makeSeedSections() {
  // Verse 1 — A Minor Pentatonic, position 5
  const v1m1 = makeEmptyMeasure("v1m1");
  [
    [0, 5, "5"], [1, 5, "8"],
    [2, 4, "5"], [3, 4, "7"],
    [4, 3, "5"], [5, 3, "7"],
    [6, 2, "5"], [7, 2, "7"],
  ].forEach(([b, s, v]) => (v1m1.beats[b][s] = v));

  const v1m2 = makeEmptyMeasure("v1m2");
  [
    [0, 1, "5"], [1, 1, "8"],
    [2, 0, "5"], [3, 0, "8"],
    [4, 0, "5"], [5, 1, "8"],
    [6, 1, "5"], [7, 2, "7"],
  ].forEach(([b, s, v]) => (v1m2.beats[b][s] = v));

  // Chorus — same key, open position resolution
  const c1m1 = makeEmptyMeasure("c1m1");
  [
    [0, 5, "0"], [1, 4, "0"],
    [2, 3, "2"], [3, 3, "0"],
    [4, 4, "2"], [5, 4, "0"],
    [6, 5, "3"], [7, 5, "0"],
  ].forEach(([b, s, v]) => (c1m1.beats[b][s] = v));

  return [
    {
      id: "s-verse",
      name: "Verse 1",
      position: 5,
      tempo: 80,
      loop: true,
      verse:
        "Pick slowly, alternate-picking. Anchor index on 5th fret, pinky on 8th. Listen for evenness between strings.",
      measures: [v1m1, v1m2],
    },
    {
      id: "s-chorus",
      name: "Chorus",
      position: 0,
      tempo: 96,
      loop: false,
      verse: "Resolve to A minor. Let the open strings ring out — no muting on this one.",
      measures: [c1m1],
    },
  ];
}

// ── Single section: header + fretboard helper + tab grid + verse ────────────
function Section({ section, index, total, onChange, onRemove, onMove, onDirty }) {
  const [sel, setSel] = useStateTab(null); // {mi, bi, si}
  const [draft, setDraft] = useStateTab("");
  const [playing, setPlaying] = useStateTab(false);
  const [playhead, setPlayhead] = useStateTab(0); // global beat index across measures
  const inputRef = useRefTab(null);
  const rafRef = useRefTab(null);

  useEffectTab(() => {
    if (sel && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [sel]);

  // ── playback animation (visual playhead) ──
  useEffectTab(() => {
    if (!playing) {
      setPlayhead(-1);
      cancelAnimationFrame(rafRef.current);
      return;
    }
    const totalBeats = section.measures.length * BEATS_PER_MEASURE;
    const beatMs = (60 / section.tempo) * 500; // 8 beats per measure = eighth notes
    let start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      let beat = Math.floor(elapsed / beatMs);
      if (beat >= totalBeats) {
        if (section.loop) {
          start = now;
          beat = 0;
        } else {
          setPlaying(false);
          setPlayhead(-1);
          return;
        }
      }
      setPlayhead(beat);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, section.tempo, section.loop, section.measures.length]);

  function patch(p) {
    onChange({ ...section, ...p });
    onDirty?.();
  }

  function selectCell(mi, bi, si) {
    const cur = section.measures[mi].beats[bi][si] || "";
    setSel({ mi, bi, si });
    setDraft(cur);
  }

  function setCellValue(mi, bi, si, value) {
    const next = section.measures.map((m, _mi) => {
      if (_mi !== mi) return m;
      const beats = m.beats.map((beat, _bi) => {
        if (_bi !== bi) return beat;
        const strings = beat.slice();
        strings[si] = value;
        return strings;
      });
      return { ...m, beats };
    });
    patch({ measures: next });
  }

  function commit() {
    if (!sel) return;
    let v = draft.trim();
    if (v !== "") {
      const n = parseInt(v, 10);
      if (Number.isNaN(n) || n < 0 || n > 24) {
        setSel(null); setDraft(""); return;
      }
      v = String(n);
    }
    setCellValue(sel.mi, sel.bi, sel.si, v);
    setSel(null); setDraft("");
  }

  function cancel() { setSel(null); setDraft(""); }

  function onKey(e) {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const wasSel = sel;
      commit();
      if (e.key === "Tab" && wasSel) {
        const next = nextCell(wasSel, section.measures.length, e.shiftKey);
        if (next) {
          const v = section.measures[next.mi].beats[next.bi][next.si] || "";
          setSel(next);
          setDraft(v);
        }
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  }

  function addMeasure() {
    patch({
      measures: [
        ...section.measures,
        makeEmptyMeasure("m-" + Date.now()),
      ],
    });
  }
  function removeMeasure(mi) {
    if (section.measures.length <= 1) return;
    patch({ measures: section.measures.filter((_, i) => i !== mi) });
  }
  function clearAll() {
    patch({ measures: section.measures.map((m) => makeEmptyMeasure(m.id)) });
  }

  // ── fretboard click → write fret to selected cell, advance ──
  function fretClick(stringIdx, fretAbs) {
    if (!sel) {
      // no cell selected — pick first beat
      setCellValue(0, 0, stringIdx, String(fretAbs));
      setSel({ mi: 0, bi: 1, si: stringIdx });
      setDraft("");
      return;
    }
    setCellValue(sel.mi, sel.bi, stringIdx, String(fretAbs));
    const next = nextCell(sel, section.measures.length, false);
    if (next) {
      setSel({ ...next, si: stringIdx });
      setDraft("");
    }
  }

  const totalBeats = section.measures.length * BEATS_PER_MEASURE;

  return (
    <div className="section-card">
      <div className="section-head">
        <div className="section-head-left">
          <span className="section-grip" title="Drag to reorder">⋮⋮</span>
          <input
            className="section-name"
            value={section.name}
            onChange={(e) => patch({ name: e.target.value })}
            placeholder="Section name (e.g. Verse 1)"
          />
          <span className="section-meta">
            {section.measures.length} bar{section.measures.length !== 1 ? "s" : ""} · {totalBeats} beats
          </span>
        </div>
        <div className="section-head-right">
          <button
            className={`btn btn--sm ${section.loop ? "btn--primary" : "btn--outline"}`}
            onClick={() => patch({ loop: !section.loop })}
            title="Loop this section while playing"
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 6V4a2 2 0 0 1 2-2h7l-2-2 m2 2-2 2" />
              <path d="M14 10v2a2 2 0 0 1-2 2H5l2 2 m-2-2 2-2" />
            </svg>
            Loop
          </button>
          <button
            className={`btn btn--sm ${playing ? "btn--saved" : "btn--primary"}`}
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? "■ Stop" : "▶ Play"}
          </button>
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
        </div>
      </div>

      <div className="section-controls">
        <div className="ctrl">
          <span className="ctrl-label">Position</span>
          <div className="stepper">
            <button onClick={() => patch({ position: Math.max(0, section.position - 1) })}>−</button>
            <span className="stepper-val">
              {section.position === 0 ? "Open" : `${section.position}${ord(section.position)} fret`}
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

      {/* Interactive fretboard helper */}
      <Fretboard
        position={section.position}
        selectedString={sel?.si ?? null}
        onClickFret={fretClick}
      />

      {/* Tab grid */}
      <div className="tab-controls">
        <button className="btn btn--outline btn--sm" onClick={addMeasure}>+ Measure</button>
        <button className="btn btn--outline btn--sm" onClick={clearAll}>Clear</button>
        <div className="spacer" />
        <span className="tab-hint">
          Click cell or fretboard · type 0–24 · <kbd>↵</kbd> commit
        </span>
      </div>

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
                <span>M<span className="m-num">{mi + 1}</span></span>
                {section.measures.length > 1 && (
                  <span className="m-remove" onClick={() => removeMeasure(mi)}>×</span>
                )}
              </div>
              <div className="measure-body">
                {STRINGS.map((_, si) => (
                  <div className="string-row" key={si}>
                    {m.beats.map((beat, bi) => {
                      const v = beat[si];
                      const isSel = sel && sel.mi === mi && sel.bi === bi && sel.si === si;
                      const globalBeat = mi * BEATS_PER_MEASURE + bi;
                      const isPlay = playing && playhead === globalBeat;
                      const cls = [
                        "cell",
                        v === "" && !isSel ? "empty" : "",
                        isSel ? "selected" : "",
                        bi === BEATS_PER_MEASURE - 1 ? "last-col" : "",
                        si === STRINGS.length - 1 ? "last-row" : "",
                        bi % 2 === 0 ? "beat-mark" : "",
                        isPlay ? "playhead" : "",
                      ].filter(Boolean).join(" ");
                      return (
                        <div key={bi} className={cls} onClick={() => selectCell(mi, bi, si)}>
                          {isSel ? (
                            <input
                              ref={inputRef}
                              value={draft}
                              onChange={(e) =>
                                setDraft(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))
                              }
                              onKeyDown={onKey}
                              onBlur={commit}
                              inputMode="numeric"
                            />
                          ) : v === "" ? "—" : v}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verse / lyrics */}
      <div className="verse-block">
        <label className="label">Verse · Lyrics or Phrase Notes</label>
        <textarea
          className="textarea"
          value={section.verse}
          onChange={(e) => patch({ verse: e.target.value })}
          placeholder="Lyrics, technique notes, or what to listen for in this section…"
          style={{ minHeight: 64 }}
        />
      </div>
    </div>
  );
}

// ── Fretboard helper component ──
function Fretboard({ position, selectedString, onClickFret }) {
  const frets = Array.from({ length: FRET_WINDOW }, (_, i) => position + i);
  return (
    <div className="fretboard">
      <div className="fb-frets">
        <div className="fb-string-label-spacer" />
        {frets.map((f, i) => (
          <div key={i} className={`fb-fret-num ${i === 0 ? "first" : ""}`}>
            {f === 0 ? "○" : f}
          </div>
        ))}
      </div>
      {STRINGS.map((s, si) => (
        <div key={si} className={`fb-string ${selectedString === si ? "active" : ""}`}>
          <div className="fb-string-label">{s}</div>
          {frets.map((f, i) => {
            const isMarker = [3, 5, 7, 9, 12, 15, 17, 19, 21].includes(f) && si === 2;
            const isDouble12 = f === 12 && (si === 1 || si === 4);
            return (
              <button
                key={i}
                className="fb-pos"
                onClick={() => onClickFret(si, f)}
                title={`String ${s} · Fret ${f}`}
              >
                <span className="fb-line" />
                {(isMarker || isDouble12) && <span className="fb-dot" />}
                <span className="fb-hit">{f}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function nextCell(sel, mCount, back) {
  let { mi, bi, si } = sel;
  if (back) {
    bi -= 1;
    if (bi < 0) { bi = BEATS_PER_MEASURE - 1; mi -= 1; if (mi < 0) return null; }
  } else {
    bi += 1;
    if (bi >= BEATS_PER_MEASURE) { bi = 0; mi += 1; if (mi >= mCount) return null; }
  }
  return { mi, bi, si };
}

function ord(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

window.Section = Section;
window.makeSeedSections = makeSeedSections;
window.STRING_NAMES = STRING_NAMES;
window.STRINGS_LIST = STRINGS;

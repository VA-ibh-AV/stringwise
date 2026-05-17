/* global React, ReactDOM, Sidebar, Section, makeSeedSections, STRING_NAMES, STRINGS_LIST,
   TweaksPanel, useTweaks, TweakSection, TweakColor, TweakRadio, TweakSlider, TweakSelect, TweakText */
const { useState, useEffect, useMemo } = React;

const BATCHES = [
  { id: "sat-int", name: "Saturday Intermediate", color: "#E8A020", schedule: "Sat 4–6pm" },
  { id: "wed-beg", name: "Wednesday Beginners A", color: "#5088CC", schedule: "Wed 6–7pm" },
  { id: "tue-adv", name: "Tuesday Advanced", color: "#9966BB", schedule: "Tue 8–9:30pm" },
  { id: "thu-kid", name: "Thursday Kids", color: "#44AA77", schedule: "Thu 5–6pm" },
  { id: "sun-fnp", name: "Sunday Fingerstyle", color: "#CC6040", schedule: "Sun 11am–12:30pm" },
  { id: "fri-pri", name: "Friday Private", color: "#CC5577", schedule: "Fri (varies)" },
];

const ACCENT_OPTIONS = [
  "#E8A020", // amber gold (default)
  "#CC6040", // coral
  "#44AA77", // green
  "#5088CC", // blue
];

function App() {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/ {
    "accent": "#E8A020",
    "theme": "dark",
    "density": "comfortable"
  } /*EDITMODE-END*/;

  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply theme + density + accent to <html>
  useEffect(() => {
    document.documentElement.dataset.theme = t.theme;
    document.documentElement.dataset.density = t.density;
    document.documentElement.style.setProperty("--accent", t.accent);
    document.documentElement.style.setProperty(
      "--accent-dim",
      hexA(t.accent, 0.1)
    );
    document.documentElement.style.setProperty(
      "--accent-glow",
      hexA(t.accent, 0.45)
    );
    if (t.theme === "light") {
      document.documentElement.style.setProperty("--accent-ink", "#1a1610");
    } else {
      document.documentElement.style.setProperty("--accent-ink", "#0a0a0a");
    }
  }, [t.theme, t.density, t.accent]);

  const [title, setTitle] = useState("A Minor Pentatonic — Box 1 Ascending");
  const [batchId, setBatchId] = useState("sat-int");
  const [youtubeUrl, setYoutubeUrl] = useState(
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  );
  const [notes, setNotes] = useState(
    "Goal: clean alternate-picking through Box 1.\n\n• Start at 60bpm, metronome on 1 & 3.\n• Anchor index on 5th fret; pinky on 8th fret.\n• Pay attention to the shift on the G string — same shape, different feel.\n• Once 80bpm feels relaxed, try the full descending lick in measure 3."
  );
  const [measures] = useState([]); // legacy placeholder, unused
  const [sections, setSections] = useState(makeSeedSections());
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved

  const batch = BATCHES.find((b) => b.id === batchId) || BATCHES[0];
  const ytId = useMemo(() => extractYouTubeId(youtubeUrl), [youtubeUrl]);

  function markDirty() {
    setDirty(true);
    setSaveState("idle");
  }

  function save() {
    setSaveState("saving");
    setTimeout(() => {
      setSaveState("saved");
      setDirty(false);
      setTimeout(() => setSaveState("idle"), 1500);
    }, 350);
  }

  // counts across all sections
  const totalMeasures = sections.reduce((a, s) => a + s.measures.length, 0);
  const filledNotes = sections.reduce(
    (acc, s) =>
      acc +
      s.measures.reduce(
        (a, m) => a + m.beats.reduce((aa, b) => aa + b.filter((v) => v !== "").length, 0),
        0
      ),
    0
  );

  function updateSection(idx, next) {
    setSections((prev) => prev.map((s, i) => (i === idx ? next : s)));
  }
  function removeSection(idx) {
    if (sections.length <= 1) return;
    setSections((prev) => prev.filter((_, i) => i !== idx));
    markDirty();
  }
  function moveSection(idx, dir) {
    setSections((prev) => {
      const j = idx + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = prev.slice();
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
    markDirty();
  }
  function addSection() {
    setSections((prev) => [
      ...prev,
      {
        id: "s-" + Date.now(),
        name: `Section ${prev.length + 1}`,
        position: 0,
        tempo: 80,
        loop: false,
        verse: "",
        measures: [
          {
            id: "m-" + Date.now(),
            beats: Array.from({ length: 8 }, () => ["", "", "", "", "", ""]),
          },
        ],
      },
    ]);
    markDirty();
  }

  return (
    <div className="app">
      <Sidebar active="lessons" />

      <div className="main">
        <div className="content">
          {/* status row */}
          <div className="statusbar">
            <div className="left">
              <a
                href="#"
                className="btn btn--ghost btn--sm"
                onClick={(e) => e.preventDefault()}
              >
                ← All lessons
              </a>
              <span className="crumbs">
                <span>Lessons</span>
                <span className="sep">/</span>
                <span className="here">Editor</span>
              </span>
            </div>
            <div className="right">
              <span
                className="tab-hint"
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <span className={`dirty-dot ${dirty ? "dirty" : ""}`} />
                {dirty ? "Unsaved changes" : "All changes saved"}
              </span>
            </div>
          </div>

          {/* title bar */}
          <div className="topbar">
            <input
              className="title-input"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                markDirty();
              }}
              placeholder="Lesson title"
            />
            <button
              className={`btn btn--md ${
                saveState === "saved" ? "btn--saved" : "btn--primary"
              }`}
              onClick={save}
              disabled={saveState === "saving"}
            >
              {saveState === "saved"
                ? "✓ Saved"
                : saveState === "saving"
                ? "Saving…"
                : "Save Lesson"}
            </button>
          </div>

          {/* batch + url row */}
          <div className="field-row">
            <div className="field">
              <label className="label">Batch</label>
              <select
                className="select"
                value={batchId}
                onChange={(e) => {
                  setBatchId(e.target.value);
                  markDirty();
                }}
              >
                {BATCHES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} — {b.schedule}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label">YouTube URL</label>
              <input
                className="input"
                value={youtubeUrl}
                onChange={(e) => {
                  setYoutubeUrl(e.target.value);
                  markDirty();
                }}
                placeholder="https://youtube.com/watch?v=…"
              />
            </div>
          </div>

          {/* split */}
          <div className="split">
            {/* video panel */}
            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">Lesson Video</div>
                <div className="panel-actions">
                  <span className="badge" style={badgeStyle(batch.color)}>
                    <span className="swatch" />
                    {batch.name}
                  </span>
                </div>
              </div>

              <div className="video-frame">
                {ytId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}`}
                    title="Lesson video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="video-empty">
                    <div>
                      <div className="play">
                        <svg width="20" height="20" viewBox="0 0 20 20">
                          <polygon points="6,4 16,10 6,16" fill="currentColor" />
                        </svg>
                      </div>
                      Paste a YouTube URL above
                      <div className="hint">Video will embed here</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="video-meta">
                <span>16:9 · auto-embed</span>
                <span className="dot">•</span>
                <span>{ytId ? "Source linked" : "No video yet"}</span>
                <span className="dot">•</span>
                <span>{batch.schedule}</span>
              </div>

              <div style={{ height: 6 }} />

              <div className="panel-head">
                <div className="panel-title">Lesson Notes</div>
                <div className="panel-actions">
                  <span className="tab-hint">
                    {notes.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
              </div>
              <textarea
                className="textarea"
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  markDirty();
                }}
                placeholder="Practice tips, technique notes, things to listen for…"
                style={{ minHeight: 140 }}
              />
            </div>

            {/* tab editor panel */}
            <div className="panel panel--tabs">
              <div className="panel-head">
                <div className="panel-title">Guitar Tab · Sections</div>
                <div className="panel-actions">
                  <span className="tab-hint">
                    {sections.length} section{sections.length !== 1 ? "s" : ""} ·{" "}
                    {totalMeasures} bar{totalMeasures !== 1 ? "s" : ""} ·{" "}
                    {filledNotes} note{filledNotes !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="sections-stack">
                {sections.map((s, i) => (
                  <Section
                    key={s.id}
                    section={s}
                    index={i}
                    total={sections.length}
                    onChange={(next) => { updateSection(i, next); markDirty(); }}
                    onRemove={removeSection}
                    onMove={moveSection}
                    onDirty={markDirty}
                  />
                ))}
              </div>

              <button className="btn btn--outline btn--md add-section-btn" onClick={addSection}>
                + Add Section
              </button>

              <div style={{ height: 4 }} />

              <div className="panel-head">
                <div className="panel-title">String Guide</div>
                <div className="panel-actions">
                  <span className="tab-hint">Standard tuning · EADGBe</span>
                </div>
              </div>
              <div className="string-guide">
                {STRINGS_LIST.map((s, i) => (
                  <div className="sg-item" key={i}>
                    <div className="sg-letter">{s}</div>
                    <div className="sg-name">{STRING_NAMES[i]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ height: 32 }} />
        </div>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Accent">
          <TweakColor
            label="Color"
            value={t.accent}
            options={ACCENT_OPTIONS}
            onChange={(v) => setTweak("accent", v)}
          />
        </TweakSection>
        <TweakSection label="Theme">
          <TweakRadio
            label="Mode"
            value={t.theme}
            options={[
              { value: "dark", label: "Dark" },
              { value: "light", label: "Light" },
            ]}
            onChange={(v) => setTweak("theme", v)}
          />
          <TweakRadio
            label="Density"
            value={t.density}
            options={[
              { value: "comfortable", label: "Comfy" },
              { value: "compact", label: "Compact" },
            ]}
            onChange={(v) => setTweak("density", v)}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

// ─────────── helpers ───────────
function extractYouTubeId(url) {
  if (!url) return null;
  const m =
    url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/) ||
    url.match(/^([A-Za-z0-9_-]{11})$/);
  return m ? m[1] : null;
}

function hexA(hex, a) {
  const n = hex.replace("#", "");
  const full =
    n.length === 3
      ? n
          .split("")
          .map((c) => c + c)
          .join("")
      : n;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function badgeStyle(color) {
  return {
    backgroundColor: hexA(color, 0.12),
    color: color,
    border: `1px solid ${hexA(color, 0.4)}`,
  };
}

// ─────────── mount ───────────
ReactDOM.createRoot(document.getElementById("root")).render(<App />);

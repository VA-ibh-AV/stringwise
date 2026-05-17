export default function Instruments() {
  return (
    <section className="instruments">
      <div className="inst-header reveal">
        <div className="sec-tag" style={{ justifyContent: 'center' }}>Made for music</div>
        <h2 className="sec-h2">Built for guitar.<br/><em>Tuned for teaching.</em></h2>
        <p style={{ fontSize: '16.5px', color: 'var(--t2)', lineHeight: 1.75, maxWidth: '540px', margin: '18px auto 0' }}>
          Every feature is shaped around what guitar teachers actually do in a session — not generic LMS dashboards bolted onto a music context.
        </p>
      </div>

      <div className="inst-grid">
        <div className="inst-card featured reveal">
          <div className="featured-img">
            <img
              src="https://images.unsplash.com/photo-1556449895-a33c9dba33dd?w=1200&q=85&auto=format&fit=crop"
              alt="Electric guitar in moody light"
              loading="lazy"
            />
          </div>
          <div className="featured-content">
            <div className="badge-mini">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }}></span>
              Primary instrument
            </div>
            <h3>Six strings,<br/><em>infinite lessons.</em></h3>
            <p>Write tab notation directly in the browser. Multi-section arrangement, beat-by-beat input. Loop markers and tempo, embedded YouTube references — all without leaving the lesson.</p>
            <div className="eq">
              <span></span><span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <div className="inst-card reveal">
          <div className="badge-mini">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--teal)', display: 'inline-block', boxShadow: '0 0 8px rgba(77,208,196,0.5)' }}></span>
            Tab editor
          </div>
          <h3>Written by hand,<br/>looks <em>professional.</em></h3>
          <p>No more screenshots from third-party tab sites. Build clean tablature your students will actually be able to read.</p>
          <div className="vis-small">
            <svg width="100%" height="100%" viewBox="0 0 400 140" preserveAspectRatio="none">
              <g stroke="rgba(245,230,200,0.25)" strokeWidth="0.7">
                <line x1="0" y1="20"  x2="400" y2="20"/>
                <line x1="0" y1="40"  x2="400" y2="40"/>
                <line x1="0" y1="60"  x2="400" y2="60"/>
                <line x1="0" y1="80"  x2="400" y2="80"/>
                <line x1="0" y1="100" x2="400" y2="100"/>
                <line x1="0" y1="120" x2="400" y2="120"/>
              </g>
              <g fontFamily="monospace" fontSize="13" fill="#f0a830" fontWeight="600">
                <text x="40"  y="84">3</text>
                <text x="80"  y="64">2</text>
                <text x="120" y="104">0</text>
                <text x="160" y="44">3</text>
                <text x="200" y="84">5</text>
                <text x="240" y="64">7</text>
                <text x="280" y="44">9</text>
                <text x="320" y="64">7</text>
                <text x="360" y="84">5</text>
              </g>
            </svg>
          </div>
        </div>

        <div className="inst-card reveal">
          <div className="badge-mini">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--t2)', display: 'inline-block' }}></span>
            Music-first design
          </div>
          <h3>Speaks the language of<br/><em>musicians.</em></h3>
          <p>Tempo, sections, dynamics, repeats — not just the language of project trackers. Built by a teacher, for teachers.</p>
          <div className="mf-vis">
            <div className="mf-header">
              <span className="mf-pill mf-pill--section">Verse 1</span>
              <span className="mf-pill mf-pill--bpm">♩ 80 bpm</span>
              <span className="mf-pill mf-pill--loop">⟳ Loop</span>
            </div>
            <div className="mf-strings">
              {[
                { w: 1,   notes: [{ p: 18 }, { p: 52 }] },
                { w: 1.4, notes: [{ p: 35 }, { p: 68 }] },
                { w: 1.8, notes: [{ p: 24 }] },
                { w: 2.2, notes: [{ p: 45 }, { p: 80 }] },
                { w: 2.7, notes: [{ p: 60 }] },
                { w: 3.2, notes: [{ p: 15 }, { p: 72 }] },
              ].map((s, i) => (
                <div key={i} className="mf-string">
                  <div className="mf-line" style={{ height: s.w + 'px' }} />
                  {s.notes.map((n, j) => (
                    <span key={j} className="mf-note" style={{ left: n.p + '%' }}>
                      {[5, 7, 0, 3, 5, 2][i]}
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <div className="mf-footer">
              <span className="mf-pill mf-pill--dim">Chorus</span>
              <span className="mf-pill mf-pill--dim">Bridge</span>
              <span className="mf-pill mf-pill--dim">Outro</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

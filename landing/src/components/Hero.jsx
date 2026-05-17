export default function Hero() {
  return (
    <div className="hero">
      <div className="hero-bg-mesh"></div>
      <div className="hero-grid-lines"></div>

      <svg className="float-note" style={{ left: '22%', bottom: '-50px', width: '22px', animationDuration: '16s', animationDelay: '0s' }} viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
      </svg>
      <svg className="float-note" style={{ left: '38%', bottom: '-50px', width: '16px', animationDuration: '22s', animationDelay: '4s' }} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="6" cy="18" r="3"/>
        <path d="M9 18V4l4 1v3M9 8l4 1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      </svg>
      <svg className="float-note" style={{ left: '12%', bottom: '-50px', width: '14px', animationDuration: '28s', animationDelay: '13s' }} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="6" cy="18" r="3"/>
        <path d="M9 18V4l4 1v3M9 8l4 1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      </svg>

      <div className="hero-body">
        <div className="badge">
          <div className="badge-dot"></div>
          For guitar teachers
        </div>
        <h1 className="hero-h1">
          <span className="line"><span>Teach guitar.</span></span>
          <span className="line"><span><em>Beautifully.</em></span></span>
        </h1>
        <p className="hero-sub">
          A focused studio for guitar teachers. Write tabs, plan lessons, track students — all in one distraction-free tool built around how you actually teach.
        </p>
        <div className="hero-actions">
          <a href="https://app.string-wise.com" className="btn-primary">
            Start Teaching Free
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <a href="#features" className="btn-ghost">See features</a>
          <a href="https://app.string-wise.com" className="btn-ghost" style={{ fontSize: '0.85em', opacity: 0.75 }}>Student sign in →</a>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-visual-frame">
          <img
            src="https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1400&q=85&auto=format&fit=crop"
            alt="Acoustic guitar in warm light"
            loading="eager"
          />
        </div>

        <div className="hero-chip hero-chip-1">
          <div className="chip-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6"  x2="20" y2="6"/>
              <line x1="4" y1="12" x2="20" y2="12"/>
              <line x1="4" y1="18" x2="20" y2="18"/>
            </svg>
          </div>
          <div>
            <div className="chip-title">Tab editor</div>
            <div className="chip-sub">Section 2 · Bar 8</div>
          </div>
        </div>

        <div className="hero-chip hero-chip-2">
          <div className="chip-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <div className="chip-title">Tuesday, 6:00 PM</div>
            <div className="chip-sub">Batch B · 6 students</div>
          </div>
        </div>
      </div>
    </div>
  )
}

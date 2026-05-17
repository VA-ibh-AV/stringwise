export default function CTA() {
  return (
    <div className="cta">
      <svg className="soundwave" viewBox="0 0 1200 80" preserveAspectRatio="none">
        <defs>
          <linearGradient id="waveG" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="rgba(240,168,48,0)"  />
            <stop offset="50%"  stopColor="rgba(240,168,48,0.6)"/>
            <stop offset="100%" stopColor="rgba(240,168,48,0)"  />
          </linearGradient>
        </defs>
        <path d="M 0 40 Q 75 5, 150 40 T 300 40 T 450 40 T 600 40 T 750 40 T 900 40 T 1050 40 T 1200 40"
              stroke="url(#waveG)" strokeWidth="2" fill="none">
          <animate attributeName="d"
            dur="4s" repeatCount="indefinite"
            values="
              M 0 40 Q 75 5,  150 40 T 300 40 T 450 40 T 600 40 T 750 40 T 900 40 T 1050 40 T 1200 40;
              M 0 40 Q 75 75, 150 40 T 300 40 T 450 40 T 600 40 T 750 40 T 900 40 T 1050 40 T 1200 40;
              M 0 40 Q 75 5,  150 40 T 300 40 T 450 40 T 600 40 T 750 40 T 900 40 T 1050 40 T 1200 40"/>
        </path>
      </svg>
      <div className="cta-inner reveal">
        <h2 className="cta-h2">Ready to teach <em>smarter?</em></h2>
        <p className="cta-sub">Free to use. No credit card. Sign in with Google and start in minutes.</p>
        <div className="cta-actions">
          <a href="https://app.string-wise.com" className="btn-primary-lg">
            Open Studio Free
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <a href="https://app.string-wise.com" className="cta-student-link">
            Student? Sign in here →
          </a>
        </div>
      </div>
    </div>
  )
}

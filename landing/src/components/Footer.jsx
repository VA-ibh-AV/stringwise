export default function Footer() {
  return (
    <footer>
      <div className="foot-logo">
        <div className="foot-mark">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <line x1="2" y1="4"  x2="14" y2="4"  stroke="#0a0a0a" strokeWidth="1"/>
            <line x1="2" y1="7"  x2="14" y2="7"  stroke="#0a0a0a" strokeWidth="1.4"/>
            <line x1="2" y1="10" x2="14" y2="10" stroke="#0a0a0a" strokeWidth="1.8"/>
            <line x1="2" y1="13" x2="14" y2="13" stroke="#0a0a0a" strokeWidth="2.2"/>
          </svg>
        </div>
        StringWise
      </div>
      <div className="foot-links">
        <a href="#features">Features</a>
        <a href="#how">How it works</a>
        <a href="#testimonials">Reviews</a>
        <a href="https://app.string-wise.com">Sign In</a>
      </div>
      <div className="foot-copy">© 2026 STRINGWISE — MADE FOR GUITAR TEACHERS</div>
    </footer>
  )
}

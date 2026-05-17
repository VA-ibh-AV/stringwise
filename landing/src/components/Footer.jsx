export default function Footer() {
  return (
    <footer>
      <div className="foot-top">
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
      </div>
      <div className="foot-bottom">
        <div className="foot-copy">© 2026 STRINGWISE — MADE FOR GUITAR TEACHERS</div>
        <div className="foot-contact">
          <span className="foot-by">Built by Vaibhav Bhardwaj</span>
          <a href="mailto:vaibhavbhardwaaj@gmail.com" className="foot-icon-link" title="Email">
            <IconMail />
            <span>vaibhavbhardwaaj@gmail.com</span>
          </a>
          <a href="https://www.linkedin.com/in/vaibhav-bhardwaj-a0554a1b8/" target="_blank" rel="noreferrer" className="foot-icon-link" title="LinkedIn">
            <IconLinkedIn />
            <span>LinkedIn</span>
          </a>
          <a href="https://github.com/VA-ibh-AV/stringwise" target="_blank" rel="noreferrer" className="foot-icon-link" title="GitHub">
            <IconGitHub />
            <span>GitHub</span>
          </a>
          <a href="https://x.com/goroutine_guy" target="_blank" rel="noreferrer" className="foot-icon-link" title="X / Twitter">
            <IconX />
            <span>@goroutine_guy</span>
          </a>
        </div>
      </div>
    </footer>
  )
}

function IconMail() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <polyline points="2,4 12,13 22,4"/>
    </svg>
  )
}

function IconLinkedIn() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  )
}

function IconGitHub() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  )
}

function IconX() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

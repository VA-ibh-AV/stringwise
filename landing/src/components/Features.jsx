const FEATURES = [
  {
    title: 'Tab Editor',
    desc: 'Write guitar tablature beat by beat across multiple sections. Set tempo, enable loop markers, and organize every measure clearly.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="6"  x2="20" y2="6"/>
        <line x1="4" y1="10" x2="20" y2="10"/>
        <line x1="4" y1="14" x2="20" y2="14"/>
        <line x1="4" y1="18" x2="20" y2="18"/>
        <rect x="8"  y="4" width="3" height="5" rx="1" fill="currentColor" stroke="none" opacity="0.7"/>
        <rect x="14" y="9" width="3" height="4" rx="1" fill="currentColor" stroke="none" opacity="0.55"/>
      </svg>
    ),
  },
  {
    title: 'Student Management',
    desc: 'Organise students into batches and groups. Track each student\'s history, joining date, and progress over time — all in one view.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    title: 'Lesson Planning',
    desc: 'Build structured lesson plans with rich notes, YouTube video embeds, and full tab notation — all attached to a batch and date.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/>
        <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5H6.5"/>
      </svg>
    ),
  },
  {
    title: 'Batch Scheduling',
    desc: 'Schedule recurring sessions with day and time. See this week\'s upcoming classes instantly from the dashboard without opening a calendar.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8"  y1="2" x2="8"  y2="6"/>
        <line x1="3"  y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    title: 'YouTube Integration',
    desc: 'Link reference videos directly to any lesson. They embed inline next to the tab editor — play and pause while you write or teach.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" opacity="0.25"/>
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
    ),
  },
  {
    title: 'Secure by Default',
    desc: 'Sign in with Google. Your data is protected with JWT-backed authentication and lives in your private account — no passwords stored.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-4" strokeWidth="2"/>
      </svg>
    ),
  },
]

export default function Features() {
  return (
    <section className="sec" id="features">
      <div className="reveal">
        <div className="sec-tag">What's inside</div>
        <h2 className="sec-h2">Everything your studio needs,<br/><em>nothing it doesn't.</em></h2>
        <p className="sec-sub">Purpose-built for guitar teachers. No generic project management, no spreadsheets — just the tools you actually use in a session.</p>
      </div>

      <div className="features-grid">
        {FEATURES.map((f) => (
          <div key={f.title} className="feat reveal">
            <div className="feat-icon">{f.icon}</div>
            <div className="feat-title">{f.title}</div>
            <div className="feat-desc">{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

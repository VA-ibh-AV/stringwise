const TESTIMONIALS = [
  {
    quote: "Finally a tool that understands how I actually teach. I write the tab, link the video, and all my students get everything in one place — no more scattered notes.",
    initials: 'RS',
    name: 'Rahul S.',
    role: 'Guitar teacher · 3 batches, 18 students',
  },
  {
    quote: "The tab editor is exactly what I needed. I used to screenshot images from UG and share them — now I write the tab myself and it looks professional.",
    initials: 'AK',
    name: 'Ananya K.',
    role: 'Guitar & ukulele teacher · 2 batches',
  },
]

export default function Proof() {
  return (
    <div className="proof" id="testimonials">
      <div className="proof-left reveal">
        <div className="sec-tag">Why teachers love it</div>
        <h2 className="sec-h2" style={{ maxWidth: '380px' }}>Built from real <em>teaching</em> experience.</h2>
        <p style={{ fontSize: '15.5px', color: 'var(--t2)', lineHeight: 1.75, marginTop: '18px', maxWidth: '400px' }}>
          StringWise was built by a teacher who was tired of juggling WhatsApp, Word docs, and YouTube tabs across 10 open browser tabs every class.
        </p>
      </div>
      <div className="proof-cards">
        {TESTIMONIALS.map((t) => (
          <div key={t.initials} className="proof-card reveal">
            <span className="qmark">"</span>
            <p className="proof-quote">{t.quote}</p>
            <div className="proof-author">
              <div className="proof-avatar">{t.initials}</div>
              <div>
                <div className="proof-name">{t.name}</div>
                <div className="proof-role">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

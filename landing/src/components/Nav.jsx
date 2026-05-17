import { useEffect, useRef } from 'react'

export default function Nav() {
  const navRef = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      navRef.current?.classList.toggle('scrolled', window.scrollY > 20)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav ref={navRef}>
      <div className="logo">
        <div className="logo-mark">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <line x1="2" y1="4"  x2="14" y2="4"  stroke="#0a0a0a" strokeWidth="1"/>
            <line x1="2" y1="7"  x2="14" y2="7"  stroke="#0a0a0a" strokeWidth="1.4"/>
            <line x1="2" y1="10" x2="14" y2="10" stroke="#0a0a0a" strokeWidth="1.8"/>
            <line x1="2" y1="13" x2="14" y2="13" stroke="#0a0a0a" strokeWidth="2.2"/>
          </svg>
        </div>
        <span className="logo-name">StringWise</span>
      </div>
      <div className="nav-right">
        <a href="#features"     className="nav-link">Features</a>
        <a href="#how"          className="nav-link">How it works</a>
        <a href="#testimonials" className="nav-link">Reviews</a>
        <a href="https://app.string-wise.com" className="nav-cta">
          Open Studio
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </nav>
  )
}

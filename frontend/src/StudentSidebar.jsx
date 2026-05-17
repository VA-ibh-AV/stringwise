import { Link, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', path: '/',         icon: IconHome },
  { id: 'lessons',   label: 'My Lessons', path: '/lessons',  icon: IconBook },
  { id: 'practice',  label: 'Practice',   path: '/practice', icon: IconMusic },
]

export default function StudentSidebar() {
  const { session, signOut } = useAuth()
  const location = useLocation()

  function initials(str) {
    if (!str) return '?'
    const parts = str.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return str.slice(0, 2).toUpperCase()
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="brand">
          <div className="brand-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <line x1="2" y1="4"  x2="14" y2="4"  stroke="currentColor" strokeWidth="1"   />
              <line x1="2" y1="7"  x2="14" y2="7"  stroke="currentColor" strokeWidth="1.4" />
              <line x1="2" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="1.8" />
              <line x1="2" y1="13" x2="14" y2="13" stroke="currentColor" strokeWidth="2.2" />
            </svg>
          </div>
          <span className="brand-name">StringWise</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-label">Learning</div>
          {NAV.map(({ id, label, path, icon: Icon }) => (
            <Link
              key={id}
              to={path}
              className={`nav-item ${location.pathname === path || (path !== '/' && location.pathname.startsWith(path)) ? 'active' : ''}`}
            >
              <Icon />
              <span className="nav-item-label">{label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="user-avatar">
          {initials(session?.user?.user_metadata?.full_name || session?.user?.email)}
        </div>
        <div className="user-info">
          <div className="u-name">{session?.user?.user_metadata?.full_name || session?.user?.email}</div>
          <div className="u-meta">{session?.user?.email}</div>
        </div>
        <button className="sidebar-logout" onClick={signOut} title="Sign out">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>
  )
}

function IconHome() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function IconBook() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

function IconMusic() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  )
}

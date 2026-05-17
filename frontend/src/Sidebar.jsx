import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

const PATHS = { dashboard: '/', batches: '/batches', students: '/students', lessons: '/lessons' }

export default function Sidebar({ active = 'dashboard', onNavigate }) {
  const { session, signOut } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: IconHome },
    { id: 'batches',   label: 'Batches',   icon: IconLayers },
    { id: 'students',  label: 'Students',  icon: IconUsers },
    { id: 'lessons',   label: 'Lessons',   icon: IconBook },
  ]

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed(c => !c)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {collapsed
            ? <><path d="M5 3l4 4-4 4"/></>
            : <><path d="M9 3L5 7l4 4"/></>}
        </svg>
      </button>

      <div className="brand">
        <div className="brand-mark">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <line x1="2" y1="4" x2="14" y2="4" stroke="#0a0a0a" strokeWidth="1" />
            <line x1="2" y1="7" x2="14" y2="7" stroke="#0a0a0a" strokeWidth="1.4" />
            <line x1="2" y1="10" x2="14" y2="10" stroke="#0a0a0a" strokeWidth="1.8" />
            <line x1="2" y1="13" x2="14" y2="13" stroke="#0a0a0a" strokeWidth="2.2" />
          </svg>
        </div>
        <div className="brand-text">
          <div className="brand-name">Stringwise</div>
          <div className="brand-tag">Guitar Studio</div>
        </div>
      </div>

      <div>
        <div className="nav-label">Studio</div>
        <nav className="nav">
          {items.map((it) => {
            const Icon = it.icon
            return (
              <Link
                key={it.id}
                className={`nav-item ${it.id === active ? 'active' : ''}`}
                to={PATHS[it.id]}
                title={collapsed ? it.label : ''}
                onClick={() => onNavigate?.(it.id)}
              >
                <Icon />
                <span className="nav-item-label">{it.label}</span>
              </Link>
            )
          })}
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
          <IconLogout />
        </button>
      </div>
    </aside>
  )
}

function initials(str) {
  if (!str) return '?'
  const parts = str.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return str.slice(0, 2).toUpperCase()
}

function IconLogout() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z" />
    </svg>
  )
}
function IconLayers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l9 5-9 5-9-5z" />
      <path d="M3 13l9 5 9-5" />
      <path d="M3 18l9 5 9-5" />
    </svg>
  )
}
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function IconBook() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" />
      <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5H6.5" />
    </svg>
  )
}

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

      <div className="sidebar-credit">
        <span className="credit-by">Built by Vaibhav</span>
        <div className="credit-links">
          <a href="mailto:vaibhavbhardwaaj@gmail.com" className="credit-link" title="Email"><IconCreditMail /></a>
          <a href="https://www.linkedin.com/in/vaibhav-bhardwaj-a0554a1b8/" target="_blank" rel="noreferrer" className="credit-link" title="LinkedIn"><IconCreditLinkedIn /></a>
          <a href="https://github.com/VA-ibh-AV/stringwise" target="_blank" rel="noreferrer" className="credit-link" title="GitHub"><IconCreditGitHub /></a>
          <a href="https://x.com/goroutine_guy" target="_blank" rel="noreferrer" className="credit-link" title="X / Twitter"><IconCreditX /></a>
        </div>
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

function IconCreditMail() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
}
function IconCreditLinkedIn() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
}
function IconCreditGitHub() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>
}
function IconCreditX() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
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

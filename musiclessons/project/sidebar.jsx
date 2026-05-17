/* global React */
const { useState } = React;

function Sidebar({ active = "lessons" }) {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: IconHome },
    { id: "batches", label: "Batches", icon: IconLayers },
    { id: "students", label: "Students", icon: IconUsers },
    { id: "lessons", label: "Lessons", icon: IconBook },
  ];
  return (
    <aside className="sidebar">
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
            const Icon = it.icon;
            return (
              <a
                key={it.id}
                className={`nav-item ${it.id === active ? "active" : ""}`}
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                <Icon />
                <span>{it.label}</span>
              </a>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="user-avatar">VS</div>
        <div className="user-info">
          <div className="u-name">Vaibhav S.</div>
          <div className="u-meta">14 students</div>
        </div>
      </div>
    </aside>
  );
}

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}
function IconLayers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l9 5-9 5-9-5z" />
      <path d="M3 13l9 5 9-5" />
      <path d="M3 18l9 5 9-5" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconBook() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" />
      <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5H6.5" />
    </svg>
  );
}

window.Sidebar = Sidebar;

function S({ w, h = 14, style }) {
  return <div className="shimmer" style={{ width: w, height: h, ...style }} />
}

function GuitarLoader() {
  return (
    <div className="guitar-loader">
      <div className="gl-strings">
        {[0, 1, 2, 3, 4, 5].map(i => <div key={i} className="gl-str" />)}
      </div>
      <span className="gl-label">Tuning up…</span>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <>
      <div className="skel-statusbar">
        <S w={80} h={12} />
      </div>

      <GuitarLoader />

      <div className="stat-grid">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="stat-card" style={{ '--stat-color': 'var(--border)' }}>
            <S w={56} h={32} style={{ marginBottom: 10 }} />
            <S w={90} h={12} />
          </div>
        ))}
      </div>

      <div className="dash-grid" style={{ marginTop: 24 }}>
        <div className="panel">
          <div className="panel-head">
            <S w={130} h={13} />
            <S w={60} h={11} />
          </div>
          <div className="session-list">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="session-item">
                <S w={36} h={12} />
                <S w={8} h={8} style={{ borderRadius: '50%' }} />
                <S w={100} h={12} />
                <S w={55} h={11} />
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <S w={110} h={13} />
            <S w={60} h={11} />
          </div>
          <div className="recent-list">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="recent-item" style={{ cursor: 'default' }}>
                <S w={48} h={18} style={{ borderRadius: 4, flexShrink: 0 }} />
                <S w="60%" h={12} />
                <S w={40} h={11} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: 32 }} />
    </>
  )
}

export function BatchesSkeleton() {
  return (
    <>
      <div className="skel-statusbar">
        <S w={80} h={12} />
      </div>

      <div className="skel-page-head">
        <div className="skel-row">
          <S w={70} h={20} />
          <S w={50} h={13} />
        </div>
        <S w={110} h={34} style={{ borderRadius: 6 }} />
      </div>

      <GuitarLoader />

      <div className="batch-grid">
        {[0, 1, 2].map(i => (
          <div key={i} className="batch-card" style={{ cursor: 'default' }}>
            <div className="batch-card-stripe shimmer" style={{ background: 'none' }} />
            <div className="batch-card-body">
              <div>
                <S w={120} h={16} style={{ marginBottom: 8 }} />
                <S w={90} h={12} />
              </div>
              <div className="batch-card-stats">
                {[0, 1, 2].map(j => (
                  <div key={j} className="batch-stat">
                    <S w={30} h={20} style={{ marginBottom: 4 }} />
                    <S w={50} h={11} />
                  </div>
                ))}
              </div>
            </div>
            <div className="batch-card-footer">
              <S w={60} h={28} style={{ borderRadius: 6 }} />
              <S w={60} h={28} style={{ borderRadius: 6 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 32 }} />
    </>
  )
}

export function StudentsSkeleton() {
  return (
    <>
      <div className="skel-statusbar">
        <S w={80} h={12} />
      </div>

      <div className="skel-page-head">
        <div className="skel-row">
          <S w={70} h={20} />
          <S w={60} h={13} />
        </div>
        <div className="skel-row">
          <S w={180} h={34} style={{ borderRadius: 6 }} />
          <S w={110} h={34} style={{ borderRadius: 6 }} />
        </div>
      </div>

      <GuitarLoader />

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {['Student', 'Batch', 'Level', 'Joined'].map(col => (
                <th key={col}><S w={col === 'Student' ? 60 : 45} h={12} /></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4].map(i => (
              <tr key={i}>
                <td>
                  <div className="st-name-cell">
                    <S w={32} h={32} style={{ borderRadius: '50%', flexShrink: 0 }} />
                    <S w={110} h={13} />
                  </div>
                </td>
                <td><S w={80} h={20} style={{ borderRadius: 4 }} /></td>
                <td><S w={75} h={20} style={{ borderRadius: 10 }} /></td>
                <td><S w={55} h={12} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ height: 32 }} />
    </>
  )
}

export function LessonsSkeleton() {
  return (
    <>
      <div className="skel-statusbar">
        <S w={80} h={12} />
      </div>

      <div className="skel-page-head">
        <div className="skel-row">
          <S w={65} h={20} />
          <S w={40} h={13} />
        </div>
        <div className="skel-row">
          <S w={180} h={34} style={{ borderRadius: 6 }} />
          <S w={120} h={34} style={{ borderRadius: 6 }} />
        </div>
      </div>

      <GuitarLoader />

      <div className="lesson-list">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="lesson-card" style={{ cursor: 'default' }}>
            <div className="lesson-card-color shimmer" style={{ background: 'none' }} />
            <div className="lesson-card-body">
              <S w="55%" h={14} style={{ marginBottom: 8 }} />
              <S w={120} h={11} />
            </div>
            <div className="lesson-card-right" style={{ gap: 10 }}>
              <S w={70} h={20} style={{ borderRadius: 4 }} />
              <S w={36} h={11} />
              <S w={70} h={28} style={{ borderRadius: 6 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 32 }} />
    </>
  )
}

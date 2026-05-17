export default function Stats() {
  return (
    <div className="stats">
      <div className="stat reveal">
        <div className="stat-num" data-count="6">0</div>
        <div className="stat-label">Dedicated features<br/>built for teachers</div>
      </div>
      <div className="stat reveal">
        <div className="stat-num">∞</div>
        <div className="stat-label">Lessons you can<br/>create and save</div>
      </div>
      <div className="stat reveal">
        <div className="stat-num" data-count="1">0</div>
        <div className="stat-label">Focused tool —<br/>zero bloat</div>
      </div>
      <div className="stat reveal">
        <div className="stat-num" data-count="0">0</div>
        <div className="stat-label">Spreadsheets you'll<br/>ever need again</div>
      </div>
    </div>
  )
}

const STEPS = [
  {
    num: '01',
    title: 'Set up your studio',
    desc: 'Sign in with Google and create your first batch. Add students, set your weekly schedule — takes under two minutes from zero.',
    dot: true,
  },
  {
    num: '02',
    title: 'Build your lessons',
    desc: 'Create a lesson for any batch. Link a YouTube reference video, write practice notes, and build the tab section by section in the editor.',
    dot: true,
  },
  {
    num: '03',
    title: 'Teach & track',
    desc: 'Open any lesson during class. Your tabs, video, and notes are all in one focused view. Every lesson saves to your library permanently.',
    dot: false,
  },
]

export default function How() {
  return (
    <div className="how" id="how">
      <div className="how-header reveal">
        <div className="sec-tag">How it works</div>
        <h2 className="sec-h2">Up and running in<br/><em>three steps.</em></h2>
      </div>
      <div className="steps">
        {STEPS.map((s) => (
          <div key={s.num} className="step reveal">
            <div className="step-num">{s.num}</div>
            <div className="step-title">{s.title}</div>
            <div className="step-desc">{s.desc}</div>
            {s.dot && <div className="step-dot"></div>}
          </div>
        ))}
      </div>
    </div>
  )
}

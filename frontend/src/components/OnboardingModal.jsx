import { useState, useEffect } from 'react'

export function useOnboarding(key) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!localStorage.getItem(key)) setShow(true)
  }, [key])
  function dismiss() {
    localStorage.setItem(key, '1')
    setShow(false)
  }
  return [show, dismiss]
}

export default function OnboardingModal({ steps, onDone, accentColor = 'var(--accent)' }) {
  const [step, setStep] = useState(0)
  const total = steps.length
  const current = steps[step]

  function next() {
    if (step < total - 1) setStep(s => s + 1)
    else onDone()
  }
  function prev() { if (step > 0) setStep(s => s - 1) }

  return (
    <div className="ob-backdrop" onClick={e => { if (e.target === e.currentTarget) onDone() }}>
      <div className="ob-modal">
        <button className="ob-close" onClick={onDone} title="Skip tour">×</button>

        <div className="ob-visual">{current.visual}</div>

        <div className="ob-body">
          <div className="ob-step-badge" style={{ background: accentColor }}>
            {step + 1} / {total}
          </div>
          <h3 className="ob-title">{current.title}</h3>
          <p className="ob-desc">{current.desc}</p>
        </div>

        <div className="ob-footer">
          <div className="ob-dots">
            {steps.map((_, i) => (
              <button
                key={i}
                className={`ob-dot ${i === step ? 'ob-dot--active' : ''}`}
                onClick={() => setStep(i)}
                style={i === step ? { background: accentColor } : {}}
              />
            ))}
          </div>
          <div className="ob-nav">
            {step > 0 && (
              <button className="ob-btn ob-btn--ghost" onClick={prev}>← Back</button>
            )}
            <button className="ob-btn ob-btn--primary" onClick={next} style={{ background: accentColor }}>
              {step === total - 1 ? "Let's go →" : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

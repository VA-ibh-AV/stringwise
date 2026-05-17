import { useEffect } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Stats from './components/Stats'
import Instruments from './components/Instruments'
import Features from './components/Features'
import How from './components/How'
import Proof from './components/Proof'
import CTA from './components/CTA'
import Footer from './components/Footer'

export default function App() {
  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const parent = e.target.parentElement
          const siblings = Array.from(parent.children).filter(c => c.classList.contains('reveal'))
          const sibIdx = siblings.indexOf(e.target)
          e.target.style.transitionDelay = `${Math.max(0, sibIdx) * 80}ms`
          e.target.classList.add('in')
          io.unobserve(e.target)
        }
      })
    }, { threshold: 0.12 })
    revealEls.forEach(el => io.observe(el))

    const counters = document.querySelectorAll('[data-count]')
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target
          const target = parseInt(el.dataset.count, 10)
          const duration = 1100
          const start = performance.now()
          const tick = (now) => {
            const t = Math.min(1, (now - start) / duration)
            const eased = 1 - Math.pow(1 - t, 3)
            el.textContent = Math.round(target * eased)
            if (t < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
          cio.unobserve(el)
        }
      })
    }, { threshold: 0.5 })
    counters.forEach(c => cio.observe(c))

    return () => {
      io.disconnect()
      cio.disconnect()
    }
  }, [])

  return (
    <>
      <Nav />
      <Hero />
      <Marquee />
      <Stats />
      <Instruments />
      <Features />
      <How />
      <Proof />
      <CTA />
      <Footer />
    </>
  )
}

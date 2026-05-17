export function hexA(hex, a) {
  const n = hex.replace('#', '')
  const full = n.length === 3 ? n.split('').map((c) => c + c).join('') : n
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

export function badgeStyle(color) {
  return {
    backgroundColor: hexA(color, 0.12),
    color,
    border: `1px solid ${hexA(color, 0.4)}`,
  }
}

// "2024-03-15T..." → "Mar 2024"
export function fmtMonthYear(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

// "2024-05-09T..." → "May 9"
export function fmtDay(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

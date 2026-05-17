const ITEMS = ['Acoustic','Electric','Fingerstyle','Blues','Rock','Classical','Jazz','Folk','Country','Metal','Indie','Funk']

function MarqueeRow() {
  return (
    <div className="marquee-item">
      {ITEMS.map((item, i) => (
        <span key={i}>{item}<span className="sep"></span></span>
      ))}
    </div>
  )
}

export default function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        <MarqueeRow />
        <MarqueeRow />
      </div>
    </div>
  )
}

export default function NavRail({ sectionId, onChange, onCloseMobile }) {
  return <aside className="nav-rail" aria-label="Choose technology">
    <div className="nav-logo">
      <img src="/images/Logo.png" alt="Code-Helper Logo" />
    </div>
    <div className="rail-divider" />
    <div className="rail-items">
      <button className={`rail-button js-rail ${sectionId === 'javascript' ? 'selected' : ''}`} onClick={() => onChange('javascript')} aria-label="JavaScript notes" aria-pressed={sectionId === 'javascript'}>
        <img src="/images/javascript.png" alt="" /><span className="rail-tooltip">JavaScript</span>
      </button>
      <button className={`rail-button react-rail ${sectionId === 'react' ? 'selected' : ''}`} onClick={() => onChange('react')} aria-label="React notes" aria-pressed={sectionId === 'react'}>
        <img src="/images/react.png" alt="" /><span className="rail-tooltip">React</span>
      </button>
    </div>
  </aside>;
}

import { Search, X, Trash2, Edit3 } from 'lucide-react';
import SearchResults from './SearchResults.jsx';
import { useState, useRef, useEffect } from 'react';

export default function Sidebar({ section, sectionId, topic, onSelect, query, setQuery, results, mobileOpen, closeMobile, onDeleteTopic, onRenameTopic, canEdit }) {
  const [contextMenu, setContextMenu] = useState(null);
  const contextMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleContextMenu = (event, item) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, topic: item });
  };

  const handleDelete = () => {
    if (contextMenu) {
      onDeleteTopic(contextMenu.topic);
      setContextMenu(null);
    }
  };

  const handleRename = () => {
    if (contextMenu) {
      onRenameTopic(contextMenu.topic);
      setContextMenu(null);
    }
  };

  return <>
    {mobileOpen && <button className="mobile-scrim sidebar-open" aria-label="Close navigation" onClick={closeMobile} />}
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-top"><div className="sidebar-section-label"><span>{section.name}</span><span className="topic-count">{section.topics.length} TOPICS</span></div><button className="mobile-close" onClick={closeMobile} aria-label="Close menu"><X size={17} /></button></div>
      <nav className="topic-list" aria-label={`${section.name} topics`}>
        {section.topics.map((item, index) => <button className={`topic-button ${topic === item ? 'active' : ''}`} key={item} onClick={() => onSelect(item)} onContextMenu={canEdit ? (event) => handleContextMenu(event, item) : undefined} aria-current={topic === item ? 'page' : undefined}>
          <span className="topic-number">{String(index + 1).padStart(2, '0')}</span><span className="topic-name">{item}</span>{topic === item && <span className="active-dot" />}
        </button>)}
      </nav>
      <div className="sidebar-search">
        {query ? <button className="search-icon clear-search" aria-label="Clear search" onClick={() => setQuery('')}><X size={15} /></button> : <Search size={15} className="search-icon" />}
        <input aria-label="Search documentation" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your notes…" />
        <kbd>⌘ K</kbd>
      </div>
      {query && <SearchResults query={query} results={results} onSelect={onSelect} />}
      {contextMenu && <div ref={contextMenuRef} className="context-menu" style={{ position: 'fixed', left: contextMenu.x, top: contextMenu.y, zIndex: 100 }}>
        <button type="button" onClick={handleRename}><Edit3 size={14} /> Rename</button>
        <button type="button" onClick={handleDelete}><Trash2 size={14} /> Delete</button>
      </div>}
    </aside>
  </>;
}

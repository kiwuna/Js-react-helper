import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronRight, Menu, PanelLeftClose, Plus, Pencil } from 'lucide-react';
import { docs, getDoc, sections } from './data/docs.js';
import NavRail from './components/NavRail.jsx';
import Sidebar from './components/Sidebar.jsx';
import DocPage from './components/DocPage.jsx';
import NoteEditor from './components/NoteEditor.jsx';

function readLocation() {
  const params = new URLSearchParams(window.location.search);
  const candidateSection = params.get('section');
  const sectionId = sections[candidateSection] ? candidateSection : 'javascript';
  const candidateTopic = params.get('topic');
  const topic = sections[sectionId].topics.includes(candidateTopic) ? candidateTopic : 'Introduction';
  return { sectionId, topic };
}

function App() {
  const [route, setRoute] = useState(readLocation);
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sessionDocs, setSessionDocs] = useState({});
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    const handlePopState = () => setRoute(readLocation());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((sectionId, topic, push = true) => {
    setRoute({ sectionId, topic });
    const next = `?section=${encodeURIComponent(sectionId)}&topic=${encodeURIComponent(topic)}`;
    if (push) window.history.pushState({ sectionId, topic }, '', next);
    setQuery('');
    setMobileOpen(false);
  }, []);

  const selectTopic = useCallback((selection) => {
    if (typeof selection === 'string') navigate(route.sectionId, selection);
    else navigate(selection.sectionId, selection.topic);
  }, [navigate, route.sectionId]);

  const allTopics = useMemo(() => Object.entries(sections).flatMap(([sectionId, section]) => section.topics.map((topic) => ({ sectionId, sectionName: section.name, topic, doc: sessionDocs[`${sectionId}:${topic}`] ?? getDoc(sectionId, topic) }))), [sessionDocs]);
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return allTopics.filter(({ topic, sectionName, doc }) => `${topic} ${sectionName} ${doc?.subtitle ?? ''} ${doc?.lead ?? ''} ${doc?.sections?.map((part) => `${part.heading} ${part.paragraphs?.join(' ')} ${part.bullets?.join(' ')}`).join(' ') ?? ''}`.toLowerCase().includes(normalized)).slice(0, 16);
  }, [allTopics, query]);

  useEffect(() => {
    const handleKeys = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        document.querySelector('.sidebar-search input')?.focus();
      }
      if (event.key === 'Escape') { setQuery(''); setMobileOpen(false); document.activeElement?.blur(); }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, []);

  const section = sections[route.sectionId];
  const doc = sessionDocs[`${route.sectionId}:${route.topic}`] ?? docs[route.sectionId]?.[route.topic] ?? null;
  const saveNote = (title, updatedDoc) => {
    const oldTitle = editor.topic;
    const nextTopics = sections[route.sectionId].topics;
    const renamed = !editor.isNew && title !== oldTitle;
    const topic = renamed && !nextTopics.includes(title) ? title : oldTitle;
    if (editor.isNew && !nextTopics.includes(title)) sections[route.sectionId].topics.push(title);
    else if (renamed && !nextTopics.includes(title)) sections[route.sectionId].topics[nextTopics.indexOf(oldTitle)] = title;
    const key = `${route.sectionId}:${topic}`;
    setSessionDocs((current) => ({ ...current, [key]: updatedDoc }));
    setEditor(null);
    navigate(route.sectionId, topic);
  };

  const handleDeleteTopic = (topicToDelete) => {
    const topicIndex = sections[route.sectionId].topics.indexOf(topicToDelete);
    if (topicIndex === -1) return;
    sections[route.sectionId].topics.splice(topicIndex, 1);
    const key = `${route.sectionId}:${topicToDelete}`;
    setSessionDocs((current) => {
      const updated = { ...current };
      delete updated[key];
      return updated;
    });
    if (route.topic === topicToDelete) {
      const nextTopic = sections[route.sectionId].topics[0] || 'Introduction';
      navigate(route.sectionId, nextTopic);
    }
  };

  const handleRenameTopic = (topicToRename) => {
    const newTitle = prompt('Enter new name:', topicToRename);
    if (newTitle && newTitle.trim() && newTitle !== topicToRename) {
      const topicIndex = sections[route.sectionId].topics.indexOf(topicToRename);
      if (topicIndex !== -1) {
        sections[route.sectionId].topics[topicIndex] = newTitle.trim();
        const oldKey = `${route.sectionId}:${topicToRename}`;
        const newKey = `${route.sectionId}:${newTitle.trim()}`;
        setSessionDocs((current) => {
          const updated = { ...current };
          if (current[oldKey]) {
            updated[newKey] = current[oldKey];
            delete updated[oldKey];
          }
          return updated;
        });
        if (route.topic === topicToRename) {
          navigate(route.sectionId, newTitle.trim());
        }
      }
    }
  };

  return <div className="app-shell">
    <NavRail sectionId={route.sectionId} onChange={(nextSection) => navigate(nextSection, 'Introduction')} onCloseMobile={() => { if (window.innerWidth <= 700) setMobileOpen(false); else navigate('javascript', 'Introduction'); }} />
    <div className={`sidebar-wrap ${sidebarCollapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'sidebar-open' : ''}`}>
      <Sidebar section={section} sectionId={route.sectionId} topic={route.topic} onSelect={selectTopic} query={query} setQuery={setQuery} results={results} mobileOpen={mobileOpen} closeMobile={() => setMobileOpen(false)} onDeleteTopic={handleDeleteTopic} onRenameTopic={handleRenameTopic} />
      {!sidebarCollapsed && <button className="collapse-toggle" onClick={() => setSidebarCollapsed(true)} aria-label="Collapse topic sidebar"><PanelLeftClose size={14} /></button>}
      {sidebarCollapsed && <button className="expand-toggle" onClick={() => setSidebarCollapsed(false)} aria-label="Expand topic sidebar"><ChevronRight size={17} /><span>Topics</span></button>}
    </div>
    <main className="main-panel">
      <header className="topbar"><div className="topbar-brand"></div><div className="topbar-right"><button className="menu-button" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={19} /></button><span className="profile-mark">B</span></div></header>
      <div className="reading-scroll"><div className="reading-column" key={`${route.sectionId}-${route.topic}`}>
        {!editor && <><div className="page-breadcrumb"><span className="breadcrumb-section">{section.name}</span><ChevronRight size={12} /><span>{route.topic}</span></div><div className="page-actions"><span className="session-badge">SESSION NOTE</span><div><button type="button" className="page-action secondary" onClick={() => setEditor({ isNew: false, topic: route.topic })}><Pencil size={13} /> Edit</button><button type="button" className="page-action primary" onClick={() => setEditor({ isNew: true, topic: '' })}><Plus size={14} /> Add new</button></div></div><DocPage section={section} topic={route.topic} doc={doc} onSelect={(related) => { if (section.topics.includes(related)) navigate(route.sectionId, related); }} /></>}
        {editor && <NoteEditor key={`${editor.isNew}-${editor.topic}`} initialTitle={editor.topic} initialDoc={editor.isNew ? null : doc} section={section} onSave={saveNote} onCancel={() => setEditor(null)} />}
      </div></div>
    </main>
  </div>;
}

export default App;

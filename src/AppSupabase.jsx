import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronRight, Menu, PanelLeftClose, Plus, Pencil } from 'lucide-react';
import { createTopic, deleteTopic, fetchDocumentation, fetchEditorPermission, updateTopic } from './lib/docsApi.js';
import { isSupabaseConfigured } from './lib/supabase.js';
import { supabase } from './lib/supabase.js';
import NavRail from './components/NavRail.jsx';
import Sidebar from './components/Sidebar.jsx';
import DocPage from './components/DocPage.jsx';
import NoteEditor from './components/NoteEditor.jsx';
import AuthMenu from './components/AuthMenu.jsx';
import EditPasswordDialog from './components/EditPasswordDialog.jsx';

function readLocation(sections) {
  const params = new URLSearchParams(window.location.search);
  const sectionId = sections.some((section) => section.id === params.get('section')) ? params.get('section') : sections[0]?.id;
  const section = sections.find((item) => item.id === sectionId);
  const topic = section?.topics.some((item) => item.title === params.get('topic')) ? params.get('topic') : section?.topics[0]?.title;
  return { sectionId, topic };
}

export default function AppSupabase() {
  const [sections, setSections] = useState([]);
  const [route, setRoute] = useState({ sectionId: null, topic: null });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editor, setEditor] = useState(null);
  const [user, setUser] = useState(null);
  const [isEditor, setIsEditor] = useState(false);
  const [editUntil, setEditUntil] = useState(0);
  const [passwordPrompt, setPasswordPrompt] = useState(false);

  const loadDocumentation = useCallback(async () => {
    setLoading(true); setLoadError('');
    try {
      const data = await fetchDocumentation();
      setSections(data);
      setRoute((current) => current.sectionId ? current : readLocation(data));
    } catch (error) { setLoadError(error.message || 'Unable to load documentation.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadDocumentation(); }, [loadDocumentation]);
  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!user) { setIsEditor(false); setEditUntil(0); return; }
    fetchEditorPermission().then(setIsEditor).catch(() => setIsEditor(false));
  }, [user]);
  useEffect(() => {
    if (!editUntil) return undefined;
    const timer = window.setTimeout(() => setEditUntil(0), Math.max(editUntil - Date.now(), 0));
    return () => window.clearTimeout(timer);
  }, [editUntil]);
  useEffect(() => {
    const handlePopState = () => setRoute(readLocation(sections));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [sections]);

  const navigate = useCallback((sectionId, topic, push = true) => {
    setRoute({ sectionId, topic });
    if (push) window.history.pushState({ sectionId, topic }, '', `?section=${encodeURIComponent(sectionId)}&topic=${encodeURIComponent(topic)}`);
    setQuery(''); setMobileOpen(false);
  }, []);
  const selectTopic = useCallback((selection) => typeof selection === 'string' ? navigate(route.sectionId, selection) : navigate(selection.sectionId, selection.topic), [navigate, route.sectionId]);
  const section = sections.find((item) => item.id === route.sectionId);
  const currentTopic = section?.topics.find((item) => item.title === route.topic);
  const doc = currentTopic?.doc ?? null;
  const allTopics = useMemo(() => sections.flatMap((item) => item.topics.map((topic) => ({ sectionId: item.id, sectionName: item.name, topic: topic.title, doc: topic.doc }))), [sections]);
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return allTopics.filter(({ topic, sectionName, doc }) => `${topic} ${sectionName} ${doc?.subtitle ?? ''} ${doc?.lead ?? ''} ${doc?.sections?.map((part) => `${part.heading} ${part.paragraphs?.join(' ')} ${part.bullets?.join(' ')}`).join(' ') ?? ''}`.toLowerCase().includes(normalized)).slice(0, 16);
  }, [allTopics, query]);

  useEffect(() => {
    const handleKeys = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); document.querySelector('.sidebar-search input')?.focus(); }
      if (event.key === 'Escape') { setQuery(''); setMobileOpen(false); document.activeElement?.blur(); }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, []);

  const saveNote = async (title, updatedDoc) => {
    if (!isEditor || Date.now() >= editUntil) throw new Error('Unlock editing with your password before saving documentation.');
    if (!section) return;
    const existing = editor.isNew ? null : currentTopic;
    if (editor.isNew && section.topics.some((topic) => topic.title === title)) throw new Error('A topic with this title already exists in this section.');
    const saved = existing ? (await updateTopic(existing.id, title, updatedDoc), { ...existing, title, doc: updatedDoc }) : await createTopic(section.id, title, updatedDoc, section.topics.length);
    setSections((current) => current.map((item) => item.id !== section.id ? item : { ...item, topics: existing ? item.topics.map((topic) => topic.id === existing.id ? saved : topic) : [...item.topics, saved] }));
    setEditor(null); navigate(section.id, title);
  };
  const handleDeleteTopic = async (title) => {
    if (!isEditor || Date.now() >= editUntil) return;
    const topic = section?.topics.find((item) => item.title === title);
    if (!topic || !window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    try {
      await deleteTopic(topic.id);
      const remaining = section.topics.filter((item) => item.id !== topic.id);
      setSections((current) => current.map((item) => item.id === section.id ? { ...item, topics: remaining } : item));
      if (route.topic === title) navigate(section.id, remaining[0]?.title ?? '');
    } catch (error) { setLoadError(error.message || 'Unable to delete the topic.'); }
  };
  const handleRenameTopic = async (oldTitle) => {
    if (!isEditor || Date.now() >= editUntil) return;
    const title = prompt('Enter new name:', oldTitle)?.trim();
    const topic = section?.topics.find((item) => item.title === oldTitle);
    if (!title || title === oldTitle || !topic) return;
    if (section.topics.some((item) => item.title === title)) { setLoadError('A topic with this title already exists in this section.'); return; }
    try {
      await updateTopic(topic.id, title, topic.doc ?? { subtitle: '', lead: '', sections: [], sources: [] });
      setSections((current) => current.map((item) => item.id !== section.id ? item : { ...item, topics: item.topics.map((item) => item.id === topic.id ? { ...item, title } : item) }));
      if (route.topic === oldTitle) navigate(section.id, title);
    } catch (error) { setLoadError(error.message || 'Unable to rename the topic.'); }
  };

  if (loading) return <div className="app-status">Loading your documentation…</div>;
  if (!isSupabaseConfigured || loadError) return <div className="app-status"><strong>{!isSupabaseConfigured ? 'Supabase needs configuration.' : 'Documentation could not load.'}</strong><p>{!isSupabaseConfigured ? 'Copy .env.example to .env and add your Supabase URL and publishable key.' : loadError}</p>{isSupabaseConfigured && <button onClick={loadDocumentation}>Try again</button>}</div>;
  if (!sections.length) return <div className="app-status"><strong>No documentation sections yet.</strong><p>Run the supplied SQL schema, including its seed data, in the Supabase SQL Editor.</p></div>;
  const sidebarSection = { ...section, topics: section?.topics.map((topic) => topic.title) ?? [] };
  const editUnlocked = isEditor && Date.now() < editUntil;
  const requestEditAccess = (isNew) => {
    if (!isEditor) return;
    if (editUnlocked) setEditor({ isNew });
    else setPasswordPrompt(isNew ? 'new' : 'edit');
  };
  return <div className="app-shell">
    <NavRail sectionId={route.sectionId} onChange={(id) => { const next = sections.find((item) => item.id === id); if (next?.topics[0]) navigate(id, next.topics[0].title); }} onCloseMobile={() => setMobileOpen(false)} />
    <div className={`sidebar-wrap ${sidebarCollapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'sidebar-open' : ''}`}><Sidebar section={sidebarSection} sectionId={route.sectionId} topic={route.topic} onSelect={selectTopic} query={query} setQuery={setQuery} results={results} mobileOpen={mobileOpen} closeMobile={() => setMobileOpen(false)} onDeleteTopic={handleDeleteTopic} onRenameTopic={handleRenameTopic} canEdit={editUnlocked} />
      {!sidebarCollapsed && <button className="collapse-toggle" onClick={() => setSidebarCollapsed(true)} aria-label="Collapse topic sidebar"><PanelLeftClose size={14} /></button>}{sidebarCollapsed && <button className="expand-toggle" onClick={() => setSidebarCollapsed(false)} aria-label="Expand topic sidebar"><ChevronRight size={17} /><span>Topics</span></button>}</div>
    <main className="main-panel"><header className="topbar"><div className="topbar-brand" /><div className="topbar-right"><button className="menu-button" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={19} /></button><AuthMenu user={user} onUserChange={setUser} /></div></header><div className="reading-scroll"><div className="reading-column" key={`${route.sectionId}-${route.topic}`}>
      {!editor && <><div className="page-breadcrumb"><span className="breadcrumb-section">{section.name}</span><ChevronRight size={12} /><span>{route.topic}</span></div><div className="page-actions"><span className="session-badge">{editUnlocked ? 'EDITING UNLOCKED' : isEditor ? 'EDITING LOCKED' : 'READ ONLY'}</span>{isEditor && <div><button type="button" className="page-action secondary" onClick={() => requestEditAccess(false)} disabled={!currentTopic}><Pencil size={13} /> Edit</button><button type="button" className="page-action primary" onClick={() => requestEditAccess(true)}><Plus size={14} /> Add new</button></div>}</div><DocPage section={section} topic={route.topic} doc={doc} onSelect={(related) => { if (section.topics.some((item) => item.title === related)) navigate(section.id, related); }} /></>}
      {editor && <NoteEditor initialTitle={editor.isNew ? '' : route.topic} initialDoc={editor.isNew ? null : doc} section={section} onSave={saveNote} onCancel={() => setEditor(null)} />}
    </div></div></main>{passwordPrompt && <EditPasswordDialog user={user} onCancel={() => setPasswordPrompt(false)} onVerified={() => { const requested = passwordPrompt; setEditUntil(Date.now() + 10 * 60 * 1000); setPasswordPrompt(false); setEditor({ isNew: requested === 'new' }); }} />}
  </div>;
}

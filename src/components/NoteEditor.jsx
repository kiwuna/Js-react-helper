import { useState } from 'react';
import { Code2, Lightbulb, Link2, Plus, Trash2, X } from 'lucide-react';

const blankSection = () => ({ heading: '', text: '', code: '', language: 'javascript', tip: '' });

export default function NoteEditor({ initialTitle, initialDoc, section, onSave, onCancel }) {
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialDoc?.subtitle ?? '');
  const [lead, setLead] = useState(initialDoc?.lead ?? '');
  const [sections, setSections] = useState(() => initialDoc?.sections?.length
    ? initialDoc.sections.map((part) => ({ heading: part.heading ?? '', text: part.paragraphs?.join('\n\n') ?? '', code: part.code ?? '', language: part.language ?? 'javascript', tip: part.callout ?? '' }))
    : [blankSection()]);
  const [sources, setSources] = useState(initialDoc?.sources?.length ? initialDoc.sources : []);
  const [sourceDraft, setSourceDraft] = useState('');
  const [focusedCodeIndex, setFocusedCodeIndex] = useState(null);
  const [focusedTipIndex, setFocusedTipIndex] = useState(null);
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const updateSection = (index, key, value) => {
    setSections((current) => current.map((item, i) => {
      if (i === index) {
        const updated = { ...item, [key]: value };
        // Auto-delete code block when code is cleared
        if (key === 'code' && value.trim() === '') {
          updated.code = '';
        }
        // Auto-delete tip when tip is cleared
        if (key === 'tip' && value.trim() === '') {
          updated.tip = '';
        }
        return updated;
      }
      return item;
    }));
  };
  const addSource = () => {
    const url = sourceDraft.trim();
    if (!url) return;
    setSources((current) => [...current, url]);
    setSourceDraft('');
  };
  const save = async (event) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    setIsSaving(true); setSaveError('');
    try { await onSave(cleanTitle, {
      subtitle: subtitle.trim(), lead: lead.trim(), sources,
      sections: sections.filter((part) => part.heading.trim() || part.text.trim() || part.code.trim() || part.tip.trim()).map((part) => ({
        heading: part.heading.trim() || 'Notes',
        paragraphs: part.text.split(/\n\s*\n/).map((line) => line.trim()).filter(Boolean),
        ...(part.code.trim() ? { code: part.code, language: part.language } : {}),
        ...(part.tip.trim() ? { callout: part.tip } : {})
      }))
    }); } catch (error) { setSaveError(error.message || 'Unable to save this note.'); } finally { setIsSaving(false); }
  };

  return <section className="inline-editor" aria-labelledby="editor-title">
      <header className="editor-header"><div><span className="editor-kicker">DEVNOTES / {initialDoc ? 'EDITING PAGE' : 'NEW PAGE'}</span><h2 id="editor-title">{initialDoc ? 'Edit documentation' : 'Create documentation'}</h2></div><span className="editing-indicator"><i /> EDITING IN PLACE</span></header>
      <form onSubmit={save} className="editor-form">
        <label className="editor-label">Page title<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Useful array patterns" required /></label>
        <label className="editor-label">Short description<input value={subtitle} onChange={(event) => setSubtitle(event.target.value)} placeholder="A short subtitle (optional)" /></label>
        <label className="editor-label">Introduction<textarea className="text-size-medium" value={lead} onChange={(event) => setLead(event.target.value)} placeholder="What is this note about?" rows={3} /></label>
        <div className="editor-block-heading"><span>CONTENT BLOCKS</span><button type="button" onClick={() => setSections((current) => [...current, blankSection()])}><Plus size={14} /> Add section</button></div>
        {sections.map((part, index) => <div className="editor-section" key={index}>
          <div className="editor-section-top"><span>SECTION {String(index + 1).padStart(2, '0')}</span><button type="button" aria-label="Remove section" onClick={() => setSections((current) => current.filter((_, i) => i !== index))}><Trash2 size={14} /></button></div>
          <input className="editor-section-title" value={part.heading} onChange={(event) => updateSection(index, 'heading', event.target.value)} placeholder="Section heading" />
          <div className="text-tools"><span>TEXT</span><select aria-label="Text size" defaultValue="medium" onChange={(event) => { const area = document.getElementById(`section-text-${index}`); area.className = `editor-textarea text-size-${event.target.value}`; }}><option value="small">Small text</option><option value="medium">Medium text</option><option value="large">Large text</option></select><select aria-label="Font" defaultValue="sans" onChange={(event) => { const area = document.getElementById(`section-text-${index}`); area.dataset.font = event.target.value; }}><option value="sans">Sans font</option><option value="serif">Serif font</option><option value="mono">Mono font</option></select><button type="button" className="add-code-button" onClick={() => { updateSection(index, 'code', ''); setFocusedCodeIndex(index); setFocusedTipIndex(null); setTimeout(() => document.getElementById(`section-code-${index}`)?.focus(), 0); }}><Code2 size={13} /> Code</button><button type="button" className="add-code-button" onClick={() => { updateSection(index, 'tip', ''); setFocusedTipIndex(index); setFocusedCodeIndex(null); setTimeout(() => document.getElementById(`section-tip-${index}`)?.focus(), 0); }}><Lightbulb size={13} /> Tip</button></div>
          <textarea id={`section-text-${index}`} className="editor-textarea text-size-medium" data-font="sans" value={part.text} onChange={(event) => updateSection(index, 'text', event.target.value)} placeholder="Write your explanation here…" rows={4} />
          {(part.code !== '' || focusedCodeIndex === index) && <div className="editor-code-wrap"><div className="editor-code-bar"><Code2 size={13} /><select value={part.language} onChange={(event) => updateSection(index, 'language', event.target.value)} aria-label="Code language"><option value="javascript">JavaScript</option><option value="jsx">JSX</option><option value="html">HTML</option><option value="css">CSS</option><option value="json">JSON</option><option value="bash">Shell</option></select><button type="button" onClick={() => updateSection(index, 'code', '')} aria-label="Remove code block"><X size={14} /></button></div><textarea id={`section-code-${index}`} className="editor-code" value={part.code} onChange={(event) => updateSection(index, 'code', event.target.value)} onFocus={() => { setFocusedCodeIndex(index); setFocusedTipIndex(null); }} onBlur={() => { setFocusedCodeIndex(null); if (part.code.trim() === '') updateSection(index, 'code', ''); }} placeholder="" rows={5} /></div>}
          {(part.tip !== '' || focusedTipIndex === index) && <div className="editor-tip-wrap"><div className="editor-tip-bar"><Lightbulb size={13} /><span>Tip</span><button type="button" onClick={() => updateSection(index, 'tip', '')} aria-label="Remove tip"><X size={14} /></button></div><textarea id={`section-tip-${index}`} className="editor-tip" value={part.tip} onChange={(event) => updateSection(index, 'tip', event.target.value)} onFocus={() => { setFocusedTipIndex(index); setFocusedCodeIndex(null); }} onBlur={() => { setFocusedTipIndex(null); if (part.tip.trim() === '') updateSection(index, 'tip', ''); }} placeholder="" rows={3} /></div>}
        </div>)}
        <div className="editor-block-heading source-heading"><span>SOURCES</span><Link2 size={14} /></div>
        <div className="source-add-row"><input value={sourceDraft} onChange={(event) => setSourceDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addSource(); } }} placeholder="Paste a URL, e.g. https://developer.mozilla.org/…" /><button type="button" onClick={addSource}><Plus size={14} /> Add</button></div>
        {sources.length > 0 && <ul className="editor-source-list">{sources.map((source, index) => <li key={`${source}-${index}`}><a href={source} target="_blank" rel="noreferrer">{source}</a><button type="button" onClick={() => setSources((current) => current.filter((_, i) => i !== index))} aria-label="Remove source"><X size={13} /></button></li>)}</ul>}
        <p className="editor-storage-note">Changes are saved to your documentation database.</p>
        {saveError && <p className="editor-save-error" role="alert">{saveError}</p>}
        <footer className="editor-actions"><button type="button" className="editor-cancel" onClick={onCancel} disabled={isSaving}>Cancel</button><button type="submit" className="editor-save" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save note'}</button></footer>
      </form>
  </section>;
}

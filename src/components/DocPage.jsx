import { ArrowUpRight, Lightbulb } from 'lucide-react';
import CodeBlock from './CodeBlock.jsx';

export default function DocPage({ section, topic, doc, onSelect }) {
  if (!doc) return <article className="doc-page empty-doc">
    <h1>{topic}</h1>
    <p className="empty-description">This page is ready for your notes.</p>
    <div className="empty-tip"><Lightbulb size={16} /><span>Add your own explanations, examples, and reminders to <code>src/data/docs.js</code> whenever you’re ready.</span></div>
    <h2 className="next-heading">Keep exploring</h2>
    <p className="muted-copy">Choose another topic from the sidebar to continue.</p>
  </article>;

  return <article className="doc-page">
    <header className="doc-header"><h1>{topic}</h1>{doc.subtitle && <p className="subtitle">{doc.subtitle}</p>}</header>
    <p className="lead">{doc.lead}</p>
    {doc.sections?.map((item, i) => <section className="content-section" key={item.heading}>
      <div className="section-heading"><span className="section-index">0{i + 1}</span><h2>{item.heading}</h2></div>
      {item.paragraphs?.map((paragraph, j) => <p className="body-copy" key={j}>{paragraph}</p>)}
      {item.code && <CodeBlock code={item.code} language={item.language} caption={item.caption} />}
      {item.bullets && <ul className="detail-list">{item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
      {item.callout && <aside className="callout"><Lightbulb size={16} /><p>{item.callout}</p></aside>}
    </section>)}
    {doc.sources?.length > 0 && <section className="related-section"><div className="related-title"><span className="section-index">↗</span><h2>Sources</h2></div><div className="source-links">{doc.sources.map((source, index) => <a href={source} target="_blank" rel="noreferrer" key={`${source}-${index}`}>{source}<ArrowUpRight size={14} /></a>)}</div></section>}
    {doc.related?.length > 0 && <section className="related-section"><div className="related-title"><span className="section-index">↗</span><h2>Related topics</h2></div><div className="related-links">{doc.related.map((related) => <button type="button" key={related} onClick={() => onSelect(related)}>{related}<ArrowUpRight size={14} /></button>)}</div></section>}
    <footer className="doc-footer"><span>END OF NOTES</span><span>Keep learning, one idea at a time.</span></footer>
  </article>;
}

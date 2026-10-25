import { ArrowUpRight, SearchX } from 'lucide-react';

export default function SearchResults({ query, results, onSelect }) {
  if (!results.length) return <div className="search-empty"><SearchX size={20} /><strong>No notes found</strong><span>Try another word or browse the topics.</span></div>;
  return <div className="search-results">
    <div className="results-heading">{results.length} {results.length === 1 ? 'RESULT' : 'RESULTS'}</div>
    {results.map((result) => <button className="result-item" key={`${result.sectionId}:${result.topic}`} onClick={() => onSelect(result)}>
      <span><i className={`result-dot ${result.sectionId}`} />{result.sectionName}<b>/</b>{result.topic}</span><ArrowUpRight size={14} />
    </button>)}
    {query && <p className="search-hint">Titles and intro notes are searched.</p>}
  </div>;
}

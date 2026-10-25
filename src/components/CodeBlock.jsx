const tokenPattern = /(\/\/[^\n]*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b(?:const|let|var|function|return|if|else|new|async|await|import|from|export|default|true|false|null|undefined)\b|\b\d+(?:\.\d+)?\b|\b(?:console|log)\b|[{}()[\].,;=<>])/g;

function highlight(code) {
  return code.split(tokenPattern).filter(Boolean).map((part, i) => {
    let kind = '';
    if (part.startsWith('//')) kind = 'comment';
    else if (/^["'`]/.test(part)) kind = 'string';
    else if (/^(const|let|var|function|return|if|else|new|async|await|import|from|export|default|true|false|null|undefined)$/.test(part)) kind = 'keyword';
    else if (/^\d/.test(part)) kind = 'number';
    else if (/^(console|log)$/.test(part)) kind = 'builtin';
    else if (/^[{}()[\].,;=<>]$/.test(part)) kind = 'punctuation';
    return <span className={kind ? `token-${kind}` : undefined} key={i}>{part}</span>;
  });
}

export default function CodeBlock({ code, language = 'javascript', caption }) {
  return <figure className="code-figure">
    <div className="code-topline"><span className="code-dots"><i /><i /><i /></span><span>{language}</span><span className="code-label">example</span></div>
    <pre><code>{highlight(code)}</code></pre>
    {caption && <figcaption>{caption}</figcaption>}
  </figure>;
}

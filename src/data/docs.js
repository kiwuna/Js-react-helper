export const sections = {
  javascript: {
    name: 'JavaScript',
    short: 'JS',
    color: '#f3d52c',
    topics: [
      'Introduction', 'Variables and Data Types', 'Operators', 'Conditions', 'Loops', 'Arrays', 'Array Methods', 'map()', 'filter()', 'find()', 'reduce()', 'Objects', 'Functions', 'Parameters and Arguments', 'Return Values', 'Arrow Functions', 'Scope', 'Global Scope and Block Scope', 'Closures', 'Hoisting', 'Callbacks', 'setTimeout and setInterval', 'DOM Manipulation', 'Events', 'Promises', 'Async/Await', 'Fetch API', 'Modules', 'Other Notes'
    ]
  },
  react: {
    name: 'React',
    short: 'R',
    color: '#48c8df',
    topics: [
      'Introduction', 'Setting Up React with Vite', 'Project Structure', 'JSX', 'Components', 'Props', 'State', 'Event Handling', 'Conditional Rendering', 'Lists and Keys', 'Forms', 'Hooks', 'useState', 'useEffect', 'React Router', 'Fetching Data', 'Project Notes', 'Other Notes'
    ]
  }
};

export const docs = {
  javascript: {
    'Introduction': {
      subtitle: 'The language that brings the web to life.',
      lead: 'JavaScript is a programming language used to create interactive experiences in the browser. It can also run on servers and in many other environments.',
      sections: [
        { heading: 'What JavaScript does', paragraphs: ['HTML gives a page its structure, and CSS describes its appearance. JavaScript adds behavior: responding to clicks, updating content, validating forms, and working with data.'] },
        { heading: 'A first example', code: 'const greeting = "Hello, world!";\nconsole.log(greeting);', language: 'javascript', caption: 'Open your browser console to see the message.' },
        { heading: 'A few useful ideas', bullets: ['Values can be stored in variables and combined with operators.', 'Functions package reusable steps.', 'The browser provides APIs for interacting with the page and the network.'] }
      ], related: ['Variables and Data Types', 'Functions', 'DOM Manipulation']
    }
  },
  react: {
    'Introduction': {
      subtitle: 'Build interfaces from small, reusable pieces.',
      lead: 'React is a JavaScript library for building user interfaces. You describe what the page should show, and React updates the screen when your data changes.',
      sections: [
        { heading: 'Think in components', paragraphs: ['A component is a reusable piece of interface, such as a button, a navigation bar, or an entire page. Components can be composed together to build a complete application.'] },
        { heading: 'A small component', code: 'function Greeting() {\n  return <h1>Hello, React!</h1>;\n}', language: 'jsx', caption: 'A function component returns the UI it describes.' },
        { heading: 'What to learn next', bullets: ['JSX describes UI with familiar JavaScript expressions.', 'Props pass information into a component.', 'State lets a component remember information that changes over time.'] }
      ], related: ['Setting Up React with Vite', 'JSX', 'Components', 'Props', 'State']
    }
  }
};

export function getDoc(sectionId, topic) {
  return docs[sectionId]?.[topic] ?? null;
}

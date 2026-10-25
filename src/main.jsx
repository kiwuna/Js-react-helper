import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './AppSupabase.jsx';
import './styles.css';
import './supabase.css';

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);

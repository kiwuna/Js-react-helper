import { useState } from 'react';
import { LogIn, LogOut, UserRound, X } from 'lucide-react';
import { supabase } from '../lib/supabase.js';

export default function AuthMenu({ user, onUserChange }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true); setMessage('');
    const result = mode === 'sign-in'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (result.error) { setMessage(result.error.message); return; }
    if (mode === 'sign-up' && !result.data.session) setMessage('Check your email to confirm your account, then sign in.');
    else { onUserChange(result.data.user ?? result.data.session?.user ?? null); setOpen(false); }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    onUserChange(null); setOpen(false);
  };

  return <div className="auth-menu">
    <button className="profile-mark" onClick={() => setOpen((value) => !value)} aria-label={user ? 'Open account menu' : 'Sign in'} aria-expanded={open}>{user?.email?.[0]?.toUpperCase() ?? 'B'}</button>
    {open && <div className="auth-popover">
      <button className="auth-close" onClick={() => setOpen(false)} aria-label="Close account menu"><X size={14} /></button>
      {user ? <><UserRound size={18} /><strong>Signed in</strong><span>{user.email}</span><button className="auth-submit sign-out" onClick={signOut}><LogOut size={13} /> Sign out</button></> : <>
        <strong>{mode === 'sign-in' ? 'Sign in to edit' : 'Create an editor account'}</strong>
        <p>Documentation is public. Sign in to make changes.</p>
        <form onSubmit={submit}><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Password<input type="password" minLength="6" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{message && <span className="auth-message">{message}</span>}<button className="auth-submit" disabled={busy}><LogIn size={13} /> {busy ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}</button></form>
        <button className="auth-switch" onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setMessage(''); }}>{mode === 'sign-in' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}</button>
      </>}
    </div>}
  </div>;
}

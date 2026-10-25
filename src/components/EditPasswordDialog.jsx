import { useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import { supabase } from '../lib/supabase.js';

export default function EditPasswordDialog({ user, onVerified, onCancel }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const verify = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password });
    setBusy(false); setPassword('');
    if (signInError) { setError('Incorrect password. Please try again.'); return; }
    onVerified();
  };
  return <div className="edit-auth-backdrop" role="presentation"><form className="edit-auth-dialog" onSubmit={verify}><LockKeyhole size={19} /><h2>Unlock editing</h2><p>Enter your account password. Editing stays unlocked for 10 minutes.</p><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus required /></label>{error && <span className="auth-message">{error}</span>}<footer><button type="button" onClick={onCancel} disabled={busy}>Cancel</button><button type="submit" disabled={busy}>{busy ? 'Verifying…' : 'Unlock'}</button></footer></form></div>;
}

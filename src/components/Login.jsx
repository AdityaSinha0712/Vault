import { useRef, useState } from 'react';
import { PROFILES } from '../config/auth.js';
import { sha256Hex } from '../lib/hash.js';

export default function Login({ onLogin }) {
  const [profile, setProfile] = useState('user');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const passwordRef = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (checking) return;
    if (password === '') {
      setError('Enter the password for this profile.');
      passwordRef.current?.focus();
      return;
    }
    setChecking(true);
    try {
      const hash = await sha256Hex(password);
      if (hash === PROFILES[profile].hash) {
        onLogin(profile);
        return;
      }
      setError(`That password doesn't open the ${PROFILES[profile].label} profile.`);
      passwordRef.current?.select();
    } catch {
      setError("This browser couldn't check the password. Try a current version of Chrome, Firefox or Safari.");
    }
    setChecking(false);
  }

  return (
    <main className="login">
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div>
          <h1 className="brand brand-login">Vault</h1>
          <p className="login-sub">Saved messages, kept exactly as written.</p>
        </div>

        <fieldset className="profiles">
          <legend className="field-label">Profile</legend>
          {Object.entries(PROFILES).map(([key, p]) => (
            <label key={key} className="profile" htmlFor={`profile-${key}`}>
              <input
                type="radio"
                id={`profile-${key}`}
                name="profile"
                value={key}
                checked={profile === key}
                onChange={() => {
                  setProfile(key);
                  setError('');
                }}
              />
              <span>{p.label}</span>
            </label>
          ))}
        </fieldset>

        <div className="field">
          <label htmlFor="password" className="field-label">
            Password
          </label>
          <input
            ref={passwordRef}
            id="password"
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) setError('');
            }}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? 'password-error' : undefined}
          />
          {error && (
            <p id="password-error" className="field-error" role="alert">
              {error}
            </p>
          )}
        </div>

        <button type="submit" id="login-button" className="btn btn-primary btn-block" disabled={checking}>
          {checking ? 'Checking…' : 'Open vault'}
        </button>
      </form>
    </main>
  );
}

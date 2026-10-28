import { useCallback, useEffect, useState } from 'react';
import { ROLES, SESSION_KEY } from '../config/auth.js';

function readRole() {
  try {
    const value = localStorage.getItem(SESSION_KEY);
    return ROLES.includes(value) ? value : null;
  } catch {
    return null; // storage disabled (e.g. some private modes)
  }
}

export function useSession() {
  const [role, setRole] = useState(readRole);

  const login = useCallback((nextRole) => {
    if (!ROLES.includes(nextRole)) return;
    try {
      localStorage.setItem(SESSION_KEY, nextRole);
    } catch {
      // Still log in for this tab even if it can't be persisted.
    }
    setRole(nextRole);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
    setRole(null);
  }, []);

  // Keep other open tabs in sync with log in / log out.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === SESSION_KEY || event.key === null) setRole(readRole());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return { role, login, logout };
}

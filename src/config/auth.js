// The only place passwords live. Values are SHA-256 hex digests of the
// passwords, loaded from environment variables (.env / .env.local).
// To generate a new hash: npm run hash -- "new-password"

export const PROFILES = {
  admin: {
    label: 'Admin',
    hash: import.meta.env.VITE_ADMIN_HASH || '',
  },
  user: {
    label: 'User',
    hash: import.meta.env.VITE_USER_HASH || '',
  },
};

export const ROLES = Object.keys(PROFILES);

// localStorage key for the logged-in role.
export const SESSION_KEY = 'vault.role.v1';

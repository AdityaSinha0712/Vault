import { LogOut } from 'lucide-react';
import { iconProps } from '../lib/icons.js';

export default function Header({ role, onLogout }) {
  return (
    <header className="app-header">
      <div className="wrap app-header-inner">
        <h1 className="brand">Vault</h1>
        <span className="role-tag">{role === 'admin' ? 'Admin' : 'User · read only'}</span>
        <button type="button" id="logout-button" className="btn btn-quiet header-logout" onClick={onLogout}>
          <LogOut {...iconProps} />
          Log out
        </button>
      </div>
    </header>
  );
}

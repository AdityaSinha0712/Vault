import { lazy, Suspense } from 'react';
import Login from './components/Login.jsx';
import StatusMessage from './components/StatusMessage.jsx';
import { useSession } from './hooks/useSession.js';
import UserView from './user/UserView.jsx';

// The admin UI lives in its own lazily-loaded chunk. It is only imported,
// and only rendered, when the role is exactly "admin". For the User role
// no admin component is ever mounted, so there is nothing to hide with CSS.
const AdminView = lazy(() => import('./admin/AdminView.jsx'));

export default function App() {
  const { role, login, logout } = useSession();

  if (role === 'admin') {
    return (
      <Suspense
        fallback={
          <main className="wrap">
            <StatusMessage kind="loading" title="Opening the vault…" />
          </main>
        }
      >
        <AdminView onLogout={logout} />
      </Suspense>
    );
  }

  if (role === 'user') {
    return <UserView onLogout={logout} />;
  }

  return <Login onLogin={login} />;
}

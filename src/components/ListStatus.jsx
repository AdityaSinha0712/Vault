import StatusMessage from './StatusMessage.jsx';
import { describeError } from '../lib/errors.js';

export default function ListStatus({ data, shownCount, query, role }) {
  const total = data.messages.length;

  if (data.status === 'unconfigured') {
    return (
      <StatusMessage kind="error" title="Firebase isn't set up yet.">
        Paste your project's web config into src/lib/firebase.js, then restart the dev server.
      </StatusMessage>
    );
  }

  if (data.status === 'loading') {
    return <StatusMessage kind="loading" title="Opening the vault…" />;
  }

  if (data.status === 'error') {
    return (
      <StatusMessage
        kind="error"
        title={total > 0 ? 'Live updates stopped. What you see may be out of date.' : "Couldn't load your messages."}
      >
        {describeError(data.error)} Reload the page to try again.
      </StatusMessage>
    );
  }

  if (total === 0) {
    if (data.fromCache) {
      return (
        <StatusMessage title="Waiting for a connection.">
          Saved messages will appear as soon as the vault can be reached.
        </StatusMessage>
      );
    }
    return (
      <StatusMessage title="Nothing saved yet.">
        {role === 'admin'
          ? 'Use “Add message” to save the first one.'
          : 'Messages will show up here as soon as the admin adds them.'}
      </StatusMessage>
    );
  }

  if (shownCount === 0) {
    return (
      <StatusMessage title={`Nothing matches “${query}”.`}>
        Search looks at titles and message text. Try fewer words, or clear the search.
      </StatusMessage>
    );
  }

  return null;
}

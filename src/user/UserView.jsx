import { useMemo, useState } from 'react';
import Header from '../components/Header.jsx';
import ListStatus from '../components/ListStatus.jsx';
import SearchBox from '../components/SearchBox.jsx';
import { useMessages } from '../hooks/useMessages.js';
import { filterMessages } from '../lib/format.js';
import MessageRow from './MessageRow.jsx';

export default function UserView({ onLogout }) {
  const data = useMessages();
  const [query, setQuery] = useState('');
  const shown = useMemo(() => filterMessages(data.messages, query), [data.messages, query]);

  return (
    <>
      <Header role="user" onLogout={onLogout} />
      <main className="wrap">
        <div className="toolbar">
          <SearchBox value={query} onChange={setQuery} shown={shown.length} total={data.messages.length} />
        </div>
        <ListStatus data={data} shownCount={shown.length} query={query} role="user" />
        {shown.length > 0 && (
          <ol className="list" aria-label="Saved messages">
            {shown.map((message) => (
              <MessageRow key={message.id} message={message} />
            ))}
          </ol>
        )}
      </main>
    </>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import Header from '../components/Header.jsx';
import ListStatus from '../components/ListStatus.jsx';
import SearchBox from '../components/SearchBox.jsx';
import { useMessages } from '../hooks/useMessages.js';
import { describeError } from '../lib/errors.js';
import { filterMessages } from '../lib/format.js';
import { describeDifference } from '../lib/verify.js';
import AdminRow from './AdminRow.jsx';
import MessageEditor from './MessageEditor.jsx';
import { createMessage, deleteMessage, saveOrder, updateMessage } from './adminApi.js';

function saveNotice(result, verb) {
  if (!result.checked) {
    return { kind: 'ok', text: `${verb}. The server copy couldn't be re-read to verify it, but the save went through.` };
  }
  if (result.identical) {
    return { kind: 'ok', text: `${verb}. The stored copy is byte-identical to what you entered (${result.expectedBytes} bytes).` };
  }
  return { kind: 'error', text: `${verb}, but the stored copy differs from what you entered. ${describeDifference(result)}` };
}

export default function AdminView({ onLogout }) {
  const data = useMessages();
  const { messages } = data;
  const [query, setQuery] = useState('');
  const [composing, setComposing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [movedId, setMovedId] = useState(null);
  const [focusRequest, setFocusRequest] = useState(null);
  const addButtonRef = useRef(null);
  const wasComposing = useRef(false);

  const shown = useMemo(() => filterMessages(messages, query), [messages, query]);
  const searching = query !== '';
  const ready = data.status === 'ready';

  useEffect(() => {
    if (wasComposing.current && !composing) addButtonRef.current?.focus();
    wasComposing.current = composing;
  }, [composing]);

  // Brief highlight on a moved row (transition itself is <150ms in CSS).
  useEffect(() => {
    if (!movedId) return undefined;
    const t = setTimeout(() => setMovedId(null), 500);
    return () => clearTimeout(t);
  }, [movedId]);

  async function handleCreate(title, content) {
    const order = messages.length > 0 ? messages[0].order - 1 : 0; // new messages go on top
    const result = await createMessage({ title, content, order });
    setComposing(false);
    setNotice(saveNotice(result, 'Saved'));
  }

  async function handleUpdate(id, title, content) {
    const result = await updateMessage(id, { title, content });
    setEditingId(null);
    setNotice(saveNotice(result, 'Changes saved'));
  }

  async function handleDelete(id) {
    await deleteMessage(id);
    if (editingId === id) setEditingId(null);
    setNotice({ kind: 'ok', text: 'Message deleted.' });
  }

  async function handleMove(id, direction) {
    const from = messages.findIndex((m) => m.id === id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= messages.length) return;
    const next = messages.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setMovedId(id);
    setFocusRequest({ id, direction, nonce: Date.now() });
    try {
      await saveOrder(next);
    } catch (err) {
      setNotice({ kind: 'error', text: `Couldn't save the new order. ${describeError(err)}` });
    }
  }

  return (
    <>
      <Header role="admin" onLogout={onLogout} />
      <main className="wrap">
        <div className="toolbar">
          <SearchBox value={query} onChange={setQuery} shown={shown.length} total={messages.length} />
          {!composing && (
            <button
              ref={addButtonRef}
              type="button"
              id="add-message-button"
              className="btn btn-primary"
              onClick={() => {
                setNotice(null);
                setComposing(true);
              }}
              disabled={!ready}
            >
              Add message
            </button>
          )}
          {searching && messages.length > 1 && <p className="toolbar-note">Clear the search to reorder.</p>}
        </div>

        {composing && (
          <section className="composer" aria-label="New message">
            <MessageEditor
              idPrefix="new"
              heading="New message"
              submitLabel="Save message"
              onSubmit={handleCreate}
              onCancel={() => setComposing(false)}
            />
          </section>
        )}

        {notice && (
          <div className={`notice notice-${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>
            <p>{notice.text}</p>
            <button type="button" className="btn btn-quiet" id="dismiss-notice" onClick={() => setNotice(null)}>
              Dismiss
            </button>
          </div>
        )}

        <ListStatus data={data} shownCount={shown.length} query={query} role="admin" />

        {shown.length > 0 && (
          <ol className="list" aria-label="Saved messages">
            {shown.map((message) => (
              <AdminRow
                key={message.id}
                message={message}
                isFirst={message.position === 1}
                isLast={message.position === messages.length}
                reorderDisabled={searching || !ready}
                editing={editingId === message.id}
                moved={movedId === message.id}
                focusRequest={focusRequest}
                onEdit={(id) => {
                  setNotice(null);
                  setEditingId(id);
                }}
                onCancelEdit={() => setEditingId(null)}
                onSave={handleUpdate}
                onDelete={handleDelete}
                onMove={handleMove}
              />
            ))}
          </ol>
        )}
      </main>
    </>
  );
}

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import CopyButton from '../components/CopyButton.jsx';
import MessageContent from '../components/MessageContent.jsx';
import RowHeading from '../components/RowHeading.jsx';
import { describeError } from '../lib/errors.js';
import { iconProps } from '../lib/icons.js';
import { padIndex } from '../lib/format.js';
import MessageEditor from './MessageEditor.jsx';
import RoundTripCheck from './RoundTripCheck.jsx';

export default function AdminRow({
  message,
  isFirst,
  isLast,
  reorderDisabled,
  editing,
  moved,
  focusRequest,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onMove,
}) {
  const [panel, setPanel] = useState(null); // null | 'confirm' | 'check'
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const contentRef = useRef(null);
  const upRef = useRef(null);
  const downRef = useRef(null);
  const editRef = useRef(null);
  const keepRef = useRef(null);
  const wasEditing = useRef(editing);

  const label = message.title.trim() !== '' ? `“${message.title}”` : `message ${padIndex(message.position)}`;

  // Keep keyboard focus on the moved row's arrow after a reorder.
  useEffect(() => {
    if (!focusRequest || focusRequest.id !== message.id) return;
    const preferred = focusRequest.direction < 0 ? upRef.current : downRef.current;
    const other = focusRequest.direction < 0 ? downRef.current : upRef.current;
    const target = preferred && !preferred.disabled ? preferred : other;
    target?.focus();
  }, [focusRequest, message.id, message.position]);

  // Return focus to Edit when leaving edit mode.
  useEffect(() => {
    if (wasEditing.current && !editing) editRef.current?.focus();
    wasEditing.current = editing;
  }, [editing]);

  useEffect(() => {
    if (panel === 'confirm') keepRef.current?.focus();
  }, [panel]);

  async function confirmDelete() {
    setDeleting(true);
    setDeleteError('');
    try {
      await onDelete(message.id);
    } catch (err) {
      setDeleteError(`Couldn't delete. ${describeError(err)}`);
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <li className="row row-editing">
        <MessageEditor
          idPrefix={`edit-${message.id}`}
          heading={`Editing ${padIndex(message.position)}`}
          initialTitle={message.title}
          initialContent={message.content}
          submitLabel="Save changes"
          initialFocus="content"
          onSubmit={(title, content) => onSave(message.id, title, content)}
          onCancel={onCancelEdit}
        />
      </li>
    );
  }

  return (
    <li className={`row${moved ? ' is-moved' : ''}`}>
      <RowHeading message={message}>
        <div className="row-reorder" role="group" aria-label={`Reorder ${label}`}>
          <button
            ref={upRef}
            type="button"
            id={`up-${message.id}`}
            className="btn btn-icon"
            onClick={() => onMove(message.id, -1)}
            disabled={reorderDisabled || isFirst}
            aria-label={`Move ${label} up`}
            title="Move up"
          >
            <ArrowUp {...iconProps} />
          </button>
          <button
            ref={downRef}
            type="button"
            id={`down-${message.id}`}
            className="btn btn-icon"
            onClick={() => onMove(message.id, 1)}
            disabled={reorderDisabled || isLast}
            aria-label={`Move ${label} down`}
            title="Move down"
          >
            <ArrowDown {...iconProps} />
          </button>
        </div>
      </RowHeading>

      <MessageContent ref={contentRef} content={message.content} />

      {panel === 'confirm' && (
        <div className="inline-panel" role="group" aria-labelledby={`confirm-${message.id}`}>
          <p id={`confirm-${message.id}`}>Delete {label}? This can't be undone.</p>
          {deleteError && (
            <p className="field-error" role="alert">
              {deleteError}
            </p>
          )}
          <div className="inline-panel-actions">
            <button
              ref={keepRef}
              type="button"
              className="btn"
              id={`keep-${message.id}`}
              onClick={() => {
                setPanel(null);
                setDeleteError('');
              }}
            >
              Keep it
            </button>
            <button
              type="button"
              className="btn btn-danger"
              id={`confirm-delete-${message.id}`}
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      )}

      {panel === 'check' && (
        <RoundTripCheck idPrefix={`check-${message.id}`} expected={message.content} onClose={() => setPanel(null)} />
      )}

      <div className="row-actions">
        <button
          type="button"
          className="btn"
          id={`check-btn-${message.id}`}
          onClick={() => setPanel(panel === 'check' ? null : 'check')}
          aria-expanded={panel === 'check'}
        >
          Check
        </button>
        <button
          type="button"
          className="btn"
          id={`delete-${message.id}`}
          onClick={() => setPanel('confirm')}
          disabled={panel === 'confirm'}
        >
          Delete
        </button>
        <button ref={editRef} type="button" className="btn" id={`edit-${message.id}`} onClick={() => onEdit(message.id)}>
          Edit
        </button>
        <CopyButton id={`copy-${message.id}`} text={message.content} targetRef={contentRef} />
      </div>
    </li>
  );
}

import { useEffect, useRef, useState } from 'react';
import { describeError } from '../lib/errors.js';

export const MAX_TITLE = 120;
export const MAX_CONTENT = 200000; // matches firestore.rules

// Exact-format rules for this editor:
// - the textarea value is saved as-is: no trim, no normalisation, no maxLength
//   (maxLength would silently cut a long paste)
// - spellcheck, autocorrect, autocapitalise and Grammarly are switched off so
//   nothing rewrites quotes, dashes or words while typing
// - Tab inserts a real tab character; Esc then Tab leaves the field
export default function MessageEditor({
  idPrefix,
  heading,
  initialTitle = '',
  initialContent = '',
  submitLabel,
  onSubmit,
  onCancel,
  initialFocus = 'title',
}) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef(null);
  const titleRef = useRef(null);
  const contentRef = useRef(null);
  const tabInserts = useRef(true);

  useEffect(() => {
    const target = initialFocus === 'content' ? contentRef.current : titleRef.current;
    target?.focus();
  }, [initialFocus]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;
    if (content.length === 0) {
      setError("The message can't be empty.");
      contentRef.current?.focus();
      return;
    }
    if (content.length > MAX_CONTENT) {
      setError(`This message is ${content.length.toLocaleString()} characters. The limit is ${MAX_CONTENT.toLocaleString()}.`);
      contentRef.current?.focus();
      return;
    }
    if (title.length > MAX_TITLE) {
      setError(`The title is ${title.length} characters. Keep it to ${MAX_TITLE} or fewer.`);
      titleRef.current?.focus();
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSubmit(title, content); // parent closes the editor on success
    } catch (err) {
      setError(`Couldn't save. ${describeError(err)}`);
      setSaving(false);
    }
  }

  function handleContentKeyDown(event) {
    if (event.key === 'Escape') {
      tabInserts.current = false;
      return;
    }
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      formRef.current?.requestSubmit();
      return;
    }
    if (event.key === 'Tab' && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
      if (!tabInserts.current) return; // let focus move on
      event.preventDefault();
      const el = event.currentTarget;
      // execCommand keeps the browser's undo history; setRangeText is the fallback.
      const inserted = document.execCommand && document.execCommand('insertText', false, '\t');
      if (!inserted) {
        el.setRangeText('\t', el.selectionStart, el.selectionEnd, 'end');
        setContent(el.value);
      }
      return;
    }
    if (event.key !== 'Shift' && event.key !== 'Tab') tabInserts.current = true;
  }

  const lineCount = content.split('\n').length;
  const rows = Math.min(24, Math.max(6, lineCount + 1));
  const hintId = `${idPrefix}-hint`;
  const errorId = `${idPrefix}-error`;

  return (
    <form ref={formRef} className="editor" onSubmit={handleSubmit} noValidate>
      <h2 className="editor-heading">{heading}</h2>

      <div className="field">
        <label htmlFor={`${idPrefix}-title`} className="field-label">
          Title <span className="field-optional">(optional)</span>
        </label>
        <input
          ref={titleRef}
          id={`${idPrefix}-title`}
          className="input"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>

      <div className="field">
        <label htmlFor={`${idPrefix}-content`} className="field-label">
          Message
        </label>
        <textarea
          ref={contentRef}
          id={`${idPrefix}-content`}
          className="textarea"
          rows={rows}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleContentKeyDown}
          onFocus={() => {
            tabInserts.current = true;
          }}
          required
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          data-gramm="false"
          data-gramm_editor="false"
          data-enable-grammarly="false"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${hintId} ${errorId}` : hintId}
        />
        <p id={hintId} className="field-hint">
          Saved exactly as typed, including spaces, tabs, blank lines and emoji. Tab inserts a tab;
          press Esc then Tab to move on. Ctrl+Enter saves.
        </p>
      </div>

      {error && (
        <p id={errorId} className="field-error" role="alert">
          {error}
        </p>
      )}

      <div className="editor-actions">
        <button type="button" className="btn" onClick={onCancel} id={`${idPrefix}-cancel`}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving} id={`${idPrefix}-save`}>
          {saving ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

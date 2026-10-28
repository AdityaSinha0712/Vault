import { useState } from 'react';
import { copyText } from '../lib/clipboard.js';
import { compareExact, describeDifference } from '../lib/verify.js';

// Round-trip check: copy a message, paste it back, and confirm it is
// byte-identical to the stored string.
// Note: on Windows the OS may turn LF into CRLF on the clipboard; browsers
// turn it back into LF when pasting into a textarea, so a clean round trip
// still compares as identical.
export default function RoundTripCheck({ idPrefix, expected, onClose }) {
  const [pasted, setPasted] = useState('');
  const [autoNote, setAutoNote] = useState('');
  const canReadClipboard = Boolean(navigator.clipboard?.readText) && window.isSecureContext;

  async function runAutomatic() {
    setAutoNote('');
    const copied = await copyText(expected);
    if (!copied) {
      setAutoNote("Copying was blocked, so the automatic check couldn't run. Paste manually instead.");
      return;
    }
    try {
      setPasted(await navigator.clipboard.readText());
    } catch {
      setAutoNote('The browser blocked reading the clipboard. It was copied, so paste it below with Ctrl+V.');
    }
  }

  const result = pasted === '' ? null : compareExact(expected, pasted);

  return (
    <div className="inline-panel" role="group" aria-labelledby={`${idPrefix}-label`}>
      <label id={`${idPrefix}-label`} htmlFor={`${idPrefix}-paste`} className="field-label">
        Copy this message, then paste it here to compare with the stored version
      </label>
      <textarea
        id={`${idPrefix}-paste`}
        className="textarea"
        rows={4}
        value={pasted}
        onChange={(event) => setPasted(event.target.value)}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        data-gramm="false"
      />
      <p className={result && !result.identical ? 'field-error' : 'field-hint'} role="status">
        {result === null && (autoNote || 'Waiting for pasted text.')}
        {result?.identical && `Identical. All ${result.expectedBytes} bytes match the stored text.`}
        {result && !result.identical && describeDifference(result)}
      </p>
      <div className="inline-panel-actions">
        <button type="button" className="btn" onClick={onClose} id={`${idPrefix}-close`}>
          Close check
        </button>
        {canReadClipboard && (
          <button type="button" className="btn" onClick={runAutomatic} id={`${idPrefix}-auto`}>
            Copy and paste for me
          </button>
        )}
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { copyText, selectElementText } from '../lib/clipboard.js';

const LABELS = { idle: 'Copy', copied: 'Copied', failed: 'Copy failed' };

export default function CopyButton({ id, text, targetRef }) {
  const [state, setState] = useState('idle');
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function handleClick() {
    // `text` is the exact stored string; it is not modified before copying.
    const ok = await copyText(text);
    clearTimeout(timer.current);
    if (ok) {
      setState('copied');
      timer.current = setTimeout(() => setState('idle'), 1500);
    } else {
      setState('failed');
      selectElementText(targetRef?.current);
      timer.current = setTimeout(() => setState('idle'), 3000);
    }
  }

  return (
    <>
      <button type="button" id={id} className={`btn btn-copy is-${state}`} onClick={handleClick}>
        {LABELS[state]}
      </button>
      <span className="visually-hidden" role="status">
        {state === 'copied' && 'Copied to clipboard.'}
        {state === 'failed' && 'This browser blocked copying. The text is now selected so you can copy it yourself.'}
      </span>
    </>
  );
}

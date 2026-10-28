// Copies the exact string it is given. Nothing here trims or rewrites text.

export async function copyText(text) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Permission denied or document not focused: fall through to the legacy path.
    }
  }
  return legacyCopy(text);
}

// Fallback for browsers/contexts that block the async Clipboard API.
function legacyCopy(text) {
  const previousFocus = document.activeElement;
  const selection = document.getSelection();
  const previousRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.setAttribute('aria-hidden', 'true');
  Object.assign(area.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '1px',
    height: '1px',
    opacity: '0',
    fontSize: '16px', // avoids iOS zoom-on-focus
    whiteSpace: 'pre',
  });
  document.body.appendChild(area);
  area.focus({ preventScroll: true });
  area.select();
  area.setSelectionRange(0, area.value.length);

  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }

  document.body.removeChild(area);
  if (selection && previousRange) {
    selection.removeAllRanges();
    selection.addRange(previousRange);
  }
  if (previousFocus && typeof previousFocus.focus === 'function') {
    previousFocus.focus({ preventScroll: true });
  }
  return ok;
}

// Last resort when both paths fail: select the text on screen so it can be copied by hand.
export function selectElementText(element) {
  if (!element) return;
  const range = document.createRange();
  range.selectNodeContents(element);
  const selection = document.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

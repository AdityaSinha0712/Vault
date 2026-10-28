// Exact comparison used by the round-trip check and post-save verification.

const encoder = new TextEncoder();

export function byteLength(text) {
  return encoder.encode(text).length;
}

const NAMED = {
  0x09: 'a tab',
  0x0a: 'a line break (LF)',
  0x0d: 'a carriage return (CR)',
  0x20: 'a space',
  0xa0: 'a non-breaking space',
  0x200b: 'a zero-width space',
  0x2018: 'a curly opening single quote',
  0x2019: 'a curly closing single quote',
  0x201c: 'a curly opening double quote',
  0x201d: 'a curly closing double quote',
  0xfeff: 'a byte-order mark',
};

function describeAt(text, index) {
  if (index >= text.length) return 'the end of the text';
  const cp = text.codePointAt(index);
  const hex = `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`;
  if (NAMED[cp]) return `${NAMED[cp]} (${hex})`;
  return `"${String.fromCodePoint(cp)}" (${hex})`;
}

export function compareExact(expected, actual) {
  const expectedBytes = byteLength(expected);
  const actualBytes = byteLength(actual);
  if (expected === actual) {
    return { identical: true, expectedBytes, actualBytes };
  }
  let i = 0;
  const max = Math.min(expected.length, actual.length);
  while (i < max && expected[i] === actual[i]) i++;
  const before = expected.slice(0, i);
  const line = before.split('\n').length;
  const column = i - before.lastIndexOf('\n');
  return {
    identical: false,
    expectedBytes,
    actualBytes,
    line,
    column,
    expectedChar: describeAt(expected, i),
    actualChar: describeAt(actual, i),
  };
}

export function describeDifference(result) {
  return `First difference at line ${result.line}, column ${result.column}: stored text has ${result.expectedChar}, the other has ${result.actualChar}. (${result.expectedBytes} vs ${result.actualBytes} bytes)`;
}

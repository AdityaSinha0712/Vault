const dateFormat = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDate(date) {
  return date ? dateFormat.format(date) : '';
}

export function padIndex(n) {
  return String(n).padStart(2, '0');
}

export function characterCount(text) {
  // Count code points so an emoji counts as one character.
  let count = 0;
  for (const _ of text) count++;
  return count;
}

export function metaLine(message) {
  const parts = [];
  const edited =
    message.updatedAt && message.createdAt && message.updatedAt - message.createdAt > 1000;
  if (edited) parts.push(`Edited ${formatDate(message.updatedAt)}`);
  else if (message.createdAt) parts.push(`Saved ${formatDate(message.createdAt)}`);
  const chars = characterCount(message.content);
  parts.push(`${chars} ${chars === 1 ? 'character' : 'characters'}`);
  if (message.pending) parts.push('syncing');
  return parts.join(' · ');
}

// Search matches title or content. The query is not trimmed, so searching
// for a double space or a tab works too.
export function filterMessages(messages, query) {
  if (query === '') return messages;
  const needle = query.toLocaleLowerCase();
  return messages.filter(
    (m) =>
      m.title.toLocaleLowerCase().includes(needle) ||
      m.content.toLocaleLowerCase().includes(needle),
  );
}

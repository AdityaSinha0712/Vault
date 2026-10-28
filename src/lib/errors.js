const MESSAGES = {
  'permission-denied':
    'Firestore refused the request. Check that the rules in firestore.rules are deployed to this project.',
  unavailable: "Can't reach Firestore right now. Check your connection; it will keep retrying.",
  'resource-exhausted': 'This project has hit its Firestore quota for now. Try again later.',
  'not-found': 'That message no longer exists. It may have been deleted on another device.',
  'invalid-argument': 'Firestore rejected the data that was sent.',
  'deadline-exceeded': 'Firestore took too long to answer. Try again.',
};

export function describeError(error) {
  if (!error) return 'Something went wrong.';
  return MESSAGES[error.code] ?? error.message ?? 'Something went wrong.';
}

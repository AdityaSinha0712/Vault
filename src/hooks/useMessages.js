import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db, MESSAGES_COLLECTION } from '../lib/firebase.js';

const initialState = {
  status: db ? 'loading' : 'unconfigured', // loading | ready | error | unconfigured
  messages: [],
  fromCache: false,
  error: null,
};

function toMessage(docSnap, index) {
  const data = docSnap.data({ serverTimestamps: 'estimate' });
  return {
    id: docSnap.id,
    // Content is passed through untouched. No trimming or normalising anywhere.
    title: typeof data.title === 'string' ? data.title : '',
    content: typeof data.content === 'string' ? data.content : '',
    order: typeof data.order === 'number' ? data.order : 0,
    createdAt: data.createdAt?.toDate?.() ?? null,
    updatedAt: data.updatedAt?.toDate?.() ?? null,
    pending: docSnap.metadata.hasPendingWrites,
    position: index + 1,
  };
}

export function useMessages() {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    if (!db) return undefined;
    const q = query(collection(db, MESSAGES_COLLECTION), orderBy('order', 'asc'));
    return onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot) => {
        setState({
          status: 'ready',
          messages: snapshot.docs.map(toMessage),
          fromCache: snapshot.metadata.fromCache,
          error: null,
        });
      },
      (error) => {
        setState((prev) => ({ ...prev, status: 'error', error }));
      },
    );
  }, []);

  return state;
}

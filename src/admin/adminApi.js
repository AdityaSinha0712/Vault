// All Firestore writes live here, inside the lazily-loaded admin chunk.
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, MESSAGES_COLLECTION } from '../lib/firebase.js';
import { compareExact } from '../lib/verify.js';

const BATCH_LIMIT = 450; // Firestore allows 500 writes per batch.

function requireDb() {
  if (!db) throw new Error("Firebase isn't set up yet. Add your config to src/lib/firebase.js.");
  return db;
}

// title and content are written exactly as received from the form.
export async function createMessage({ title, content, order }) {
  const ref = await addDoc(collection(requireDb(), MESSAGES_COLLECTION), {
    title,
    content,
    order,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return verifyStored(ref, content);
}

export async function updateMessage(id, { title, content }) {
  const ref = doc(requireDb(), MESSAGES_COLLECTION, id);
  await updateDoc(ref, { title, content, updatedAt: serverTimestamp() });
  return verifyStored(ref, content);
}

export function deleteMessage(id) {
  return deleteDoc(doc(requireDb(), MESSAGES_COLLECTION, id));
}

// Writes order = index for every message whose position changed.
export async function saveOrder(orderedMessages) {
  const database = requireDb();
  const changes = orderedMessages
    .map((message, index) => ({ id: message.id, from: message.order, to: index }))
    .filter((change) => change.from !== change.to);

  for (let i = 0; i < changes.length; i += BATCH_LIMIT) {
    const batch = writeBatch(database);
    for (const change of changes.slice(i, i + BATCH_LIMIT)) {
      batch.update(doc(database, MESSAGES_COLLECTION, change.id), { order: change.to });
    }
    await batch.commit();
  }
}

// Re-reads the document from the server (bypassing the local cache) and
// checks the stored content is identical to what was submitted.
async function verifyStored(ref, submitted) {
  try {
    const snap = await getDocFromServer(ref);
    const stored = snap.get('content');
    return { checked: true, ...compareExact(submitted, typeof stored === 'string' ? stored : '') };
  } catch {
    return { checked: false };
  }
}

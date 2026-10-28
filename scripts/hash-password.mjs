// Usage: npm run hash -- "your-new-password"
//    or: node scripts/hash-password.mjs "your-new-password"
// Prints the SHA-256 hex digest to paste into src/config/auth.js.
import { createHash } from 'node:crypto';

const password = process.argv[2];

if (password === undefined) {
  console.error('Usage: npm run hash -- "your-new-password"');
  process.exit(1);
}

// No trimming: the hash must match exactly what will be typed in the login field.
console.log(createHash('sha256').update(password, 'utf8').digest('hex'));

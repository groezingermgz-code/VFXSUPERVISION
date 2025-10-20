import 'dotenv/config';
import crypto from 'crypto';
import { createInvite } from '../server/db.js';

const email = (process.argv[2] || '').toLowerCase();
const name = process.argv[3] || '';
if (!email || !/.+@.+\..+/.test(email)) {
  console.error('Usage: node scripts/create-invite.mjs <email> [name]');
  process.exit(1);
}

const token = crypto.randomBytes(24).toString('hex');
const invite = createInvite({ email, name, invited_by: 0, token });

const base = process.env.APP_BASE_URL || 'http://localhost:5173';
const link = `${base}/accept-invite?token=${invite.token}`;

console.log('Invite created');
console.log(' email:', email);
console.log(' token:', invite.token);
console.log(' link :', link);
import 'dotenv/config';
import nodemailer from 'nodemailer';

const host = process.argv[2];
if (!host) {
  console.error('Usage: node scripts/smtp-probe-host.mjs <host>');
  process.exit(1);
}

const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
if (!user || !pass) {
  console.error('Missing SMTP_USER/SMTP_PASS in environment.');
  process.exit(1);
}

async function verify(host, port, secure) {
  const tx = nodemailer.createTransport({ host, port, secure, auth: { user, pass }, authMethod: 'LOGIN' });
  try {
    await tx.verify();
    console.log(`[VERIFY OK] host=${host} port=${port} secure=${secure}`);
  } catch (err) {
    console.log(`[VERIFY FAIL] host=${host} port=${port} secure=${secure}`);
    console.log(err && err.message ? err.message : err);
  }
}

(async () => {
  console.log(`Probing host: ${host} with user=${user}`);
  await verify(host, 465, true);
  await verify(host, 587, false);
})();
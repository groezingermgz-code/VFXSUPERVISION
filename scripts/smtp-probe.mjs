import 'dotenv/config';
import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.MAIL_FROM || user;

async function tryConfig({ port, secure }) {
  const tx = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  try {
    await tx.verify();
    console.log(`VERIFY OK (port=${port}, secure=${secure})`);
  } catch (e) {
    console.log(`VERIFY FAIL (port=${port}, secure=${secure})`, e?.code || '', e?.responseCode || '', e?.response || e?.message);
  }
}

(async () => {
  console.log('SMTP probe using:', { host, user });
  await tryConfig({ port: 465, secure: true });
  await tryConfig({ port: 587, secure: false });
})();
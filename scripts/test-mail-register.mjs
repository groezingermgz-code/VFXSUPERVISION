const url = 'http://localhost:5174/api/auth/register';
const body = { name: 'SMTP Test', email: 'info@der-automat.com', password: 'Test1234!' };

(async () => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', text);
  } catch (err) {
    console.error('Error:', err);
  }
})();
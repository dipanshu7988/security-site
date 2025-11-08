// functions/contact.js
// This is your backend function for handling contact form submissions.

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // Load environment variables (you’ll set these in Netlify)
  const SUPA_URL = process.env.SUPABASE_URL;
  const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPA_URL || !SUPA_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server not configured properly' }) };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch (e) { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  if (!body.name || !body.email || !body.message) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing fields' }) };
  }

  const payload = {
    name: body.name,
    email: body.email,
    message: body.message,
    created_at: new Date().toISOString()
  };

  const res = await fetch(`${SUPA_URL}/rest/v1/contacts`, {
    method: 'POST',
    headers: {
      'apikey': SUPA_KEY,
      'Authorization': `Bearer ${SUPA_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    return { statusCode: 500, body: JSON.stringify({ error: 'Database error', details: text }) };
  }

  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
/**
 * refresh-token.js
 *
 * Run this ONCE before starting the project each session:
 *   node refresh-token.js
 *
 * Fetches a fresh token from the Afford Medical evaluation service and
 * writes it into backend/.env and frontend/.env automatically.
 */

const fs = require('fs');
const path = require('path');

const AUTH_URL     = 'http://4.224.186.213/evaluation-service/auth';
const BACKEND_ENV  = path.join(__dirname, 'backend',  '.env');
const FRONTEND_ENV = path.join(__dirname, 'frontend', '.env');

function parseEnv(filePath) {
  const obj = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const idx = line.indexOf('=');
    if (idx > 0) obj[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return obj;
}

function setEnvValue(filePath, key, value) {
  let content = fs.readFileSync(filePath, 'utf8');
  const regex = new RegExp(`^${key}=.*$`, 'm');
  content = regex.test(content)
    ? content.replace(regex, `${key}=${value}`)
    : content + `\n${key}=${value}`;
  fs.writeFileSync(filePath, content, 'utf8');
}

async function main() {
  const env = parseEnv(BACKEND_ENV);

  const payload = {
    email:        env['EMAIL']         || 'e23cseu1716@bennett.edu.in',
    name:         env['FULL_NAME']     || 'kaushal kumar',
    rollNo:       env['ROLL_NO']       || 'e3cseu1716',
    accessCode:   env['ACCESS_CODE']   || 'TfDxgr',
    clientID:     env['CLIENT_ID']     || '4c0a9228-31c2-4525-9435-3cb0e3fdcc0a',
    clientSecret: env['CLIENT_SECRET'] || 'fqUMBbwTAfcpmPWS',
  };

  console.log('[refresh-token] Requesting new token from evaluation service...');
  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[refresh-token] ❌ Auth failed: ${res.status} — ${text}`);
    process.exit(1);
  }

  const data = await res.json();
  const token = data.access_token;
  if (!token) {
    console.error('[refresh-token] ❌ No access_token in response:', JSON.stringify(data));
    process.exit(1);
  }

  setEnvValue(BACKEND_ENV,  'LOG_BEARER_TOKEN',      token);
  setEnvValue(BACKEND_ENV,  'EVALUATION_API_TOKEN',  token);
  setEnvValue(FRONTEND_ENV, 'VITE_LOG_BEARER_TOKEN', token);

  const expDate = data.expires_in
    ? new Date(data.expires_in * 1000).toLocaleString('en-IN')
    : '~15 min';
  console.log(`[refresh-token] ✅ Token refreshed! Expires: ${expDate}`);
  console.log('[refresh-token] Both .env files updated — nodemon will auto-reload.');
}

main().catch((err) => {
  console.error('[refresh-token] Fatal:', err.message);
  process.exit(1);
});

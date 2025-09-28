// Check for required auth envs for local testing with Google OAuth
const required = ['NEXTAUTH_URL', 'NEXTAUTH_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
const missing = required.filter(k => !process.env[k] || process.env[k] === '');
if (missing.length) {
  console.error('Missing required auth envs to run dev authentication: ' + missing.join(', '));
  console.error('Create a .env.local file with these values (see .env.local.example) and restart.');
  process.exit(1);
}
console.log('Dev auth envs present. Starting dev server...');
process.exit(0);

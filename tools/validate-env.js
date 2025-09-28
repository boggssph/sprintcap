// Simple env validator: fails build if any of the watched keys exist and are empty strings
const keysToCheck = [
  'NEXTAUTH_URL',
  'NEXTAUTH_URL_INTERNAL',
  'VERCEL_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

const problems = [];
for (const k of keysToCheck) {
  if (Object.prototype.hasOwnProperty.call(process.env, k) && process.env[k] === '') {
    problems.push(k);
  }
}

if (problems.length) {
  console.error(`Env validation failed: the following env keys are present but empty: ${problems.join(', ')}`);
  console.error('Please remove the empty entries from your env file or set them to a valid value.');
  process.exit(1);
}

console.log('Env validation passed.');
process.exit(0);

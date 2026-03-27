import admin, { ServiceAccount } from 'firebase-admin';

export function initializeFirebaseAdmin() {
  console.log('\n\tINITIALIZE-FIREBASE-ADMIN-PROCESSING\n');

  let serviceAccount: ServiceAccount | undefined;

  // 1. Try to load from individual environment variables
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    const sanitize = (val: string | undefined) =>
      val?.trim().replace(/^"|"$/g, '') || '';

    serviceAccount = {
      projectId: sanitize(process.env.FIREBASE_PROJECT_ID),
      clientEmail: sanitize(process.env.FIREBASE_CLIENT_EMAIL),
      privateKey: sanitize(process.env.FIREBASE_PRIVATE_KEY).replace(
        /\\n/g,
        '\n',
      ),
    } as ServiceAccount;
  }

  // 2. Try to load from environment variable JSON string (recommended for production)
  if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (error) {
      console.error('\tERROR: Failed to parse FIREBASE_SERVICE_ACCOUNT env var as JSON\n');
    }
  }

  // 3. Fallback to local firebase.json (for local development)
  if (!serviceAccount) {
    try {
      // Use dynamic require to avoid build-time errors when the file is missing
      serviceAccount = require('./firebase.json');
    } catch (error) {
      console.error('\tERROR: firebase.json not found and FIREBASE environment variables not set.\n');
      console.log('\tINITIALIZE-FIREBASE-ADMIN-FAILED\n');
      return;
    }
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('\tINITIALIZE-FIREBASE-ADMIN-SUCCESS\n');
  }
}

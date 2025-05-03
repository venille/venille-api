import * as serviceAccount from './firebase.json';
import admin, { ServiceAccount } from 'firebase-admin';

export function initializeFirebaseAdmin() {
  console.log('\n\tINITIALIZE-FIREBASE-ADMIN-PROCESSING\n');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
  });

  console.log('\tINITIALIZE-FIREBASE-ADMIN-SUCCESS\n');
}

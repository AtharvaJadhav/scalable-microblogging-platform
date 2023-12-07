import admin from 'firebase-admin';

export async function verifyGoogleToken(idToken: string) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Google token', error);
    return null;
  }
}

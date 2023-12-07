import admin from 'firebase-admin';
const serviceAccount = require('../config/firebase-adminsdk.json');


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export default admin;

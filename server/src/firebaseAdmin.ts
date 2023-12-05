import admin from 'firebase-admin';
// import serviceAccount from './config/firebase-adminsdk.json';
const serviceAccount = require('./config/firebase-adminsdk.json');


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export default admin;

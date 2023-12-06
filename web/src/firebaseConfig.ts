import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
    apiKey: "AIzaSyDPEVhWt27xcOBi5fr38oZ_SErOyErDhsY",
    authDomain: "lireddit-22e53.firebaseapp.com",
    projectId: "lireddit-22e53",
    storageBucket: "lireddit-22e53.appspot.com",
    messagingSenderId: "792248251512",
    appId: "1:792248251512:web:ec2a78f4f1c67781fb698d",
    measurementId: "G-HW9BP0QNHK"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  
  export { app, auth };
// eslint-disable-next-line import/no-extraneous-dependencies
import * as admin from 'firebase-admin';

const firebaseConfig = {
  apiKey: 'AIzaSyBg5hXu0UORYEMPkj9SXkgtCObtXEj-fCU',
  authDomain: 'journey-reviewer.firebaseapp.com',
  projectId: 'journey-reviewer',
  storageBucket: 'journey-reviewer.appspot.com',
  messagingSenderId: '487805099450',
  appId: '1:487805099450:web:c8a2dcef7d61d16103d183',
  measurementId: 'G-8PNMMGPVP1',
};

const firebaseAdmin = admin.initializeApp(firebaseConfig);

export default firebaseAdmin;

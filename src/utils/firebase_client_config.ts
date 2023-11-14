// eslint-disable-next-line import/no-extraneous-dependencies
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyBg5hXu0UORYEMPkj9SXkgtCObtXEj-fCU',
  authDomain: 'journey-reviewer.firebaseapp.com',
  projectId: 'journey-reviewer',
  storageBucket: 'journey-reviewer.appspot.com',
  messagingSenderId: '487805099450',
  appId: '1:487805099450:web:c8a2dcef7d61d16103d183',
  measurementId: 'G-8PNMMGPVP1',
};

const firebaseClient = initializeApp(firebaseConfig);

export default firebaseClient;

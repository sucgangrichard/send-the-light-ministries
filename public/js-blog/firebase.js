let firebaseConfig = {
  apiKey: window.ENV_FIREBASE_API_KEY,
  authDomain: window.ENV_FIREBASE_AUTH_DOMAIN,
  projectId: window.ENV_FIREBASE_PROJECT_ID,
  storageBucket: window.ENV_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: window.ENV_FIREBASE_MESSAGING_SENDER_ID,
  appId: window.ENV_FIREBASE_APP_ID
};
firebase.initializeApp(firebaseConfig);
firebase.initializeApp(firebaseConfig);
let db = firebase.firestore();
let auth = firebase.auth();
const logoutUser = () => {
  auth.signOut();
  location.reload();
}
let firebaseConfig = {
  apiKey: window.ENV_FIREBASE_API_KEY || "AIzaSyCtn80g5ku5dtY55GctR_3QEuPJwVg_FEM",
  authDomain: window.ENV_FIREBASE_AUTH_DOMAIN || "stlp-website.firebaseapp.com",
  projectId: window.ENV_FIREBASE_PROJECT_ID || "stlp-website", 
  storageBucket: window.ENV_FIREBASE_STORAGE_BUCKET || "stlp-website.firebasestorage.app",
  messagingSenderId: window.ENV_FIREBASE_MESSAGING_SENDER_ID || "588843257956",
  appId: window.ENV_FIREBASE_APP_ID || "1:588843257956:web:fa81b308df6f46b22f4f71"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let db = firebase.firestore();
let auth = firebase.auth();

// Add error handling for Firebase initialization
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('User is signed in');
  } else {
    console.log('No user is signed in');
  }
}, (error) => {
  console.error('Auth state change error:', error);
});

const logoutUser = () => {
  auth.signOut();
  location.reload();
}
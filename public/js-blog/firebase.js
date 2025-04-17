let firebaseConfig = {
  apiKey: "AIzaSyBm3o7PpVFlpdld4ih-6ZpoL-fXIZOf0A8",
  authDomain: "stlp-project-e347f.firebaseapp.com",
  projectId: "stlp-project-e347f",
  storageBucket: "stlp-project-e347f.firebasestorage.app",
  messagingSenderId: "187979954654",
  appId: "1:187979954654:web:2101a212b962fb26d6054f"
};
firebase.initializeApp(firebaseConfig);
firebase.initializeApp(firebaseConfig);
let db = firebase.firestore();
let auth = firebase.auth();
const logoutUser = () => {
  auth.signOut();
  location.reload();
}
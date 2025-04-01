
let firebaseConfig = {

    apiKey: "AIzaSyCtn80g5ku5dtY55GctR_3QEuPJwVg_FEM",
  authDomain: "stlp-website.firebaseapp.com",
  projectId: "stlp-website",
  storageBucket: "stlp-website.firebasestorage.app",
  messagingSenderId: "588843257956",
  appId: "1:588843257956:web:fa81b308df6f46b22f4f71"
};


firebase.initializeApp(firebaseConfig);

let db = firebase.firestore();


let auth = firebase.auth();



const logoutUser = () => {
    auth.signOut();
    location.reload();
}
// Your web app's Firebase configuration
let firebaseConfig = {
    // apiKey: "AIzaSyDjoeZPjgeTdu03Sf2ZjWoBMm9cu5oTGU0",
    // authDomain: "blogging-website-56dad.firebaseapp.com",
    // projectId: "blogging-website-56dad",
    // storageBucket: "blogging-website-56dad.firebasestorage.app",
    // messagingSenderId: "466623775314",
    // appId: "1:466623775314:web:b7c88426e0423a7fde558b"

    apiKey: "AIzaSyCtn80g5ku5dtY55GctR_3QEuPJwVg_FEM",
  authDomain: "stlp-website.firebaseapp.com",
  projectId: "stlp-website",
  storageBucket: "stlp-website.firebasestorage.app",
  messagingSenderId: "588843257956",
  appId: "1:588843257956:web:fa81b308df6f46b22f4f71"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let db = firebase.firestore();

//fordashboard
let auth = firebase.auth();

//fromdashboardfiles

const logoutUser = () => {
    auth.signOut();
    location.reload();
}
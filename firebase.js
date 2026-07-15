import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB_rINiMOgncgjzELwcnRgXiy_w1llZL28",
  authDomain: "palabra-maestra-4901c.firebaseapp.com",
  projectId: "palabra-maestra-4901c",
  storageBucket: "palabra-maestra-4901c.firebasestorage.app",
  messagingSenderId: "1006984116243",
  appId: "1:1006984116243:web:2afd7b804a868a94aba7e6"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export { app };

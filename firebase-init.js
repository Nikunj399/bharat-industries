/* ============================================================
   Firebase initialization — shared by every page.
   This file is imported by index.html, vessel-agitator.html, etc.
   as: import { auth, db } from './firebase-init.js';
   Do NOT add <script> tags in here — this is a plain .js module,
   not an HTML file.
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAUTcER4k06zPQATNgDGSc0fKmTPssmTMA",
  authDomain: "bharat-industries-28586.firebaseapp.com",
  projectId: "bharat-industries-28586",
  storageBucket: "bharat-industries-28586.firebasestorage.app",
  messagingSenderId: "77089263715",
  appId: "1:77089263715:web:3f3f2a0bcda940705de856"
};

const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

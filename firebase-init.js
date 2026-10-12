/* ============================================================
   Firebase initialization — shared by every page.
   This file is imported by index.html, vessel-agitator.html, etc.
   as: import { auth, db, mintQuotationNumber } from './firebase-init.js';
   Do NOT add <script> tags in here — this is a plain .js module,
   not an HTML file.
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import {
  getFirestore, doc, runTransaction, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

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

/* ============================================================
   Quotation numbering — shared across every calculator type so
   there's one continuous BI/25-26/001, 002, 003... sequence,
   not a separate series per calculator.

   Numbers are only minted (and the counter only incremented)
   right when an estimate is actually saved for the first time —
   never just from opening a blank estimate. Abandoning an
   unsaved estimate never burns a number; it stays available for
   whoever saves next. Concurrent saves are made safe by
   Firestore's runTransaction, which retries automatically if two
   people save at the same moment.

   The counter document lives at counters/{PREFIX}-{FY}, e.g.
   counters/BI-25-26, and resets to 001 automatically each new
   Indian financial year (Apr–Mar).
   ============================================================ */
function financialYearKey(d){
  d = d || new Date();
  var y = d.getFullYear();
  var m = d.getMonth(); // 0 = Jan ... 3 = Apr
  var startYear = m >= 3 ? y : y - 1;
  var endYear = startYear + 1;
  return String(startYear).slice(-2) + '-' + String(endYear).slice(-2);
}

export async function mintQuotationNumber(prefix){
  prefix = prefix || 'BI';
  var fy = financialYearKey(new Date());
  var counterRef = doc(db, 'counters', prefix + '-' + fy);
  var newNumber;
  await runTransaction(db, async function(tx){
    var snap = await tx.get(counterRef);
    var last = snap.exists() ? (snap.data().lastNumber || 0) : 0;
    var next = last + 1;
    tx.set(counterRef, { lastNumber: next, fy: fy, updatedAt: serverTimestamp() }, { merge: true });
    newNumber = next;
  });
  var padded = String(newNumber).padStart(3, '0');
  return prefix + '/' + fy + '/' + padded;
}

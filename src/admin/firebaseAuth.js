import { getApps, initializeApp } from "firebase/app";
import { doc, getFirestore, serverTimestamp, setDoc, writeBatch } from "firebase/firestore";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { db } from "../firebase"; // importing this also initializes the Firebase app

export const auth = getAuth();

/*
  One-time first-run setup: creates the very first admin account.
  The Firestore rules only allow this while the "setup/done" document does not exist,
  and the same batch creates that document, so it can only ever happen once.
*/
export async function createFirstAdmin({ name, email, password }) {
  const existing = getApps().find((a) => a.name === "staff-creator");
  const secondary = existing || initializeApp(auth.app.options, "staff-creator");
  const secondaryAuth = getAuth(secondary);
  const secondaryDb = getFirestore(secondary);
  const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
  const uid = cred.user.uid;
  try {
    const batch = writeBatch(secondaryDb);
    batch.set(doc(secondaryDb, "staff", uid), {
      name,
      email,
      role: "admin",
      createdBy: uid,
      createdAt: serverTimestamp(),
    });
    batch.set(doc(secondaryDb, "setup", "done"), { by: uid, at: serverTimestamp() });
    await batch.commit();
  } finally {
    await signOut(secondaryAuth);
  }
  await signInWithEmailAndPassword(auth, email, password);
}

/*
  Creates a login for a new staff member WITHOUT signing the current admin out.
  A second, temporary Firebase app instance is used for the sign-up, then the
  staff document (which is what grants access in the Firestore rules) is saved.
*/
export async function createStaffAccount({ name, email, password, role, createdBy }) {
  const existing = getApps().find((a) => a.name === "staff-creator");
  const secondary = existing || initializeApp(auth.app.options, "staff-creator");
  const secondaryAuth = getAuth(secondary);
  const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
  const uid = cred.user.uid;
  await signOut(secondaryAuth);
  await setDoc(doc(db, "staff", uid), {
    name,
    email,
    role,
    createdBy,
    createdAt: serverTimestamp(),
  });
}

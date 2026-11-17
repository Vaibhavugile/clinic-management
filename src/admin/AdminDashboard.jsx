
import "./styles/base.css";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import { db } from "../firebase";
import { auth } from "./firebaseAuth";
import { Login, AccessDenied } from "./pages/Login";
import { Dashboard } from "./Dashboard";

export default function AdminDashboard() {
  const [user, setUser] = useState(undefined);
  const [staff, setStaff] = useState(undefined);
  const [staffError, setStaffError] = useState("");

  // Listen for Firebase authentication changes.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setStaff(undefined);
        setStaffError("");
      },
      (error) => {
        console.error("Authentication check failed:", error);
        setUser(null);
        setStaff(null);
        setStaffError("Unable to verify your sign-in. Please try again.");
      }
    );

    return unsubscribe;
  }, []);

  // Verify the signed-in user's staff document.
  useEffect(() => {
    if (!user) {
      setStaff(undefined);
      return undefined;
    }

    setStaff(undefined);
    setStaffError("");

    const staffRef = doc(db, "staff", user.uid);

    const unsubscribe = onSnapshot(
      staffRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setStaff({
            id: snapshot.id,
            ...snapshot.data(),
          });
        } else {
          setStaff(null);
        }
      },
      (error) => {
        console.error("Reading staff profile failed:", error);
        setStaff(null);
        setStaffError(
          "We couldn't verify your staff account. Please contact your administrator."
        );
      }
    );

    return unsubscribe;
  }, [user]);

  // Initial authentication / staff verification screen.
  if (user === undefined || (user && staff === undefined)) {
    return (
      <div className="ad-shell ad-center">
        <div className="ad-auth-loading">
          <div className="ad-loading-logo">A</div>
          <div className="ad-loading-spinner" />
          <h2>Preparing your workspace</h2>
          <p className="ad-muted">
            Securely verifying your Anand Dental account...
          </p>
        </div>
      </div>
    );
  }

  // Not signed in.
  if (!user) {
    return <Login />;
  }

  // Signed in, but staff verification failed or no staff record exists.
  if (!staff) {
    return <AccessDenied user={user} error={staffError} />;
  }

  // Verified staff member.
  return <Dashboard user={user} staff={staff} />;
}

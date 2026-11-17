// Sign-in screen (premium split layout) with first-run admin setup, plus the "No access" screen.
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
} from "firebase/firestore";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  CalendarDays,
  Users,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { db } from "../../firebase";
import { auth, createFirstAdmin } from "../firebaseAuth";
import { ToothMark } from "../components/ToothMark";
import "./Login.css";

const FEATURES = [
  { icon: CalendarDays, title: "Smart scheduling", text: "Same-time clash alerts and easy postponing." },
  { icon: Users, title: "Patients and follow-ups", text: "Records, reminders and billing in one place." },
  { icon: ShieldCheck, title: "Staff-only access", text: "Every sign-in is checked before data opens." },
];

// Left brand panel + right form+
// + panel (stacked on phones)
function AuthShell({ title, subtitle, children }) {
  return (
    <div className="ad-shell ad-auth">
      <div className="ad-auth-art">
        <div className="ad-auth-brand">
          <span className="ad-logo ad-logo-lg">
            <ToothMark size={26} />
          </span>
          <div>
            <p className="ad-auth-brand-name">Anand Dental</p>
            <p className="ad-auth-brand-sub">Clinic &amp; Implant Center</p>
          </div>
        </div>

        <div className="ad-auth-copy">
          <h2>Run the clinic with calm.</h2>
          <p>Appointments, patients, billing and follow-ups, always in sync for your whole team.</p>
        </div>

        <ul className="ad-auth-features">
          {FEATURES.map(({ icon: Icon, title: t, text }) => (
            <li key={t}>
              <span className="ad-auth-feature-icon">
                <Icon size={18} />
              </span>
              <span>
                <strong>{t}</strong>
                <small>{text}</small>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="ad-auth-panel">
        <div className="ad-auth-card">
          <span className="ad-logo ad-auth-mobile-logo">
            <ToothMark size={22} />
          </span>
          <h1>{title}</h1>
          <p className="ad-muted ad-auth-sub">{subtitle}</p>
          {children}
        </div>
        <p className="ad-auth-foot">Anand Dental Clinic &amp; Implant Center · Staff area</p>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, children }) {
  return (
    <label className="ad-field">
      <span className="ad-field-label">{label}</span>
      <span className="ad-field-box">
        <Icon size={18} />
        {children}
      </span>
    </label>
  );
}

function PasswordInput({ value, onChange, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder="Enter your password"
        required
      />
      <button
        type="button"
        className="ad-field-eye"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </>
  );
}

export function Login() {
  const [mode, setMode] = useState("signin"); // "signin" | "setup"
  const [setupOpen, setSetupOpen] = useState(false); // true only until the first admin exists
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "setup", "done"))
      .then((snap) => setSetupOpen(!snap.exists()))
      .catch(() => setSetupOpen(false));
  }, []);

  const switchMode = (m) => {
    setMode(m);
    setError("");
    setInfo("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      const messages = {
        "auth/invalid-credential": "Wrong email or password.",
        "auth/invalid-email": "Enter a valid email address.",
        "auth/too-many-requests": "Too many attempts. Try again in a few minutes.",
        "auth/operation-not-allowed": "Email/password sign-in is not enabled in Firebase Authentication.",
      };
      setError(messages[err.code] || `Could not sign in (${err.code || err.message}).`);
      setBusy(false);
    }
  };

  const setup = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await createFirstAdmin({ name: name.trim(), email: email.trim().toLowerCase(), password });
    } catch (err) {
      const messages = {
        "auth/email-already-in-use": "That email already has an account. Sign in instead, or use a different email.",
        "auth/invalid-email": "Enter a valid email address.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/operation-not-allowed": "Email/password sign-in is not enabled in Firebase Authentication.",
        "permission-denied": "Setup is already complete. Ask an existing admin to add you from the Staff page.",
      };
      setError(messages[err.code] || `Could not create the account (${err.code || err.message}).`);
      setBusy(false);
    }
  };

  const forgot = async () => {
    setInfo("");
    if (!email.trim()) {
      setError("Enter your email first, then click Forgot password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setError("");
      setInfo("If an account exists for that email, a reset link has been sent.");
    } catch (err) {
      setError(`Could not send the reset email (${err.code || err.message}).`);
    }
  };

  if (mode === "setup") {
    return (
      <AuthShell title="Create the admin account" subtitle="One-time setup. This account manages the dashboard and adds other staff.">
        <form className="ad-auth-form" onSubmit={setup}>
          <Field icon={User} label="Full name">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
          </Field>
          <Field icon={Mail} label="Email">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" placeholder="you@clinic.com" required />
          </Field>
          <Field icon={Lock} label="Password (min 6 characters)">
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </Field>
          <Field icon={Lock} label="Confirm password">
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" placeholder="Repeat the password" required />
          </Field>
          {error && <p className="ad-form-error" role="alert">{error}</p>}
          <button className="ad-btn ad-btn-primary ad-auth-submit" type="submit" disabled={busy}>
            {busy ? "Creating..." : "Create admin account"}
          </button>
          <button type="button" className="ad-link ad-link-center" onClick={() => switchMode("signin")}>
            Back to sign in
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in with your clinic staff account to continue.">
      <form className="ad-auth-form" onSubmit={submit}>
        <Field icon={Mail} label="Email">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" placeholder="you@clinic.com" required />
        </Field>
        <Field icon={Lock} label="Password">
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </Field>
        {error && <p className="ad-form-error" role="alert">{error}</p>}
        {info && <p className="ad-auth-info" role="status">{info}</p>}
        <button className="ad-btn ad-btn-primary ad-auth-submit" type="submit" disabled={busy}>
          {busy ? "Signing in..." : "Sign in"}
        </button>
        <button type="button" className="ad-link ad-link-center" onClick={forgot}>
          Forgot password?
        </button>
        {setupOpen && (
          <button type="button" className="ad-auth-setup" onClick={() => switchMode("setup")}>
            First time here? Create the admin account
          </button>
        )}
      </form>
    </AuthShell>
  );
}

export function AccessDenied({ user }) {
  return (
    <AuthShell title="No access" subtitle={`${user.email} is signed in, but this account has not been added as clinic staff. Ask an admin to add you.`}>
      <div className="ad-auth-form">
        <button className="ad-btn ad-btn-primary ad-auth-submit" onClick={() => signOut(auth)}>
          Sign out
        </button>
      </div>
    </AuthShell>
  );
}

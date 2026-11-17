// Staff page (admin only): add staff, change roles, remove access.
import { useMemo, useState } from "react";
import {
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  Plus,
} from "lucide-react";
import { db } from "../../firebase";
import { auth, createStaffAccount } from "../firebaseAuth";
import { isoDate, fmtDate, initials } from "../utils";
import { useCollection } from "../hooks/useCollection";
import { Empty, Modal, SaveButtons } from "../components/Common";
import "./Staff.css";

function StaffForm({ onSave, onClose }) {
  const [f, setF] = useState({ name: "", email: "", password: "", role: "staff" });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const valid = f.name.trim() && /\S+@\S+\.\S+/.test(f.email) && f.password.length >= 6;

  const save = async () => {
    setSaving(true);
    const ok = await onSave({ ...f, name: f.name.trim(), email: f.email.trim().toLowerCase() });
    if (!ok) setSaving(false);
  };

  return (
    <Modal
      title="Add staff member"
      onClose={onClose}
      footer={<SaveButtons onClose={onClose} onSave={save} disabled={!valid} saving={saving} label="Create account" />}
    >
      <div className="ad-form">
        <label>
          Full name
          <input value={f.name} onChange={set("name")} placeholder="e.g. Reception desk" />
        </label>
        <label>
          Email
          <input type="email" value={f.email} onChange={set("email")} placeholder="name@example.com" autoComplete="off" />
        </label>
        <label>
          Temporary password (min 6 characters)
          <input value={f.password} onChange={set("password")} autoComplete="off" />
        </label>
        <label>
          Role
          <select value={f.role} onChange={set("role")}>
            <option value="staff">Staff (everything except managing staff)</option>
            <option value="admin">Admin (can also manage staff)</option>
          </select>
        </label>
      </div>
      <p className="ad-muted ad-modal-note">
        Share the temporary password with them. They can change it any time with "Forgot password" on the sign-in screen.
      </p>
    </Modal>
  );
}

export function StaffPage({ me, flash }) {
  const col = useCollection("staff");
  const [adding, setAdding] = useState(false);
  const rows = useMemo(
    () => [...col.rows].sort((a, b) => (a.name || "").localeCompare(b.name || "")),
    [col.rows]
  );

  const run = async (fn, okMsg) => {
    try {
      await fn();
      flash(okMsg);
    } catch (e) {
      console.error(e);
      flash(`Could not complete (${e.code || e.message}).`, true);
    }
  };

  const create = async (f) => {
    try {
      await createStaffAccount({ ...f, createdBy: me.uid });
      flash(`${f.name} can now sign in.`);
      setAdding(false);
      return true;
    } catch (e) {
      console.error(e);
      const messages = {
        "auth/email-already-in-use": "That email already has an account. Use a different email, or delete the old user in Firebase Authentication first.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/invalid-email": "Enter a valid email address.",
        "permission-denied": "Only an admin can add staff. Check your Firestore rules.",
      };
      flash(messages[e.code] || `Could not add staff (${e.code || e.message}).`, true);
      return false;
    }
  };

  const remove = (s) => {
    if (!window.confirm(`Remove access for ${s.name}? They will no longer be able to open the dashboard.`)) return;
    run(() => deleteDoc(doc(db, "staff", s.id)), "Access removed.");
  };

  return (
    <section className="ad-card">
      <div className="ad-toolbar ad-toolbar-end">
        <button className="ad-btn ad-btn-primary" onClick={() => setAdding(true)}>
          <Plus size={16} /> Add staff
        </button>
      </div>

      {col.loading ? (
        <Empty text="Loading staff..." />
      ) : rows.length === 0 ? (
        <Empty text="No staff added yet." />
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Added</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const isMe = s.id === me.uid;
                return (
                  <tr key={s.id}>
                    <td data-label="Name">
                      <div className="ad-person">
                        <span className="ad-avatar">{initials(s.name)}</span>
                        <p className="ad-strong">{s.name}{isMe ? " (you)" : ""}</p>
                      </div>
                    </td>
                    <td data-label="Email">{s.email}</td>
                    <td data-label="Role">
                      <select
                        value={s.role || "staff"}
                        disabled={isMe}
                        aria-label={`Role for ${s.name}`}
                        onChange={(e) => run(() => updateDoc(doc(db, "staff", s.id), { role: e.target.value }), "Role updated.")}
                      >
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td data-label="Added">{s.createdAt?.seconds ? fmtDate(isoDate(new Date(s.createdAt.seconds * 1000))) : "-"}</td>
                    <td data-label="Action">
                      <div className="ad-actions">
                        <button
                          className="ad-btn ad-btn-sm ad-btn-soft"
                          onClick={() => run(() => sendPasswordResetEmail(auth, s.email), `Reset email sent to ${s.email}.`)}
                        >
                          Send password reset
                        </button>
                        {!isMe && (
                          <button className="ad-btn ad-btn-sm ad-btn-ghost" onClick={() => remove(s)}>
                            Remove access
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {adding && <StaffForm onSave={create} onClose={() => setAdding(false)} />}
    </section>
  );
}

import { useState } from "react";
import { digits } from "../utils";
import { Modal, SaveButtons } from "../components/Common";
import "./forms.css";

// Edit details popup: contact details (name, phone, email) plus the extra clinic details.
// Saving the contact details also updates every appointment, follow-up and invoice of this patient.
export function ProfileForm({ patient, profile, onSave, onClose }) {
  const [f, setF] = useState({
    name: patient.name || "",
    phone: patient.phone || "",
    email: patient.email || "",
    age: profile?.age ?? "",
    gender: profile?.gender || "",
    address: profile?.address || "",
    medicalHistory: profile?.medicalHistory || "",
    notes: profile?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  // A patient who already has a phone number must keep a valid 10 digit number
  const phoneOk = f.phone.trim() === "" ? !patient.phone : digits(f.phone).length === 10;
  const emailOk = f.email.trim() === "" || /\S+@\S+\.\S+/.test(f.email.trim());
  const valid = f.name.trim() && phoneOk && emailOk;
  const contactChanged =
    f.name.trim() !== (patient.name || "") ||
    f.phone.trim() !== (patient.phone || "") ||
    f.email.trim() !== (patient.email || "");

  const save = async () => {
    setSaving(true);
    const ok = await onSave({
      ...f,
      name: f.name.trim(),
      phone: f.phone.trim(),
      email: f.email.trim(),
      age: f.age === "" ? "" : Number(f.age),
    });
    if (!ok) setSaving(false);
  };

  return (
    <Modal
      title={`Edit details for ${patient.name}`}
      onClose={onClose}
      footer={<SaveButtons onClose={onClose} onSave={save} disabled={!valid} saving={saving} label="Save details" />}
    >
      {contactChanged && (
        <p className="ad-muted ad-modal-note">
          Name, phone and email will also be updated in all of this patient's appointments, follow-ups and invoices.
        </p>
      )}
      <div className="ad-form ad-form-plain">
        <label>
          Full name
          <input value={f.name} onChange={set("name")} placeholder="Full name" />
        </label>
        <label>
          Phone (10 digits)
          <input value={f.phone} onChange={set("phone")} inputMode="numeric" maxLength={14} placeholder="98XXXXXXXX" />
        </label>
        <label className="ad-span">
          Email
          <input type="email" value={f.email} onChange={set("email")} placeholder="name@example.com" />
        </label>
        <label>
          Age
          <input type="number" min="0" max="120" value={f.age} onChange={set("age")} />
        </label>
        <label>
          Gender
          <select value={f.gender} onChange={set("gender")}>
            <option value="">Not set</option>
            <option>Female</option>
            <option>Male</option>
            <option>Other</option>
          </select>
        </label>
        <label className="ad-span">
          Address
          <input value={f.address} onChange={set("address")} placeholder="Area, city" />
        </label>
        <label className="ad-span">
          Medical history and allergies
          <textarea rows={3} value={f.medicalHistory} onChange={set("medicalHistory")} placeholder="Allergies, ongoing conditions, medicines" />
        </label>
        <label className="ad-span">
          Clinic notes
          <textarea rows={4} value={f.notes} onChange={set("notes")} placeholder="Anything the team should remember about this patient" />
        </label>
      </div>
    </Modal>
  );
}

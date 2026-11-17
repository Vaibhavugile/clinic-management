// Popup forms for follow-ups: add a follow-up, and book a follow-up as an appointment.
import { useState } from "react";
import { todayISO, addDays, fmtDate, digits, withCurrent, findClashes } from "../utils";
import { Modal, SaveButtons, ClashWarning, HoursNotice } from "../components/Common";
import "./forms.css";

export function FollowUpForm({ patients, initial, onSave, onClose }) {
  const [f, setF] = useState({
    patient: initial?.name || "",
    phone: initial?.phone || "",
    reason: "",
    due: addDays(7),
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const valid = f.patient.trim() && digits(f.phone).length === 10 && f.due; // reason is optional

  const pick = (e) => {
    const p = patients.find((x) => x.key === e.target.value);
    if (p) setF({ ...f, patient: p.name, phone: p.phone });
  };
  const save = async () => {
    setSaving(true);
    const ok = await onSave({ ...f, patient: f.patient.trim(), reason: f.reason.trim() });
    if (!ok) setSaving(false);
  };

  return (
    <Modal
      title={initial ? `New follow-up for ${initial.name}` : "New follow-up"}
      onClose={onClose}
      footer={<SaveButtons onClose={onClose} onSave={save} disabled={!valid} saving={saving} label="Save follow-up" />}
    >
      <div className="ad-form">
        {patients.length > 0 && !initial && (
          <label>
            Pick an existing patient (optional)
            <select defaultValue="" onChange={pick}>
              <option value="">Select patient</option>
              {patients.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}
            </select>
          </label>
        )}
        <label>
          Patient name
          <input value={f.patient} onChange={set("patient")} placeholder="Full name" readOnly={Boolean(initial)} />
        </label>
        <label>
          Phone (10 digits)
          <input value={f.phone} onChange={set("phone")} inputMode="numeric" maxLength={14} placeholder="98XXXXXXXX" readOnly={Boolean(initial)} />
        </label>
        <label>
          Reason (optional)
          <input value={f.reason} onChange={set("reason")} placeholder="e.g. RCT 2nd sitting" />
        </label>
        <label>
          Due date
          <input type="date" value={f.due} onChange={set("due")} />
        </label>
        <div className="ad-quick">
          {[["1 week", 7], ["1 month", 30], ["3 months", 90], ["6 months", 180]].map(([label, n]) => (
            <button type="button" key={label} className="ad-btn ad-btn-sm ad-btn-soft" onClick={() => setF({ ...f, due: addDays(n) })}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

// Turns a follow-up into a real appointment: choose doctor, treatment, date and time.
export function BookFollowUpForm({ followup, patient, appointments, doctors, doctorHours, treatments, onSave, onClose }) {
  const defaultTreatment = patient?.lastTreatment || treatments[0]?.name || "";
  const [f, setF] = useState({
    doctor: "",
    treatment: defaultTreatment,
    date: followup.due && followup.due > todayISO() ? followup.due : todayISO(),
    time: "10:00",
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const treatmentOptions = withCurrent(treatments.map((t) => t.name), defaultTreatment);
  const doctor = f.doctor || doctors[0] || "";
  const treatment = f.treatment || treatmentOptions[0] || "";
  const clashes = findClashes(appointments, f.date, f.time, doctor);
  const inPast = f.date < todayISO();

  const save = async () => {
    if (clashes.length > 0) return;
    setSaving(true);
    const ok = await onSave({ ...f, doctor, treatment });
    if (!ok) setSaving(false);
  };

  return (
    <Modal
      title={`Book ${followup.patient}`}
      onClose={onClose}
      footer={
        <>
          {clashes.length > 0 && (
            <div className="ad-warn ad-confirm-footer-warning" role="alert">
              <p className="ad-strong">⚠ This time slot is already allocated!</p>
              <p>
                {doctor} already has an appointment on {fmtDate(f.date)} at {f.time}. Please choose another time.
              </p>
              <ul>
                {clashes.map((c) => (
                  <li key={c.id}>{c.patient} · {c.treatment}</li>
                ))}
              </ul>
            </div>
          )}
          <SaveButtons
            onClose={onClose}
            onSave={save}
            disabled={!doctor || !treatment || !f.date || !f.time || inPast || clashes.length > 0}
            saving={saving}
            label="Add to appointments"
          />
        </>
      }
    >
      <p className="ad-muted ad-modal-note">
        {followup.reason ? `${followup.reason} · ` : "Follow-up · "}due {fmtDate(followup.due)}
      </p>
      {doctors.length === 0 && (
        <p className="ad-form-error ad-modal-note">
          No doctors found. An admin needs to add them in Clinic setup first.
        </p>
      )}
      {inPast && <p className="ad-form-error ad-modal-note">Pick today or a future date.</p>}
      <ClashWarning clashes={clashes} date={f.date} time={f.time} doctor={doctor} />
      <HoursNotice doctor={doctor} hours={doctorHours?.[doctor]} date={f.date} time={f.time} />
      <div className="ad-form ad-form-plain">
        <label>
          Date
          <input type="date" min={todayISO()} value={f.date} onChange={set("date")} />
        </label>
        <label>
          Time
          <input type="time" value={f.time} onChange={set("time")} />
        </label>
        <label className="ad-span">
          Doctor
          <select value={doctor} onChange={set("doctor")}>
            {doctors.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
        <label className="ad-span">
          Treatment
          <select value={treatment} onChange={set("treatment")}>
            {treatmentOptions.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
      </div>
    </Modal>
  );
}

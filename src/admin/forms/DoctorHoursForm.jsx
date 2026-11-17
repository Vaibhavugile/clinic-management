// Popup to set a doctor's working days and hours (shown in Clinic setup).
import { useState } from "react";
import { DAY_NAMES, DAY_ORDER, DEFAULT_HOURS } from "../utils";
import { Modal, SaveButtons } from "../components/Common";
import "./forms.css";

export function DoctorHoursForm({ doctor, onSave, onClose }) {
  const start = doctor.hours || DEFAULT_HOURS;
  const [days, setDays] = useState(start.days);
  const [from, setFrom] = useState(start.start);
  const [to, setTo] = useState(start.end);
  const [saving, setSaving] = useState(false);

  const toggle = (d) => setDays((list) => (list.includes(d) ? list.filter((x) => x !== d) : [...list, d]));
  const valid = days.length > 0 && from && to && to > from;

  const save = async () => {
    setSaving(true);
    const ok = await onSave({ days: DAY_ORDER.filter((d) => days.includes(d)), start: from, end: to });
    if (!ok) setSaving(false);
  };

  return (
    <Modal
      title={`Working hours · ${doctor.name}`}
      onClose={onClose}
      footer={<SaveButtons onClose={onClose} onSave={save} disabled={!valid} saving={saving} label="Save hours" />}
    >
      <p className="ad-pay-label">Working days</p>
      <div className="ad-seg ad-days" role="group" aria-label="Working days">
        {DAY_ORDER.map((d) => (
          <button
            type="button"
            key={d}
            className={days.includes(d) ? "ad-seg-btn ad-seg-on" : "ad-seg-btn"}
            aria-pressed={days.includes(d)}
            onClick={() => toggle(d)}
          >
            {DAY_NAMES[d]}
          </button>
        ))}
      </div>

      <div className="ad-form ad-form-plain ad-tab-top">
        <label>
          Starts at
          <input type="time" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label>
          Ends at
          <input type="time" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
      </div>
      {to && from && to <= from && <p className="ad-form-error ad-modal-note ad-tab-top">The end time must be after the start time.</p>}
      {days.length === 0 && <p className="ad-form-error ad-modal-note ad-tab-top">Choose at least one working day.</p>}
      <p className="ad-muted ad-modal-note ad-tab-top">
        New appointments outside these hours show a warning. They can still be saved.
      </p>
    </Modal>
  );
}

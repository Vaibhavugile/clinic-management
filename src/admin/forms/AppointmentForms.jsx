// Popup forms used on the Appointments page: walk-in, confirm and complete (bill).
import { useState } from "react";
import {
  BellRing,
  Plus,
  Trash2,
} from "lucide-react";
import { todayISO, fmtDate, inr, digits, withCurrent, findClashes, PAY_MODES } from "../utils";
import { Modal, SaveButtons, ClashWarning, HoursNotice } from "../components/Common";
import "./forms.css";

export function WalkInForm({ appointments, doctors, doctorHours, treatments, onSave, onClose }) {
  const [f, setF] = useState({
    name: "",
    phone: "",
    treatment: "",
    doctor: "",
    date: todayISO(),
    time: "10:00",
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const treatment = f.treatment || treatments[0]?.name || "";
  const doctor = f.doctor || doctors[0] || "";
  const valid = f.name.trim() && digits(f.phone).length === 10 && f.date && treatment && doctor;
  const clashes = findClashes(appointments, f.date, f.time, doctor);

  const save = async () => {
    setSaving(true);
    const ok = await onSave({ ...f, treatment, doctor, name: f.name.trim(), phone: f.phone.trim() });
    if (!ok) setSaving(false);
  };

  return (
    <Modal
      title="New walk-in appointment"
      onClose={onClose}
      footer={<SaveButtons onClose={onClose} onSave={save} disabled={!valid} saving={saving} label="Save appointment" />}
    >
      {(doctors.length === 0 || treatments.length === 0) && (
        <p className="ad-muted ad-modal-note">
          Doctors or treatments are missing. An admin needs to add them in Clinic setup first.
        </p>
      )}
      <ClashWarning clashes={clashes} date={f.date} time={f.time} doctor={doctor} />
      <HoursNotice doctor={doctor} hours={doctorHours?.[doctor]} date={f.date} time={f.time} />
      <div className="ad-form">
        <label>
          Patient name
          <input value={f.name} onChange={set("name")} placeholder="Full name" />
        </label>
        <label>
          Phone (10 digits)
          <input value={f.phone} onChange={set("phone")} inputMode="numeric" maxLength={14} placeholder="98XXXXXXXX" />
        </label>
        <label>
          Treatment
          <select value={treatment} onChange={set("treatment")}>
            {treatments.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
        </label>
        <label>
          Doctor
          <select value={doctor} onChange={set("doctor")}>
            {doctors.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
        <label>
          Date
          <input type="date" value={f.date} onChange={set("date")} />
        </label>
        <label>
          Time
          <input type="time" value={f.time} onChange={set("time")} />
        </label>
      </div>
    </Modal>
  );
}

export function ConfirmForm({ appointment, appointments, doctors, doctorHours, onSave, onClose }) {
  const [f, setF] = useState({
    doctor: appointment.doctor || "",
    time: appointment.time || "10:00",
    date: appointment.date || todayISO(),
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const doctorOptions = withCurrent(doctors, appointment.doctor);
  const doctor = f.doctor || doctorOptions[0] || "";
  const clashes = findClashes(appointments, f.date, f.time, doctor, appointment.id);

  const save = async () => {
    // Final client-side guard: never confirm a conflicting slot.
    if (clashes.length > 0) return;
    setSaving(true);
    const ok = await onSave({ ...f, doctor });
    if (!ok) setSaving(false);
  };

  return (
    <Modal
      title={`Confirm ${appointment.patient}`}
      onClose={onClose}
      footer={
        <>
          {clashes.length > 0 && (
            <div className="ad-warn ad-confirm-footer-warning" role="alert" style={{ width: "100%", flexBasis: "100%", boxSizing: "border-box" }}>
              <p className="ad-strong">⚠ This time slot is already allocated!</p>
              <p>
                {doctor} already has an appointment on {fmtDate(f.date)} at {f.time}.
                Please select another time before confirming.
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
            disabled={!doctor || !f.time || !f.date || clashes.length > 0}
            saving={saving}
            label="Confirm appointment"
          />
        </>
      }
    >
      <p className="ad-muted ad-modal-note">
        {appointment.treatment} · requested for {fmtDate(appointment.date)}
      </p>
      {doctorOptions.length === 0 && (
        <p className="ad-form-error ad-modal-note">
          No doctors found. An admin needs to add them in Clinic setup first.
        </p>
      )}
      <ClashWarning clashes={clashes} date={f.date} time={f.time} doctor={doctor} />
      <HoursNotice doctor={doctor} hours={doctorHours?.[doctor]} date={f.date} time={f.time} />
      <div className="ad-form">
        <label>
          Doctor
          <select value={doctor} onChange={set("doctor")}>
            {doctorOptions.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
        <label>
          Date
          <input type="date" value={f.date} onChange={set("date")} />
        </label>
        <label>
          Time
          <input type="time" value={f.time} onChange={set("time")} />
        </label>
      </div>
    </Modal>
  );
}

const CUSTOM = "__custom__"; // "+ New treatment..." entry in the treatment list
let lineSeq = 0;
const newLine = (treatment = "") => ({ key: ++lineSeq, treatment, custom: "", amount: "", touched: false });

// Complete an appointment and make the bill. The doctor can add more treatments than the booked one
// (from the Clinic setup list, or a brand new one) and the total is added up automatically.
export function CompleteForm({ appointment, treatments, added, onFollowUp, onSave, onClose }) {
  const [lines, setLines] = useState(() => [newLine(appointment.treatment)]);
  const [pay, setPay] = useState(""); // payment mode is chosen, not preset
  const [saving, setSaving] = useState(false);

  const options = withCurrent(treatments.map((t) => t.name), appointment.treatment);
  const nameOf = (l) => (l.treatment === CUSTOM ? l.custom.trim() : l.treatment);
  const priceOf = (l) => treatments.find((t) => t.name === l.treatment)?.price || 0;
  // the price from Clinic setup fills the amount until the doctor types a different one
  const amountOf = (l) => (l.touched ? l.amount : priceOf(l) ? String(priceOf(l)) : "");
  const total = lines.reduce((sum, l) => sum + (Number(amountOf(l)) || 0), 0);

  const patch = (key, data) => setLines((list) => list.map((l) => (l.key === key ? { ...l, ...data } : l)));
  const addLine = () => {
    const unused = options.find((o) => !lines.some((l) => l.treatment === o));
    setLines((list) => [...list, newLine(unused || options[0] || CUSTOM)]);
  };
  const removeLine = (key) => setLines((list) => list.filter((l) => l.key !== key));

  const linesOk = lines.every((l) => nameOf(l) && amountOf(l) !== "" && Number(amountOf(l)) >= 0);
  const needsPay = total > 0; // a bill needs to know how it was paid (or "Pay later")
  const valid = linesOk && (!needsPay || pay !== "");
  const payModes = [...PAY_MODES, "unpaid"];

  const save = async () => {
    setSaving(true);
    const ok = await onSave({
      items: lines.map((l) => ({ treatment: nameOf(l), amount: Number(amountOf(l)) })),
      amount: total,
      paid: pay !== "" && pay !== "unpaid",
      mode: pay === "" || pay === "unpaid" ? "" : pay,
    });
    if (!ok) setSaving(false);
  };

  return (
    <Modal
      title={`Complete ${appointment.patient}`}
      onClose={onClose}
      footer={<SaveButtons onClose={onClose} onSave={save} disabled={!valid} saving={saving} label="Complete & save bill" />}
    >
      <div className="ad-bill">
        <div className="ad-bill-row">
          <span>Patient</span>
          <b>{appointment.patient}</b>
        </div>
        <div className="ad-bill-row">
          <span>Doctor</span>
          <b>{appointment.doctor || "-"}</b>
        </div>
        {lines.map((l) => (
          <div className="ad-bill-row" key={l.key}>
            <span>{nameOf(l) || "New treatment"}</span>
            <b>{inr(amountOf(l))}</b>
          </div>
        ))}
        <div className="ad-bill-row ad-bill-total">
          <span>Total</span>
          <b>{inr(total)}</b>
        </div>
      </div>

      <div className="ad-lines">
        <p className="ad-pay-label">Treatments done</p>
        {lines.map((l, i) => (
          <div className="ad-line" key={l.key}>
            <select
              aria-label={`Treatment ${i + 1}`}
              value={l.treatment}
              onChange={(e) => patch(l.key, { treatment: e.target.value })}
            >
              {options.map((t) => <option key={t}>{t}</option>)}
              <option value={CUSTOM}>+ New treatment...</option>
            </select>
            <label className="ad-line-amount">
              ₹
              <input
                type="number"
                min="0"
                aria-label={`Amount ${i + 1}`}
                value={amountOf(l)}
                onChange={(e) => patch(l.key, { amount: e.target.value, touched: true })}
                placeholder="0"
              />
            </label>
            {lines.length > 1 ? (
              <button type="button" className="ad-icon-btn" aria-label={`Remove treatment ${i + 1}`} onClick={() => removeLine(l.key)}>
                <Trash2 size={16} />
              </button>
            ) : (
              <span />
            )}
            {l.treatment === CUSTOM && (
              <input
                className="ad-line-custom"
                aria-label={`New treatment name ${i + 1}`}
                value={l.custom}
                onChange={(e) => patch(l.key, { custom: e.target.value })}
                placeholder="Name of the new treatment"
              />
            )}
          </div>
        ))}
        <button type="button" className="ad-btn ad-btn-soft ad-add-line" onClick={addLine}>
          <Plus size={16} /> Add another treatment
        </button>
      </div>

      <div className="ad-form ad-form-plain">
        <div className="ad-span">
          <p className="ad-pay-label">Paid by</p>
          <div className="ad-seg" role="group" aria-label="Payment mode">
            {payModes.map((m) => (
              <button
                type="button"
                key={m}
                className={pay === m ? "ad-seg-btn ad-seg-on" : "ad-seg-btn"}
                aria-pressed={pay === m}
                onClick={() => setPay(m)}
              >
                {m === "unpaid" ? "Pay later" : m}
              </button>
            ))}
          </div>
        </div>

        {needsPay && !pay && <p className="ad-span ad-hint ad-hint-warn">Choose how the patient paid to continue.</p>}

        <div className="ad-span ad-followup-row">
          <button type="button" className="ad-btn ad-btn-soft" onClick={onFollowUp}>
            <BellRing size={16} /> Next follow-up
          </button>
          {added.map((x, i) => (
            <span key={i} className="ad-badge ad-badge-confirmed">{x.reason || "Follow-up"} · {fmtDate(x.due)}</span>
          ))}
        </div>
      </div>
      {linesOk && total === 0 && (
        <p className="ad-muted ad-modal-note ad-tab-top">Amount is 0, so no invoice will be created.</p>
      )}
    </Modal>
  );
}

// Move a confirmed appointment to a new date / time (and doctor). A busy slot cannot be chosen.
export function PostponeForm({ appointment, appointments, doctors, doctorHours, onSave, onClose }) {
  const [f, setF] = useState({
    doctor: appointment.doctor || "",
    date: appointment.date || todayISO(),
    time: appointment.time || "10:00",
    reason: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const doctorOptions = withCurrent(doctors, appointment.doctor);
  const doctor = f.doctor || doctorOptions[0] || "";
  const unchanged =
    f.date === appointment.date && f.time === appointment.time && doctor === (appointment.doctor || "");
  const clashes = findClashes(appointments, f.date, f.time, doctor, appointment.id);
  const inPast = f.date < todayISO();

  const save = async () => {
    if (clashes.length > 0) return;
    setSaving(true);
    const ok = await onSave({ ...f, doctor, reason: f.reason.trim() });
    if (!ok) setSaving(false);
  };

  return (
    <Modal
      title={`Postpone ${appointment.patient}`}
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
            disabled={!doctor || !f.date || !f.time || unchanged || inPast || clashes.length > 0}
            saving={saving}
            label="Postpone appointment"
          />
        </>
      }
    >
      <p className="ad-muted ad-modal-note">
        {appointment.treatment} · now on {fmtDate(appointment.date)}
        {appointment.time ? ` at ${appointment.time}` : ""}
      </p>
      {inPast && <p className="ad-form-error ad-modal-note">Pick today or a future date.</p>}
      <ClashWarning clashes={clashes} date={f.date} time={f.time} doctor={doctor} />
      <HoursNotice doctor={doctor} hours={doctorHours?.[doctor]} date={f.date} time={f.time} />
      <div className="ad-form ad-form-plain">
        <label>
          New date
          <input type="date" min={todayISO()} value={f.date} onChange={set("date")} />
        </label>
        <label>
          New time
          <input type="time" value={f.time} onChange={set("time")} />
        </label>
        <label className="ad-span">
          Doctor
          <select value={doctor} onChange={set("doctor")}>
            {doctorOptions.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
        <label className="ad-span">
          Reason (optional)
          <input value={f.reason} onChange={set("reason")} placeholder="e.g. Patient asked for another day" />
        </label>
      </div>
    </Modal>
  );
}

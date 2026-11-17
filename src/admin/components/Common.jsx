// Small pieces shared by every page: Badge, Stat, Empty, Modal, SaveButtons, ClashWarning.
import {
  X,
} from "lucide-react";
import { fmtHours, outsideHours, fmtDate, inr, STATUS_LABEL } from "../utils";

export const Badge = ({ status }) => (
  <span className={`ad-badge ad-badge-${status}`}>{STATUS_LABEL[status] || status}</span>
);

export function Stat({ label, value, note, icon: Icon, tone }) {
  return (
    <div className={tone ? `ad-stat ad-stat-${tone}` : "ad-stat"}>
      {Icon && (
        <span className="ad-stat-icon">
          <Icon size={20} />
        </span>
      )}
      <div className="ad-stat-body">
        <p className="ad-stat-label">{label}</p>
        <p className="ad-stat-value">{value}</p>
        <p className="ad-stat-note">{note}</p>
      </div>
    </div>
  );
}

export function Empty({ text }) {
  return <p className="ad-empty">{text}</p>;
}

export function Modal({ title, onClose, children, footer }) {
  return (
    <div className="ad-modal-bg" onClick={onClose}>
      <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal-head">
          <h3>{title}</h3>
          <button className="ad-icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
        <div className="ad-modal-foot">{footer}</div>
      </div>
    </div>
  );
}

export function SaveButtons({ onClose, onSave, disabled, saving, label }) {
  return (
    <>
      <button className="ad-btn ad-btn-ghost" onClick={onClose}>Cancel</button>
      <button className="ad-btn ad-btn-primary" disabled={disabled || saving} onClick={onSave}>
        {saving ? "Saving..." : label}
      </button>
    </>
  );
}

// Warning shown when another appointment is already booked at the chosen date + time
export function ClashWarning({ clashes, date, time, doctor }) {
  if (clashes.length === 0) return null;
  return (
    <div className="ad-warn" role="alert">
      <p className="ad-strong">
        ⚠ {clashes.length === 1 ? "Another appointment is" : `${clashes.length} other appointments are`} already booked on {fmtDate(date)} at {time}:
      </p>
      <ul>
        {clashes.map((c) => (
          <li key={c.id}>
            {c.patient} · {c.treatment}
            {c.doctor ? ` · ${c.doctor}` : ""}
            {c.doctor && c.doctor === doctor ? " (same doctor)" : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Shows the doctor's working hours under a form, and a soft warning (it does not block saving)
// when the chosen date / time is outside them.
export function HoursNotice({ doctor, hours, date, time }) {
  const text = fmtHours(hours);
  if (!doctor || !text) return null;
  const outside = outsideHours(hours, date, time);
  return (
    <>
      <p className="ad-hint">{doctor} works {text}</p>
      {outside && (
        <div className="ad-hours-warn" role="status">
          ⚠ {doctor} {outside}. You can still save this appointment.
        </div>
      )}
    </>
  );
}

// Small breakdown under a bill's treatment when it has more than one item
export function ItemsNote({ items }) {
  if (!items || items.length < 2) return null;
  return <p className="ad-muted ad-items">{items.map((x) => `${x.treatment} ${inr(x.amount)}`).join(" · ")}</p>;
}

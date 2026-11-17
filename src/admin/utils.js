// Small helper functions and shared constants used across the admin dashboard.
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  BellRing,
  IndianRupee,
  Settings,
  UserCog,
} from "lucide-react";

export const isoDate = (d) => d.toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
export const todayISO = () => isoDate(new Date());
export const addDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return isoDate(d);
};
export const fmtDate = (iso) =>
  iso
    ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : "-";
export const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
export const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
export const digits = (phone = "") => phone.replace(/\D/g, "").slice(-10);
export const patientKey = (phone, name = "") => digits(phone) || name.trim().toLowerCase();
export const profileId = (key) => key.replace(/[^a-z0-9]/gi, "_");
export const waLink = (phone, msg) => `https://wa.me/91${digits(phone)}?text=${encodeURIComponent(msg)}`;
export const byName = (a, b) => (a.name || "").localeCompare(b.name || "");
export const withCurrent = (list, current) => (current && !list.includes(current) ? [current, ...list] : list);
export const weekDays = () => {
  const now = new Date();
  const offset = (now.getDay() + 6) % 7; // Monday = 0
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - offset + i);
    return { iso: isoDate(d), label: d.toLocaleDateString("en-IN", { weekday: "short" }) };
  });
};

// Find appointments already allocated to the same doctor, date and time.
// Pending requests do not block a slot; confirmed/completed appointments do.
export const findClashes = (appointments, date, time, doctor, excludeId) =>
  appointments.filter((a) => {
    const sameDoctor = String(a.doctor || "").trim().toLowerCase() ===
      String(doctor || "").trim().toLowerCase();
    return (
      a.id !== excludeId &&
      ["confirmed", "completed"].includes(String(a.status || "").toLowerCase()) &&
      a.date === date &&
      a.time === time &&
      sameDoctor
    );
  });

/* ---------- constants ---------- */
// Doctors and treatments now live in Firestore ("doctors" and "treatments" collections).
// These defaults are only used by the "Add starter list" button on the Clinic setup page.
export const DEFAULT_DOCTORS = ["Dr. Shrikant Mali", "Dr. Devyani Mali"];
export const DEFAULT_TREATMENTS = [
  "General Consultation",
  "Dental Implants",
  "Root Canal",
  "Teeth Whitening",
  "Braces and Aligners",
  "Smile Makeover",
  "Other",
];
export const PAY_MODES = ["Cash", "UPI", "Card"];

export const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "appointments", label: "Appointments", icon: CalendarDays },
  { id: "patients", label: "Patients", icon: Users },
  { id: "followups", label: "Follow-ups", icon: BellRing },
  { id: "billing", label: "Billing", icon: IndianRupee },
];

export const SETUP_NAV = { id: "setup", label: "Clinic setup", icon: Settings };
export const STAFF_NAV = { id: "staff", label: "Staff", icon: UserCog };

export const STATUS_LABEL = {
  new: "New",
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  reminded: "Reminded",
  done: "Done",
  booked: "Booked",
};

/* ---------- doctor working hours ---------- */
export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday first
export const DEFAULT_HOURS = { days: [1, 2, 3, 4, 5, 6], start: "10:00", end: "19:00" };

// "19:00" -> "7:00 PM"
export const fmtTime = (hhmm) => {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

// [1,2,3,4,5,6] -> "Mon–Sat", [1,3,5] -> "Mon, Wed, Fri"
export const fmtDays = (days = []) => {
  const on = DAY_ORDER.filter((d) => days.includes(d));
  if (on.length === 7) return "Every day";
  const runs = [];
  on.forEach((d) => {
    const last = runs[runs.length - 1];
    if (last && DAY_ORDER.indexOf(d) === DAY_ORDER.indexOf(last[last.length - 1]) + 1) last.push(d);
    else runs.push([d]);
  });
  return runs
    .map((r) => (r.length >= 3 ? `${DAY_NAMES[r[0]]}–${DAY_NAMES[r[r.length - 1]]}` : r.map((d) => DAY_NAMES[d]).join(", ")))
    .join(", ");
};

// "Mon–Sat · 10:00 AM – 7:00 PM" (empty text when the hours are not set)
export const fmtHours = (h) =>
  h && h.days && h.days.length && h.start && h.end ? `${fmtDays(h.days)} · ${fmtTime(h.start)} – ${fmtTime(h.end)}` : "";

// Returns a short reason when the doctor does not work on that day / time, otherwise ""
export const outsideHours = (hours, date, time) => {
  if (!hours || !hours.days || !hours.start || !hours.end || !date) return "";
  const dow = new Date(`${date}T00:00:00`).getDay();
  if (!hours.days.includes(dow)) return `does not work on ${DAY_NAMES[dow]} (works ${fmtDays(hours.days)})`;
  if (time && (time < hours.start || time >= hours.end)) {
    return `works only ${fmtTime(hours.start)} – ${fmtTime(hours.end)}`;
  }
  return "";
};

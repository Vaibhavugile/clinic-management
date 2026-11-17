
import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  ArrowLeft,
  Users,
  UserRound,
  CalendarDays,
  CalendarCheck,
  Activity,
  Wallet,
  CreditCard,
  Phone,
  Mail,
  Pencil,
  Clock3,
  FileText,
  CheckCircle2,
  X,
  ChevronRight,
  Stethoscope,
  IndianRupee,
} from "lucide-react";

import {
  fmtDate,
  inr,
  initials,
  digits,
  patientKey,
  waLink,
  PAY_MODES,
} from "../utils";

import { usePersistentState } from "../hooks/usePersistentState";
import { Badge, Empty, ItemsNote } from "../components/Common";
import { WhatsAppIcon } from "../components/WhatsAppIcon";
import { ProfileForm } from "../forms/ProfileForm";
import "./Patients.css";


/* =========================================================
   PATIENT DIRECTORY
   ========================================================= */

export function Patients({ patients = [], loading, onOpen }) {
  const [q, setQ] = usePersistentState("ad.patients.q", "");

  const safePatients = Array.isArray(patients) ? patients : [];

  const rows = useMemo(() => {
    const search = q.trim().toLowerCase();

    return safePatients
      .filter((p) => {
        const searchable = [
          p.name,
          p.phone,
          p.email,
          p.lastTreatment,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(search);
      })
      .sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
  }, [safePatients, q]);

  const totalVisits = safePatients.reduce(
    (sum, p) => sum + (Number(p.visits) || 0),
    0
  );

  return (
    <main className="ad-patients-page">

      {/* HEADER */}
      <header className="ad-patients-header">
        <div className="ad-patients-heading">
          <div className="ad-patients-heading-icon">
            <Users size={23} />
          </div>

          <div>
            <span className="ad-patients-eyebrow">
              CLINIC MANAGEMENT
            </span>

            <h1>Patients</h1>

            <p>
              Your patient directory, treatment history and records.
            </p>
          </div>
        </div>

        <div className="ad-patients-header-right">
          <div className="ad-patients-live">
            <span />
            Patient records
          </div>
        </div>
      </header>

      {/* SUMMARY */}
      <section className="ad-patients-overview">

        <div className="ad-patients-overview-card ad-patients-overview-primary">
          <div className="ad-patients-overview-icon">
            <Users size={21} />
          </div>

          <div>
            <span>Total patients</span>
            <strong>{safePatients.length}</strong>
            <small>Registered patient records</small>
          </div>
        </div>

        <div className="ad-patients-overview-card">
          <div className="ad-patients-overview-icon">
            <Activity size={21} />
          </div>

          <div>
            <span>Total visits</span>
            <strong>{totalVisits}</strong>
            <small>Recorded appointments</small>
          </div>
        </div>

        <div className="ad-patients-overview-card">
          <div className="ad-patients-overview-icon">
            <UserRound size={21} />
          </div>

          <div>
            <span>Search results</span>
            <strong>{rows.length}</strong>
            <small>Matching patients</small>
          </div>
        </div>
      </section>

      {/* DIRECTORY */}
      <section className="ad-patients-directory">

        <div className="ad-patients-directory-header">
          <div>
            <h2>Patient directory</h2>
            <p>Search and open individual patient profiles.</p>
          </div>

          <div className="ad-patients-directory-count">
            <Users size={15} />
            {safePatients.length} patients
          </div>
        </div>

        {/* SEARCH */}
        <div className="ad-patients-toolbar">
          <div className="ad-patients-search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search by patient name, phone or email..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search patients"
            />

            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {q && (
            <span className="ad-patients-search-count">
              {rows.length} matches
            </span>
          )}
        </div>

        {/* PATIENT LIST */}
        {loading ? (
          <div className="ad-patients-loading">
            <div className="ad-patients-spinner" />
            <span>Loading patient records...</span>
          </div>
        ) : rows.length === 0 ? (
          <div className="ad-patients-empty">
            <div className="ad-patients-empty-icon">
              <Users size={28} />
            </div>

            <h3>
              {safePatients.length === 0
                ? "No patients yet"
                : "No matching patients"}
            </h3>

            <p>
              {safePatients.length === 0
                ? "Patients will appear here after their first appointment."
                : "Try another name, phone number or email address."}
            </p>

            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="ad-patients-result-label">
              Showing <strong>{rows.length}</strong> of{" "}
              <strong>{safePatients.length}</strong> patients
            </div>

            {/* DESKTOP TABLE */}
            <div className="ad-patients-table-wrap">
              <table className="ad-patients-table">
                <thead>
                  <tr>
                    <th>Patient details</th>
                    <th>Appointments</th>
                    <th>Last treatment</th>
                    <th>Last appointment</th>
                    <th className="ad-patients-table-action">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((p) => (
                    <tr key={p.key}>
                      <td data-label="Patient">
                        <div className="ad-patients-person">
                          <span className="ad-patients-avatar">
                            {initials(p.name)}
                          </span>

                          <div className="ad-patients-person-info">
                            <strong>{p.name}</strong>
                            <span>{p.phone || "No phone number"}</span>
                          </div>
                        </div>
                      </td>

                      <td data-label="Appointments">
                        <span className="ad-patients-visit-count">
                          <CalendarCheck size={15} />
                          {Number(p.visits) || 0}
                        </span>
                      </td>

                      <td data-label="Last treatment">
                        <div className="ad-patients-treatment">
                          <Stethoscope size={15} />
                          <span>{p.lastTreatment || "Not recorded"}</span>
                        </div>
                      </td>

                      <td data-label="Last appointment">
                        <div className="ad-patients-date">
                          <CalendarDays size={14} />
                          {p.lastDate ? fmtDate(p.lastDate) : "No visits"}
                        </div>
                      </td>

                      <td data-label="Action">
                        <button
                          type="button"
                          className="ad-patients-view-btn"
                          onClick={() => onOpen(p.key)}
                        >
                          View profile
                          <ChevronRight size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE PATIENT CARDS */}
            <div className="ad-patients-mobile-list">
              {rows.map((p) => (
                <button
                  type="button"
                  className="ad-patients-mobile-card"
                  key={p.key}
                  onClick={() => onOpen(p.key)}
                >
                  <div className="ad-patients-mobile-top">
                    <div className="ad-patients-person">
                      <span className="ad-patients-avatar">
                        {initials(p.name)}
                      </span>

                      <div className="ad-patients-person-info">
                        <strong>{p.name}</strong>
                        <span>{p.phone || "No phone number"}</span>
                      </div>
                    </div>

                    <ChevronRight size={19} />
                  </div>

                  <div className="ad-patients-mobile-meta">
                    <span>
                      <CalendarCheck size={14} />
                      {Number(p.visits) || 0} visits
                    </span>

                    <span>
                      <CalendarDays size={14} />
                      {p.lastDate ? fmtDate(p.lastDate) : "No visits"}
                    </span>
                  </div>

                  <div className="ad-patients-mobile-treatment">
                    <Stethoscope size={14} />
                    {p.lastTreatment || "No treatment recorded"}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="ad-patients-directory-footer">
          Anand Dental Clinic & Implant Center
        </div>
      </section>
    </main>
  );
}


/* =========================================================
   PATIENT DETAIL PAGE
   ========================================================= */

export function PatientDetail({
  patient,
  profile,
  appointments = [],
  followups = [],
  invoices = [],
  onBack,
  onSaveProfile,
  onAddFollowUp,
  onAddInvoice,
  markPaid,
}) {
  const [tab, setTab] = useState("appointments");
  const [editing, setEditing] = useState(false);

  const safeAppointments = Array.isArray(appointments)
    ? appointments
    : [];

  const safeFollowups = Array.isArray(followups)
    ? followups
    : [];

  const safeInvoices = Array.isArray(invoices)
    ? invoices
    : [];

  const mineAppts = safeAppointments
    .filter(
      (a) =>
        patientKey(a.phone, a.patient) === patient.key
    )
    .sort((a, b) =>
      `${b.date || ""} ${b.time || ""}`.localeCompare(
        `${a.date || ""} ${a.time || ""}`
      )
    );

  const mineFollowups = safeFollowups
    .filter(
      (x) =>
        patientKey(x.phone, x.patient) === patient.key
    )
    .sort((a, b) =>
      (b.due || "").localeCompare(a.due || "")
    );

  const mineInvoices = safeInvoices.filter((i) =>
    i.phone
      ? digits(i.phone) === digits(patient.phone)
      : (i.patient || "").trim().toLowerCase() ===
        (patient.name || "").trim().toLowerCase()
  );

  const completed = mineAppts.filter(
    (a) => a.status === "completed"
  ).length;

  const activeAppointments = mineAppts.filter(
    (a) => a.status !== "cancelled"
  ).length;

  const billed = mineInvoices.reduce(
    (sum, i) => sum + (Number(i.amount) || 0),
    0
  );

  const paid = mineInvoices
    .filter((i) => i.paid)
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const dues = mineInvoices
    .filter((i) => !i.paid)
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const tabs = [
    {
      id: "appointments",
      label: "Appointments",
      count: mineAppts.length,
      icon: CalendarDays,
    },
    {
      id: "followups",
      label: "Follow-ups",
      count: mineFollowups.length,
      icon: Clock3,
    },
    {
      id: "billing",
      label: "Billing",
      count: mineInvoices.length,
      icon: Wallet,
    },
  ];

  const phoneDigits = digits(patient.phone);
  const canContact = phoneDigits.length === 10;

  return (
    <main className="ad-patient-detail-page">

      {/* BACK NAVIGATION */}
      <button
        type="button"
        className="ad-patient-back"
        onClick={onBack}
      >
        <ArrowLeft size={17} />
        Back to patients
      </button>

      {/* PATIENT PROFILE HEADER */}
      <section className="ad-patient-profile-card">

        <div className="ad-patient-profile-main">
          <div className="ad-patient-profile-avatar">
            {initials(patient.name)}
          </div>

          <div className="ad-patient-profile-info">
            <span className="ad-patient-profile-eyebrow">
              PATIENT PROFILE
            </span>

            <h1>{patient.name}</h1>

            <div className="ad-patient-contact-details">
              <span>
                <Phone size={14} />
                {patient.phone || "No phone number"}
              </span>

              {patient.email && (
                <span>
                  <Mail size={14} />
                  {patient.email}
                </span>
              )}
            </div>

            <div className="ad-patient-profile-tag">
              <CheckCircle2 size={13} />
              Patient record
            </div>
          </div>
        </div>

        <div className="ad-patient-profile-actions">
          <button
            type="button"
            className="ad-patient-edit-btn"
            onClick={() => setEditing(true)}
          >
            <Pencil size={15} />
            Edit details
          </button>

          {canContact && (
            <>
              <a
                className="ad-patient-whatsapp-btn"
                href={waLink(
                  patient.phone,
                  `Hello ${patient.name}, this is Anand Dental Clinic.`
                )}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsAppIcon size={17} />
                WhatsApp
              </a>

              <a
                className="ad-patient-call-btn"
                href={`tel:+91${phoneDigits}`}
              >
                <Phone size={15} />
                Call
              </a>
            </>
          )}
        </div>
      </section>

      {/* PATIENT STATISTICS */}
      <section className="ad-patient-detail-stats">

        <div className="ad-patient-detail-stat">
          <div className="ad-patient-detail-stat-icon blue">
            <CalendarDays size={19} />
          </div>

          <span>Appointments</span>
          <strong>{activeAppointments}</strong>
          <small>{completed} completed visits</small>
        </div>

        <div className="ad-patient-detail-stat">
          <div className="ad-patient-detail-stat-icon violet">
            <CalendarCheck size={19} />
          </div>

          <span>Last appointment</span>
          <strong className="ad-patient-date-value">
            {patient.lastDate ? fmtDate(patient.lastDate) : "—"}
          </strong>
          <small>{patient.lastTreatment || "No treatment recorded"}</small>
        </div>

        <div className="ad-patient-detail-stat">
          <div className="ad-patient-detail-stat-icon green">
            <Wallet size={19} />
          </div>

          <span>Total billed</span>
          <strong>{inr(billed)}</strong>
          <small>
            {mineInvoices.length} invoice
            {mineInvoices.length !== 1 ? "s" : ""}
          </small>
        </div>

        <div className="ad-patient-detail-stat">
          <div className="ad-patient-detail-stat-icon amber">
            <CreditCard size={19} />
          </div>

          <span>Pending dues</span>
          <strong>{inr(dues)}</strong>
          <small>
            {dues > 0 ? "Payment pending" : "All payments clear"}
          </small>
        </div>
      </section>

      {/* PATIENT RECORDS */}
      <section className="ad-patient-records">

        <div className="ad-patient-records-header">
          <div>
            <h2>Patient records</h2>
            <p>Appointments, follow-ups and billing history.</p>
          </div>

          {tab === "followups" && (
            <button
              type="button"
              className="ad-patient-add-btn"
              onClick={onAddFollowUp}
            >
              <Plus size={16} />
              Add follow-up
            </button>
          )}

          {tab === "billing" && (
            <button
              type="button"
              className="ad-patient-add-btn"
              onClick={onAddInvoice}
            >
              <Plus size={16} />
              New invoice
            </button>
          )}
        </div>

        {/* TABS */}
        <div className="ad-patient-tabs" role="tablist">
          {tabs.map((t) => {
            const Icon = t.icon;

            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={
                  tab === t.id
                    ? "ad-patient-tab active"
                    : "ad-patient-tab"
                }
                onClick={() => setTab(t.id)}
              >
                <Icon size={16} />
                {t.label}
                <span>{t.count}</span>
              </button>
            );
          })}
        </div>

        {/* APPOINTMENTS TAB */}
        {tab === "appointments" && (
          mineAppts.length === 0 ? (
            <Empty text="No appointments for this patient." />
          ) : (
            <div className="ad-patient-table-wrap">
              <table className="ad-patient-record-table">
                <thead>
                  <tr>
                    <th>Date & time</th>
                    <th>Treatment</th>
                    <th>Doctor</th>
                    <th>Status</th>
                    <th>Patient message</th>
                  </tr>
                </thead>

                <tbody>
                  {mineAppts.map((a) => (
                    <tr key={a.id}>
                      <td data-label="Date & time">
                        <div className="ad-patient-record-date">
                          <CalendarDays size={14} />
                          <span>
                            {fmtDate(a.date)}
                            {a.time ? `, ${a.time}` : ""}
                          </span>
                        </div>
                      </td>

                      <td data-label="Treatment">
                        <strong>{a.treatment || "Consultation"}</strong>
                      </td>

                      <td data-label="Doctor">
                        {a.doctor || "Not assigned"}
                      </td>

                      <td data-label="Status">
                        <Badge status={a.status} />
                      </td>

                      <td
                        data-label="Patient message"
                        className="ad-patient-message-cell"
                        title={a.message || ""}
                      >
                        {a.message || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* FOLLOW-UPS TAB */}
        {tab === "followups" && (
          mineFollowups.length === 0 ? (
            <Empty text="No follow-ups for this patient." />
          ) : (
            <div className="ad-patient-followup-list">
              {mineFollowups.map((x) => (
                <div
                  className="ad-patient-followup-card"
                  key={x.id}
                >
                  <div className="ad-patient-followup-icon">
                    <Clock3 size={19} />
                  </div>

                  <div className="ad-patient-followup-info">
                    <strong>{x.reason || "Follow-up"}</strong>
                    <span>
                      <CalendarDays size={13} />
                      Due {fmtDate(x.due)}
                    </span>
                  </div>

                  <Badge status={x.status} />
                </div>
              ))}
            </div>
          )
        )}

        {/* BILLING TAB */}
        {tab === "billing" && (
          <>
            <div className="ad-patient-billing-overview">
              <div>
                <span>Total billed</span>
                <strong>{inr(billed)}</strong>
              </div>

              <div>
                <span>Paid amount</span>
                <strong className="paid">{inr(paid)}</strong>
              </div>

              <div>
                <span>Outstanding</span>
                <strong className="due">{inr(dues)}</strong>
              </div>
            </div>

            {mineInvoices.length === 0 ? (
              <Empty text="No invoices for this patient." />
            ) : (
              <div className="ad-patient-table-wrap">
                <table className="ad-patient-record-table">
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Treatment</th>
                      <th>Amount</th>
                      <th>Mode</th>
                      <th>Payment status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {mineInvoices.map((i) => (
                      <tr key={i.id}>
                        <td data-label="Invoice">
                          <div className="ad-patient-invoice-id">
                            <FileText size={16} />
                            INV-{String(i.id).slice(0, 5).toUpperCase()}
                          </div>
                        </td>

                        <td data-label="Treatment">
                          <div className="ad-patient-invoice-treatment">
                            <strong>{i.treatment || "Treatment"}</strong>
                            <ItemsNote items={i.items} />
                          </div>
                        </td>

                        <td data-label="Amount">
                          <strong className="ad-patient-invoice-amount">
                            {inr(Number(i.amount) || 0)}
                          </strong>
                        </td>

                        <td data-label="Mode">
                          {i.mode || "—"}
                        </td>

                        <td data-label="Payment status">
                          {i.paid ? (
                            <div className="ad-patient-paid-status">
                              <Badge status="completed" />
                            </div>
                          ) : (
                            <div className="ad-patient-payment-actions">
                              <span className="ad-patient-unpaid-label">
                                Pending
                              </span>

                              <div className="ad-patient-payment-buttons">
                                {PAY_MODES.map((m) => (
                                  <button
                                    key={m}
                                    type="button"
                                    className="ad-patient-pay-btn"
                                    onClick={() => markPaid(i.id, m)}
                                  >
                                    <CheckCircle2 size={13} />
                                    {m}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>

      {/* EDIT PROFILE */}
      {editing && (
        <ProfileForm
          patient={patient}
          profile={profile}
          onSave={async (data) => {
            const ok = await onSaveProfile(patient, data);

            if (ok) setEditing(false);

            return ok;
          }}
          onClose={() => setEditing(false)}
        />
      )}
    </main>
  );
}

// The dashboard shell: sidebar, top bar, live data, actions and which page is shown.
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import {
  signOut,
} from "firebase/auth";
import {
  Menu,
  LogOut,
} from "lucide-react";
import { db } from "../firebase";
import { auth } from "./firebaseAuth";
import { initials, digits, patientKey, profileId, byName, NAV, SETUP_NAV, STAFF_NAV } from "./utils";
import { useCollection } from "./hooks/useCollection";
import { ToothMark } from "./components/ToothMark";
import {
  WalkInForm,
  ConfirmForm,
  CompleteForm,
  PostponeForm,
} from "./forms/AppointmentForms";
import { FollowUpForm, BookFollowUpForm } from "./forms/FollowUpForm";
import { InvoiceForm } from "./forms/InvoiceForm";
import { Overview } from "./pages/Overview";
import { Appointments } from "./pages/Appointments";
import { Patients, PatientDetail } from "./pages/Patients";
import { FollowUps } from "./pages/FollowUps";
import { Billing } from "./pages/Billing";
import { ClinicSetup } from "./pages/ClinicSetup";
import { StaffPage } from "./pages/Staff";

export function Dashboard({ user, staff }) {
  const isAdmin = staff.role === "admin";
  const nav = isAdmin ? [...NAV, SETUP_NAV, STAFF_NAV] : NAV;
  // The page and the open patient live in the URL (?page=...&patient=...), so the browser Back
  // button (and the Back button on the patient page) returns to the page you came from.
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const pageParam = query.get("page");
  const page = nav.some((n) => n.id === pageParam) ? pageParam : "overview";
  const selectedPatient = query.get("patient"); // patient key, or null for the list
  const goTo = (params, replace = false) =>
    navigate({ search: `?${new URLSearchParams(params).toString()}` }, { state: { inApp: true }, replace });
  const [drawer, setDrawer] = useState(false);
  const [modal, setModal] = useState(null); // "walkin" | "followup" | "invoice" | { confirm: appointment } | { complete: appointment }
  const [toast, setToast] = useState(null);
  const [keyChange, setKeyChange] = useState(null); // { from, to } while a patient's phone/name is being changed
  const [prefill, setPrefill] = useState(null); // used to open follow-up/invoice forms for one patient
  const [fuFor, setFuFor] = useState(null); // follow-up form opened on top of the Complete form
  const [addedFollowups, setAddedFollowups] = useState([]); // follow-ups added while completing

  // Once an admin is signed in, make sure first-run setup is closed for everyone else
  useEffect(() => {
    if (!isAdmin) return;
    getDoc(doc(db, "setup", "done"))
      .then((snap) => {
        if (!snap.exists()) return setDoc(doc(db, "setup", "done"), { by: user.uid, at: serverTimestamp() });
        return null;
      })
      .catch((e) => console.error("Closing setup failed:", e));
  }, [isAdmin, user.uid]);

  const apptCol = useCollection("appointments");
  const fuCol = useCollection("followups");
  const invCol = useCollection("invoices");
  const profCol = useCollection("patients");
  const docCol = useCollection("doctors");
  const trCol = useCollection("treatments");
  const loadError =
    apptCol.error || fuCol.error || invCol.error || profCol.error || docCol.error || trCol.error;

  // Each doctor's working hours (from Clinic setup), so forms can show them and warn about off-hours
  const doctorHours = useMemo(
    () => Object.fromEntries(docCol.rows.filter((d) => d.name).map((d) => [d.name, d.hours || null])),
    [docCol.rows]
  );

  // Active doctors and treatments (with default prices) for the forms
  const doctors = useMemo(
    () =>
      docCol.rows
        .filter((d) => d.active !== false && d.name)
        .sort(byName)
        .map((d) => d.name),
    [docCol.rows]
  );
  const treatments = useMemo(
    () =>
      trCol.rows
        .filter((t) => t.active !== false && t.name)
        .sort(byName)
        .map((t) => ({ id: t.id, name: t.name, price: Number(t.price) || 0 })),
    [trCol.rows]
  );

  const appointments = useMemo(
    () =>
      apptCol.rows
        .map((d) => ({
          id: d.id,
          patient: d.name || "Unknown",
          phone: d.phone || "",
          email: d.email || "",
          treatment: d.treatment || "Other",
          doctor: d.doctor || "",
          date: d.date || "",
          time: d.time || "",
          message: d.message || "",
          status: d.status || "new",
          treatments: Array.isArray(d.treatments) && d.treatments.length ? d.treatments : [d.treatment || "Other"],
          postponedFrom: d.postponedFrom || null,
          postponeCount: d.postponeCount || 0,
        }))
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [apptCol.rows]
  );

  const followups = useMemo(
    () =>
      fuCol.rows.map((d) => ({
        id: d.id,
        patient: d.patient || "Unknown",
        phone: d.phone || "",
        reason: d.reason || "",
        due: d.due || "",
        status: d.status || "pending",
      })),
    [fuCol.rows]
  );

  // Invoice reports use the invoice creation/payment timestamps. For invoices created
  // while completing an appointment, enrich the report with the linked appointment's
  // date and doctor without changing the existing Firestore invoice schema.
  const appointmentsById = useMemo(
    () => Object.fromEntries(appointments.map((a) => [a.id, a])),
    [appointments]
  );

  const invoices = useMemo(
    () =>
      invCol.rows
        .map((d) => {
          const linkedAppointment = d.appointmentId
            ? appointmentsById[d.appointmentId]
            : null;

          return {
            id: d.id,
            patient: d.patient || "Unknown",
            phone: d.phone || "",
            treatment: d.treatment || "",
            items: Array.isArray(d.items) ? d.items : [],
            amount: Number(d.amount) || 0,
            paid: Boolean(d.paid),
            mode: d.mode || "",
            createdAt: d.createdAt || null,
            paidAt: d.paidAt || null,
            appointmentId: d.appointmentId || "",
            appointmentDate: linkedAppointment?.date || "",
            doctor: linkedAppointment?.doctor || "",
            sort: d.createdAt?.seconds || d.createdAt?.toDate?.()?.getTime?.() / 1000 || 0,
          };
        })
        .sort((a, b) => b.sort - a.sort),
    [invCol.rows, appointmentsById]
  );

  // Patients are built from appointments, so there is no separate list to maintain
  const patients = useMemo(() => {
    const map = new Map();
    appointments.forEach((a) => {
      const key = patientKey(a.phone, a.patient);
      const live = a.status !== "cancelled";
      let cur = map.get(key);
      if (!cur) {
        cur = { key, name: a.patient, phone: a.phone, email: a.email, visits: 0, lastDate: "", lastTreatment: "" };
        map.set(key, cur);
      }
      if (a.email) cur.email = a.email;
      if (live) {
        cur.visits += 1;
        if (a.date >= cur.lastDate) {
          cur.lastDate = a.date;
          cur.lastTreatment = a.treatment;
          cur.name = a.patient;
        }
      }
    });
    return [...map.values()].sort((a, b) => b.lastDate.localeCompare(a.lastDate));
  }, [appointments]);

  // Extra details (age, notes, ...) saved from the patient page
  const profiles = useMemo(() => Object.fromEntries(profCol.rows.map((r) => [r.id, r])), [profCol.rows]);

  // While a patient's phone/name is being changed, keep showing the same person (old key, then new key)
  const selected =
    (keyChange &&
      (patients.find((p) => p.key === keyChange.to) || patients.find((p) => p.key === keyChange.from))) ||
    patients.find((p) => p.key === selectedPatient) ||
    null;

  const flash = (text, error = false) => {
    setToast({ text, error });
    setTimeout(() => setToast(null), 3500);
  };

  // Runs a Firestore write, shows a message, and returns true/false
  const act = async (fn, okMsg) => {
    try {
      await fn();
      if (okMsg) flash(okMsg);
      return true;
    } catch (e) {
      console.error(e);
      flash(`Could not save (${e.code || e.message}).`, true);
      return false;
    }
  };

  const updateAppt = (id, data, msg) => act(() => updateDoc(doc(db, "appointments", id), data), msg);
  const updateFollowup = (id, data) => act(() => updateDoc(doc(db, "followups", id), data));

  const saveWalkIn = async (f) => {
    const ok = await act(
      () =>
        addDoc(collection(db, "appointments"), {
          name: f.name,
          phone: f.phone,
          email: "",
          treatment: f.treatment,
          doctor: f.doctor,
          date: f.date,
          time: f.time,
          message: "",
          status: "confirmed",
          source: "walk-in",
          createdAt: serverTimestamp(),
        }),
      "Appointment saved."
    );
    if (ok) setModal(null);
    return ok;
  };

  const saveConfirm = async (f) => {
    const ok = await updateAppt(modal.confirm.id, { ...f, status: "confirmed" }, "Appointment confirmed.");
    if (ok) setModal(null);
    return ok;
  };

  const saveFollowUp = async (f) => {
    const ok = await act(
      () =>
        addDoc(collection(db, "followups"), {
          patient: f.patient,
          phone: f.phone,
          reason: f.reason,
          due: f.due,
          status: "pending",
          createdAt: serverTimestamp(),
        }),
      "Follow-up saved."
    );
    if (ok) setModal(null);
    return ok;
  };

  const saveInvoice = async (f) => {
    const ok = await act(
      () => addDoc(collection(db, "invoices"), { ...f, createdAt: serverTimestamp() }),
      "Invoice saved."
    );
    if (ok) setModal(null);
    return ok;
  };

  // Complete: marks the appointment completed and saves the bill as an invoice, in one batch
  const saveComplete = async (f) => {
    const a = modal.complete;
    const ok = await act(async () => {
      const batch = writeBatch(db);
      const names = f.items.map((i) => i.treatment);
      const apptUpdate = { status: "completed", treatment: names[0], treatments: names, completedAt: serverTimestamp() };
      if (f.amount > 0) {
        const invRef = doc(collection(db, "invoices"));
        batch.set(invRef, {
          patient: a.patient,
          phone: a.phone,
          treatment: names.join(" + "),
          items: f.items,
          amount: f.amount,
          paid: f.paid,
          mode: f.mode,
          appointmentId: a.id,
          createdAt: serverTimestamp(),
          ...(f.paid ? { paidAt: serverTimestamp() } : {}),
        });
        apptUpdate.invoiceId = invRef.id;
      }
      batch.update(doc(db, "appointments", a.id), apptUpdate);
      await batch.commit();
    }, "Appointment completed and bill saved.");
    if (ok) setModal(null);
    return ok;
  };

  // Follow-up saved from inside the Complete form (keeps the Complete form open)
  const saveStackedFollowUp = async (f) => {
    const ok = await act(
      () =>
        addDoc(collection(db, "followups"), {
          patient: f.patient,
          phone: f.phone,
          reason: f.reason,
          due: f.due,
          status: "pending",
          createdAt: serverTimestamp(),
        }),
      "Follow-up saved."
    );
    if (ok) {
      setAddedFollowups((list) => [...list, { reason: f.reason, due: f.due }]);
      setFuFor(null);
    }
    return ok;
  };

  // Follow-up -> appointment: the admin picks doctor, treatment, date and time, and the
  // appointment is created as confirmed. The follow-up then leaves the Follow-ups list.
  const saveBook = async (f) => {
    const x = modal.book;
    const p = patients.find((q) => q.key === patientKey(x.phone, x.patient));
    const ok = await act(async () => {
      const batch = writeBatch(db);
      const apptRef = doc(collection(db, "appointments"));
      batch.set(apptRef, {
        name: x.patient,
        phone: x.phone,
        email: p?.email || "",
        treatment: f.treatment,
        doctor: f.doctor,
        date: f.date,
        time: f.time,
        message: x.reason ? `Follow-up: ${x.reason}` : "Follow-up visit",
        status: "confirmed",
        source: "follow-up",
        followupId: x.id,
        createdAt: serverTimestamp(),
      });
      batch.update(doc(db, "followups", x.id), {
        status: "booked",
        appointmentId: apptRef.id,
        bookedAt: serverTimestamp(),
      });
      await batch.commit();
    }, "Follow-up added to Appointments.");
    if (ok) setModal(null);
    return ok;
  };

  // Postpone: moves a confirmed appointment to a new date / time and remembers the old one
  const savePostpone = async (f) => {
    const a = modal.postpone;
    const ok = await updateAppt(
      a.id,
      {
        date: f.date,
        time: f.time,
        doctor: f.doctor,
        status: "confirmed",
        postponedFrom: { date: a.date, time: a.time },
        postponeCount: (a.postponeCount || 0) + 1,
        postponeReason: f.reason || "",
        postponedAt: serverTimestamp(),
      },
      "Appointment postponed."
    );
    if (ok) setModal(null);
    return ok;
  };

  // Edit details: saves the extra details AND updates name / phone / email everywhere
  // (all appointments, follow-ups and invoices of this patient), so nothing goes out of sync.
  const saveProfile = async (p, data) => {
    const name = data.name.trim();
    const phone = data.phone.trim();
    const email = data.email.trim();
    const newKey = patientKey(phone, name);
    const keyChanged = newKey !== p.key;

    if (keyChanged && patients.some((q) => q.key === newKey)) {
      flash("Another patient already uses this phone number or name.", true);
      return false;
    }

    const extra = {
      age: data.age,
      gender: data.gender,
      address: data.address,
      medicalHistory: data.medicalHistory,
      notes: data.notes,
    };

    // Everything that belongs to this patient right now
    const writes = [];
    appointments
      .filter((a) => patientKey(a.phone, a.patient) === p.key)
      .forEach((a) => writes.push((b) => b.update(doc(db, "appointments", a.id), { name, phone, email })));
    followups
      .filter((x) => patientKey(x.phone, x.patient) === p.key)
      .forEach((x) => writes.push((b) => b.update(doc(db, "followups", x.id), { patient: name, phone })));
    invoices
      .filter((i) =>
        i.phone
          ? digits(i.phone) === digits(p.phone)
          : i.patient.trim().toLowerCase() === p.name.trim().toLowerCase()
      )
      .forEach((i) => writes.push((b) => b.update(doc(db, "invoices", i.id), { patient: name, phone })));
    writes.push((b) =>
      b.set(
        doc(db, "patients", profileId(newKey)),
        { name, phone, email, ...extra, updatedAt: serverTimestamp() },
        { merge: true }
      )
    );
    if (keyChanged) writes.push((b) => b.delete(doc(db, "patients", profileId(p.key))));

    if (keyChanged) setKeyChange({ from: p.key, to: newKey });
    const ok = await act(async () => {
      // A Firestore batch holds at most 500 writes, so send them in chunks
      for (let i = 0; i < writes.length; i += 400) {
        const batch = writeBatch(db);
        writes.slice(i, i + 400).forEach((w) => w(batch));
        await batch.commit();
      }
    }, "Patient details saved.");
    if (ok && keyChanged) goTo({ page: "patients", patient: newKey }, true);
    setKeyChange(null);
    return ok;
  };

  const markPaid = (id, mode) =>
    act(() => updateDoc(doc(db, "invoices", id), { paid: true, mode, paidAt: serverTimestamp() }), "Marked as paid.");

  const go = (id) => {
    setDrawer(false);
    if (id === page && !selectedPatient) return;
    goTo({ page: id });
  };
  const openPatient = (key) => {
    setDrawer(false);
    goTo({ page: "patients", patient: key });
  };
  // Back: return to the page we came from (Appointments, Patients, ...). If the page was opened
  // directly (no earlier page in this visit), go to the patient list instead.
  const goBack = () => {
    if (location.state && location.state.inApp) navigate(-1);
    else goTo({ page: "patients" }, true);
  };
  const openModal = (name, data = null) => {
    setPrefill(data);
    setModal(name);
  };
  const title =
    page === "patients" && selected ? "Patient details" : (nav.find((n) => n.id === page) || NAV[0]).label;

  return (
    <div className="ad-shell">
      <aside className={drawer ? "ad-side ad-side-open" : "ad-side"}>
        <div className="ad-brand">
          <span className="ad-logo"><ToothMark size={22} /></span>
          <div>
            <p className="ad-brand-name">Anand Dental</p>
            <p className="ad-brand-sub">Admin panel</p>
          </div>
        </div>
        <nav className="ad-nav">
          {nav.map(({ id, label, icon: Icon }) => (
            <button key={id} className={page === id ? "ad-nav-item ad-nav-on" : "ad-nav-item"} onClick={() => go(id)}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>
        <button className="ad-nav-item ad-logout" onClick={() => signOut(auth)}>
          <LogOut size={18} /> Logout
        </button>
      </aside>
      {drawer && <div className="ad-scrim" onClick={() => setDrawer(false)} />}

      <main className="ad-main">
        <header className="ad-top">
          <button className="ad-icon-btn ad-burger" onClick={() => setDrawer(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div className="ad-grow">
            <h1>{title}</h1>
            <p className="ad-muted">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <span className="ad-avatar ad-avatar-lg" title={user.email}>{initials(staff.name) || "AD"}</span>
        </header>

        <div className="ad-content">
          {loadError && <div className="ad-banner" role="alert">{loadError}</div>}

          {page === "overview" && (
            <Overview appointments={appointments} followups={followups} invoices={invoices} loading={apptCol.loading || fuCol.loading || invCol.loading} goTo={go} />
          )}
          {page === "appointments" && (
            <Appointments
              appointments={appointments}
              loading={apptCol.loading}
              onConfirm={(a) => setModal({ confirm: a })}
              onComplete={(a) => {
                setAddedFollowups([]);
                setModal({ complete: a });
              }}
              onPostpone={(a) => setModal({ postpone: a })}
              setStatus={(id, status) => updateAppt(id, { status })}
              onAdd={() => openModal("walkin")}
              onOpenPatient={openPatient}
            />
          )}
          {page === "patients" &&
            (selected ? (
              <PatientDetail
                key={selected.key}
                patient={selected}
                profile={profiles[profileId(selected.key)]}
                appointments={appointments}
                followups={followups}
                invoices={invoices}
                onBack={goBack}
                onSaveProfile={saveProfile}
                onAddFollowUp={() => openModal("followup", { name: selected.name, phone: selected.phone })}
                onAddInvoice={() => openModal("invoice", { name: selected.name, phone: selected.phone })}
                markPaid={markPaid}
              />
            ) : (
              <Patients patients={patients} loading={apptCol.loading} onOpen={openPatient} />
            ))}
          {page === "followups" && (
            <FollowUps followups={followups} loading={fuCol.loading} update={updateFollowup} onBook={(x) => setModal({ book: x })} onAdd={() => openModal("followup")} />
          )}
          {page === "billing" && (
            <Billing invoices={invoices} loading={invCol.loading} markPaid={markPaid} onAdd={() => openModal("invoice")} />
          )}
          {page === "setup" && isAdmin && (
            <ClinicSetup
              doctorRows={docCol.rows}
              treatmentRows={trCol.rows}
              loading={docCol.loading || trCol.loading}
              act={act}
              flash={flash}
            />
          )}
          {page === "staff" && isAdmin && <StaffPage me={user} flash={flash} />}
        </div>
      </main>

      {modal === "walkin" && (
        <WalkInForm
          appointments={appointments}
          doctors={doctors}
          doctorHours={doctorHours}
          treatments={treatments}
          onSave={saveWalkIn}
          onClose={() => setModal(null)}
        />
      )}
      {modal && modal.confirm && (
        <ConfirmForm
          appointment={modal.confirm}
          appointments={appointments}
          doctors={doctors}
          doctorHours={doctorHours}
          onSave={saveConfirm}
          onClose={() => setModal(null)}
        />
      )}
      {modal && modal.postpone && (
        <PostponeForm
          appointment={modal.postpone}
          appointments={appointments}
          doctors={doctors}
          doctorHours={doctorHours}
          onSave={savePostpone}
          onClose={() => setModal(null)}
        />
      )}
      {modal && modal.book && (
        <BookFollowUpForm
          followup={modal.book}
          patient={patients.find((q) => q.key === patientKey(modal.book.phone, modal.book.patient))}
          appointments={appointments}
          doctors={doctors}
          doctorHours={doctorHours}
          treatments={treatments}
          onSave={saveBook}
          onClose={() => setModal(null)}
        />
      )}
      {modal && modal.complete && (
        <CompleteForm
          appointment={modal.complete}
          treatments={treatments}
          added={addedFollowups}
          onFollowUp={() => setFuFor({ name: modal.complete.patient, phone: modal.complete.phone })}
          onSave={saveComplete}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "followup" && <FollowUpForm patients={patients} initial={prefill} onSave={saveFollowUp} onClose={() => setModal(null)} />}
      {fuFor && <FollowUpForm patients={patients} initial={fuFor} onSave={saveStackedFollowUp} onClose={() => setFuFor(null)} />}
      {modal === "invoice" && <InvoiceForm patients={patients} treatments={treatments} initial={prefill} onSave={saveInvoice} onClose={() => setModal(null)} />}

      {toast && (
        <div className={toast.error ? "ad-toast ad-toast-error" : "ad-toast"} role="status">
          {toast.text}
        </div>
      )}
    </div>
  );
}

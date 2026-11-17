
import { useEffect, useMemo, useState } from "react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

import {
  Plus,
  Trash2,
  Clock,
  Search,
  Stethoscope,
  Activity,
  IndianRupee,
  Eye,
  EyeOff,
  Users,
  Settings2,
  CalendarClock,
  Sparkles,
  CheckCircle2,
  X,
} from "lucide-react";

import { db } from "../../firebase";

import {
  fmtHours,
  initials,
  byName,
  DEFAULT_HOURS,
  DEFAULT_DOCTORS,
  DEFAULT_TREATMENTS,
} from "../utils";

import { Empty } from "../components/Common";
import { DoctorHoursForm } from "../forms/DoctorHoursForm";

import "./ClinicSetup.css";

/* =========================================================
   PRICE EDITOR
   ========================================================= */

function PriceEdit({ value, onSave }) {
  const [v, setV] = useState(String(value ?? 0));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setV(String(value ?? 0));
  }, [value]);

  const commit = async () => {
    const n = Number(v);

    if (!Number.isFinite(n) || n < 0) {
      setV(String(value ?? 0));
      return;
    }

    if (n === Number(value || 0)) return;

    try {
      setSaving(true);
      await onSave(n);
    } finally {
      setSaving(false);
    }
  };

  return (
    <label className="ad-cs-price-editor">
      <span>₹</span>

      <input
        type="number"
        min="0"
        step="1"
        value={v}
        aria-label="Default treatment price"
        disabled={saving}
        onChange={(e) => setV(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }

          if (e.key === "Escape") {
            setV(String(value ?? 0));
            e.currentTarget.blur();
          }
        }}
      />
    </label>
  );
}

/* =========================================================
   MAIN PAGE
   ========================================================= */

export function ClinicSetup({
  doctorRows = [],
  treatmentRows = [],
  loading,
  act,
  flash,
}) {
  const [dName, setDName] = useState("");
  const [tName, setTName] = useState("");
  const [tPrice, setTPrice] = useState("");

  const [hoursFor, setHoursFor] = useState(null);

  const [doctorSearch, setDoctorSearch] = useState("");
  const [treatmentSearch, setTreatmentSearch] = useState("");

  const [doctorFilter, setDoctorFilter] = useState("all");
  const [treatmentFilter, setTreatmentFilter] = useState("all");

  const [addingDoctor, setAddingDoctor] = useState(false);
  const [addingTreatment, setAddingTreatment] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const doctors = useMemo(
    () => [...doctorRows].sort(byName),
    [doctorRows]
  );

  const treatments = useMemo(
    () => [...treatmentRows].sort(byName),
    [treatmentRows]
  );

  const activeDoctors = doctors.filter(
    (d) => d.active !== false
  ).length;

  const inactiveDoctors = doctors.length - activeDoctors;

  const activeTreatments = treatments.filter(
    (t) => t.active !== false
  ).length;

  const inactiveTreatments = treatments.length - activeTreatments;

  const nothingYet =
    !loading &&
    doctors.length === 0 &&
    treatments.length === 0;

  const visibleDoctors = useMemo(() => {
    const query = doctorSearch.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const matchesSearch =
        !query ||
        doctor.name?.toLowerCase().includes(query);

      const matchesFilter =
        doctorFilter === "all" ||
        (doctorFilter === "active" && doctor.active !== false) ||
        (doctorFilter === "hidden" && doctor.active === false);

      return matchesSearch && matchesFilter;
    });
  }, [doctors, doctorSearch, doctorFilter]);

  const visibleTreatments = useMemo(() => {
    const query = treatmentSearch.trim().toLowerCase();

    return treatments.filter((treatment) => {
      const matchesSearch =
        !query ||
        treatment.name?.toLowerCase().includes(query);

      const matchesFilter =
        treatmentFilter === "all" ||
        (treatmentFilter === "active" && treatment.active !== false) ||
        (treatmentFilter === "hidden" && treatment.active === false);

      return matchesSearch && matchesFilter;
    });
  }, [treatments, treatmentSearch, treatmentFilter]);

  /* =========================================================
     ADD DOCTOR
     ========================================================= */

  const addDoctor = async (e) => {
    e.preventDefault();

    const name = dName.trim();

    if (!name || addingDoctor) return;

    if (
      doctors.some(
        (d) =>
          (d.name || "").trim().toLowerCase() ===
          name.toLowerCase()
      )
    ) {
      flash("That doctor is already in the list.", true);
      return;
    }

    setAddingDoctor(true);

    try {
      const ok = await act(
        () =>
          addDoc(collection(db, "doctors"), {
            name,
            active: true,
            hours: DEFAULT_HOURS,
            createdAt: serverTimestamp(),
          }),
        "Doctor added."
      );

      if (ok) setDName("");
    } finally {
      setAddingDoctor(false);
    }
  };

  /* =========================================================
     ADD TREATMENT
     ========================================================= */

  const addTreatment = async (e) => {
    e.preventDefault();

    const name = tName.trim();

    if (!name || addingTreatment) return;

    if (
      treatments.some(
        (t) =>
          (t.name || "").trim().toLowerCase() ===
          name.toLowerCase()
      )
    ) {
      flash("That treatment is already in the list.", true);
      return;
    }

    const price = Number(tPrice);

    if (tPrice.trim() !== "" && (!Number.isFinite(price) || price < 0)) {
      flash("Enter a valid treatment price.", true);
      return;
    }

    setAddingTreatment(true);

    try {
      const ok = await act(
        () =>
          addDoc(collection(db, "treatments"), {
            name,
            price: price || 0,
            active: true,
            createdAt: serverTimestamp(),
          }),
        "Treatment added."
      );

      if (ok) {
        setTName("");
        setTPrice("");
      }
    } finally {
      setAddingTreatment(false);
    }
  };

  /* =========================================================
     TOGGLE ACTIVE STATE
     ========================================================= */

  const toggle = (col, row) =>
    act(
      () =>
        updateDoc(doc(db, col, row.id), {
          active: row.active === false,
        }),
      row.active === false
        ? `${row.name} is now visible.`
        : `${row.name} is now hidden.`
    );

  /* =========================================================
     DELETE
     ========================================================= */

  const remove = (col, row, label) => {
    if (
      !window.confirm(
        `Remove ${row.name}? Old appointments and invoices keep the ${label} name.`
      )
    ) {
      return;
    }

    act(
      () => deleteDoc(doc(db, col, row.id)),
      `${label[0].toUpperCase()}${label.slice(1)} removed.`
    );
  };

  /* =========================================================
     SEED DEFAULT DATA
     ========================================================= */

  const seed = async () => {
    if (seeding) return;

    setSeeding(true);

    try {
      await act(async () => {
        const batch = writeBatch(db);

        DEFAULT_DOCTORS.forEach((name) => {
          batch.set(doc(collection(db, "doctors")), {
            name,
            active: true,
            hours: DEFAULT_HOURS,
            createdAt: serverTimestamp(),
          });
        });

        DEFAULT_TREATMENTS.forEach((name) => {
          batch.set(doc(collection(db, "treatments")), {
            name,
            price: 0,
            active: true,
            createdAt: serverTimestamp(),
          });
        });

        await batch.commit();
      }, "Starter list added. Set the prices below.");
    } finally {
      setSeeding(false);
    }
  };

  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <div className="ad-cs-loading">
        <div className="ad-cs-spinner" />
        <p>Loading clinic configuration...</p>
      </div>
    );
  }

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <section className="ad-cs-page">

      {/* Page heading */}
      <div className="ad-cs-heading">
        <div>
          <div className="ad-cs-eyebrow">
            <Sparkles size={13} />
            CLINIC CONFIGURATION
          </div>

          <h2>Clinic setup</h2>

          <p>
            Manage your doctors, working schedules, treatments
            and default consultation prices.
          </p>
        </div>

        <div className="ad-cs-heading-badge">
          <Settings2 size={16} />
          Admin settings
        </div>
      </div>

      {/* Statistics */}
      <div className="ad-cs-stats">

        <div className="ad-cs-stat">
          <div className="ad-cs-stat-icon blue">
            <Stethoscope size={20} />
          </div>

          <div>
            <span>Total doctors</span>
            <strong>{doctors.length}</strong>
            <small>{activeDoctors} active · {inactiveDoctors} hidden</small>
          </div>
        </div>

        <div className="ad-cs-stat">
          <div className="ad-cs-stat-icon green">
            <Users size={20} />
          </div>

          <div>
            <span>Available doctors</span>
            <strong>{activeDoctors}</strong>
            <small>Visible in appointment forms</small>
          </div>
        </div>

        <div className="ad-cs-stat">
          <div className="ad-cs-stat-icon violet">
            <Activity size={20} />
          </div>

          <div>
            <span>Total treatments</span>
            <strong>{treatments.length}</strong>
            <small>{activeTreatments} active · {inactiveTreatments} hidden</small>
          </div>
        </div>

        <div className="ad-cs-stat">
          <div className="ad-cs-stat-icon amber">
            <IndianRupee size={20} />
          </div>

          <div>
            <span>Priced treatments</span>
            <strong>
              {treatments.filter(
                (t) => t.active !== false && Number(t.price) > 0
              ).length}
            </strong>
            <small>Active treatments with a price</small>
          </div>
        </div>

      </div>

      {/* Empty starter state */}
      {nothingYet && (
        <section className="ad-cs-seed">
          <div className="ad-cs-seed-icon">
            <Sparkles size={25} />
          </div>

          <div className="ad-cs-seed-copy">
            <h3>Your clinic setup is ready to begin</h3>
            <p>
              Add the starter doctors and treatments to quickly
              configure your clinic. You can edit everything afterward.
            </p>
          </div>

          <button
            className="ad-btn ad-btn-primary"
            onClick={seed}
            disabled={seeding}
          >
            <Plus size={16} />
            {seeding ? "Adding..." : "Add starter list"}
          </button>
        </section>
      )}

      {/* Management columns */}
      <div className="ad-cs-grid">

        {/* =================================================
            DOCTORS
            ================================================= */}

        <section className="ad-cs-panel">

          <div className="ad-cs-panel-heading">
            <div className="ad-cs-panel-title">
              <div className="ad-cs-panel-icon blue">
                <Stethoscope size={19} />
              </div>

              <div>
                <h3>Doctors</h3>
                <p>Manage your clinic's medical team</p>
              </div>
            </div>

            <span className="ad-cs-total">
              {doctors.length} total
            </span>
          </div>

          {/* Add doctor */}
          <form
            className="ad-cs-add-form"
            onSubmit={addDoctor}
          >
            <div className="ad-cs-input-wrap">
              <Plus size={16} />
              <input
                value={dName}
                onChange={(e) => setDName(e.target.value)}
                placeholder="Enter doctor name..."
                aria-label="Doctor name"
                maxLength={100}
              />
            </div>

            <button
              className="ad-btn ad-btn-primary"
              type="submit"
              disabled={!dName.trim() || addingDoctor}
            >
              <Plus size={16} />
              {addingDoctor ? "Adding..." : "Add doctor"}
            </button>
          </form>

          {/* Search and filters */}
          <div className="ad-cs-list-toolbar">
            <div className="ad-cs-search">
              <Search size={15} />
              <input
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                placeholder="Search doctors..."
              />
              {doctorSearch && (
                <button
                  type="button"
                  onClick={() => setDoctorSearch("")}
                  aria-label="Clear doctor search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              aria-label="Filter doctors"
            >
              <option value="all">All doctors</option>
              <option value="active">Active</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>

          {/* Doctor list */}
          <div className="ad-cs-list-heading">
            <span>DOCTOR DIRECTORY</span>
            <span>{visibleDoctors.length} results</span>
          </div>

          {doctors.length === 0 ? (
            <Empty text="No doctors added yet." />
          ) : visibleDoctors.length === 0 ? (
            <div className="ad-cs-no-results">
              No doctors match your search.
            </div>
          ) : (
            <div className="ad-cs-doctor-list">
              {visibleDoctors.map((doctor) => {
                const isActive = doctor.active !== false;
                const hours = fmtHours(doctor.hours);

                return (
                  <article
                    key={doctor.id}
                    className={`ad-cs-doctor ${!isActive ? "is-hidden" : ""}`}
                  >
                    <div className="ad-cs-doctor-main">
                      <div className="ad-cs-avatar">
                        {initials(doctor.name)}
                      </div>

                      <div className="ad-cs-doctor-info">
                        <div className="ad-cs-doctor-name">
                          <h4>{doctor.name}</h4>

                          <span
                            className={`ad-cs-status ${isActive ? "active" : "hidden"}`}
                          >
                            <span />
                            {isActive ? "Active" : "Hidden"}
                          </span>
                        </div>

                        <p className={`ad-cs-hours ${!hours ? "no-hours" : ""}`}>
                          <Clock size={13} />
                          {hours || "Working hours not set"}
                        </p>
                      </div>
                    </div>

                    <div className="ad-cs-doctor-actions">

                      <button
                        className="ad-cs-action-btn"
                        onClick={() => setHoursFor(doctor)}
                        title="Manage working hours"
                      >
                        <CalendarClock size={15} />
                        <span>
                          {hours ? "Edit hours" : "Set hours"}
                        </span>
                      </button>

                      <button
                        className="ad-cs-action-btn"
                        onClick={() => toggle("doctors", doctor)}
                        title={isActive ? "Hide doctor" : "Show doctor"}
                      >
                        {isActive ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                        <span>{isActive ? "Hide" : "Show"}</span>
                      </button>

                      <button
                        className="ad-cs-delete"
                        onClick={() => remove("doctors", doctor, "doctor")}
                        aria-label={`Remove ${doctor.name}`}
                        title="Remove doctor"
                      >
                        <Trash2 size={15} />
                      </button>

                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="ad-cs-panel-footer">
            <span>
              <CheckCircle2 size={14} />
              Active doctors appear in appointment forms
            </span>
          </div>

        </section>

        {/* =================================================
            TREATMENTS
            ================================================= */}

        <section className="ad-cs-panel">

          <div className="ad-cs-panel-heading">
            <div className="ad-cs-panel-title">
              <div className="ad-cs-panel-icon violet">
                <Activity size={19} />
              </div>

              <div>
                <h3>Treatments & prices</h3>
                <p>Configure your clinic's services</p>
              </div>
            </div>

            <span className="ad-cs-total">
              {treatments.length} total
            </span>
          </div>

          {/* Add treatment */}
          <form
            className="ad-cs-add-form ad-cs-treatment-form"
            onSubmit={addTreatment}
          >
            <div className="ad-cs-input-wrap">
              <Plus size={16} />
              <input
                value={tName}
                onChange={(e) => setTName(e.target.value)}
                placeholder="Treatment name..."
                aria-label="Treatment name"
                maxLength={100}
              />
            </div>

            <div className="ad-cs-new-price">
              <span>₹</span>
              <input
                type="number"
                min="0"
                step="1"
                value={tPrice}
                onChange={(e) => setTPrice(e.target.value)}
                placeholder="Price"
                aria-label="Treatment price"
              />
            </div>

            <button
              className="ad-btn ad-btn-primary"
              type="submit"
              disabled={!tName.trim() || addingTreatment}
            >
              <Plus size={16} />
              {addingTreatment ? "Adding..." : "Add"}
            </button>
          </form>

          {/* Search and filters */}
          <div className="ad-cs-list-toolbar">
            <div className="ad-cs-search">
              <Search size={15} />
              <input
                value={treatmentSearch}
                onChange={(e) => setTreatmentSearch(e.target.value)}
                placeholder="Search treatments..."
              />

              {treatmentSearch && (
                <button
                  type="button"
                  onClick={() => setTreatmentSearch("")}
                  aria-label="Clear treatment search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              value={treatmentFilter}
              onChange={(e) => setTreatmentFilter(e.target.value)}
              aria-label="Filter treatments"
            >
              <option value="all">All treatments</option>
              <option value="active">Active</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>

          {/* Treatment list */}
          <div className="ad-cs-list-heading">
            <span>TREATMENT DIRECTORY</span>
            <span>{visibleTreatments.length} results</span>
          </div>

          {treatments.length === 0 ? (
            <Empty text="No treatments added yet." />
          ) : visibleTreatments.length === 0 ? (
            <div className="ad-cs-no-results">
              No treatments match your search.
            </div>
          ) : (
            <div className="ad-cs-treatment-list">
              {visibleTreatments.map((treatment) => {
                const isActive = treatment.active !== false;

                return (
                  <article
                    key={treatment.id}
                    className={`ad-cs-treatment ${!isActive ? "is-hidden" : ""}`}
                  >
                    <div className="ad-cs-treatment-info">
                      <div className="ad-cs-treatment-symbol">
                        <Activity size={17} />
                      </div>

                      <div>
                        <h4>{treatment.name}</h4>

                        <span
                          className={`ad-cs-status ${isActive ? "active" : "hidden"}`}
                        >
                          <span />
                          {isActive ? "Active" : "Hidden"}
                        </span>
                      </div>
                    </div>

                    <div className="ad-cs-treatment-price">
                      <span>DEFAULT PRICE</span>

                      <PriceEdit
                        value={treatment.price}
                        onSave={(n) =>
                          act(
                            () =>
                              updateDoc(
                                doc(db, "treatments", treatment.id),
                                { price: n }
                              ),
                            "Price updated."
                          )
                        }
                      />
                    </div>

                    <div className="ad-cs-treatment-actions">
                      <button
                        className="ad-cs-action-btn"
                        onClick={() => toggle("treatments", treatment)}
                        title={isActive ? "Hide treatment" : "Show treatment"}
                      >
                        {isActive ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                        <span>{isActive ? "Hide" : "Show"}</span>
                      </button>

                      <button
                        className="ad-cs-delete"
                        onClick={() =>
                          remove("treatments", treatment, "treatment")
                        }
                        aria-label={`Remove ${treatment.name}`}
                        title="Remove treatment"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="ad-cs-price-note">
            <IndianRupee size={16} />
            <p>
              Default prices automatically fill the amount in New Invoice.
              You can still change the price for individual invoices.
            </p>
          </div>

        </section>
      </div>

      {/* Doctor working hours modal */}
      {hoursFor && (
        <DoctorHoursForm
          doctor={hoursFor}
          onSave={async (hours) => {
            const ok = await act(
              () =>
                updateDoc(
                  doc(db, "doctors", hoursFor.id),
                  { hours }
                ),
              "Working hours saved."
            );

            if (ok) setHoursFor(null);

            return ok;
          }}
          onClose={() => setHoursFor(null)}
        />
      )}

    </section>
  );
}

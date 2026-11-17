
import {
  CalendarClock,
  CalendarDays,
  User,
  Plus,
  Search,
  Check,
  CheckCheck,
  Ban,
  Clock3,
  Stethoscope,
  Users,
  CalendarCheck,
  X,
  SlidersHorizontal,
  ArrowUpRight,
} from "lucide-react";

import { todayISO, fmtDate, patientKey, waLink } from "../utils";
import { usePersistentState } from "../hooks/usePersistentState";
import { Badge, Empty } from "../components/Common";
import { WhatsAppIcon } from "../components/WhatsAppIcon";
import { ActionMenu } from "../components/ActionMenu";
import "./Appointments.css";

export function Appointments({
  appointments = [],
  loading,
  onConfirm,
  onComplete,
  onPostpone,
  setStatus,
  onAdd,
  onOpenPatient,
}) {
  const [q, setQ] = usePersistentState("ad.appt.q", "");
  const [status, setStatusFilter] = usePersistentState(
    "ad.appt.status",
    "all"
  );
  const [range, setRange] = usePersistentState(
    "ad.appt.range",
    "all"
  );

  const today = todayISO();

  const safeAppointments = Array.isArray(appointments)
    ? appointments
    : [];

  const count = (fn) => safeAppointments.filter(fn).length;

  const chips = [
    {
      id: "all",
      label: "Total appointments",
      sub: "All appointments",
      n: safeAppointments.length,
      tone: "blue",
      status: "all",
      range: "all",
      icon: CalendarDays,
    },
    {
      id: "new",
      label: "Pending",
      sub: "Awaiting confirmation",
      n: count((a) => a.status === "new"),
      tone: "amber",
      status: "new",
      range: "all",
      icon: Clock3,
    },
    {
      id: "confirmed",
      label: "Confirmed",
      sub: "Successfully booked",
      n: count((a) => a.status === "confirmed"),
      tone: "blue",
      status: "confirmed",
      range: "all",
      icon: CalendarCheck,
    },
    {
      id: "completed",
      label: "Completed",
      sub: "Consultations done",
      n: count((a) => a.status === "completed"),
      tone: "green",
      status: "completed",
      range: "all",
      icon: CheckCheck,
    },
    {
      id: "cancelled",
      label: "Cancelled",
      sub: "Cancelled bookings",
      n: count((a) => a.status === "cancelled"),
      tone: "red",
      status: "cancelled",
      range: "all",
      icon: X,
    },
    {
      id: "today",
      label: "Today's visits",
      sub: "Not cancelled",
      n: count(
        (a) => a.date === today && a.status !== "cancelled"
      ),
      tone: "violet",
      status: "all",
      range: "today",
      icon: CalendarClock,
    },
  ];

  const chipOn = (c) =>
    status === c.status && range === c.range;

  const pickChip = (c) => {
    const alreadySelected = chipOn(c);

    setStatusFilter(alreadySelected ? "all" : c.status);
    setRange(alreadySelected ? "all" : c.range);
  };

  const searchTerm = q.trim().toLowerCase();

  const rows = safeAppointments
    .filter((a) => status === "all" || a.status === status)
    .filter((a) => {
      if (range === "all") return true;
      if (range === "today") return a.date === today;
      if (range === "upcoming") return a.date >= today;
      if (range === "past") return a.date < today;
      return true;
    })
    .filter((a) => {
      const searchable = [
        a.patient,
        a.phone,
        a.treatment,
        a.doctor,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(searchTerm);
    })
    .sort((a, b) => {
      const dateA = `${a.date || ""} ${a.time || ""}`;
      const dateB = `${b.date || ""} ${b.time || ""}`;

      return dateA.localeCompare(dateB);
    });

  const message = (a) => {
    if (a.postponedFrom && a.time) {
      return `Hello ${a.patient}, this is Anand Dental Clinic. Your ${
        a.treatment
      } appointment has been rescheduled to ${fmtDate(a.date)} at ${
        a.time
      }. Sorry for the inconvenience.`;
    }

    if (a.time) {
      return `Hello ${a.patient}, this is Anand Dental Clinic. Your ${
        a.treatment
      } appointment is on ${fmtDate(a.date)} at ${a.time}.`;
    }

    return `Hello ${a.patient}, this is Anand Dental Clinic. We received your request for ${
      a.treatment
    } on ${fmtDate(a.date)}. We will confirm the time shortly.`;
  };

  const cancel = (a) => {
    if (
      window.confirm(
        `Cancel ${a.patient}'s appointment on ${fmtDate(a.date)}?`
      )
    ) {
      setStatus(a.id, "cancelled");
    }
  };

  const menuItems = (a) =>
    [
      a.status === "new" && {
        label: "Confirm appointment",
        icon: Check,
        onClick: () => onConfirm(a),
      },

      a.status === "confirmed" && {
        label: "Mark as completed",
        icon: CheckCheck,
        onClick: () => onComplete(a),
      },

      a.status === "confirmed" && {
        label: "Postpone appointment",
        icon: CalendarClock,
        onClick: () => onPostpone(a),
      },

      {
        label: "View patient profile",
        icon: User,
        onClick: () =>
          onOpenPatient(patientKey(a.phone, a.patient)),
      },

      (a.status === "new" || a.status === "confirmed") && {
        label: "Cancel appointment",
        icon: Ban,
        tone: "danger",
        onClick: () => cancel(a),
      },
    ].filter(Boolean);

  const clearFilters = () => {
    setQ("");
    setStatusFilter("all");
    setRange("all");
  };

  const hasFilters =
    q.trim() !== "" || status !== "all" || range !== "all";

  return (
    <main className="ad-appt-page">

      {/* PAGE HEADER */}
      <header className="ad-appt-header">
        <div className="ad-appt-heading">
          <div className="ad-appt-heading-icon">
            <CalendarDays size={23} />
          </div>

          <div>
            <div className="ad-appt-eyebrow">
              CLINIC MANAGEMENT
            </div>

            <h1>Appointments</h1>

            <p>
              Manage patient visits, confirmations and
              treatment schedules.
            </p>
          </div>
        </div>

        <div className="ad-appt-header-actions">
          <div className="ad-appt-live">
            <span className="ad-appt-live-dot" />
            Appointment overview
          </div>

          <button
            type="button"
            className="ad-appt-add-btn"
            onClick={onAdd}
          >
            <Plus size={18} />
            <span>Add walk-in</span>
          </button>
        </div>
      </header>

      {/* STATISTICS */}
      <section className="ad-appt-stats">
        {chips.map((c) => {
          const Icon = c.icon;

          return (
            <button
              key={c.id}
              type="button"
              className={`ad-appt-stat ad-appt-stat-${c.tone} ${
                chipOn(c) ? "is-active" : ""
              }`}
              onClick={() => pickChip(c)}
              aria-pressed={chipOn(c)}
            >
              <div className="ad-appt-stat-top">
                <span className="ad-appt-stat-icon">
                  <Icon size={19} />
                </span>

                <span className="ad-appt-stat-arrow">
                  <ArrowUpRight size={16} />
                </span>
              </div>

              <div className="ad-appt-stat-number">
                {c.n}
              </div>

              <div className="ad-appt-stat-label">
                {c.label}
              </div>

              <div className="ad-appt-stat-sub">
                {c.sub}
              </div>
            </button>
          );
        })}
      </section>

      {/* APPOINTMENTS CONTENT */}
      <section className="ad-appt-content">

        <div className="ad-appt-content-header">
          <div>
            <div className="ad-appt-section-title">
              All appointments
            </div>

            <p className="ad-appt-section-subtitle">
              View and manage your clinic's appointments.
            </p>
          </div>

          <div className="ad-appt-total-pill">
            <Users size={15} />
            {safeAppointments.length} records
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="ad-appt-toolbar">

          <div className="ad-appt-search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search patient, phone, treatment or doctor..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search appointments"
            />

            {q && (
              <button
                type="button"
                className="ad-appt-clear-search"
                onClick={() => setQ("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="ad-appt-filter">
            <SlidersHorizontal size={16} />

            <select
              value={status}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="new">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="ad-appt-filter">
            <CalendarDays size={16} />

            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              aria-label="Filter by date"
            >
              <option value="all">All dates</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>

          {hasFilters && (
            <button
              type="button"
              className="ad-appt-reset"
              onClick={clearFilters}
            >
              <X size={15} />
              Clear
            </button>
          )}
        </div>

        {/* RESULTS SUMMARY */}
        {!loading && (
          <div className="ad-appt-results">
            <span>
              Showing <strong>{rows.length}</strong> of{" "}
              <strong>{safeAppointments.length}</strong> appointments
            </span>

            {hasFilters && (
              <span className="ad-appt-filter-active">
                <span />
                Filters applied
              </span>
            )}
          </div>
        )}

        {/* TABLE */}
        {loading ? (
          <div className="ad-appt-loading">
            <div className="ad-appt-loader" />
            <span>Loading appointments...</span>
          </div>
        ) : rows.length === 0 ? (
          <div className="ad-appt-empty">
            <div className="ad-appt-empty-icon">
              <CalendarDays size={28} />
            </div>

            <h3>
              {safeAppointments.length === 0
                ? "No appointments yet"
                : "No matching appointments"}
            </h3>

            <p>
              {safeAppointments.length === 0
                ? "Website bookings and walk-in appointments will appear here."
                : "Try changing your search or filters to find an appointment."}
            </p>

            {hasFilters && (
              <button
                type="button"
                className="ad-appt-empty-reset"
                onClick={clearFilters}
              >
                Clear all filters
              </button>
            )}

            {safeAppointments.length === 0 && (
              <button
                type="button"
                className="ad-appt-empty-reset"
                onClick={onAdd}
              >
                <Plus size={16} />
                Add walk-in appointment
              </button>
            )}
          </div>
        ) : (
          <div className="ad-appt-table-wrap">
            <table className="ad-appt-table">
              <thead>
                <tr>
                  <th>Patient details</th>
                  <th>Treatment</th>
                  <th>Doctor</th>
                  <th>Date & time</th>
                  <th>Status</th>
                  <th className="ad-appt-action-heading">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((a) => {
                  const treatments = Array.isArray(a.treatments)
                    ? a.treatments
                    : [];

                  return (
                    <tr key={a.id}>
                      {/* PATIENT */}
                      <td data-label="Patient">
                        <div className="ad-appt-patient">
                          <div className="ad-appt-avatar">
                            {(a.patient || "?")
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="ad-appt-patient-info">
                            <button
                              type="button"
                              className="ad-appt-patient-name"
                              onClick={() =>
                                onOpenPatient(
                                  patientKey(a.phone, a.patient)
                                )
                              }
                            >
                              {a.patient || "Unknown patient"}
                            </button>

                            <span className="ad-appt-phone">
                              {a.phone || "No phone provided"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* TREATMENT */}
                      <td data-label="Treatment">
                        <div className="ad-appt-treatment">
                          <span className="ad-appt-treatment-icon">
                            <Stethoscope size={15} />
                          </span>

                          <div className="ad-appt-treatment-info">
                            <strong>
                              {a.treatment || "General consultation"}
                            </strong>

                            {treatments.length > 1 && (
                              <span>
                                + {treatments.slice(1).join(", ")}
                              </span>
                            )}
                          </div>
                        </div>

                        {a.message && (
                          <p
                            className="ad-appt-note"
                            title={a.message}
                          >
                            {a.message}
                          </p>
                        )}
                      </td>

                      {/* DOCTOR */}
                      <td data-label="Doctor">
                        <div className="ad-appt-doctor">
                          <User size={15} />
                          <span>{a.doctor || "Not assigned"}</span>
                        </div>
                      </td>

                      {/* DATE AND TIME */}
                      <td data-label="Date & time">
                        <div className="ad-appt-datetime">
                          <strong>
                            {a.date ? fmtDate(a.date) : "Date not set"}
                          </strong>

                          <span>
                            <Clock3 size={13} />
                            {a.time || "Time not set"}
                          </span>
                        </div>

                        {a.postponedFrom && (
                          <div className="ad-appt-postponed">
                            <CalendarClock size={12} />
                            Rescheduled from{" "}
                            {fmtDate(a.postponedFrom.date)}
                            {a.postponedFrom.time
                              ? `, ${a.postponedFrom.time}`
                              : ""}
                          </div>
                        )}
                      </td>

                      {/* STATUS */}
                      <td data-label="Status">
                        <div className="ad-appt-status">
                          <Badge status={a.status} />
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td data-label="Actions">
                        <div className="ad-appt-actions">

                          {a.phone && (
                            <a
                              className="ad-appt-wa"
                              aria-label={`WhatsApp ${a.patient}`}
                              title="Message on WhatsApp"
                              href={waLink(a.phone, message(a))}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <WhatsAppIcon size={18} />
                            </a>
                          )}

                          <ActionMenu items={menuItems(a)} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* FOOTER */}
        {!loading && rows.length > 0 && (
          <div className="ad-appt-footer">
            <span>
              Displaying {rows.length} appointment
              {rows.length !== 1 ? "s" : ""}
            </span>

            <span>
              Anand Dental Clinic & Implant Center
            </span>
          </div>
        )}
      </section>
    </main>
  );
}

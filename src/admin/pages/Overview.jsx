
import { useMemo } from "react";

import {
  CalendarDays,
  BellRing,
  IndianRupee,
  Inbox,
  Users,
  ArrowUpRight,
  ArrowRight,
  Clock3,
  CheckCircle2,
  CalendarCheck,
  Activity,
  Stethoscope,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Wallet,
} from "lucide-react";

import {
  todayISO,
  inr,
  initials,
  weekDays,
} from "../utils";

import {
  Badge,
  Empty,
} from "../components/Common";

import "./Overview.css";


/* =========================================================
   HELPERS
   ========================================================= */

const safeNumber = (value) => Number(value) || 0;

const getTreatments = (appointment) => {
  if (
    Array.isArray(appointment.treatments) &&
    appointment.treatments.length
  ) {
    return appointment.treatments.filter(Boolean);
  }

  return appointment.treatment
    ? [appointment.treatment]
    : [];
};

const formatTime = (time) => time || "--:--";


/* =========================================================
   OVERVIEW DASHBOARD
   ========================================================= */

export function Overview({
  appointments = [],
  followups = [],
  invoices = [],
  loading,
  goTo,
}) {
  const today = todayISO();

  const safeAppointments = Array.isArray(appointments)
    ? appointments
    : [];

  const safeFollowups = Array.isArray(followups)
    ? followups
    : [];

  const safeInvoices = Array.isArray(invoices)
    ? invoices
    : [];


  /* =======================================================
     APPOINTMENT DATA
     ======================================================= */

  const live = useMemo(
    () =>
      safeAppointments.filter(
        (a) => a.status !== "cancelled"
      ),
    [safeAppointments]
  );

  const todays = useMemo(
    () =>
      live
        .filter((a) => a.date === today)
        .sort((a, b) =>
          formatTime(a.time).localeCompare(formatTime(b.time))
        ),
    [live, today]
  );

  const newRequests = safeAppointments.filter(
    (a) => a.status === "new"
  ).length;

  const completedToday = todays.filter(
    (a) => a.status === "completed"
  ).length;

  const confirmedToday = todays.filter(
    (a) => a.status === "confirmed"
  ).length;


  /* =======================================================
     FOLLOW-UP DATA
     ======================================================= */

  const due = useMemo(
    () =>
      safeFollowups
        .filter(
          (x) =>
            !["done", "booked"].includes(x.status) &&
            x.due <= today
        )
        .sort((a, b) =>
          (a.due || "").localeCompare(b.due || "")
        ),
    [safeFollowups, today]
  );

  const overdueCount = due.filter(
    (x) => x.due < today
  ).length;


  /* =======================================================
     FINANCIAL DATA
     ======================================================= */

  const collected = safeInvoices
    .filter((i) => i.paid)
    .reduce(
      (sum, i) => sum + safeNumber(i.amount),
      0
    );

  const outstanding = safeInvoices
    .filter((i) => !i.paid)
    .reduce(
      (sum, i) => sum + safeNumber(i.amount),
      0
    );

  const totalBilled = safeInvoices.reduce(
    (sum, i) => sum + safeNumber(i.amount),
    0
  );


  /* =======================================================
     WEEKLY APPOINTMENT CHART
     ======================================================= */

  const week = useMemo(
    () =>
      weekDays().map((d) => ({
        ...d,
        n: live.filter((a) => a.date === d.iso).length,
        completed: live.filter(
          (a) =>
            a.date === d.iso &&
            a.status === "completed"
        ).length,
      })),
    [live]
  );

  const weekMax = Math.max(
    1,
    ...week.map((w) => w.n)
  );

  const weeklyTotal = week.reduce(
    (sum, w) => sum + w.n,
    0
  );

  const todayWeekEntry = week.find(
    (w) => w.iso === today
  );

  const chartTodayCount = todayWeekEntry?.n || 0;


  /* =======================================================
     POPULAR TREATMENTS
     ======================================================= */

  const mix = useMemo(() => {
    const counts = {};

    live.forEach((a) => {
      getTreatments(a).forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([t, n]) => ({ t, n }))
      .sort((a, b) => b.n - a.n)
      .slice(0, 5);
  }, [live]);

  const mixMax = Math.max(
    1,
    ...mix.map((m) => m.n)
  );


  /* =======================================================
     GREETING
     ======================================================= */

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";

    return "Good evening";
  }, []);

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    []
  );


  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <main className="ad-overview-page">
        <div className="ad-overview-loading">
          <div className="ad-overview-loader" />
          <h3>Preparing your dashboard</h3>
          <p>Loading clinic appointments and records...</p>
        </div>
      </main>
    );
  }


  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className="ad-overview-page">

      {/* =================================================
          WELCOME HEADER
         ================================================= */}

      <header className="ad-overview-header">

        <div className="ad-overview-welcome">
          <div className="ad-overview-welcome-icon">
            <Sparkles size={20} />
          </div>

          <div>
            <span className="ad-overview-eyebrow">
              ANAND DENTAL CLINIC & IMPLANT CENTER
            </span>

            <h1>
              {greeting}, <span>Welcome back.</span>
            </h1>

            <p>
              Here's what's happening at your clinic today.
            </p>
          </div>
        </div>

        <div className="ad-overview-header-right">
          <div className="ad-overview-date">
            <div className="ad-overview-date-icon">
              <CalendarDays size={18} />
            </div>

            <div>
              <span>Today</span>
              <strong>{dateLabel}</strong>
            </div>
          </div>
        </div>

      </header>


      {/* =================================================
          KPI STATISTICS
         ================================================= */}

      <section className="ad-overview-stats">

        {/* TODAY'S APPOINTMENTS */}

        <button
          type="button"
          className="ad-overview-stat"
          onClick={() => goTo("appointments")}
        >
          <div className="ad-overview-stat-top">
            <div className="ad-overview-stat-icon blue">
              <CalendarDays size={21} />
            </div>

            <span className="ad-overview-stat-indicator">
              <Activity size={12} />
              Today
            </span>
          </div>

          <div className="ad-overview-stat-value">
            {todays.length}
          </div>

          <div className="ad-overview-stat-label">
            Today's appointments
          </div>

          <div className="ad-overview-stat-bottom">
            <span>
              <CheckCircle2 size={13} />
              {completedToday} completed
            </span>

            <span>
              {confirmedToday} confirmed
            </span>
          </div>

          <div className="ad-overview-stat-decoration blue-decoration" />
        </button>


        {/* NEW REQUESTS */}

        <button
          type="button"
          className="ad-overview-stat"
          onClick={() => goTo("appointments")}
        >
          <div className="ad-overview-stat-top">
            <div className="ad-overview-stat-icon amber">
              <Inbox size={21} />
            </div>

            {newRequests > 0 ? (
              <span className="ad-overview-stat-alert">
                Action needed
              </span>
            ) : (
              <span className="ad-overview-stat-indicator">
                All clear
              </span>
            )}
          </div>

          <div className="ad-overview-stat-value">
            {newRequests}
          </div>

          <div className="ad-overview-stat-label">
            New appointment requests
          </div>

          <div className="ad-overview-stat-bottom">
            <span>
              <Clock3 size={13} />
              Waiting for confirmation
            </span>
          </div>

          <div className="ad-overview-stat-decoration amber-decoration" />
        </button>


        {/* FOLLOW-UPS */}

        <button
          type="button"
          className="ad-overview-stat"
          onClick={() => goTo("followups")}
        >
          <div className="ad-overview-stat-top">
            <div className="ad-overview-stat-icon violet">
              <BellRing size={21} />
            </div>

            {overdueCount > 0 ? (
              <span className="ad-overview-stat-alert">
                {overdueCount} overdue
              </span>
            ) : (
              <span className="ad-overview-stat-indicator">
                On track
              </span>
            )}
          </div>

          <div className="ad-overview-stat-value">
            {due.length}
          </div>

          <div className="ad-overview-stat-label">
            Follow-ups due
          </div>

          <div className="ad-overview-stat-bottom">
            <span>
              <AlertCircle size={13} />
              Due today or overdue
            </span>
          </div>

          <div className="ad-overview-stat-decoration violet-decoration" />
        </button>


        {/* COLLECTIONS */}

        <button
          type="button"
          className="ad-overview-stat"
          onClick={() => goTo("invoices")}
        >
          <div className="ad-overview-stat-top">
            <div className="ad-overview-stat-icon green">
              <IndianRupee size={21} />
            </div>

            <span className="ad-overview-stat-indicator">
              Collected
            </span>
          </div>

          <div className="ad-overview-stat-value ad-overview-money">
            {inr(collected)}
          </div>

          <div className="ad-overview-stat-label">
            Total collections
          </div>

          <div className="ad-overview-stat-bottom">
            <span>
              <Wallet size={13} />
              {inr(outstanding)} pending
            </span>
          </div>

          <div className="ad-overview-stat-decoration green-decoration" />
        </button>

      </section>


      {/* =================================================
          MAIN ANALYTICS
         ================================================= */}

      <section className="ad-overview-analytics">

        {/* WEEKLY CHART */}

        <div className="ad-overview-panel ad-overview-weekly">

          <div className="ad-overview-panel-header">
            <div>
              <span className="ad-overview-section-eyebrow">
                PERFORMANCE
              </span>

              <h2>Appointments this week</h2>

              <p>
                Weekly appointment activity at your clinic.
              </p>
            </div>

            <div className="ad-overview-panel-icon blue">
              <TrendingUp size={19} />
            </div>
          </div>

          <div className="ad-overview-week-summary">
            <div>
              <strong>{weeklyTotal}</strong>
              <span>Total appointments</span>
            </div>

            <div className="ad-overview-week-summary-right">
              <span>This week</span>
              <strong>
                {chartTodayCount} today
              </strong>
            </div>
          </div>

          <div
            className="ad-overview-chart"
            role="img"
            aria-label={`Weekly appointments: ${week.map((w) => `${w.label} ${w.n}`).join(", ")}`}
          >
            <div className="ad-overview-chart-grid">
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="ad-overview-chart-columns">
              {week.map((w, index) => {
                const percentage =
                  w.n === 0
                    ? 0
                    : Math.max(5, (w.n / weekMax) * 100);

                const isToday = w.iso === today;

                return (
                  <div
                    className={
                      isToday
                        ? "ad-overview-chart-col today"
                        : "ad-overview-chart-col"
                    }
                    key={w.iso}
                  >
                    <span className="ad-overview-chart-number">
                      {w.n}
                    </span>

                    <div className="ad-overview-chart-track">
                      <div
                        className={
                          isToday
                            ? "ad-overview-chart-bar active"
                            : "ad-overview-chart-bar"
                        }
                        style={{
                          height: `${percentage}%`,
                          animationDelay: `${index * 70}ms`,
                        }}
                      />
                    </div>

                    <span className="ad-overview-chart-day">
                      {w.label}
                    </span>

                    {isToday && (
                      <span className="ad-overview-chart-today">
                        Today
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="ad-overview-chart-legend">
            <span>
              <i />
              Appointments
            </span>

            <span>
              <i className="today-dot" />
              Current day
            </span>
          </div>

        </div>


        {/* POPULAR TREATMENTS */}

        <div className="ad-overview-panel ad-overview-treatments">

          <div className="ad-overview-panel-header">
            <div>
              <span className="ad-overview-section-eyebrow">
                CLINIC INSIGHTS
              </span>

              <h2>Popular treatments</h2>

              <p>
                Most requested treatments across appointments.
              </p>
            </div>

            <div className="ad-overview-panel-icon violet">
              <Stethoscope size={19} />
            </div>
          </div>

          {mix.length === 0 ? (
            <div className="ad-overview-empty">
              <div>
                <Stethoscope size={24} />
              </div>
              <strong>No treatment data yet</strong>
              <span>Treatments will appear as appointments are added.</span>
            </div>
          ) : (
            <div className="ad-overview-treatment-list">

              {mix.map((m, index) => (
                <div
                  className="ad-overview-treatment-item"
                  key={m.t}
                >
                  <div className="ad-overview-treatment-heading">

                    <div className="ad-overview-treatment-name">
                      <span className="ad-overview-treatment-rank">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <strong>{m.t}</strong>
                    </div>

                    <span className="ad-overview-treatment-count">
                      {m.n} visits
                    </span>
                  </div>

                  <div className="ad-overview-treatment-track">
                    <div
                      className={`ad-overview-treatment-fill rank-${index + 1}`}
                      style={{
                        width: `${(m.n / mixMax) * 100}%`,
                      }}
                    />
                  </div>

                </div>
              ))}

            </div>
          )}

          <button
            type="button"
            className="ad-overview-panel-footer"
            onClick={() => goTo("appointments")}
          >
            Explore appointments
            <ArrowRight size={15} />
          </button>

        </div>

      </section>


      {/* =================================================
          SCHEDULE AND FOLLOWUPS
         ================================================= */}

      <section className="ad-overview-lower">

        {/* TODAY'S SCHEDULE */}

        <div className="ad-overview-panel ad-overview-schedule">

          <div className="ad-overview-panel-header">

            <div>
              <span className="ad-overview-section-eyebrow">
                DAILY PLANNER
              </span>

              <h2>Today's schedule</h2>

              <p>
                Your clinic's appointments for today.
              </p>
            </div>

            <div className="ad-overview-schedule-heading-right">
              <span className="ad-overview-schedule-count">
                {todays.length} appointments
              </span>

              <button
                type="button"
                className="ad-overview-view-link"
                onClick={() => goTo("appointments")}
              >
                View all
                <ChevronRight size={15} />
              </button>
            </div>

          </div>

          {todays.length === 0 ? (
            <div className="ad-overview-empty">
              <div>
                <CalendarDays size={24} />
              </div>

              <strong>No appointments today</strong>

              <span>
                Your schedule is clear. New bookings will appear here.
              </span>
            </div>
          ) : (
            <div className="ad-overview-schedule-list">

              {todays.map((a, index) => (
                <div
                  className="ad-overview-schedule-item"
                  key={a.id}
                >

                  <div className="ad-overview-schedule-time">
                    <Clock3 size={14} />
                    <strong>{formatTime(a.time)}</strong>
                  </div>

                  <div className="ad-overview-schedule-timeline">
                    <span className="ad-overview-timeline-dot" />
                    {index !== todays.length - 1 && (
                      <span className="ad-overview-timeline-line" />
                    )}
                  </div>

                  <div className="ad-overview-schedule-patient">

                    <div className="ad-overview-patient-avatar">
                      {initials(a.patient)}
                    </div>

                    <div className="ad-overview-patient-info">
                      <strong>{a.patient || "Patient"}</strong>

                      <span>
                        {getTreatments(a).join(", ") || "Consultation"}
                      </span>

                      {a.doctor && (
                        <small>
                          <Stethoscope size={12} />
                          {a.doctor}
                        </small>
                      )}
                    </div>

                  </div>

                  <div className="ad-overview-schedule-status">
                    <Badge status={a.status} />
                  </div>

                </div>
              ))}

            </div>
          )}

          <button
            type="button"
            className="ad-overview-schedule-footer"
            onClick={() => goTo("appointments")}
          >
            Open appointment management
            <ArrowUpRight size={15} />
          </button>

        </div>


        {/* FOLLOW-UPS */}

        <div className="ad-overview-panel ad-overview-followups">

          <div className="ad-overview-panel-header">

            <div>
              <span className="ad-overview-section-eyebrow">
                PATIENT CARE
              </span>

              <h2>Follow-ups to send</h2>

              <p>
                Patients who need your attention.
              </p>
            </div>

            <div className="ad-overview-panel-icon amber">
              <BellRing size={19} />
            </div>

          </div>

          <div className="ad-overview-followup-summary">

            <div>
              <strong>{due.length}</strong>
              <span>Pending follow-ups</span>
            </div>

            <div className="ad-overview-followup-overdue">
              <strong>{overdueCount}</strong>
              <span>Overdue</span>
            </div>

          </div>

          {due.length === 0 ? (
            <div className="ad-overview-empty">
              <div>
                <CheckCircle2 size={24} />
              </div>

              <strong>All caught up!</strong>

              <span>
                No follow-ups are currently pending.
              </span>
            </div>
          ) : (
            <div className="ad-overview-followup-list">

              {due.slice(0, 6).map((x) => {
                const overdue = x.due < today;

                return (
                  <div
                    className="ad-overview-followup-item"
                    key={x.id}
                  >

                    <div className="ad-overview-followup-avatar">
                      {initials(x.patient)}
                    </div>

                    <div className="ad-overview-followup-info">
                      <strong>{x.patient || "Patient"}</strong>

                      <span>
                        {x.reason || "Follow-up"}
                      </span>
                    </div>

                    <div
                      className={
                        overdue
                          ? "ad-overview-followup-date overdue"
                          : "ad-overview-followup-date"
                      }
                    >
                      {overdue ? (
                        <AlertCircle size={12} />
                      ) : (
                        <CalendarDays size={12} />
                      )}

                      {overdue ? "Overdue" : "Today"}
                    </div>

                  </div>
                );
              })}

            </div>
          )}

          {due.length > 0 && (
            <button
              type="button"
              className="ad-overview-panel-footer"
              onClick={() => goTo("followups")}
            >
              Manage follow-ups
              <ArrowRight size={15} />
            </button>
          )}

        </div>

      </section>


      {/* =================================================
          BOTTOM FINANCIAL SUMMARY
         ================================================= */}

      <section className="ad-overview-financial">

        <div className="ad-overview-financial-icon">
          <Wallet size={21} />
        </div>

        <div className="ad-overview-financial-heading">
          <span>FINANCIAL OVERVIEW</span>
          <strong>Clinic collections</strong>
          <small>Based on all recorded invoices.</small>
        </div>

        <div className="ad-overview-financial-value">
          <span>Total billed</span>
          <strong>{inr(totalBilled)}</strong>
        </div>

        <div className="ad-overview-financial-value">
          <span>Collected</span>
          <strong className="collected">{inr(collected)}</strong>
        </div>

        <div className="ad-overview-financial-value">
          <span>Outstanding</span>
          <strong className="outstanding">{inr(outstanding)}</strong>
        </div>

        <button
          type="button"
          className="ad-overview-financial-action"
          onClick={() => goTo("invoices")}
        >
          View billing
          <ArrowUpRight size={15} />
        </button>

      </section>

    </main>
  );
}

export default Overview;

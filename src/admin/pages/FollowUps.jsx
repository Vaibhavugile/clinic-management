
import { useMemo, useState } from "react";
import { serverTimestamp } from "firebase/firestore";
import {
  CalendarDays,
  Plus,
  Search,
  MessageCircle,
  Clock3,
  AlertCircle,
  CalendarCheck,
  ArrowUpRight,
  Phone,
  RefreshCw,
} from "lucide-react";

import {
  todayISO,
  fmtDate,
  initials,
  waLink,
} from "../utils";

import { usePersistentState } from "../hooks/usePersistentState";
import { Badge, Empty } from "../components/Common";
import { WhatsAppIcon } from "../components/WhatsAppIcon";

import "./FollowUps.css";

export function FollowUps({
  followups = [],
  loading,
  update,
  onBook,
  onAdd,
}) {
  const [tab, setTab] = usePersistentState("ad.followups.tab", "today");
  const [search, setSearch] = useState("");
  const [sendingId, setSendingId] = useState(null);

  const today = todayISO();

  const bucket = (item) => {
    if (
      item.status === "done" ||
      item.status === "booked"
    ) {
      return "hidden";
    }

    if (!item.due) return "upcoming";

    if (item.due < today) return "overdue";
    if (item.due === today) return "today";

    return "upcoming";
  };

  const tabs = [
    {
      id: "today",
      label: "Today",
      description: "Due today",
      icon: Clock3,
    },
    {
      id: "overdue",
      label: "Overdue",
      description: "Needs attention",
      icon: AlertCircle,
    },
    {
      id: "upcoming",
      label: "Upcoming",
      description: "Scheduled ahead",
      icon: CalendarCheck,
    },
  ];

  const counts = useMemo(() => {
    return {
      today: followups.filter((x) => bucket(x) === "today").length,
      overdue: followups.filter((x) => bucket(x) === "overdue").length,
      upcoming: followups.filter((x) => bucket(x) === "upcoming").length,
    };
  }, [followups, today]);

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return followups
      .filter((item) => bucket(item) === tab)
      .filter((item) => {
        if (!query) return true;

        return [
          item.patient,
          item.phone,
          item.reason,
          item.status,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(query)
          );
      })
      .sort((a, b) =>
        (a.due || "").localeCompare(b.due || "")
      );
  }, [followups, tab, search, today]);

  const remind = async (item) => {
    if (!item.phone || sendingId) return;

    const message = item.reason
      ? `Hello ${item.patient}, this is Anand Dental Clinic. Your follow-up for "${item.reason}" is due on ${fmtDate(item.due)}. Please reply or call us to book an appointment.`
      : `Hello ${item.patient}, this is Anand Dental Clinic. Your follow-up visit is due on ${fmtDate(item.due)}. Please reply or call us to book an appointment.`;

    try {
      setSendingId(item.id);

      const url = waLink(item.phone, message);

      window.open(url, "_blank", "noopener,noreferrer");

      await update(item.id, {
        status: "reminded",
        remindedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Unable to send follow-up reminder:", error);
    } finally {
      setSendingId(null);
    }
  };

  const activeTab = tabs.find((item) => item.id === tab);

  return (
    <section className="ad-fu-page">

      {/* Page heading */}
      <div className="ad-fu-heading">
        <div>
          <div className="ad-fu-eyebrow">
            <span className="ad-fu-eyebrow-dot" />
            PATIENT CARE MANAGEMENT
          </div>

          <h2>Follow-ups</h2>

          <p>
            Stay connected with your patients and never miss
            a follow-up appointment.
          </p>
        </div>

        <button
          className="ad-btn ad-btn-primary ad-fu-add"
          onClick={onAdd}
        >
          <Plus size={17} />
          Add follow-up
        </button>
      </div>

      {/* Overview statistics */}
      <div className="ad-fu-overview">
        <div className="ad-fu-stat">
          <div className="ad-fu-stat-icon blue">
            <CalendarCheck size={19} />
          </div>
          <div>
            <span>Today's follow-ups</span>
            <strong>{counts.today}</strong>
            <small>Due today</small>
          </div>
        </div>

        <div className="ad-fu-stat">
          <div className="ad-fu-stat-icon red">
            <AlertCircle size={19} />
          </div>
          <div>
            <span>Overdue</span>
            <strong>{counts.overdue}</strong>
            <small>Require attention</small>
          </div>
        </div>

        <div className="ad-fu-stat">
          <div className="ad-fu-stat-icon green">
            <Clock3 size={19} />
          </div>
          <div>
            <span>Upcoming</span>
            <strong>{counts.upcoming}</strong>
            <small>Scheduled follow-ups</small>
          </div>
        </div>

        <div className="ad-fu-stat">
          <div className="ad-fu-stat-icon violet">
            <RefreshCw size={19} />
          </div>
          <div>
            <span>Total active</span>
            <strong>
              {counts.today + counts.overdue + counts.upcoming}
            </strong>
            <small>Pending follow-ups</small>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ad-fu-panel">

        <div className="ad-fu-panel-header">
          <div>
            <h3>Patient follow-up schedule</h3>
            <p>Manage reminders and appointment bookings</p>
          </div>

          <div className="ad-fu-search">
            <Search size={17} />
            <input
              type="search"
              placeholder="Search patient, phone or treatment..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="ad-fu-tabs">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;

            return (
              <button
                key={item.id}
                role="tab"
                aria-selected={active}
                className={`ad-fu-tab ${active ? "active" : ""}`}
                onClick={() => setTab(item.id)}
              >
                <span className="ad-fu-tab-icon">
                  <Icon size={17} />
                </span>

                <span className="ad-fu-tab-copy">
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>

                <span className="ad-fu-tab-count">
                  {counts[item.id]}
                </span>
              </button>
            );
          })}
        </div>

        {/* List heading */}
        <div className="ad-fu-list-heading">
          <div>
            <h4>{activeTab?.label} follow-ups</h4>
            <span>
              {rows.length} {rows.length === 1 ? "patient" : "patients"}
            </span>
          </div>

          <span className="ad-fu-sort-label">
            <CalendarDays size={14} />
            Sorted by due date
          </span>
        </div>

        {/* Loading / empty / list */}
        {loading ? (
          <div className="ad-fu-loading">
            <div className="ad-fu-loading-spinner" />
            <p>Loading patient follow-ups...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="ad-fu-empty">
            <div className="ad-fu-empty-icon">
              <CalendarCheck size={28} />
            </div>
            <h4>
              {search
                ? "No matching patients"
                : `No ${tab} follow-ups`}
            </h4>
            <p>
              {search
                ? "Try searching with another patient name or phone number."
                : "Your follow-up schedule is clear. New follow-ups will appear here."}
            </p>

            {!search && (
              <button
                className="ad-btn ad-btn-soft"
                onClick={onAdd}
              >
                <Plus size={16} />
                Create follow-up
              </button>
            )}
          </div>
        ) : (
          <div className="ad-fu-list">
            {rows.map((item, index) => {
              const overdue = bucket(item) === "overdue";
              const sending = sendingId === item.id;

              return (
                <article
                  key={item.id}
                  className={`ad-fu-item ${overdue ? "is-overdue" : ""}`}
                  style={{ "--fu-index": index }}
                >
                  <div className="ad-fu-patient">
                    <div className="ad-fu-avatar">
                      {initials(item.patient)}
                    </div>

                    <div className="ad-fu-patient-info">
                      <h4>{item.patient || "Unknown patient"}</h4>

                      {item.phone ? (
                        <a
                          className="ad-fu-phone"
                          href={`tel:${item.phone}`}
                        >
                          <Phone size={12} />
                          {item.phone}
                        </a>
                      ) : (
                        <span className="ad-fu-no-phone">
                          Phone number unavailable
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="ad-fu-reason">
                    <span>FOLLOW-UP REASON</span>
                    <strong>{item.reason || "General follow-up"}</strong>
                  </div>

                  <div className="ad-fu-date">
                    <span>DUE DATE</span>
                    <strong className={overdue ? "overdue-text" : ""}>
                      {item.due ? fmtDate(item.due) : "Not scheduled"}
                    </strong>
                    {overdue && (
                      <small>Past due</small>
                    )}
                  </div>

                  <div className="ad-fu-status">
                    <Badge status={item.status} />
                    {item.remindedAt && (
                      <small>Reminder sent</small>
                    )}
                  </div>

                  <div className="ad-fu-item-actions">
                    <button
                      className="ad-btn ad-btn-sm ad-btn-primary"
                      onClick={() => remind(item)}
                      disabled={sending || !item.phone}
                      title={
                        !item.phone
                          ? "Patient phone number is missing"
                          : "Send WhatsApp reminder"
                      }
                    >
                      <WhatsAppIcon size={14} />
                      {sending ? "Sending..." : "Remind"}
                    </button>

                    <button
                      className="ad-btn ad-btn-sm ad-btn-soft"
                      onClick={() => onBook(item)}
                    >
                      <CalendarDays size={14} />
                      Book
                      <ArrowUpRight size={13} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {!loading && rows.length > 0 && (
          <div className="ad-fu-footer">
            <span>
              Showing {rows.length} of {counts[tab]} follow-ups
            </span>
            <span>
              <span className="ad-fu-live-dot" />
              Schedule updated from your clinic records
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

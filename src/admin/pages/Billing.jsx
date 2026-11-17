import { useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  FileSpreadsheet,
  IndianRupee,
  Plus,
  Search,
  SlidersHorizontal,
  Wallet,
  XCircle,
} from "lucide-react";
import { inr, PAY_MODES } from "../utils";
import "./Billing.css";

const PRESETS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7days", label: "Last 7 days" },
  { id: "30days", label: "Last 30 days" },
  { id: "month", label: "This month" },
  { id: "lastmonth", label: "Last month" },
  { id: "custom", label: "Custom range" },
  { id: "all", label: "All time" },
];

const dateKey = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const asDate = (value) => {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  if (typeof value?.seconds === "number") return new Date(value.seconds * 1000);
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDate = (value) => {
  const d = asDate(value);
  return d
    ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
};

const formatTime = (value) => {
  const d = asDate(value);
  return d
    ? d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : "";
};

const formatDateTime = (value) => {
  const d = asDate(value);
  return d ? `${formatDate(d)} · ${formatTime(d)}` : "—";
};

const today = () => dateKey(new Date());

const getRange = (preset) => {
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = (n) => {
    const d = new Date(todayDate);
    d.setDate(d.getDate() + n);
    return dateKey(d);
  };

  if (preset === "today") return { from: day(0), to: day(0) };
  if (preset === "yesterday") return { from: day(-1), to: day(-1) };
  if (preset === "7days") return { from: day(-6), to: day(0) };
  if (preset === "30days") return { from: day(-29), to: day(0) };
  if (preset === "month") {
    return {
      from: dateKey(new Date(now.getFullYear(), now.getMonth(), 1)),
      to: day(0),
    };
  }
  if (preset === "lastmonth") {
    return {
      from: dateKey(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      to: dateKey(new Date(now.getFullYear(), now.getMonth(), 0)),
    };
  }
  return { from: "", to: "" };
};

const amountOf = (invoice) => Number(invoice.amount) || 0;
const invoiceDate = (invoice) => asDate(invoice.createdAt);
const paymentDate = (invoice) => asDate(invoice.paidAt);
const within = (value, from, to) => {
  const d = asDate(value);
  if (!d) return false;
  const key = dateKey(d);
  return (!from || key >= from) && (!to || key <= to);
};

const csvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

function MetricCard({ icon: Icon, label, value, note, tone = "blue" }) {
  return (
    <article className={`bill-metric bill-metric-${tone}`}>
      <div className="bill-metric-top">
        <span className="bill-metric-icon"><Icon size={19} /></span>
        <span className="bill-metric-label">{label}</span>
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function StatusPill({ paid }) {
  return (
    <span className={`bill-status ${paid ? "is-paid" : "is-pending"}`}>
      <span />
      {paid ? "Paid" : "Pending"}
    </span>
  );
}

export function Billing({ invoices = [], loading = false, markPaid, onAdd }) {
  const [preset, setPreset] = useState("today");
  const [customFrom, setCustomFrom] = useState(today);
  const [customTo, setCustomTo] = useState(today);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [payingId, setPayingId] = useState("");
  const [expandedId, setExpandedId] = useState("");

  const range = useMemo(
    () => (preset === "custom" ? { from: customFrom, to: customTo } : getRange(preset)),
    [preset, customFrom, customTo]
  );

  const periodInvoices = useMemo(() => {
    if (preset === "all") return invoices;
    return invoices.filter((invoice) => within(invoice.createdAt, range.from, range.to));
  }, [invoices, preset, range]);

  // Cash received is based on paidAt, not invoice creation date.
  const collectedInPeriod = useMemo(
    () =>
      invoices
        .filter((invoice) => invoice.paid && within(invoice.paidAt, range.from, range.to))
        .reduce((sum, invoice) => sum + amountOf(invoice), 0),
    [invoices, range]
  );

  const totals = useMemo(() => {
    const billed = periodInvoices.reduce((sum, invoice) => sum + amountOf(invoice), 0);
    const paidInvoices = periodInvoices.filter((invoice) => invoice.paid);
    const pendingInvoices = periodInvoices.filter((invoice) => !invoice.paid);
    const paidValue = paidInvoices.reduce((sum, invoice) => sum + amountOf(invoice), 0);
    const pendingValue = pendingInvoices.reduce((sum, invoice) => sum + amountOf(invoice), 0);
    return {
      billed,
      paidValue,
      pendingValue,
      paidCount: paidInvoices.length,
      pendingCount: pendingInvoices.length,
      count: periodInvoices.length,
      rate: billed > 0 ? Math.round((paidValue / billed) * 100) : 0,
    };
  }, [periodInvoices]);

  const modeSummary = useMemo(() => {
    const map = new Map();
    periodInvoices
      .filter((invoice) => invoice.paid)
      .forEach((invoice) => {
        const mode = invoice.mode || "Other";
        map.set(mode, (map.get(mode) || 0) + amountOf(invoice));
      });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [periodInvoices]);

  const filteredInvoices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...periodInvoices]
      .filter((invoice) => {
        const haystack = [
          invoice.id,
          invoice.patient,
          invoice.phone,
          invoice.treatment,
          invoice.doctor,
          ...(invoice.items || []).map((item) => item.treatment || item.name || ""),
        ]
          .join(" ")
          .toLowerCase();
        const matchesSearch = !q || haystack.includes(q);
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "paid" ? invoice.paid : !invoice.paid);
        const matchesMode =
          modeFilter === "all" ||
          (invoice.mode || "").toLowerCase() === modeFilter.toLowerCase();
        return matchesSearch && matchesStatus && matchesMode;
      })
      .sort((a, b) => {
        const aDate = invoiceDate(a)?.getTime() || 0;
        const bDate = invoiceDate(b)?.getTime() || 0;
        return sortOrder === "newest" ? bDate - aDate : aDate - bDate;
      });
  }, [periodInvoices, search, statusFilter, modeFilter, sortOrder]);

  const exportCSV = () => {
    const rows = [
      [
        "Invoice ID",
        "Invoice Date",
        "Invoice Time",
        "Patient",
        "Phone",
        "Treatment",
        "Items",
        "Appointment Date",
        "Doctor",
        "Amount",
        "Payment Status",
        "Payment Mode",
        "Paid Date",
        "Paid Time",
      ],
      ...filteredInvoices.map((invoice) => {
        const created = invoiceDate(invoice);
        const paid = paymentDate(invoice);
        const items = (invoice.items || [])
          .map((item) => {
            const name = item.treatment || item.name || "Item";
            const qty = item.quantity ? ` x${item.quantity}` : "";
            const price = item.price ?? item.amount;
            return `${name}${qty}${price != null ? ` (${price})` : ""}`;
          })
          .join("; ");
        return [
          `INV-${invoice.id.slice(0, 6).toUpperCase()}`,
          created ? dateKey(created) : "",
          created ? formatTime(created) : "",
          invoice.patient,
          invoice.phone,
          invoice.treatment,
          items,
          invoice.appointmentDate || "",
          invoice.doctor || "",
          amountOf(invoice),
          invoice.paid ? "Paid" : "Pending",
          invoice.mode || "",
          paid ? dateKey(paid) : "",
          paid ? formatTime(paid) : "",
        ];
      }),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `anand-dental-billing-${preset}-${today()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleMarkPaid = async (invoice, mode) => {
    if (!markPaid || payingId) return;
    setPayingId(invoice.id);
    try {
      await markPaid(invoice.id, mode);
    } finally {
      setPayingId("");
      setExpandedId("");
    }
  };

  const activeFilterCount =
    (statusFilter !== "all" ? 1 : 0) + (modeFilter !== "all" ? 1 : 0);

  return (
    <section className="bill-page">
      <div className="bill-heading">
        <div>
          <div className="bill-eyebrow"><span /> FINANCE OVERVIEW</div>
          <h2>Billing & collections</h2>
          <p>Track invoices, monitor pending dues and review every payment received.</p>
        </div>
        <div className="bill-heading-actions">
          <button className="bill-btn bill-btn-outline" onClick={exportCSV} disabled={!filteredInvoices.length}>
            <Download size={16} /> Export report
          </button>
          <button className="bill-btn bill-btn-primary" onClick={onAdd}>
            <Plus size={17} /> New invoice
          </button>
        </div>
      </div>

      <div className="bill-period-card">
        <div className="bill-period-title">
          <span className="bill-period-icon"><CalendarDays size={18} /></span>
          <div>
            <strong>Report period</strong>
            <small>
              {preset === "all"
                ? "Showing all recorded invoices"
                : range.from && range.to
                  ? `${formatDate(`${range.from}T00:00:00`)} — ${formatDate(`${range.to}T00:00:00`)}`
                  : "Choose a date range"}
            </small>
          </div>
        </div>
        <div className="bill-presets">
          {PRESETS.map((item) => (
            <button
              key={item.id}
              className={preset === item.id ? "bill-preset active" : "bill-preset"}
              onClick={() => setPreset(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        {preset === "custom" && (
          <div className="bill-custom-range">
            <label>
              <span>From date</span>
              <input type="date" value={customFrom} max={customTo || undefined} onChange={(e) => setCustomFrom(e.target.value)} />
            </label>
            <label>
              <span>To date</span>
              <input type="date" value={customTo} min={customFrom || undefined} onChange={(e) => setCustomTo(e.target.value)} />
            </label>
          </div>
        )}
      </div>

      <div className="bill-metrics">
        <MetricCard
          icon={FileSpreadsheet}
          label="Total billed"
          value={inr(totals.billed)}
          note={`${totals.count} invoice${totals.count === 1 ? "" : "s"} in selected period`}
          tone="blue"
        />
        <MetricCard
          icon={Wallet}
          label="Collected on invoices"
          value={inr(totals.paidValue)}
          note={`${totals.paidCount} invoice${totals.paidCount === 1 ? "" : "s"} marked paid`}
          tone="green"
        />
        <MetricCard
          icon={Clock3}
          label="Pending dues"
          value={inr(totals.pendingValue)}
          note={`${totals.pendingCount} invoice${totals.pendingCount === 1 ? "" : "s"} awaiting payment`}
          tone="amber"
        />
        <MetricCard
          icon={Activity}
          label="Collection rate"
          value={`${totals.rate}%`}
          note="Paid invoice value ÷ billed value"
          tone="violet"
        />
      </div>

      <div className="bill-insight-row">
        <div className="bill-insight-card bill-cash-card">
          <div className="bill-insight-icon"><IndianRupee size={19} /></div>
          <div>
            <span>Payments received in this period</span>
            <strong>{inr(collectedInPeriod)}</strong>
            <small>Based on payment date, including older invoices paid during this period</small>
          </div>
        </div>
        <div className="bill-insight-card bill-mode-card">
          <div className="bill-mode-heading">
            <strong>Payment mode breakdown</strong>
            <span>{modeSummary.length} mode{modeSummary.length === 1 ? "" : "s"}</span>
          </div>
          {modeSummary.length ? (
            <div className="bill-mode-list">
              {modeSummary.map(([mode, amount]) => (
                <div className="bill-mode-item" key={mode}>
                  <span>{mode}</span>
                  <strong>{inr(amount)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="bill-muted">No paid invoices in this invoice period.</p>
          )}
        </div>
      </div>

      <div className="bill-register">
        <div className="bill-register-head">
          <div>
            <div className="bill-register-title">
              <h3>Invoice register</h3>
              <span>{filteredInvoices.length} records</span>
            </div>
            <p>Search, filter and review invoice-level details.</p>
          </div>
          <div className="bill-register-tools">
            <label className="bill-search">
              <Search size={17} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patient, phone, treatment..."
              />
              {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search"><XCircle size={15} /></button>}
            </label>
            <label className="bill-select-wrap">
              <SlidersHorizontal size={15} />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All statuses</option>
                <option value="paid">Paid only</option>
                <option value="pending">Pending only</option>
              </select>
            </label>
            <label className="bill-select-wrap">
              <Wallet size={15} />
              <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)}>
                <option value="all">All modes</option>
                {[...new Set(invoices.map((i) => i.mode).filter(Boolean))].sort().map((mode) => (
                  <option value={mode} key={mode}>{mode}</option>
                ))}
              </select>
            </label>
            <label className="bill-select-wrap">
              <ChevronDown size={15} />
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>
          </div>
        </div>

        {(activeFilterCount > 0 || search) && (
          <div className="bill-active-filters">
            <span>{activeFilterCount + (search ? 1 : 0)} active filter(s)</span>
            <button onClick={() => { setSearch(""); setStatusFilter("all"); setModeFilter("all"); }}>Clear filters</button>
          </div>
        )}

        {loading ? (
          <div className="bill-state">
            <span className="bill-spinner" />
            <strong>Loading billing records</strong>
            <p>Fetching the latest invoices...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="bill-state">
            <span className="bill-empty-icon"><FileSpreadsheet size={23} /></span>
            <strong>No invoices found</strong>
            <p>{search || activeFilterCount ? "Try changing your search or filters." : "Invoices for this selected period will appear here."}</p>
            {search || activeFilterCount ? (
              <button className="bill-btn bill-btn-outline" onClick={() => { setSearch(""); setStatusFilter("all"); setModeFilter("all"); }}>Reset filters</button>
            ) : (
              <button className="bill-btn bill-btn-primary" onClick={onAdd}><Plus size={16} /> Create first invoice</button>
            )}
          </div>
        ) : (
          <div className="bill-table-scroll">
            <table className="bill-table">
              <thead>
                <tr>
                  <th>Invoice / Date</th>
                  <th>Patient</th>
                  <th>Treatment & items</th>
                  <th>Appointment</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Paid on</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => {
                  const created = invoiceDate(invoice);
                  const isExpanded = expandedId === invoice.id;
                  return (
                    <tr key={invoice.id}>
                      <td data-label="Invoice / Date">
                        <div className="bill-invoice-id">INV-{invoice.id.slice(0, 6).toUpperCase()}</div>
                        <div className="bill-cell-sub">{created ? formatDate(created) : "Date unavailable"}</div>
                        {created && <div className="bill-cell-sub bill-time">{formatTime(created)}</div>}
                      </td>
                      <td data-label="Patient">
                        <strong className="bill-patient-name">{invoice.patient || "Unknown"}</strong>
                        <span className="bill-cell-sub">{invoice.phone || "No phone"}</span>
                      </td>
                      <td data-label="Treatment">
                        <strong className="bill-treatment">{invoice.treatment || "—"}</strong>
                        {invoice.items?.length > 0 && (
                          <div className="bill-items">
                            {invoice.items.map((item, index) => (
                              <span key={`${item.treatment || item.name || "item"}-${index}`}>
                                {item.treatment || item.name || "Item"}
                                {item.quantity ? ` × ${item.quantity}` : ""}
                                {item.price != null ? ` · ${inr(Number(item.price) || 0)}` : ""}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td data-label="Appointment">
                        <span className="bill-cell-main">{invoice.appointmentDate ? formatDate(`${invoice.appointmentDate}T00:00:00`) : "—"}</span>
                        <span className="bill-cell-sub">{invoice.doctor || (invoice.appointmentId ? "Doctor unavailable" : "Manual invoice")}</span>
                      </td>
                      <td data-label="Amount"><strong className="bill-amount">{inr(amountOf(invoice))}</strong></td>
                      <td data-label="Payment">
                        <StatusPill paid={invoice.paid} />
                        <span className="bill-cell-sub">{invoice.mode || (invoice.paid ? "Mode not recorded" : "Awaiting payment")}</span>
                      </td>
                      <td data-label="Paid on">
                        {invoice.paidAt ? (
                          <>
                            <span className="bill-cell-main">{formatDate(invoice.paidAt)}</span>
                            <span className="bill-cell-sub">{formatTime(invoice.paidAt)}</span>
                          </>
                        ) : <span className="bill-cell-sub">—</span>}
                      </td>
                      <td data-label="Action" className="bill-action-cell">
                        {!invoice.paid ? (
                          <div className="bill-pay-action">
                            <button
                              className="bill-pay-trigger"
                              onClick={() => setExpandedId(isExpanded ? "" : invoice.id)}
                              disabled={payingId === invoice.id}
                            >
                              {payingId === invoice.id ? "Saving..." : "Mark paid"}
                              <ChevronDown size={14} />
                            </button>
                            {isExpanded && (
                              <div className="bill-pay-menu">
                                <strong>Choose payment mode</strong>
                                {(PAY_MODES || ["Cash", "UPI", "Card", "Bank transfer"]).map((mode) => (
                                  <button key={mode} onClick={() => handleMarkPaid(invoice, mode)}>{mode}</button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="bill-confirmed"><CheckCircle2 size={15} /> Settled</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="bill-register-footer">
          <span>Showing {filteredInvoices.length} of {periodInvoices.length} invoices</span>
          <span>Report uses invoice creation date; cash received uses payment date.</span>
        </div>
      </div>
    </section>
  );
}

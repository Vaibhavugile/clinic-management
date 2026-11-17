// Popup form to add an invoice (one or more treatments).
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PAY_MODES } from "../utils";
import { Modal, SaveButtons } from "../components/Common";
import "./forms.css";

export function InvoiceForm({ patients, treatments, initial, onSave, onClose }) {
  const [f, setF] = useState({ patient: initial?.name || "", paid: "unpaid", mode: "" });
  // each row: name ("" = first treatment in the list), price typed by hand, touched = price was edited
  const [items, setItems] = useState(() => [{ name: initial?.treatment || "", price: "", touched: false }]);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const nameOf = (it) => it.name || treatments[0]?.name || "";
  const defaultPrice = (name) => treatments.find((t) => t.name === name)?.price || 0;
  const priceOf = (it) => (it.touched ? Number(it.price) || 0 : defaultPrice(nameOf(it)));

  const updateItem = (i, patch) => setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const addItem = () => setItems([...items, { name: "", price: "", touched: false }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const rows = items.map((it) => ({ name: nameOf(it), price: priceOf(it) }));
  const total = rows.reduce((s, r) => s + r.price, 0);
  const modeOk = f.paid !== "paid" || f.mode !== ""; // when paid, the mode must be chosen
  const valid = f.patient.trim() && rows.length > 0 && rows.every((r) => r.name) && total > 0 && modeOk;

  const save = async () => {
    setSaving(true);
    const name = f.patient.trim();
    const match = patients.find((p) => p.name.trim().toLowerCase() === name.toLowerCase());
    const ok = await onSave({
      patient: name,
      phone: initial?.phone || match?.phone || "",
      treatment: rows.map((r) => r.name).join(", "), // old screens keep working with this
      treatments: rows, // [{ name, price }, ...]
      amount: total,
      paid: f.paid === "paid",
      mode: f.paid === "paid" ? f.mode : "",
    });
    if (!ok) setSaving(false);
  };

  return (
    <Modal
      title={initial ? `New invoice for ${initial.name}` : "New invoice"}
      onClose={onClose}
      footer={<SaveButtons onClose={onClose} onSave={save} disabled={!valid} saving={saving} label="Save invoice" />}
    >
      {treatments.length === 0 && (
        <p className="ad-muted ad-modal-note">
          No treatments found. An admin needs to add them in Clinic setup first.
        </p>
      )}
      <div className="ad-form">
        <label>
          Patient name
          <input value={f.patient} onChange={set("patient")} list="ad-patient-names" placeholder="Full name" readOnly={Boolean(initial)} />
          <datalist id="ad-patient-names">
            {patients.map((p) => <option key={p.key} value={p.name} />)}
          </datalist>
        </label>

        <div className="ad-items">
          <span className="ad-items-title">Treatments</span>
          {items.map((it, i) => {
            const name = nameOf(it);
            const known = treatments.some((t) => t.name === name);
            return (
              <div className="ad-item-row" key={i}>
                <select value={name} onChange={(e) => updateItem(i, { name: e.target.value })} aria-label={`Treatment ${i + 1}`}>
                  {!known && name && <option value={name}>{name}</option>}
                  {treatments.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
                <input
                  type="number"
                  min="0"
                  value={it.touched ? it.price : String(priceOf(it) || "")}
                  onChange={(e) => updateItem(i, { price: e.target.value, touched: true })}
                  placeholder="₹"
                  aria-label={`Price ${i + 1}`}
                />
                {items.length > 1 && (
                  <button type="button" className="ad-icon-btn" onClick={() => removeItem(i)} aria-label={`Remove treatment ${i + 1}`}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            );
          })}
          <button type="button" className="ad-btn ad-btn-sm ad-btn-soft ad-item-add" onClick={addItem} disabled={treatments.length === 0}>
            <Plus size={14} /> Add another treatment
          </button>
        </div>

        <p className="ad-strong ad-items-total">Total: ₹{total}</p>

        <label>
          Payment
          <select value={f.paid} onChange={set("paid")}>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
          </select>
        </label>
        {f.paid === "paid" && (
          <label>
            Payment mode
            <select value={f.mode} onChange={set("mode")}>
              <option value="">Select mode</option>
              {PAY_MODES.map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>
        )}
      </div>
    </Modal>
  );
}
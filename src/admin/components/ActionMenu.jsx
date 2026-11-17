// A small "Actions" dropdown. Lists what can be done with a row (Confirm, Postpone, Cancel...).
// On phones it opens as a sheet at the bottom of the screen.
//   items: [{ label, icon, onClick, tone: "danger" }]  (false / null items are skipped)
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ChevronDown,
} from "lucide-react";

export function ActionMenu({ items, label = "Actions" }) {
  const list = items.filter(Boolean);
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState({});
  const btn = useRef(null);
  const menu = useRef(null);

  // place the menu under the button (or above it when there is no room), inside the screen
  useLayoutEffect(() => {
    if (!open || !btn.current || !menu.current) return;
    const r = btn.current.getBoundingClientRect();
    const mh = menu.current.offsetHeight;
    const mw = menu.current.offsetWidth;
    const roomBelow = window.innerHeight - r.bottom;
    const top = roomBelow >= mh + 12 || r.top < mh + 12 ? r.bottom + 6 : r.top - mh - 6;
    const left = Math.min(Math.max(8, r.right - mw), Math.max(8, window.innerWidth - mw - 8));
    setStyle({ top, left });
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const close = () => setOpen(false);
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        if (btn.current) btn.current.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btn}
        type="button"
        className={open ? "ad-btn ad-btn-sm ad-btn-ghost ad-menu-btn ad-menu-btn-open" : "ad-btn ad-btn-sm ad-btn-ghost ad-menu-btn"}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {label} <ChevronDown size={14} />
      </button>
      {open && (
        <>
          <div className="ad-menu-scrim" onClick={() => setOpen(false)} />
          <div ref={menu} className="ad-menu" role="menu" style={style}>
            {list.map((it) => {
              const Icon = it.icon;
              return (
                <button
                  key={it.label}
                  type="button"
                  role="menuitem"
                  className={it.tone === "danger" ? "ad-menu-item ad-menu-danger" : "ad-menu-item"}
                  onClick={() => {
                    setOpen(false);
                    it.onClick();
                  }}
                >
                  {Icon && <Icon size={16} />}
                  {it.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

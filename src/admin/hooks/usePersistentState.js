// Like useState, but the value is remembered for the browser session.
// Used so filters and tabs are still there when you come back to a page.
import { useEffect, useState } from "react";

export function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.sessionStorage.getItem(key);
      return raw === null ? initial : JSON.parse(raw);
    } catch (e) {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* storage can be unavailable (private mode); the value just is not remembered */
    }
  }, [key, value]);

  return [value, setValue];
}

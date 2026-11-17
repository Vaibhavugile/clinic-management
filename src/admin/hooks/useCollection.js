// Live (real-time) list of every document in one Firestore collection.
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

export function useCollection(name) {
  const [state, setState] = useState({ rows: [], loading: true, error: "" });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, name),
      (snap) =>
        setState({
          rows: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
          loading: false,
          error: "",
        }),
      (err) => {
        console.error(`Reading "${name}" failed:`, err);
        setState({
          rows: [],
          loading: false,
          error:
            err.code === "permission-denied"
              ? `No permission to read "${name}". Check your Firestore rules.`
              : err.message,
        });
      }
    );
    return unsubscribe;
  }, [name]);

  return state;
}

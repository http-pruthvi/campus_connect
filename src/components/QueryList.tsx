import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import QueryCard from "./QueryCard";

export default function QueryList() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "queries"), orderBy("date_posted", "desc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQueries(docs);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching queries:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const handleNotify = (notif) => {
    console.log("Notification:", notif);
  };

  if (loading) return <p>Loading queries...</p>;

  return (
    <div className="query-list">
      {queries.length === 0 ? (
        <p>No queries posted yet.</p>
      ) : (
        queries.map((q) => (
          <QueryCard key={q.id} query={q} onNotify={handleNotify} />
        ))
      )}
    </div>
  );
}


import React, { useEffect, useState } from "react";
import { doc, collection, onSnapshot, query, orderBy, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import AnswerSection from "./AnswerSection";

export default function QueryCard({ query: queryData, onNotify }) {

  if (!queryData || typeof queryData !== "object") return null;

  const { id, title, description, category, postedBy, date_posted, status } = queryData;
  if (!id) return null;

  const [replies, setReplies] = useState([]);
  const [localStatus, setLocalStatus] = useState(status || "open");

  // Listen for live replies
  useEffect(() => {
    if (!id) return;

    const repliesRef = query(collection(db, `queries/${id}/replies`), orderBy("time", "asc"));
    const unsub = onSnapshot(
      repliesRef,
      (snapshot) => {
        const docs = [];
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const newReply = change.doc.data();
            if (onNotify)
              onNotify({ type: "reply", message: `New reply on: ${title}` });
          }
        });
        snapshot.forEach((doc) => docs.push({ id: doc.id, ...doc.data() }));
        setReplies(docs);
      },
      (err) => {
        console.error("Replies listener error:", err);
      }
    );

    return () => unsub();
  }, [id, onNotify, title]);

  // Toggle between open/resolved
  const toggleResolved = async () => {
    try {
      const docRef = doc(db, "queries", id);
      const newStatus = localStatus === "open" ? "resolved" : "open";
      await updateDoc(docRef, { status: newStatus });
      setLocalStatus(newStatus);
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  return (
    <div className="query-card">
      {/* Header */}
      <div className="query-card-header">
        <h3 className="query-title">{title || "Untitled Query"}</h3>
        <div className={`status-pill ${localStatus}`}>{localStatus}</div>
      </div>

      {/* Meta info */}
      <div className="query-meta">
        <span className="posted-by">{postedBy || "Anonymous"}</span>
        <span className="dot">•</span>
        <span className="category">{category || "General"}</span>
        <span className="dot">•</span>
        <span className="date">
          {date_posted?.seconds
            ? new Date(date_posted.seconds * 1000).toLocaleString()
            : ""}
        </span>
      </div>

      {/* Description */}
      <p className="query-desc">{description || "No description provided."}</p>

      {/* Replies */}
      <div className="replies-block">
        {replies.length === 0 ? (
          <p className="muted-small">No replies yet — be the first to reply.</p>
        ) : (
          replies.map((r) => (
            <div className="reply" key={r.id}>
              <strong>{r.repliedBy || "Anonymous"}</strong>
              <span className="reply-time">
                {r.time?.seconds
                  ? new Date(r.time.seconds * 1000).toLocaleString()
                  : ""}
              </span>
              <div className="reply-text">{r.text}</div>
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="card-actions">
        <button onClick={toggleResolved} className="btn-small">
          {localStatus === "open" ? "Mark Resolved" : "Mark Open"}
        </button>
      </div>

      {/* Reply Form */}
      <AnswerSection queryId={id} />
    </div>
  );
}

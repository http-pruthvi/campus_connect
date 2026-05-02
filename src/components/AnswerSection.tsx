
import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function AnswerSection({ queryId }) {
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, `queries/${queryId}/replies`), {
        text: text.trim(),
        repliedBy: name.trim() || "Anonymous",
        time: serverTimestamp(),
      });
      setText("");
      setName("");
    } catch (err) {
      console.error("Reply failed:", err);
    }
    setLoading(false);
  };

  return (
    <form className="reply-form" onSubmit={handleReply}>
      <input
        placeholder="Your name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        placeholder="Write your answer..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
      />
      <div className="reply-actions">
        <button type="submit" disabled={loading}>
          {loading ? "Posting..." : "Post Reply"}
        </button>
      </div>
    </form>
  );
}

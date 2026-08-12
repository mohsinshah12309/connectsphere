import { useState } from "react";
import api from "../api/axios";
import styles from "./CommentForm.module.css";

function CommentForm({ postId, onCommentAdded }) {
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    try {
      const res = await api.post("/comments", { text, postId });
      onCommentAdded?.(res.data.data.comment);
      setText("");
    } catch (err) {
      console.error("Failed to add comment", err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment…"
        maxLength={300}
      />
      <button type="submit" disabled={posting || !text.trim()}>
        Reply
      </button>
    </form>
  );
}

export default CommentForm;

import { useState } from "react";
import api from "../api/axios";
import styles from "./CreatePostForm.module.css";

function CreatePostForm({ onPosted }) {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Write something before posting.");
      return;
    }
    setError("");
    setPosting(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (imageFile) formData.append("image", imageFile);

      const res = await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onPosted?.(res.data.data.post);
      setContent("");
      setImageFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create post.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <form className={styles.compose} onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share something with your network…"
        maxLength={500}
        rows={3}
      />
      <div className={styles.row}>
        <label className={styles.imagePicker}>
          {imageFile ? imageFile.name : "📷 Add image"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setImageFile(e.target.files[0])}
            hidden
          />
        </label>
        <button type="submit" disabled={posting}>
          {posting ? "Posting…" : "Post"}
        </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
}

export default CreatePostForm;

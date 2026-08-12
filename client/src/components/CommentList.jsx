import { Link } from "react-router-dom";
import api from "../api/axios";
import styles from "./CommentList.module.css";

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  const units = [
    ["y", 31536000],
    ["mo", 2592000],
    ["d", 86400],
    ["h", 3600],
    ["m", 60],
  ];
  for (const [label, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value}${label} ago`;
  }
  return "just now";
}

function CommentList({
  comments,
  currentUserId,
  isPostAuthor,
  onCommentDeleted,
}) {
  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      onCommentDeleted?.(commentId);
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  if (comments.length === 0) {
    return <p className={styles.empty}>No comments yet.</p>;
  }

  return (
    <div className={styles.list}>
      {comments.map((comment, index) => {
        const canDelete = comment.author._id === currentUserId || isPostAuthor;
        return (
          <div
            key={comment._id}
            className={styles.comment}
            style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
          >
            <img src={comment.author.avatar} alt="" className={styles.avatar} />
            <div className={styles.body}>
              <p>
                <Link
                  to={`/profile/${comment.author._id}`}
                  className={styles.author}
                >
                  {comment.author.name}
                </Link>{" "}
                {comment.text}
              </p>
              <div className={styles.meta}>
                <span>{timeAgo(comment.createdAt)}</span>
                {canDelete && (
                  <button onClick={() => handleDelete(comment._id)}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CommentList;

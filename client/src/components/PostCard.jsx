import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import styles from "./PostCard.module.css";

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

/**
 * One post, everywhere it appears (Feed, Explore, Profile). Owns like
 * state and the heart-pop animation internally so parent pages don't each
 * reimplement optimistic-update logic — they just pass the post in and,
 * optionally, get told via onDeleted when the viewer removes their own post.
 */
function PostCard({
  post,
  currentUserId,
  animationDelay = 0,
  onDeleted,
  linkToDetail = true,
}) {
  const navigate = useNavigate();
  const [likes, setLikes] = useState(post.likes);
  const [popping, setPopping] = useState(false);

  const isLiked = likes.includes(currentUserId);
  const isOwnPost = post.author._id === currentUserId;

  const handleLike = async (e) => {
    e.preventDefault(); // card body is a Link; don't navigate on like tap
    const wasLiked = likes.includes(currentUserId);

    if (!wasLiked) {
      setPopping(true);
      setTimeout(() => setPopping(false), 500);
    }

    setLikes((prev) =>
      wasLiked
        ? prev.filter((id) => id !== currentUserId)
        : [...prev, currentUserId],
    );

    try {
      await api.patch(`/posts/${post._id}/like`);
    } catch (err) {
      console.error("Failed to toggle like", err);
      setLikes(post.likes); // revert to last known-good state
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    try {
      await api.delete(`/posts/${post._id}`);
      onDeleted?.(post._id);
    } catch (err) {
      console.error("Failed to delete post", err);
    }
  };

  return (
    <article
      className={styles.card}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className={styles.head}>
        <Link to={`/profile/${post.author._id}`} className={styles.author}>
          <img src={post.author.avatar} alt="" className={styles.avatar} />
          <span>{post.author.name}</span>
        </Link>
        <div className={styles.headRight}>
          <span className={styles.time}>{timeAgo(post.createdAt)}</span>
          {isOwnPost && (
            <button
              className={styles.deleteBtn}
              onClick={handleDelete}
              aria-label="Delete post"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {linkToDetail ? (
        <Link to={`/posts/${post._id}`} className={styles.body}>
          <p>{post.content}</p>
          {post.image && (
            <div className={styles.imageFrame}>
              <img src={post.image} alt="" className={styles.postImage} />
            </div>
          )}
        </Link>
      ) : (
        <div className={styles.body}>
          <p>{post.content}</p>
          {post.image && (
            <div className={styles.imageFrame}>
              <img src={post.image} alt="" className={styles.postImage} />
            </div>
          )}
        </div>
      )}

      <div className={styles.actions}>
        <button
          className={`${styles.likeBtn} ${isLiked ? styles.liked : ""} ${popping ? styles.pop : ""}`}
          onClick={handleLike}
        >
          <span className={styles.heartIcon}>{isLiked ? "♥" : "♡"}</span>
          {likes.length}
        </button>
        <button
          className={styles.commentBtn}
          onClick={() => linkToDetail && navigate(`/posts/${post._id}`)}
          disabled={!linkToDetail}
        >
          💬 {post.comments.length}
        </button>
      </div>
    </article>
  );
}

export default PostCard;

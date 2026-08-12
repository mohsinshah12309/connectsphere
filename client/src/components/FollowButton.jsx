import { useState } from "react";
import api from "../api/axios";
import styles from "./FollowButton.module.css";

/**
 * Self-contained follow/unfollow control. Owns its own optimistic state so
 * any page can drop it in without wiring up follow logic itself — it just
 * reports back via onChange when the server confirms (or rejects) the toggle.
 */
function FollowButton({ userId, initialIsFollowing, onChange, size = "md" }) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    setBusy(true);
    const next = !isFollowing;
    setIsFollowing(next); // optimistic

    try {
      const res = await api.post(`/users/${userId}/follow`);
      const { isFollowing: confirmed, followersCount } = res.data.data;
      setIsFollowing(confirmed);
      onChange?.(confirmed, followersCount);
    } catch (err) {
      console.error("Follow toggle failed", err);
      setIsFollowing(!next); // revert
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      className={`${styles.btn} ${isFollowing ? styles.following : ""} ${styles[size]}`}
      onClick={handleClick}
      disabled={busy}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}

export default FollowButton;

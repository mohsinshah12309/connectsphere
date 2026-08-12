import { Link } from "react-router-dom";
import styles from "./NotificationDropdown.module.css";

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

function messageFor(notification) {
  switch (notification.type) {
    case "like":
      return "liked your post";
    case "comment":
      return "commented on your post";
    case "follow":
      return "started following you";
    default:
      return "interacted with your content";
  }
}

function NotificationDropdown({ notifications, loading, onClose }) {
  return (
    <div className={styles.dropdown}>
      <div className={styles.head}>
        <h2>Notifications</h2>
      </div>

      {loading && <p className={styles.status}>Loading…</p>}
      {!loading && notifications.length === 0 && (
        <p className={styles.status}>You're all caught up.</p>
      )}

      <div className={styles.list}>
        {notifications.map((n, index) => (
          <Link
            key={n._id}
            to={
              n.type === "follow"
                ? `/profile/${n.sender._id}`
                : `/posts/${n.post?._id}`
            }
            className={`${styles.item} ${!n.isRead ? styles.unread : ""}`}
            style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
            onClick={onClose}
          >
            <img src={n.sender.avatar} alt="" className={styles.avatar} />
            <div className={styles.body}>
              <p>
                <span className={styles.senderName}>{n.sender.name}</span>{" "}
                {messageFor(n)}
              </p>
              <span className={styles.time}>{timeAgo(n.createdAt)}</span>
            </div>
            {!n.isRead && <span className={styles.dot} aria-hidden="true" />}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default NotificationDropdown;

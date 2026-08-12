import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import styles from "./FollowListModal.module.css";

/**
 * type is 'followers' or 'following'. Fetches lazily when opened rather
 * than whenever the profile page loads, since most visits never open it.
 */
function FollowListModal({ userId, type, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/users/${userId}/${type}`);
        setUsers(res.data.data[type]);
      } catch (err) {
        console.error(`Failed to load ${type}`, err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, type]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <h2>{type === "followers" ? "Followers" : "Following"}</h2>
          <button onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {loading && <p className={styles.status}>Loading…</p>}
        {!loading && users.length === 0 && (
          <p className={styles.status}>Nobody here yet.</p>
        )}

        {users.map((u) => (
          <Link
            key={u._id}
            to={`/profile/${u._id}`}
            className={styles.row}
            onClick={onClose}
          >
            <img src={u.avatar} alt="" className={styles.avatar} />
            <div>
              <p className={styles.name}>{u.name}</p>
              {u.bio && <p className={styles.bio}>{u.bio}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default FollowListModal;

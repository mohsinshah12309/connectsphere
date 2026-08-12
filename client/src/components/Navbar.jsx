import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SearchBar from "./SearchBar";
import NotificationBell from "./NotificationBell";
import styles from "./Navbar.module.css";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className={styles.bar}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          ConnectSphere
        </Link>

        <nav className={styles.links}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            Feed
          </NavLink>
          <NavLink
            to="/explore"
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            Explore
          </NavLink>
        </nav>

        <div className={styles.searchSlot}>
          <SearchBar compact placeholder="Search…" />
        </div>

        <div className={styles.right}>
          <NotificationBell />
          <Link to={`/profile/${user._id}`} className={styles.avatarLink}>
            <img src={user.avatar} alt="" className={styles.avatar} />
          </Link>
          <button
            className={styles.logout}
            onClick={handleLogout}
            aria-label="Log out"
          >
            <svg
              className={styles.logoutIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className={styles.logoutLabel}>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

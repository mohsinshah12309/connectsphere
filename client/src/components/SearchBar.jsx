import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import styles from "./SearchBar.module.css";

function SearchBar({ compact = false, placeholder = "Search people…" }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await api.get(
          `/users/search?q=${encodeURIComponent(query)}`,
        );
        setResults(res.data.data.users);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [query]);

  const showDropdown = focused && query.trim().length > 0;

  return (
    <div
      className={`${styles.wrap} ${compact ? styles.compact : ""} ${focused ? styles.focused : ""}`}
    >
      <div className={styles.fieldShell}>
        <svg
          className={styles.searchIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)} // let link clicks register first
          placeholder={placeholder}
        />
        {searching && <span className={styles.spinner} aria-hidden="true" />}
      </div>
      {showDropdown && (
        <div className={styles.results}>
          {searching && <p className={styles.status}>Searching…</p>}
          {!searching && results.length === 0 && (
            <p className={styles.status}>No users found</p>
          )}
          {results.map((u) => (
            <Link
              key={u._id}
              to={`/profile/${u._id}`}
              className={styles.row}
              onClick={() => setQuery("")}
            >
              <img src={u.avatar} alt="" className={styles.avatar} />
              <div>
                <p className={styles.name}>{u.name}</p>
                {u.bio && <p className={styles.bio}>{u.bio}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;

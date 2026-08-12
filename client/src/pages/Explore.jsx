import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import SearchBar from "../components/SearchBar";
import PostCard from "../components/PostCard";
import feedStyles from "./Feed.module.css";
import styles from "./Explore.module.css";

function Explore() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadPosts = async (pageNum) => {
    setLoading(true);
    try {
      const res = await api.get(`/posts?page=${pageNum}&limit=10`);
      const { posts: newPosts, pagination } = res.data.data;
      setPosts((prev) => (pageNum === 1 ? newPosts : [...prev, ...newPosts]));
      setHasMore(pagination.page < pagination.totalPages);
    } catch (err) {
      console.error("Failed to load explore posts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(1);
  }, []);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    loadPosts(next);
  };

  const handleDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  return (
    <div className={feedStyles.page}>
      <div className={styles.searchWrap}>
        <SearchBar placeholder="Search people…" />
      </div>

      {loading && posts.length === 0 && (
        <div className={feedStyles.list}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={feedStyles.skeletonCard}>
              <div className={feedStyles.skeletonHead}>
                <span className={`skeleton ${feedStyles.skeletonAvatar}`} />
                <span
                  className={`skeleton ${feedStyles.skeletonLine}`}
                  style={{ width: "35%" }}
                />
              </div>
              <span
                className={`skeleton ${feedStyles.skeletonLine}`}
                style={{ width: "90%" }}
              />
              <span
                className={`skeleton ${feedStyles.skeletonLine}`}
                style={{ width: "60%" }}
              />
            </div>
          ))}
        </div>
      )}

      <div className={feedStyles.list}>
        {posts.map((post, index) => (
          <PostCard
            key={post._id}
            post={post}
            currentUserId={user._id}
            animationDelay={Math.min(index, 6) * 60}
            onDeleted={handleDeleted}
          />
        ))}
      </div>

      {hasMore && !loading && posts.length > 0 && (
        <button className={feedStyles.loadMore} onClick={handleLoadMore}>
          Load more
        </button>
      )}
    </div>
  );
}

export default Explore;

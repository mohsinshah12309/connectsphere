import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import CreatePostForm from "../components/CreatePostForm";
import PostCard from "../components/PostCard";
import styles from "./Feed.module.css";

function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadFeed = async (pageNum) => {
    setLoading(true);
    try {
      const res = await api.get(`/posts/feed?page=${pageNum}&limit=10`);
      const { posts: newPosts, pagination } = res.data.data;
      setPosts((prev) => (pageNum === 1 ? newPosts : [...prev, ...newPosts]));
      setHasMore(pagination.page < pagination.totalPages);
    } catch (err) {
      console.error("Failed to load feed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed(1);
  }, []);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    loadFeed(next);
  };

  const handlePosted = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  return (
    <div className={styles.page}>
      <CreatePostForm onPosted={handlePosted} />

      {loading && posts.length === 0 && (
        <div className={styles.list}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonHead}>
                <span className={`skeleton ${styles.skeletonAvatar}`} />
                <span
                  className={`skeleton ${styles.skeletonLine}`}
                  style={{ width: "35%" }}
                />
              </div>
              <span
                className={`skeleton ${styles.skeletonLine}`}
                style={{ width: "90%" }}
              />
              <span
                className={`skeleton ${styles.skeletonLine}`}
                style={{ width: "60%" }}
              />
            </div>
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className={styles.empty}>
          <p>Your feed is quiet.</p>
          <p className={styles.emptySub}>
            Follow people from <Link to="/explore">Explore</Link> to see their
            posts here.
          </p>
        </div>
      )}

      <div className={styles.list}>
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
        <button className={styles.loadMore} onClick={handleLoadMore}>
          Load more
        </button>
      )}
    </div>
  );
}

export default Feed;

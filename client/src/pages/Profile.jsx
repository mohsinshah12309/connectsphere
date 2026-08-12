import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import FollowButton from "../components/FollowButton";
import FollowListModal from "../components/FollowListModal";
import PostCard from "../components/PostCard";
import styles from "./Profile.module.css";
import feedStyles from "./Feed.module.css";

function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [listModal, setListModal] = useState(null); // 'followers' | 'following' | null

  const isOwnProfile = currentUser._id === id;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/users/${id}`);
        const { user, posts: userPosts, followersCount: fc } = res.data.data;
        setProfile(user);
        setPosts(userPosts);
        setFollowersCount(fc);
        setIsFollowing(
          user.followers?.some(
            (f) => f === currentUser._id || f._id === currentUser._id,
          ),
        );
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, currentUser._id]);

  const handleFollowChange = (confirmed, newFollowersCount) => {
    setIsFollowing(confirmed);
    setFollowersCount(newFollowersCount);
  };

  const handleDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  if (loading) return <p className={feedStyles.status}>Loading profile…</p>;
  if (!profile) return <p className={feedStyles.status}>User not found.</p>;

  return (
    <div className={styles.page}>
      <div
        className={styles.cover}
        style={{ backgroundImage: `url(${profile.coverPhoto})` }}
      />

      <div className={styles.headRow}>
        <img src={profile.avatar} alt="" className={styles.avatar} />

        {isOwnProfile ? (
          <Link to={`/profile/${id}/edit`} className={styles.editBtn}>
            Edit profile
          </Link>
        ) : (
          <FollowButton
            userId={id}
            initialIsFollowing={isFollowing}
            onChange={handleFollowChange}
          />
        )}
      </div>

      <h1 className={styles.name}>{profile.name}</h1>
      {profile.bio && <p className={styles.bio}>{profile.bio}</p>}

      <div className={styles.stats}>
        <button onClick={() => setListModal("followers")}>
          <strong>{followersCount}</strong> Followers
        </button>
        <button onClick={() => setListModal("following")}>
          <strong>{profile.following?.length ?? 0}</strong> Following
        </button>
      </div>

      <div className={feedStyles.list} style={{ marginTop: 24 }}>
        {posts.length === 0 && (
          <p className={feedStyles.status}>No posts yet.</p>
        )}
        {posts.map((post, index) => (
          <PostCard
            key={post._id}
            post={post}
            currentUserId={currentUser._id}
            animationDelay={Math.min(index, 6) * 60}
            onDeleted={handleDeleted}
          />
        ))}
      </div>

      {listModal && (
        <FollowListModal
          userId={id}
          type={listModal}
          onClose={() => setListModal(null)}
        />
      )}
    </div>
  );
}

export default Profile;

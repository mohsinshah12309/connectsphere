import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import CommentForm from "../components/CommentForm";
import CommentList from "../components/CommentList";
import feedStyles from "./Feed.module.css";
import styles from "./PostDetail.module.css";

function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/posts/${id}`);
        setPost(res.data.data.post);
      } catch (err) {
        console.error("Failed to load post", err);
      } finally {
        setLoading(false);
      }
    };
    loadPost();
  }, [id]);

  const handleCommentAdded = (comment) => {
    setPost((prev) => ({ ...prev, comments: [comment, ...prev.comments] }));
  };

  const handleCommentDeleted = (commentId) => {
    setPost((prev) => ({
      ...prev,
      comments: prev.comments.filter((c) => c._id !== commentId),
    }));
  };

  if (loading) return <p className={feedStyles.status}>Loading post…</p>;
  if (!post) return <p className={feedStyles.status}>Post not found.</p>;

  const isOwnPost = post.author._id === user._id;

  return (
    <div className={styles.page}>
      <PostCard
        post={post}
        currentUserId={user._id}
        linkToDetail={false}
        onDeleted={() => navigate("/")}
      />

      <CommentForm postId={id} onCommentAdded={handleCommentAdded} />

      <CommentList
        comments={post.comments}
        currentUserId={user._id}
        isPostAuthor={isOwnPost}
        onCommentDeleted={handleCommentDeleted}
      />
    </div>
  );
}

export default PostDetail;

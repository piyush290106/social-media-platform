// Post component for displaying individual posts
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Post = ({ post, onUpdate }) => {
  // Guard missing post entirely
  if (!post) return null;

  // Safeguards
  const author = post.author || {};                    // may be {}
  const authorName =
    (author.firstName && author.lastName)
      ? `${author.firstName} ${author.lastName}`
      : author.username || 'Unknown user';

  const authorId = author._id || null;                 // may be null

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Array.isArray(post.likes) ? post.likes.length : 0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(Array.isArray(post.comments) ? post.comments : []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (user && Array.isArray(post.likes)) {
      setIsLiked(post.likes.some((l) => String(l) === String(user._id)));
    }
  }, [user, post.likes]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

  const handleLike = async () => {
    if (!isAuthenticated) {
      setError('Please login to like posts');
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.post(`/api/posts/${post._id}/like`);
      setIsLiked(data.liked);
      setLikeCount((prev) => (data.liked ? prev + 1 : Math.max(prev - 1, 0)));
    } catch (e) {
      setError('Failed to like post');
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      setLoading(true);
      const { data } = await axios.post(`/api/posts/${post._id}/comment`, { content: newComment });
      setComments(Array.isArray(data.post?.comments) ? data.post.comments : []);
      setNewComment('');
      setError('');
    } catch (e) {
      setError('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      setLoading(true);
      await axios.delete(`/api/posts/${post._id}`);
      onUpdate?.();
    } catch (e) {
      setError('Failed to delete post');
    } finally {
      setLoading(false);
    }
  };

  // Only allow delete if author exists and matches current user
  const canDelete = Boolean(isAuthenticated && user && authorId && String(user._id) === String(authorId));

  return (
    <div className="post">
      {error && <div className="alert alert-error mb-2">{error}</div>}

      <div className="post-header">
        <div>
          {authorId ? (
            <Link to={`/user/${authorId}`} className="post-author">{authorName}</Link>
          ) : (
            <span className="post-author">{authorName}</span>
          )}
          <span className="post-date">{formatDate(post.createdAt)}</span>
        </div>

        {canDelete && (
          <button
            onClick={handleDelete}
            className="btn btn-danger"
            disabled={loading}
            style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
          >
            Delete
          </button>
        )}
      </div>

      {post.content && <div className="post-content">{post.content}</div>}

      {post.imageUrl && (
        <div style={{ marginTop: 8 }}>
          <img
            src={post.imageUrl}
            alt="Post"
            style={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 8 }}
          />
        </div>
      )}

      <div className="post-actions">
        <button onClick={handleLike} className={`post-action ${isLiked ? 'liked' : ''}`} disabled={loading}>
          <span>❤️</span> {likeCount} {likeCount === 1 ? 'like' : 'likes'}
        </button>
        <button onClick={() => setShowComments((s) => !s)} className="post-action">
          <span>💬</span> {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </button>
      </div>

      {showComments && (
        <div className="comments">
          {isAuthenticated && (
            <form onSubmit={handleComment} className="mb-2">
              <div className="d-flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="form-input"
                  style={{ flex: 1 }}
                  disabled={loading}
                />
                <button type="submit" className="btn btn-primary" disabled={loading || !newComment.trim()}>
                  Comment
                </button>
              </div>
            </form>
          )}

          {comments.length > 0 ? (
            comments.map((c, idx) => {
              const cu = c.user || {};
              const cuName =
                (cu.firstName && cu.lastName) ? `${cu.firstName} ${cu.lastName}` : cu.username || 'Unknown user';
              const cuId = cu._id || null;
              return (
                <div key={idx} className="comment">
                  <div>
                    {cuId ? (
                      <Link to={`/user/${cuId}`} className="comment-author">{cuName}</Link>
                    ) : (
                      <span className="comment-author">{cuName}</span>
                    )}
                    <div className="comment-content">{c.content}</div>
                    <div className="comment-date">{formatDate(c.createdAt)}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center" style={{ color: '#666' }}>No comments yet. Be the first to comment!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Post;

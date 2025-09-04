// Post component for displaying individual posts
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Post = ({ post, onUpdate }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, isAuthenticated } = useAuth();

  // Check if current user liked this post
  React.useEffect(() => {
    if (user && post.likes) {
      setIsLiked(post.likes.some(like => like.toString() === user._id));
    }
  }, [user, post.likes]);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle like/unlike
  const handleLike = async () => {
    if (!isAuthenticated) {
      setError('Please login to like posts');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`/api/posts/${post._id}/like`);
      
      setIsLiked(response.data.liked);
      setLikeCount(prev => response.data.liked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Error liking post:', error);
      setError('Failed to like post');
    } finally {
      setLoading(false);
    }
  };

  // Handle comment submission
  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      const response = await axios.post(`/api/posts/${post._id}/comment`, {
        content: newComment
      });
      
      setComments(response.data.post.comments);
      setNewComment('');
      setError('');
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  // Handle post deletion
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`/api/posts/${post._id}`);
      onUpdate(); // Refresh the posts list
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post">
      {/* Error message */}
      {error && (
        <div className="alert alert-error mb-2">
          {error}
        </div>
      )}

      {/* Post header */}
      <div className="post-header">
        <div>
          <Link 
            to={`/user/${post.author._id}`} 
            className="post-author"
          >
            {post.author.firstName && post.author.lastName 
              ? `${post.author.firstName} ${post.author.lastName}`
              : post.author.username
            }
          </Link>
          <span className="post-date">
            {formatDate(post.createdAt)}
          </span>
        </div>
        
        {/* Delete button for post author */}
        {isAuthenticated && user && user._id === post.author._id && (
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

      {/* Post content */}
      <div className="post-content">
        {post.content}
      </div>

      {/* Post actions */}
      <div className="post-actions">
        <button 
          onClick={handleLike}
          className={`post-action ${isLiked ? 'liked' : ''}`}
          disabled={loading}
        >
          <span>❤️</span>
          {likeCount} {likeCount === 1 ? 'like' : 'likes'}
        </button>
        
        <button 
          onClick={() => setShowComments(!showComments)}
          className="post-action"
        >
          <span>💬</span>
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="comments">
          {/* Add comment form */}
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
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !newComment.trim()}
                >
                  Comment
                </button>
              </div>
            </form>
          )}

          {/* Comments list */}
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <div key={index} className="comment">
                <div>
                  <Link 
                    to={`/user/${comment.user._id}`}
                    className="comment-author"
                  >
                    {comment.user.firstName && comment.user.lastName 
                      ? `${comment.user.firstName} ${comment.user.lastName}`
                      : comment.user.username
                    }
                  </Link>
                  <div className="comment-content">
                    {comment.content}
                  </div>
                  <div className="comment-date">
                    {formatDate(comment.createdAt)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center" style={{ color: '#666' }}>
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Post;



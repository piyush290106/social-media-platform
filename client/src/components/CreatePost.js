// CreatePost component for creating new posts
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Post content is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await axios.post('/api/posts', {
        content: content.trim()
      });
      
      // Redirect to home page after successful creation
      navigate('/');
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Create New Post</h2>
        </div>
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="content" className="form-label">
              What's on your mind?
            </label>
            <textarea
              id="content"
              name="content"
              className="form-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              rows="4"
              maxLength="1000"
              disabled={loading}
            />
            <div className="text-right mt-1">
              <small style={{ color: '#666' }}>
                {content.length}/1000 characters
              </small>
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !content.trim()}
            >
              {loading ? 'Creating Post...' : 'Create Post'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;



// Home component displaying all posts
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Post from './Post';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const { isAuthenticated } = useAuth();

  // Fetch posts from API
  const fetchPosts = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/posts?page=${pageNum}&limit=10`);
      
      if (append) {
        setPosts(prevPosts => [...prevPosts, ...response.data.posts]);
      } else {
        setPosts(response.data.posts);
      }
      
      setHasMore(pageNum < response.data.totalPages);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  // Load posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  // Load more posts
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, true);
  };

  // Refresh posts after creating/updating/deleting
  const refreshPosts = () => {
    setPage(1);
    fetchPosts(1, false);
  };

  if (loading && posts.length === 0) {
    return <div className="loading">Loading posts...</div>;
  }

  return (
    <div>
      {/* Welcome message for authenticated users */}
      {isAuthenticated && (
        <div className="card mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <h3>Welcome to Social Media!</h3>
            <Link to="/create-post" className="btn btn-primary">
              Create New Post
            </Link>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Posts list */}
      <div>
        {posts.length === 0 ? (
          <div className="card text-center">
            <h3>No posts yet</h3>
            <p>Be the first to share something!</p>
            {isAuthenticated && (
              <Link to="/create-post" className="btn btn-primary">
                Create First Post
              </Link>
            )}
          </div>
        ) : (
          posts.map(post => (
            <Post 
              key={post._id} 
              post={post} 
              onUpdate={refreshPosts}
            />
          ))
        )}
      </div>

      {/* Load more button */}
      {hasMore && posts.length > 0 && (
        <div className="text-center mt-3">
          <button 
            onClick={loadMore}
            className="btn btn-secondary"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More Posts'}
          </button>
        </div>
      )}

      {/* Login prompt for guests */}
      {!isAuthenticated && (
        <div className="card mt-3">
          <div className="text-center">
            <h3>Join the conversation!</h3>
            <p>Sign up or login to create posts, like, and comment.</p>
            <div className="d-flex gap-2 justify-content-center">
              <Link to="/register" className="btn btn-primary">
                Sign Up
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;



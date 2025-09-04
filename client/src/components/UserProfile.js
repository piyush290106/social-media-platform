// UserProfile component for viewing other users' profiles
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Post from './Post';

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [error, setError] = useState('');
  
  const { user: currentUser, isAuthenticated } = useAuth();

  // Load user profile and posts
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/users/${id}`);
        
        setUser(response.data.user);
        setPosts(response.data.posts);
        
        // Check if current user is following this user
        if (currentUser && response.data.user.followers) {
          setFollowing(response.data.user.followers.some(
            follower => follower._id === currentUser._id
          ));
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [id, currentUser]);

  // Handle follow/unfollow
  const handleFollow = async () => {
    if (!isAuthenticated) {
      setError('Please login to follow users');
      return;
    }

    try {
      const endpoint = following ? 'unfollow' : 'follow';
      const response = await axios.post(`/api/users/${id}/${endpoint}`);
      
      setFollowing(response.data.following);
      
      // Update user data to reflect new follower count
      setUser(prevUser => ({
        ...prevUser,
        followers: following 
          ? prevUser.followers.filter(f => f._id !== currentUser._id)
          : [...prevUser.followers, currentUser]
      }));
      
      setError('');
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      setError(error.response?.data?.message || 'Failed to follow/unfollow user');
    }
  };

  // Refresh posts after updates
  const refreshPosts = () => {
    const loadPosts = async () => {
      try {
        const response = await axios.get(`/api/users/${id}`);
        setPosts(response.data.posts);
      } catch (error) {
        console.error('Error refreshing posts:', error);
      }
    };
    loadPosts();
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error && !user) {
    return (
      <div className="container">
        <div className="alert alert-error">
          {error}
        </div>
      </div>
    );
  }

  // Don't show profile if it's the current user (redirect to own profile)
  if (currentUser && user && user._id === currentUser._id) {
    window.location.href = '/profile';
    return null;
  }

  return (
    <div>
      {/* User profile header */}
      <div className="card mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2>
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user.username
              }
            </h2>
            <p style={{ color: '#666', margin: 0 }}>
              @{user.username}
            </p>
            {user.bio && (
              <p style={{ marginTop: '0.5rem' }}>
                {user.bio}
              </p>
            )}
          </div>
          
          {/* Follow/Unfollow button */}
          {isAuthenticated && currentUser && user._id !== currentUser._id && (
            <button 
              onClick={handleFollow}
              className={`btn ${following ? 'btn-secondary' : 'btn-primary'}`}
            >
              {following ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="alert alert-error mb-3">
          {error}
        </div>
      )}

      {/* User stats */}
      <div className="card mb-3">
        <div className="d-flex gap-3">
          <div className="text-center">
            <h4>{posts.length}</h4>
            <p style={{ color: '#666', margin: 0 }}>Posts</p>
          </div>
          <div className="text-center">
            <h4>{user.followers?.length || 0}</h4>
            <p style={{ color: '#666', margin: 0 }}>Followers</p>
          </div>
          <div className="text-center">
            <h4>{user.following?.length || 0}</h4>
            <p style={{ color: '#666', margin: 0 }}>Following</p>
          </div>
        </div>
      </div>

      {/* Followers and Following links */}
      <div className="card mb-3">
        <div className="d-flex gap-3">
          <Link 
            to={`/user/${id}/followers`}
            className="nav-link"
          >
            View Followers ({user.followers?.length || 0})
          </Link>
          <Link 
            to={`/user/${id}/following`}
            className="nav-link"
          >
            View Following ({user.following?.length || 0})
          </Link>
        </div>
      </div>

      {/* User's posts */}
      <div>
        <h3>{user.firstName || user.username}'s Posts</h3>

        {posts.length === 0 ? (
          <div className="card text-center">
            <h4>No posts yet</h4>
            <p>This user hasn't shared anything yet.</p>
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
    </div>
  );
};

export default UserProfile;



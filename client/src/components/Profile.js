// Profile component for user's own profile
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Post from './Post';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    bio: ''
  });
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);
  
  const { user, updateProfile } = useAuth();

  // Load user data and posts
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        
        // Load user's posts
        const response = await axios.get(`/api/users/${user._id}`);
        setPosts(response.data.posts);
        
        // Set profile data
        setProfileData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          bio: user.bio || ''
        });
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const result = await updateProfile(profileData);
      
      if (result.success) {
        setSuccess('Profile updated successfully!');
        setShowEditForm(false);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  // Refresh posts after updates
  const refreshPosts = () => {
    const loadPosts = async () => {
      try {
        const response = await axios.get(`/api/users/${user._id}`);
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

  return (
    <div>
      {/* Profile header */}
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
          <button 
            onClick={() => setShowEditForm(!showEditForm)}
            className="btn btn-secondary"
          >
            {showEditForm ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Edit profile form */}
      {showEditForm && (
        <div className="card mb-3">
          <div className="card-header">
            <h3 className="card-title">Edit Profile</h3>
          </div>
          
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}
          
          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className="form-input"
                value={profileData.firstName}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className="form-input"
                value={profileData.lastName}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio" className="form-label">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                className="form-textarea"
                value={profileData.bio}
                onChange={handleChange}
                rows="3"
                maxLength="500"
                disabled={saving}
                placeholder="Tell us about yourself..."
              />
              <div className="text-right mt-1">
                <small style={{ color: '#666' }}>
                  {profileData.bio.length}/500 characters
                </small>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
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

      {/* User's posts */}
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Your Posts</h3>
          <Link to="/create-post" className="btn btn-primary">
            Create New Post
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="card text-center">
            <h4>No posts yet</h4>
            <p>Start sharing your thoughts with the world!</p>
            <Link to="/create-post" className="btn btn-primary">
              Create Your First Post
            </Link>
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

export default Profile;



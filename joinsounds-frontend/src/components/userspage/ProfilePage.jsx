import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProfileService from '../service/ProfilePageService';
import ProfileEditModal from './ProfileEditModal';
import './ProfilePage.css';
import UserService from '../service/UserService';
import PostService from '../service/PostService';
import { MdOutlineRemoveCircleOutline, MdAddAPhoto } from "react-icons/md";
import joinsoundsSquare from '../../assets/images/JOINSOUNDS_square.png';

function ProfilePage() {
    const { userId } = useParams();
    const token = localStorage.getItem('token');
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);
    
    const fileInputRef = React.useRef();

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    const fetchProfile = async () => {
        setLoading(true);
        setError(null);

        try {
            const profileData = await ProfileService.getUserProfile(userId);
            
            // Jeśli jest zdjęcie profilowe, utwórz pełny URL używając PostService
            if (profileData.profilePictureUrl) {
                profileData.profilePictureUrl = PostService.getAuthorizedFileUrl(profileData.profilePictureUrl);
            }
            
            // Pobierz ID aktualnego użytkownika tylko jeśli jest token
            if (token) {
                try {
                    const currentUserId = await UserService.getCurrentUserId(token);
                    setCurrentUser(currentUserId ? { id: currentUserId } : null);
                } catch (err) {
                    console.error('Error fetching current user ID:', err);
                    setCurrentUser(null);
                }
            } else {
                setCurrentUser(null);
            }
            
            setProfile(profileData);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Choose a valid image file (JPEG, PNG, etc.)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('File is too large. Maximum size is 5MB');
            return;
        }

        if (!token) {
            alert('You must be logged in to change your profile picture');
            return;
        }

        try {
            setUploadProgress(0);
            const filename = await ProfileService.uploadProfilePicture(
                file, 
                token, 
                (progress) => {
                    setUploadProgress(progress);
                }
            );
            
            const pictureUrl = ProfileService.getProfilePictureUrl(filename);
            setProfile(prevProfile => ({
                ...prevProfile,
                profilePictureUrl: pictureUrl
            }));
            setUploadProgress(100);

            setTimeout(() => setUploadProgress(0), 2000);
        } catch (error) {
            alert('Error during image upload: ' + error.message);
        }
    };

    const handleRemovePicture = async () => {
        if (!window.confirm('Are you sure you want to remove your profile picture?')) return;

        if (!token) {
            alert('You must be logged in to remove your profile picture');
            return;
        }

        try {
            await ProfileService.removeProfilePicture(token);
            setProfile(prevProfile => ({
                ...prevProfile,
                profilePictureUrl: null
            }));
        } catch (error) {
            alert('Error removing picture: ' + error.message);
        }
    };

    const handleUpdateProfile = async (profileData) => {
        if (!token) {
            alert('You must be logged in to edit your profile');
            return;
        }

        try {
            const updatedProfile = await ProfileService.updateUserProfile(profileData, token);
            setProfile(prevProfile => ({
                ...prevProfile,
                ...updatedProfile
            }));
            setIsEditing(false);
        } catch (error) {
            alert('Error saving profile: ' + error.message);
            throw error;
        }
    };

    // Dodaj zabezpieczenie przed null - FIXED
    const isOwnProfile = currentUser && currentUser.id === userId;

    if (loading) {
        return (
            <div className="profile-container">
                <div className="profile-loading">Loading profile...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-container">
                <div className="profile-error">Error: {error}</div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="profile-container">
                <div className="profile-not-found">Profile not found</div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar-section">
                    <div className="profile-avatar-container">
                        <img
                        src={profile.profilePictureUrl || joinsoundsSquare}
                        alt={`Avatar ${profile.username}`}
                        className="profile-avatar"
                        />
                        
                </div>
                {isOwnProfile && (
                            <div className="profile-avatar-actions">
                                <label className="avatar-upload-btn">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                    <MdAddAPhoto /> Change
                                </label>
                                {profile.profilePictureUrl && (
                                    <button
                                        className="avatar-remove-btn"
                                        onClick={handleRemovePicture}
                                    >
                                        <MdOutlineRemoveCircleOutline /> Remove
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    {uploadProgress > 0 && (
                        <div className="upload-progress">
                            <div
                                className="progress-bar"
                                style={{ width: `${uploadProgress}%` }}
                            />
                            <span>{uploadProgress}%</span>
                        </div>
                    )}
                <div className="profile-info">
                    <h1 className="profile-username">{profile.username}</h1>
                    <div className="profile-stats">
                        <span className="stat-item">
                            🎵 {profile.postCount} posts
                        </span>
                    </div>
                </div>

                {isOwnProfile && (
                    <button
                        className="edit-profile-btn"
                        onClick={() => setIsEditing(true)}
                    >
                        ✏️ Edit Profile
                    </button>
                )}
            </div>

            <div className="profile-content">
                {profile.bio && (
                    <div className="profile-section">
                        <h3>About Me</h3>
                        <p className="profile-bio">{profile.bio}</p>
                    </div>
                )}

                {profile.tools && profile.tools.length > 0 && (
                    <div className="profile-section">
                        <h3>Tools and software</h3>
                        <div className="tags-list">
                            {profile.tools.map((tool, index) => (
                                <span key={index} className="tag">
                                    {tool}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {profile.genres && profile.genres.length > 0 && (
                    <div className="profile-section">
                        <h3>Music Genres</h3>
                        <div className="tags-list">
                            {profile.genres.map((genre, index) => (
                                <span key={index} className="tag">
                                    {genre}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {!profile.bio && !profile.tools?.length && !profile.genres?.length && isOwnProfile && (
                    <div className="profile-empty">
                        <p>Add information about yourself</p>
                        <button
                            className="add-info-btn"
                            onClick={() => setIsEditing(true)}
                        >
                            Add Informations
                        </button>
                    </div>
                )}
            </div>

            {isEditing && (
                <ProfileEditModal
                    profile={profile}
                    onSave={handleUpdateProfile}
                    onClose={() => setIsEditing(false)}
                />
            )}
        </div>
    );
}

export default ProfilePage;
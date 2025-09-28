import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProfileService from '../service/ProfilePageService';
import ProfileEditModal from './ProfileEditModal';
import './ProfilePage.css';
import UserService from '../service/UserService';
import PostService from '../service/PostService';
import ReviewService from '../service/ReviewService';
import { MdOutlineRemoveCircleOutline, MdAddAPhoto, MdStar, MdStarBorder, MdEdit, MdDelete } from "react-icons/md";
import joinsoundsSquare from '../../assets/images/JOINSOUNDS_square.png';
import ChatWindow from '../chat/ChatWindow';
import useChat from '../chat/useChat';
import { Button } from '@mui/material';
import '../common/Buttons.css';
import { useNavigate } from 'react-router-dom';
import AutoLink from '../common/AutoLink';

function ProfilePage() {
    const { userId } = useParams();
    const token = localStorage.getItem('token');
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const navigate = useNavigate();
    
    // Review states
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        content: ''
    });
    const [reviewsPage, setReviewsPage] = useState(0);
    const [hasMoreReviews, setHasMoreReviews] = useState(true);

    const fileInputRef = React.useRef();

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    useEffect(() => {
        if (profile && !isOwnProfile) {
            fetchReviews(0, true);
        }
    }, [profile]);

    const fetchProfile = async () => {
        setLoading(true);
        setError(null);

        try {
            const profileData = await ProfileService.getUserProfile(userId);
            
            if (profileData.profilePictureUrl) {
                profileData.profilePictureUrl = PostService.getAuthorizedFileUrl(profileData.profilePictureUrl);
            }
            
            if (token) {
                try {
                    const currentUserId = await UserService.getCurrentUserId(token);
                    const currentUserProfile = await ProfileService.getUserProfile(currentUserId);
                    if (currentUserProfile.profilePictureUrl) {
                        currentUserProfile.profilePictureUrl = PostService.getAuthorizedFileUrl(currentUserProfile.profilePictureUrl);
                    }
                    setCurrentUser(currentUserProfile);
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

    const fetchReviews = async (page = 0, reset = false) => {
        if (!profile || isOwnProfile) return;
        
        setReviewsLoading(true);
        try {
            const response = await ReviewService.getAllReviewsForUser(
                profile.id, 
                page, 
                10, 
                'createdAt', 
                'desc',
                {},
                token
            );
            
            // Przetwarzanie danych recenzji - tworzenie poprawnej struktury
            const processedReviews = (response.content || []).map(review => ({
                ...review,
                userFrom: {
                    id: review.userFromId,
                    username: review.userFromUsername,
                    profilePictureUrl: review.userFromProfilePicturePath 
                        ? PostService.getAuthorizedFileUrl(review.userFromProfilePicturePath)
                        : null
                }
            }));
            
            if (reset) {
                setReviews(processedReviews);
            } else {
                setReviews(prev => [...prev, ...processedReviews]);
            }
            
            setReviewsPage(page);
            setHasMoreReviews(!response.last);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setReviewsLoading(false);
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

    // Review handlers
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            alert('You must be logged in to submit a review');
            return;
        }

        try {
            const reviewData = {
                rating: reviewForm.rating,
                content: reviewForm.content,
                userAbout: { id: profile.id }
            };

            if (editingReview) {
                await ReviewService.updateReview(editingReview.id, reviewData, token);
            } else {
                await ReviewService.createReview(reviewData, token);
            }

            setReviewForm({ rating: 5, content: '' });
            setShowReviewForm(false);
            setEditingReview(null);
            fetchReviews(0, true); // Refresh reviews
        } catch (error) {
            alert('Error submitting review: ' + error.message);
        }
    };

    const handleEditReview = (review) => {
        setReviewForm({
            rating: review.rating,
            content: review.content
        });
        setEditingReview(review);
        setShowReviewForm(true);
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;

        try {
            await ReviewService.deleteReview(reviewId, token);
            fetchReviews(0, true); // Refresh reviews
        } catch (error) {
            alert('Error deleting review: ' + error.message);
        }
    };

    const canUserReview = () => {
        if (!currentUser || !profile) return false;
        return !reviews.some(review => review.userFromId === currentUser.id);
    };

    const isOwnProfile = currentUser && userId && currentUser.id === userId;
    const isLoggedIn = !!token;

    // Calculate average rating
    const averageRating = reviews.length > 0 
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : 0;

    // Hook czatu
    const { messages, sendMessage } = useChat(
        currentUser?.id,
        profile?.id
    );

    // StarRating component
    const StarRating = ({ rating, onRatingChange, editable = false }) => {
        return (
            <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className={editable ? "star-button" : ""}
                        onClick={() => editable && onRatingChange(star)}
                        disabled={!editable}
                    >
                        {star <= rating ? <MdStar /> : <MdStarBorder />}
                    </button>
                ))}
            </div>
        );
    };

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

    const handleOpenChat = () => {
        if (!token) {
            alert('You must be logged in to start a chat');
            return;
        }
        setShowChat(true);
    };

    const handlePostRedirect = () => {
        navigate(`/posts/user/${profile.id}`);
    };

    return (
        <div className="profile-container">
            {/* Przycisk czatu */}
            {isLoggedIn && !isOwnProfile && (
                <button
                    className="chat-with-user-btn"
                    onClick={handleOpenChat}
                    title="Chat with this user"
                >
                    Chat with {profile.username}
                </button>
            )}
            
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
                        {!isOwnProfile && reviews.length > 0 && (
                            <span className="stat-item">
                                ⭐ {averageRating} ({reviews.length} reviews)
                            </span>
                        )}
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
                        <p className="profile-bio">
                            <AutoLink text={profile.bio} />
                        </p>
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

                {profile.postCount > 0 && (
                    <div className="profile-section">
                        <h3>User's Posts</h3>
                        <div className="tags-list">
                            <Button className='submit-btn' onClick={handlePostRedirect}>
                                View Posts
                            </Button>
                        </div>
                    </div>
                )}


                {/* Reviews Section */}
                {/* {!isOwnProfile && ( */}
                    <div className="profile-section">
                        <div className="reviews-header">
                            <h3>Reviews</h3>
                            {reviews.length > 0 && (
                                <div className="average-rating">
                                    <span>Average: {averageRating}</span>
                                    <StarRating rating={parseFloat(averageRating)} />
                                </div>
                            )}
                        </div>

                        {!isOwnProfile && isLoggedIn && canUserReview() && !showReviewForm && (
                            <button
                                className="add-review-btn"
                                onClick={() => setShowReviewForm(true)}
                            >
                                Write a Review
                            </button>
                        )}

                        {!isOwnProfile && showReviewForm && (
                            <form className="review-form" onSubmit={handleReviewSubmit}>
                                <h4>{editingReview ? 'Edit Review' : 'Write a Review'}</h4>
                                <div className="review-rating">
                                    <label>Rating:</label>
                                    <StarRating 
                                        rating={reviewForm.rating} 
                                        onRatingChange={(rating) => setReviewForm(prev => ({...prev, rating}))}
                                        editable={true}
                                    />
                                </div>
                                <textarea
                                    value={reviewForm.content}
                                    onChange={(e) => setReviewForm(prev => ({...prev, content: e.target.value}))}
                                    placeholder="Share your experience with this user..."
                                    rows="4"
                                    required
                                />
                                <div className="review-form-actions">
                                    <button type="submit" className="submit-btn">
                                        {editingReview ? 'Update Review' : 'Submit Review'}
                                    </button>
                                    <button 
                                        type="button" 
                                        className="cancel-btn"
                                        onClick={() => {
                                            setShowReviewForm(false);
                                            setEditingReview(null);
                                            setReviewForm({ rating: 5, content: '' });
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="reviews-list">
                            {reviews.map((review) => (
                                <div key={review.id} className="review-item">
                                    <div className="review-header">
                                        <div className="reviewer-info">
                                            <img 
                                                src={review.userFrom?.profilePictureUrl || joinsoundsSquare} 
                                                alt={review.userFrom?.username || 'User'}
                                                className="reviewer-avatar"
                                            />
                                            <span className="reviewer-name">{review.userFrom?.username || 'Unknown User'}</span>
                                        </div>
                                        <div className="review-rating">
                                            <StarRating rating={review.rating} />
                                            <span className="review-date">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="review-content">{review.content}</p>
                                    {currentUser && review.userFromId === currentUser.id && (
                                        <div className="review-actions">
                                            <button 
                                                className="edit-review-btn"
                                                onClick={() => handleEditReview(review)}
                                            >
                                                <MdEdit /> Edit
                                            </button>
                                            <button 
                                                className="delete-review-btn"
                                                onClick={() => handleDeleteReview(review.id)}
                                            >
                                                <MdDelete /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            {reviews.length === 0 && !showReviewForm && (
                                <p className="no-reviews">No reviews yet. Be the first to write one!</p>
                            )}
                            
                            {hasMoreReviews && reviews.length > 0 && (
                                <button 
                                    className="load-more-reviews"
                                    onClick={() => fetchReviews(reviewsPage + 1)}
                                    disabled={reviewsLoading}
                                >
                                    {reviewsLoading ? 'Loading...' : 'Load More Reviews'}
                                </button>
                            )}
                        </div>
                    </div>
                {/* )} */}

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

            {showChat && (
                <ChatWindow
                    currentUser={currentUser}
                    otherUser={profile}
                    messages={messages}
                    sendMessage={sendMessage}
                    onClose={() => {
                        setShowChat(false);
                        localStorage.setItem("activeChat", "");
                    }}
                    onOpen={() => {
                        localStorage.setItem("activeChat", profile.id);
                    }}
                />
            )}

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
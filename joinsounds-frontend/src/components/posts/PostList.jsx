import React, { useState } from "react";
import "../common/Buttons.css";
import PostService from "../service/PostService";
import "./PostList.css";
import UserService from "../service/UserService";
import AudioPlayer from "../common/AudioPlayer";
import { useNavigate } from "react-router-dom";
import joinsoundsSquare from "../../assets/images/JOINSOUNDS_square.png"; 

function PostList({ 
  posts, 
  loading, 
  currentUserId, 
  onShowMore, 
  onEdit,
  onDelete, 
  onAdminDelete,
  token 
}) {
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);
  const navigate = useNavigate();
  
  const truncateText = (text, maxLength = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getAudioType = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    const types = {
      mp3: 'audio/mpeg',
      aac: 'audio/aac',
      m4a: 'audio/mp4',
      ogg: 'audio/ogg',
      wav: 'audio/wav',
      flac: 'audio/flac',
      opus: 'audio/ogg; codecs=opus'
    };
    return types[ext] || 'audio/mpeg';
  };

  const getAudioUrl = (filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith('http')) return filePath;
    return PostService.getAuthorizedFileUrl(filePath, token);
  };

  // Funkcja do pobierania URL zdjęcia profilowego
  const getProfilePictureUrl = (profilePicturePath) => {
    if (!profilePicturePath) return joinsoundsSquare;
    if (profilePicturePath.startsWith('http')) return profilePicturePath;
    return PostService.getAuthorizedFileUrl(profilePicturePath, token);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    
    const date = new Date(isoString);
    const options = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    
    return date.toLocaleDateString('en-EN', options);
  };

  const handlePlay = (postId) => {
    setCurrentlyPlayingId(postId);
  };

  const handlePause = () => {
    setCurrentlyPlayingId(null);
  };

  const onTagClick = (tag) => {
    navigate(`/tag/${tag}`);
  };

  const handleAuthorClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const onFinished = async (postId) => {
    if (window.confirm("Are you sure you want to finish this post, this action CAN'T BE REVERTED?")) {
      try {
        await PostService.markPostAsFinished(postId, token);
      }
      catch (error) {
        console.error("Error finishing post:", error);
      }
    }
  };

  if (loading) return <div className="loading">Loading posts...</div>;
  if (posts.length === 0 && !loading) return <p>No posts available. Be the first to post!</p>;

return (
    <div className="posts-list">
      {posts.map(post => (
        <div key={post.id} className="post-card-wrapper">
          <div className="post-card">
            <div className="post-header">
              {/* Sekcja autora ze zdjęciem profilowym */}
              {post.user && (
                <div className="post-author-section">
                  <div 
                    className="post-author-avatar-container"
                    onClick={() => handleAuthorClick(post.user.id)}
                  >
                    <img
                      src={getProfilePictureUrl(post.userProfilePicturePath)}
                      alt={`${post.user.name}'s avatar`}
                      className="post-author-avatar"
                    />
                  </div>
                  <div className="post-author-info">
                    <p 
                      className="post-author-name"
                      onClick={() => handleAuthorClick(post.user.id)}
                    >
                      {post.user.name}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Data w prawym górnym rogu */}
              {post.createdAt && (
                <div className="post-date-container">
                  <span className="post-date">
                    {formatDate(post.createdAt)}
                  </span>
                </div>
              )}
            </div>
            
            <h3>
              {post.isFinished && (
                <span className="finished-badge">FINISHED <br /></span>
              )}
              {post.title}
            </h3>
            
            <p>{truncateText(post.content)}</p>
            
            {/* Tags display section */}
            {post.tags && post.tags.length > 0 && (
              <div className="post-tags">
                {post.tags.map((tag, index) => (
                  <button
                    key={index}
                    className="tag-btn"
                    onClick={() => onTagClick(tag)}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
            
            {post.content.length > 0 && (
              <button 
                onClick={() => onShowMore(post.id)}
                className="submit-btn"
              >
                VIEW FULL POST
              </button>
            )}

            <div className="post-actions">
              {currentUserId === post.user?.id && (
                <button 
                  className="submit-btn"
                  onClick={() => onEdit(post.id)}
                >
                  Edit
                </button>
              )}

              {currentUserId === post.user?.id && (
                <button 
                  className="submit-btn"
                  onClick={() => onFinished(post.id)}
                >
                  Mark As Finished
                </button>
              )}

              {(currentUserId === post.user?.id || UserService.isModeratorOrAdmin()) && (
                <button 
                  onClick={(e) => onDelete(e, post.id)}  
                  className="delete-btn"
                >
                  Delete
                </button>
              )}
                
              {(UserService.isModeratorOrAdmin() && post.content !== "") && (
                <button 
                  onClick={(e) => onAdminDelete(e, post.id)}  
                  className="delete-btn"
                >
                  Moderator Delete
                </button>
              )}
            </div>

            {post.audioFilePath && (
              <AudioPlayer 
                audioUrl={getAudioUrl(post.audioFilePath)}
                audioType={getAudioType(post.audioFilePath)}
                isPlaying={currentlyPlayingId === post.id}
                onPlay={() => handlePlay(post.id)}
                onPause={handlePause}
                onEnd={handlePause}
                postId={post.id}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PostList;
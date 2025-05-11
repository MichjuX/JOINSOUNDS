import React , { useState } from "react";
import "../common/Buttons.css";
import PostService from "../service/PostService";
import "./PostList.css";
import UserService from "../service/UserService";
import AudioPlayer from "../common/AudioPlayer";

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

  if (loading) return <div className="loading">Loading posts...</div>;
  if (posts.length === 0 && !loading) return <p>No posts available. Be the first to post!</p>;

  return (
    <div className="posts-list">
      {posts.map(post => (
        <div key={post.id} className="post-card">
          <div className="post-header">
            <h3>{post.title}</h3>
            {post.createdAt && (
              <span className="post-date">
                {formatDate(post.createdAt)}
              </span>
            )}
        </div>
          
        {post.user && <p className="post-author">By: {post.user.name}</p>}
              
        <p>{truncateText(post.content)}</p>
        {post.content.length > 0 && (
            <button 
                onClick={() => onShowMore(post.id)}
                className="submit-btn"
            >
                VIEW FULL POST
            </button>
        )}

        {currentUserId === post.user?.id && (
           <button 
                    className="submit-btn"
                    onClick={() => onEdit(post.id)}
                >
                    Edit
                </button>
        )}

        {(currentUserId === post.user?.id || UserService.isModeratorOrAdmin()) && (
            <>
                <button 
                    onClick={() => onDelete(post.id)}
                    className="delete-btn"
                >
                    Delete
                </button>
            </>
        )}
            
        {(UserService.isModeratorOrAdmin() && post.content!="" ) && (
            <button 
                onClick={() => onAdminDelete(post.id)}
                className="delete-btn"
            >
                Moderator Delete
            </button>
        )}

          
          {/* {post.audioFilePath && (
            <div className="audio-player">
              <audio controls>
                <source 
                  src={getAudioUrl(post.audioFilePath)} 
                  type={getAudioType(post.audioFilePath)}
                  onError={(e) => {
                    console.error('Audio load failed:', {
                      error: e.target.error,
                      src: e.target.src,
                      type: e.target.type
                    });
                  }}
                />
                Your browser does not support the audio element.
              </audio>
            </div>
          )} */}
          {post.audioFilePath && (
            <AudioPlayer 
              audioUrl={getAudioUrl(post.audioFilePath)}
              audioType={getAudioType(post.audioFilePath)}
              isPlaying={currentlyPlayingId === post.id}
              onPlay={() => handlePlay(post.id)}
              onPause={handlePause}
              onEnd={handlePause}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default PostList;
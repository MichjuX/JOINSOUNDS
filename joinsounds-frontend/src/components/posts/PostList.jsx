import React, { useState, useRef, useEffect } from "react";
import "../common/Buttons.css";
import PostService from "../service/PostService";
import "./PostList.css";
import UserService from "../service/UserService";
import AudioPlayer from "../common/AudioPlayer";
import CommentSection from "./CommentSection";
import { useNavigate } from "react-router-dom";
import joinsoundsSquare from "../../assets/images/JOINSOUNDS_square.png"; 
import { Button } from "@mui/material";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";

function PostList({ 
  posts, 
  loading, 
  currentUserId, 
  onShowMore, 
  onEdit,
  onDelete, 
  onAdminDelete,
  token,
  onUpdatePosts
}) {
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [needsExpandButton, setNeedsExpandButton] = useState({});
  const contentRefs = useRef({});
  const navigate = useNavigate();
  
  // Funkcja do rozwijania i zwijania tekstu
  const toggleExpand = (postId) => {
    setExpandedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Funkcja do sprawdzania czy tekst jest zbyt długi
  const checkTextOverflow = (postId) => {
    const element = contentRefs.current[postId];
    if (!element) return false;
    
    // Sprawdzamy czy tekst przekracza maksymalną wysokość (5 linii)
    return element.scrollHeight > element.clientHeight;
  };

  useEffect(() => {
    // Po załadowaniu komponentu sprawdzamy każdy post
    const newNeedsExpandButton = {};
    posts.forEach(post => {
      if (post.content) {
        newNeedsExpandButton[post.id] = checkTextOverflow(post.id);
      }
    });
    setNeedsExpandButton(newNeedsExpandButton);
  }, [posts]);

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

  const handleLike = async (postId) => {
    // od razu aktualizujemy stan UI
    onUpdatePosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              isLikedByCurrentUser: !post.isLikedByCurrentUser,
              likeCount: post.isLikedByCurrentUser 
                ? post.likeCount - 1 
                : post.likeCount + 1
            }
          : post
      )
    );

    try {
      await PostService.toggleLike(postId, token);
    } catch (error) {
      console.error("Error liking post:", error);
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
            <div className="post-title-section">
              <h3>
                {post.isFinished && (
                  <span className="finished-badge">FINISHED <br /></span>
                )}
                {post.title}
              </h3>
              <button className="like-btn" onClick={() => handleLike(post.id)}>
                {post.isLikedByCurrentUser ? <IoMdHeart size={24} /> : <IoMdHeartEmpty size={24} />}
                <span className="like-count">{post.likeCount}</span>
              </button>
            </div>
            
            {/* Sekcja z tekstem z możliwością przewijania */}
            <div 
              ref={el => contentRefs.current[post.id] = el}
              className={`post-content ${expandedPosts[post.id] ? 'expanded' : ''} ${needsExpandButton[post.id] ? 'has-gradient' : ''}`}
            >
              <p>{post.content}</p>
            </div>
            
            {/* Przycisk do rozwijania/zwijania długiego tekstu */}
            {needsExpandButton[post.id] && (
              <button 
                className="toggle-text-btn"
                onClick={() => toggleExpand(post.id)}
              >
                {expandedPosts[post.id] ? 'Show less' : 'Show more'}
              </button>
            )}
            
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

            {/* Sekcja komentarzy dla postów bez audio */}
            {!post.audioFilePath && (
              <CommentSection 
                postId={post.id}
                currentUserId={currentUserId}
                token={token}
                getProfilePictureUrl={getProfilePictureUrl}
                handleAuthorClick={handleAuthorClick}
              />
            )}

            {/* AudioPlayer tylko dla postów z audio */}
            {post.audioFilePath && (
              <AudioPlayer 
                audioUrl={getAudioUrl(post.audioFilePath)}
                audioType={getAudioType(post.audioFilePath)}
                isPlaying={currentlyPlayingId === post.id}
                onPlay={() => handlePlay(post.id)}
                onPause={handlePause}
                onEnd={handlePause}
                postId={post.id}
                currentUserId={currentUserId}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PostList;
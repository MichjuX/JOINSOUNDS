import React, { useState, useEffect } from "react";
import { FaComment, FaTrash } from "react-icons/fa";
import CommentService from "../service/CommentService";
import UserService from "../service/UserService";
import "../common/Buttons.css";
import "./PostList.css";

const CommentSection = ({ 
  postId, 
  currentUserId, 
  token, 
  getProfilePictureUrl, 
  handleAuthorClick 
}) => {
  const [isCreatingComment, setIsCreatingComment] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const loadedComments = await CommentService.getCommentsByPostId(postId);
      setComments(loadedComments);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const startNewComment = () => {
    setIsCreatingComment(true);
  };

  const cancelComment = () => {
    setIsCreatingComment(false);
    setCommentText("");
  };

  const saveComment = async () => {
    if (!commentText.trim()) return;

    try {
      const commentData = {
        content: commentText,
        post: { id: postId }
      };

      const savedComment = await CommentService.createComment(commentData, token);
      
      setComments(prev => [savedComment, ...prev]);
      cancelComment();
    } catch (error) {
      console.error("Error saving comment:", error);
      alert('Error saving comment: ' + error.message);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await CommentService.deleteComment(commentId, token);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  // Sprawdzanie uprawnień do usuwania komentarza
  const canDeleteComment = (comment) => {
    return currentUserId === comment.user?.id || UserService.isModeratorOrAdmin();
  };

  if (loading) {
    return <div className="loading">Loading comments...</div>;
  }

  return (
    <div className="comments-section">
      <div className="comments-header">
        <h3>Comments ({comments.length})</h3>
        <button 
          onClick={startNewComment}
          className="add-comment-btn"
        >
          <FaComment /> New Comment
        </button>
      </div>

      {/* Formularz tworzenia komentarza */}
      {isCreatingComment && (
        <div className="comment-form">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write your comment..."
            rows={3}
          />
          
          <div className="form-actions">
            <button 
              onClick={cancelComment}
              className="delete-btn"
            >
              Cancel
            </button>
            <button 
              onClick={saveComment}
              className="submit-btn"
              disabled={!commentText.trim()}
            >
              Save Comment
            </button>
          </div>
        </div>
      )}

      {/* Lista komentarzy */}
      <div className="comments-list-scrollable">
        {comments.map(comment => (
          <div key={comment.id} className="comment-card">
            <div className="comment-header">
              <div 
                className="post-author-avatar-container"
                onClick={() => handleAuthorClick(comment.user.id)}
              >
                <img
                  src={getProfilePictureUrl(comment.userProfilePicturePath)}
                  alt={`${comment.user.name}'s avatar`}
                  className="post-author-avatar"
                />
              </div>
              <span className="comment-author">
                <p 
                  className="post-author-name"
                  onClick={() => handleAuthorClick(comment.user.id)}
                >
                  {comment.user?.name || 'Anonymous User'}
                </p>
              </span>
              <span className="comment-date">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
              {canDeleteComment(comment) && (
                <button 
                  onClick={() => deleteComment(comment.id)}
                  className="delete-comment-btn"
                >
                  <FaTrash />
                </button>
              )}
            </div>
            
            <div className="comment-content">
              <p>{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
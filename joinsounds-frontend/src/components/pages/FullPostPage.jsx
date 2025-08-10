import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostService from "../service/PostService";
import "./FullPostPage.css";
import AudioPlayer from "../common/AudioPlayer";
import UserService from "../service/UserService";

function FullPostPage() {
    const token = localStorage.getItem('token');
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);
    const currentUserId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const postData = await PostService.getPostById(id);
                setPost(postData);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
                console.error("Error fetching post:", err);
            }
        };

        fetchPost();
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                await PostService.deletePost(id, token);
                navigate(-1);
            } catch (err) {
                console.error("Error deleting post:", err);
            }
        }
    };

    const handleAdminDelete = async () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                await PostService.adminDeletePost(id, token);
                navigate(-1);
            } catch (err) {
                console.error("Error admin deleting post:", err);
            }
        }
    };

    const handleEdit = () => {
        navigate(`/post/edit/${post.id}`);
    };

    if (loading) return <div className="error">Loading post...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!post) return <div className="error">Post not found</div>;

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

    const getAudioType = (filename) => {
        const ext = filename?.split('.')?.pop()?.toLowerCase();
        const types = {
            mp3: 'audio/mpeg', aac: 'audio/aac', m4a: 'audio/mp4',
            ogg: 'audio/ogg', wav: 'audio/wav', flac: 'audio/flac',
            opus: 'audio/ogg; codecs=opus'
        };
        return types[ext] || 'audio/mpeg';
    };

    const getAudioUrl = (filePath) => {
        if (!filePath) return null;
        if (filePath.startsWith('http')) return filePath;
        return PostService.getAuthorizedFileUrl(filePath, token);
    };

    const handlePlay = (postId) => {
        setCurrentlyPlayingId(postId);
    };

    const handlePause = () => {
        setCurrentlyPlayingId(null);
    };

    return (
        <div className="full-post-container">
            <button onClick={() => navigate(-1)} className="back-button">
                Wróć
            </button>
            
            <div className="full-post-card">
                <div className="post-header">
                    <h3>{post.title}</h3>
                    {post.createdAt && (
                        <span className="post-date">
                            {formatDate(post.createdAt)}
                        </span>
                    )}
                </div>
                
                {post.user && <p className="post-author">By: {post.user.name}</p>}
                
                <p className="full-content">{post.content}</p>
                
                <div className="post-actions">
                    {currentUserId === post.user?.id && (
                        <button 
                            className="submit-btn"
                            onClick={handleEdit}
                        >
                            Edit
                        </button>
                    )}

                    {(currentUserId === post.user?.id || UserService.isModeratorOrAdmin()) && (
                        <button 
                            onClick={handleDelete}
                            className="delete-btn"
                        >
                            Delete
                        </button>
                    )}
                        
                    {(UserService.isModeratorOrAdmin() && post.content !== "") && (
                        <button 
                            onClick={handleAdminDelete}
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
                    />
                )}
            </div>
        </div>
    );
}

export default FullPostPage;
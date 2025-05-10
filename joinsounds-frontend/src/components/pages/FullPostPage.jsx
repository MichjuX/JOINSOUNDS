import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostService from "../service/PostService";
import "./FullPostPage.css";

function FullPostPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    if (loading) return <div className="error">Loading post...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!post) return <div className="error">Post not found</div>;

    return (
        <div className="full-post-container">
            <button onClick={() => navigate(-1)} className="back-button">
                Wróć
            </button>
            
            <div className="full-post-card">
                <h2>{post.title}</h2>
                <p className="full-content">{post.content}</p>
                
                {post.audioFilePath && (
                    <div className="audio-player">
                        <audio controls>
                            <source 
                                src={PostService.getAuthorizedFileUrl(post.audioFilePath)} 
                                type={getAudioType(post.audioFilePath)}
                            />
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                )}
            </div>
        </div>
    );
}

// Ta sama funkcja co w HomePage
const getAudioType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
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

export default FullPostPage;
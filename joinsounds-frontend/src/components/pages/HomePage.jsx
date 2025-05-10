import React, { useState, useEffect } from "react";
import PostForm from "../forms/PostForm";
import PostService from "../service/PostService";
import "./HomePage.css";

function HomePage() {
    const token = localStorage.getItem('token');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const postsData = await PostService.getAllPosts(token);
                setPosts(postsData);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
                console.error("Error fetching posts:", err);
            }
        };

        fetchPosts();
    }, [token]);

    if (loading) return <div className="error">Loading posts...</div>;
    if (error) return <div className="error">Error: {error}</div>;

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

    return (
        <div className="home-page-container">
            <h1>Welcome to JoinSounds</h1>
            
            <div className="post-form-section">
                <h2>Create new post</h2>
                <PostForm token={token} onPostCreated={() => window.location.reload()} />
            </div>

            <div className="posts-list">
                <h2>Recent Posts</h2>
                {posts.length === 0 ? (
                    <p>No posts available. Be the first to post!</p>
                ) : (
                    posts.map(post => (
                        <div key={post.id} className="post-card">
                            <h3>{post.title}</h3>
                            <p>{post.content}</p>
                            
                            {post.audioFilePath && (
                                <div className="audio-player">
                                    <audio controls>
                                        <source 
                                            src={PostService.getAuthorizedFileUrl(post.audioFilePath, token)} 
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
                            )}
                        
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default HomePage;
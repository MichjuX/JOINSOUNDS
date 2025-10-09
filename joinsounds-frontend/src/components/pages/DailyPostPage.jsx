import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PostService from "../service/PostService";
import PostList from "../posts/PostList";
import "./HomePage.css";
import "../common/Buttons.css";

function DailyPostPage() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDailyPost = async () => {
      try {
        setLoading(true);
        const data = await PostService.getDailyPost(token);
        setPost(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyPost();
  }, [token]);

  const getAudioType = (filename) => {
    const ext = filename?.split('.').pop().toLowerCase();
    const types = {
      mp3: 'audio/mpeg',
      aac: 'audio/aac',
      m4a: 'audio/mp4',
      ogg: 'audio/ogg',
      wav: 'audio/wav'
    };
    return types[ext] || 'audio/mpeg';
  };

  const handleShowMore = (postId) => {
    navigate(`/post/${postId}`);
  };

  if (loading) return <div className="loading">Loading daily post...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!post) return <div className="no-content">No daily post available today.</div>;

  return (
    <div className="home-page-container">
      <div className="posts-container">
        <h2>🎵 Post of the Day</h2>

        <PostList 
          posts={[post]} 
          loading={false}
          currentUserId={localStorage.getItem("userId")}
          onShowMore={() => handleShowMore(post.id)}
          onEdit={(postId) => navigate(`/post/edit/${postId}`)}
          onDelete={() => {}} // brak usuwania
          getAudioType={getAudioType}
          token={token}
        />
      </div>
    </div>
  );
}

export default DailyPostPage;

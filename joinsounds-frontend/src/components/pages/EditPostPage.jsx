import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostService from "../service/PostService";
import "./FullPostPage.css";
import PostEditForm from "../forms/PostEditForm";
import "../common/Buttons.css";

function EditPostPage() {
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
            <button 
                className="submit-btn"
                onClick={() => navigate(-1)}
                >
                Back
            </button>

            <PostEditForm post={post} onPostUpdated={() => navigate(-1)} />
        </div>
    );
}

export default EditPostPage;
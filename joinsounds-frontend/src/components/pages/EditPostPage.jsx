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
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        // Sprawdź czy token jest poprawny
        if (!token || token.split('.').length !== 3) {
            setError('Invalid authentication token. Please log in again.');
            setLoading(false);
            return;
        }

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
    }, [id, token]);

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

            <PostEditForm 
                post={post} 
                onPostUpdated={() => navigate(-1)} 
                token={token} // ← TU PRZEKAZUJESZ TOKEN!
            />
        </div>
    );
}

export default EditPostPage;
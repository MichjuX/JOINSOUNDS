import React, { useState, useRef, useEffect } from 'react';
import PostService from '../service/PostService';
import './PostForm.css';

const PostEditForm = ({ post, onPostUpdated }) => { // Zmieniamy props na post i onPostUpdated
    const [title, setTitle] = useState(post ? post.title : '');
    const [content, setContent] = useState(post ? post.content : '');
    const [audioFile, setAudioFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    // Dodajemy useEffect do aktualizacji stanu gdy zmieni się prop 'post'
    useEffect(() => {
        if (post) {
            setTitle(post.title);
            setContent(post.content);
        }
    }, [post]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const token = localStorage.getItem('token') // Pobierz aktualny token
            if (!token) {
                throw new Error("No authentication token found");
            }

            await PostService.updatePost(post.id, {
                title,
                content
            }, token); // Przekaż token

            alert('Post updated successfully!');
            if (onPostUpdated) onPostUpdated();
        } catch (error) {
            console.error("Update error:", error);
            alert(`Error: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <form onSubmit={handleSubmit}>
            <input
                className='form-input'
                type="text"
                placeholder="Tytuł"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isSubmitting}
            />
            <textarea
                placeholder="Treść"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                disabled={isSubmitting}
            />
            
            {post.audioFilePath && !audioFile && (
                <div className="current-audio">
                    <p>Aktualny plik audio: {post.audioFilePath}</p>
                </div>
            )}
            
            {isSubmitting && (
                <div className="progress-container">
                    <div 
                        className="progress-bar" 
                        style={{ width: `${uploadProgress || 0}%` }}
                    ></div>
                    <span className="progress-text">
                        {uploadProgress !== undefined ? `${uploadProgress}%` : 'Przesyłanie...'}
                    </span>
                </div>
            )}
            
            <button
                type="submit"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Saving...' : 'Save changes'}
            </button>
        </form>
    );
};

export default PostEditForm;
import React, { useState, useRef, useEffect } from 'react';
import PostService from '../service/PostService';
import './PostForm.css'; // Importujemy ten sam CSS co w PostForm
import '../common/Buttons.css';

const PostEditForm = ({ post, onPostUpdated, token }) => {
    const [title, setTitle] = useState(post ? post.title : '');
    const [content, setContent] = useState(post ? post.content : '');
    const [audioFile, setAudioFile] = useState(null);
    const [replaceAudio, setReplaceAudio] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (post) {
            setTitle(post.title);
            setContent(post.content);
        }
    }, [post]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setUploadProgress(0);

        try {
            let audioFilePath = post.audioFilePath;

            // Jeśli użytkownik chce podmienić plik audio
            if (replaceAudio && audioFile) {
                const fileName = await PostService.uploadFile(
                    audioFile, 
                    token,
                    (progress) => {
                        setUploadProgress(progress);
                    }
                );
                audioFilePath = fileName;
            }

            await PostService.updatePost(post.id, {
                title,
                content,
                audioFilePath: replaceAudio ? audioFilePath : undefined
            }, token, replaceAudio);

            // Opcjonalnie: Toast success tutaj
            
            if (onPostUpdated) {
                onPostUpdated();
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.includes("Only audio files are allowed")) {
                alert('Choose audio file (MP3, WAV, OGG, M4A)');
            } else {
                console.error(error);
                alert(`An error occurred: ${error.response?.data?.message || error.message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAudioFile(file);
            setReplaceAudio(true);
        }
    };

    const cancelAudioChange = () => {
        setAudioFile(null);
        setReplaceAudio(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <form onSubmit={handleSubmit} className="post-form">
            {/* Tytuł */}
            <div className="form-group">
                <label>Edit Title</label>
                <input
                    type="text"
                    placeholder="Tytuł"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={isSubmitting}
                />
            </div>
            
            {/* Treść */}
            <div className="form-group">
                <label>Edit Content</label>
                <textarea
                    placeholder="Treść"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    disabled={isSubmitting}
                    rows={6}
                />
            </div>
            
            {/* Sekcja Audio */}
            <div className="form-group">
                <label>Audio Management</label>
                
                {/* 1. Wyświetlanie obecnego audio (jeśli istnieje i nie zmieniamy) */}
                {post.audioFilePath && !replaceAudio && (
                    <div style={{ 
                        backgroundColor: '#212121', 
                        padding: '15px', 
                        borderRadius: '8px', 
                        border: '1px solid #313131',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        <div style={{ color: '#fff', fontSize: '0.9rem' }}>Current file loaded.</div>
                        <audio controls style={{ width: '100%' }}>
                            <source src={PostService.getAuthorizedFileUrl(post.audioFilePath, token)} type="audio/mpeg" />
                            Your browser does not support the audio element.
                        </audio>
                        
                        <button 
                            type="button" 
                            onClick={() => setReplaceAudio(true)}
                            disabled={isSubmitting}
                            style={{
                                background: 'transparent',
                                border: '1px solid #ff5100',
                                color: '#ff5100',
                                padding: '8px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                alignSelf: 'flex-start',
                                marginTop: '5px'
                            }}
                        >
                            Replace Audio File
                        </button>
                    </div>
                )}

                {/* 2. Brak audio w poście OR tryb zmiany audio */}
                {(!post.audioFilePath || replaceAudio) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            disabled={isSubmitting}
                            accept="audio/*"
                        />
                        
                        {/* Przycisk Anuluj tylko jeśli post miał wcześniej audio */}
                        {post.audioFilePath && replaceAudio && (
                            <button 
                                type="button" 
                                onClick={cancelAudioChange}
                                disabled={isSubmitting}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#aaaaaa',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    alignSelf: 'flex-start',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Cancel change (Keep original audio)
                            </button>
                        )}
                    </div>
                )}
            </div>
            
            {/* Pasek postępu */}
            {isSubmitting && uploadProgress > 0 && (
                <div className="progress-container">
                    <div 
                        className="progress-bar" 
                        style={{ width: `${uploadProgress}%` }}
                    ></div>
                    <span className="progress-text">
                        {uploadProgress}%
                    </span>
                </div>
            )}
            
            {/* Przyciski akcji */}
            <div className="form-actions">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="submit-btn"
                >
                    {isSubmitting ? 'Saving...' : 'Update Post'}
                </button>
            </div>
        </form>
    );
};

export default PostEditForm;
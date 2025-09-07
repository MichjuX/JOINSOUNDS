import React, { useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import PostService from '../service/PostService';
import './PostForm.css';
import '../common/Buttons.css';

const PostForm = ({ token, onPostCreated }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [audioFile, setAudioFile] = useState(null);
    const [currentTag, setCurrentTag] = useState('');
    const [tags, setTags] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);
    const toast = useRef(null);

    const addTag = () => {
        if (currentTag.trim() && !tags.includes(currentTag.trim().toLowerCase())) {
            setTags(prevTags => [...prevTags, currentTag.trim().toLowerCase()]);
            setCurrentTag('');
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(prevTags => prevTags.filter(tag => tag !== tagToRemove));
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    const showToast = (severity, summary, detail) => {
        toast.current.show({
            severity: severity,
            summary: summary,
            detail: detail,
            life: 3000
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setUploadProgress(0);

        try {
            let audioFilePath = null;

            if (audioFile) {
                const fileName = await PostService.uploadFile(
                    audioFile, 
                    token,
                    (progress) => {
                        setUploadProgress(progress);
                    }
                );
                audioFilePath = fileName;
            }
            
            // Konwertujemy tablicę tagów na string oddzielony przecinkami
            const tagsString = tags.join(',');
            
            await PostService.createPost({
                title,
                content,
                audioFilePath,
                tags: tagsString
            }, token);

            showToast('success', 'Success', 'Post has been successfully added!');

            // Reset formularza
            setTitle('');
            setContent('');
            setCurrentTag('');
            setTags([]);
            setAudioFile(null);
            setUploadProgress(0);
            
            // Reset formularza pliku
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            // Wywołujemy callback po przesłaniu pliku
            if (onPostCreated) {
                onPostCreated();
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.includes("Only audio files are allowed")) {
                showToast('error', 'Błąd', 'Proszę wybrać plik audio w poprawnym formacie (MP3, WAV, OGG, M4A)');
            } else {
                showToast('error', 'Błąd', `Wystąpił błąd: ${error.response?.data?.message || error.message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Toast ref={toast} position="top-right" />
            <form onSubmit={handleSubmit} className="post-form">
                <div className="form-group">
                    <label>Title</label>
                    <input
                        className='form-input'
                        type="text"
                        placeholder="Post title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                </div>
                
                <div className="form-group">
                    <label>Content</label>
                    <textarea
                        placeholder="Describe your post..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        disabled={isSubmitting}
                        rows={4}
                    />
                </div>
                
                <div className="form-group">
                    <label>Tags</label>
                    <div className="tag-input-group">
                        <input
                            className='form-input'
                            type="text"
                            value={currentTag}
                            onChange={(e) => setCurrentTag(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            placeholder="Add tag (e.g. music) and press Enter"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="tags-list">
                        {tags.map((tag, index) => (
                            <span key={index} className="tag">
                                {tag}
                                <button 
                                    type="button" 
                                    className='tag-list-btn' 
                                    onClick={() => removeTag(tag)}
                                    disabled={isSubmitting}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
                
                <div className="form-group">
                    <label>Plik audio</label>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => setAudioFile(e.target.files[0])}
                        disabled={isSubmitting}
                        accept="audio/*"
                    />
                </div>
                
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
                
                <div className="form-actions">
                    <button
                        type="submit"
                        className='submit-btn'
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Wysyłanie...' : 'Dodaj post'}
                    </button>
                </div>
            </form>
        </>
    );
};

export default PostForm;
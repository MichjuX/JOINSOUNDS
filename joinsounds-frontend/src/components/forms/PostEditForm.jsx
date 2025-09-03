import React, { useState, useRef, useEffect } from 'react';
import PostService from '../service/PostService';
import './PostForm.css';

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
                // Prześlij nowy plik
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

            alert('Post został zaktualizowany!');
            
            if (onPostUpdated) {
                onPostUpdated();
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.includes("Only audio files are allowed")) {
                alert('Proszę wybrać plik audio w poprawnym formacie (MP3, WAV, OGG, M4A)');
            } else {
                alert(`Wystąpił błąd: ${error.response?.data?.message || error.message}`);
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

    const removeAudioSelection = () => {
        setAudioFile(null);
        setReplaceAudio(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
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
            
            {/* Sekcja zarządzania plikiem audio */}
            <div className="audio-management">
                {post.audioFilePath && !replaceAudio && (
                    <div className="current-audio">
                        <p>Aktualny plik audio: {post.audioFilePath}</p>
                        <audio controls>
                            <source src={PostService.getAuthorizedFileUrl(post.audioFilePath)} type="audio/mpeg" />
                            Twoja przeglądarka nie obsługuje odtwarzacza audio.
                        </audio>
                        <button 
                            type="button" 
                            onClick={() => setReplaceAudio(true)}
                            disabled={isSubmitting}
                            className="secondary-button"
                        >
                            Zmień plik audio
                        </button>
                    </div>
                )}
                
                {replaceAudio && (
                    <div className="new-audio">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            disabled={isSubmitting}
                            accept="audio/*"
                        />
                        {audioFile && (
                            <div className="audio-actions">
                                <span>Wybrano: {audioFile.name}</span>
                                <button 
                                    type="button" 
                                    onClick={cancelAudioChange}
                                    disabled={isSubmitting}
                                    className="secondary-button"
                                >
                                    Anuluj zmianę
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
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
            
            <button
                type="submit"
                disabled={isSubmitting}
                className="primary-button"
            >
                {isSubmitting ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </button>
        </form>
    );
};

export default PostEditForm;
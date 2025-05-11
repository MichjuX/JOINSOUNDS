import React, { useState, useRef } from 'react';
import PostService from '../service/PostService';
import './PostForm.css';

const PostForm = ({ token, onPostCreated}) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [audioFile, setAudioFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null); // Dodajemy referencję do inputa file

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
            
            await PostService.createPost({
                title,
                content,
                audioFilePath
            }, token);

            alert('Post został dodany!');
            // Reset formularza
            setTitle('');
            setContent('');
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
                alert('Proszę wybrać plik audio w poprawnym formacie (MP3, WAV, OGG, M4A)');
            } else {
                alert(`Wystąpił błąd: ${error.response?.data?.message || error.message}`);
            }
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
            <input
                type="file"
                ref={fileInputRef} // Dodajemy referencję
                onChange={(e) => setAudioFile(e.target.files[0])}
                disabled={isSubmitting}
                accept="audio/*"
            />
            
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
                {isSubmitting ? 'Sending...' : 'Add post'}
            </button>
        </form>
    );
};

export default PostForm;
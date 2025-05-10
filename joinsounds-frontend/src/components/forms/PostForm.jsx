import React, { useState } from 'react';
import PostService from '../service/PostService';

const PostForm = ({ token }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [audioFile, setAudioFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let audioFilePath = null;

            // 1. Upload pliku audio (jeśli istnieje)
            if (audioFile) {
                const fileName = await PostService.uploadFile(audioFile, token);
                audioFilePath = fileName; // Backend zwraca już gotową nazwę pliku
            }
            // 2. Utwórz post
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
              onChange={(e) => setAudioFile(e.target.files[0])}
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Wysyłanie...' : 'Dodaj post'}
            </button>
          </form>
        );
};

export default PostForm;
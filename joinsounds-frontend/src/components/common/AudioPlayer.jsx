import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import { MdPlayArrow, MdOutlinePause, MdVolumeDown, MdVolumeUp, MdVolumeOff, MdReplay } from "react-icons/md";
import { FaComment, FaTrash, FaPlus, FaMinus, FaUser } from "react-icons/fa";
import CommentService from '../service/CommentService';
import "./AudioPlayer.css";

const CommentPlayer = ({ audioUrl, startTime, endTime, color }) => {
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!waveformRef.current || !audioUrl) return;

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "rgba(200, 200, 200, 0.2)",
      progressColor: color || "rgba(252, 68, 47, 0.8)",
      cursorColor: '#e64900',
      barWidth: 1,
      cursorWidth: 1,
      height: 40,
      responsive: true,
      interact: true,
      fillParent: true,
      partialRender: true,
      backgroundColor: 'transparent'
    });

    wavesurferRef.current = ws;

    ws.load(audioUrl);
    ws.setVolume(volume);

    ws.on('ready', () => {
      setIsReady(true);
      
      if (startTime && endTime) {
        const regions = ws.registerPlugin(RegionsPlugin.create());
        
        regions.addRegion({
          id: `comment-region-${Date.now()}`,
          start: startTime,
          end: endTime,
          color: color || 'rgba(255, 89, 0, 0.5)',
          drag: false,
          resize: false
        });

        // Ustaw czas rozpoczęcia odtwarzania na początek regionu
        ws.setTime(startTime);
      }
    });

    ws.on('finish', () => {
      setIsPlaying(false);
    });

    return () => {
      ws.destroy();
    };
  }, [audioUrl, startTime, endTime, color]);

  const togglePlay = () => {
    if (!wavesurferRef.current) return;
    
    if (isPlaying) {
      wavesurferRef.current.pause();
    } else {
      // Jeśli to początek odtwarzania, ustaw czas na start regionu
      if (wavesurferRef.current.getCurrentTime() === 0 && startTime) {
        wavesurferRef.current.setTime(startTime);
      }
      wavesurferRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(newVolume);
    }
    if (isMuted && newVolume > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (wavesurferRef.current) {
      if (isMuted) {
        wavesurferRef.current.setVolume(volume);
      } else {
        wavesurferRef.current.setVolume(0);
      }
      setIsMuted(!isMuted);
    }
  };

  const jumpToRegionStart = () => {
    if (wavesurferRef.current && startTime) {
      wavesurferRef.current.setTime(startTime);
      if (!isPlaying) {
        wavesurferRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="comment-player">
      <div ref={waveformRef} className="comment-waveform" />
      <div className="comment-player-controls">
        <button 
          onClick={togglePlay} 
          className="comment-play-btn"
          disabled={!isReady}
        >
          {isPlaying ? <MdOutlinePause size={14} /> : <MdPlayArrow size={14} />}
        </button>
        
        <button
          onClick={jumpToRegionStart}
          className="comment-jump-btn"
          title="Przewiń do początku fragmentu"
        >
          <MdReplay size={14} />
        </button>
        
        <div className="comment-volume-control">
          <button onClick={toggleMute} className="comment-volume-btn">
            {isMuted ? <MdVolumeOff size={14} /> : 
             volume > 0.5 ? <MdVolumeUp size={14} /> : <MdVolumeDown size={14} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="comment-volume-slider"
          />
        </div>
      </div>
    </div>
  );
};

const AudioPlayer = ({ 
  audioUrl, 
  postId,
  initialComments = []
}) => {
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const regionsRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [activeComment, setActiveComment] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isCreatingComment, setIsCreatingComment] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const token = localStorage.getItem('token');

  // Initialize main WaveSurfer instance
  useEffect(() => {
    if (!waveformRef.current || !audioUrl) return;

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "rgba(252, 68, 47, 1)",
      progressColor: "rgba(252, 68, 47, 0.5)",
      cursorColor: '#e64900',
      barWidth: 3,
      cursorWidth: 3,
      height: 80,
      responsive: true,
      interact: true,
      backgroundColor: 'transparent'
    });

    const regions = ws.registerPlugin(RegionsPlugin.create());
    regionsRef.current = regions;

    wavesurferRef.current = ws;

    ws.load(audioUrl);
    ws.setVolume(volume);

    ws.on('ready', () => {
      setIsReady(true);
      setDuration(ws.getDuration());
      loadComments();
    });

    ws.on('audioprocess', () => {
      setCurrentTime(ws.getCurrentTime());
    });

    ws.on('finish', () => {
      setIsPlaying(false);
    });

    ws.on('interaction', () => {
      ws.play();
      setIsPlaying(true);
    });

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, [audioUrl]);

  // Load comments
  const loadComments = async () => {
    try {
      const loadedComments = await CommentService.getCommentsByPostId(postId);
      setComments(loadedComments);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  // Tworzenie regionów dla komentarzy
  const createRegionsForComments = (comments) => {
    // Najpierw wyczyść istniejące regiony
    regionsRef.current.clearRegions();
    
    comments.forEach(comment => {
      if (comment.startTime && comment.endTime) {
        const region = regionsRef.current.addRegion({
          id: comment.id,
          start: comment.startTime,
          end: comment.endTime,
          content: comment.content,
          color: 'rgba(249, 75, 0, 0.69)',
          drag: true,
          resize: true
        });

        region.on('click', (e) => {
          e.stopPropagation();
          setActiveComment(comment);
          // Przewiń do regionu i odtwórz
          wavesurferRef.current.setTime(region.start);
          wavesurferRef.current.play();
          setIsPlaying(true);
        });
      }
    });
  };

  // Rozpoczęcie tworzenia nowego komentarza
  const startNewComment = () => {
    setIsCreatingComment(true);
    setActiveComment({
      id: null,
      content: '',
      regions: []
    });
    setCommentText('');
    setSelectedRegions([]);
  };

  // Anulowanie tworzenia komentarza
  const cancelComment = () => {
    setIsCreatingComment(false);
    setActiveComment(null);
    
    // USUWANIE REGIONÓW PRZY ANULOWANIU
    selectedRegions.forEach(region => {
      region.remove();
    });
    
    setSelectedRegions([]);
  };

  // Dodanie nowego regionu do tworzonego komentarza
  const addRegionToComment = () => {
    if (!isCreatingComment) return;
    
    const currentTime = wavesurferRef.current.getCurrentTime();
    const newRegion = regionsRef.current.addRegion({
      start: currentTime,
      end: currentTime + 5,
      color: 'rgba(201, 201, 201, 0.48)',
      drag: true,
      resize: true,
      minLength: 0.5,
    });

    newRegion.on('update-end', () => {
      setSelectedRegions(prev => [...prev]);
    });

    newRegion.on('click', (e) => {
      e.stopPropagation();
      setSelectedRegions(prev => [...prev]);
    });

    setSelectedRegions(prev => [...prev, newRegion]);
  };

  // Usunięcie regionu z tworzonego komentarza
  const removeRegionFromComment = (index) => {
    if (!isCreatingComment || index >= selectedRegions.length) return;
    
    const regionToRemove = selectedRegions[index];
    regionToRemove.remove();
    setSelectedRegions(prev => prev.filter((_, i) => i !== index));
  };

  // Zapisanie komentarza
  // Zapisanie komentarza
  const saveComment = async () => {
    if (!commentText.trim()) return;

    try {
      const commentData = {
        content: commentText,
        startTime: selectedRegions.length > 0 ? selectedRegions[0].start : null,
        endTime: selectedRegions.length > 0 ? selectedRegions[0].end : null,
        color: 'rgba(255, 68, 0, 0.57)',
        post: {
          id: postId
        }
      };

      const savedComment = await CommentService.createComment(commentData, token);
      
      // Usuń wszystkie regiony związane z tworzonym komentarzem
      selectedRegions.forEach(region => {
        if (region && typeof region.remove === 'function') {
          region.remove();
        }
      });
      
      // Zaktualizuj stan
      setComments(prev => [...prev, savedComment]);
      setIsCreatingComment(false);
      setActiveComment(null);
      setCommentText('');
      setSelectedRegions([]);
      
    } catch (error) {
      console.error("Error saving comment:", error);
      // Możesz dodać powiadomienie dla użytkownika
      alert('Error saving comment: ' + error.message);
    }
  };
  
  // Usunięcie komentarza
  const deleteComment = async (commentId) => {
    try {
      await CommentService.deleteComment(commentId, token);
      setComments(prev => prev.filter(c => c.id !== commentId));
      
      const regions = regionsRef.current.getRegions();
      regions.forEach(region => {
        if (region.id.startsWith(commentId)) {
          region.remove();
        }
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  // Obsługa play/pause
  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  // Formatowanie czasu
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="audio-player-container">
      <div ref={waveformRef} className="waveform" onClick={(e) => e.stopPropagation()} />
      
      {/* Main player controls */}
      <div className="controls">
        <button 
          onClick={togglePlayPause} 
          className="control-btn"
          disabled={!isReady}
        >
          {isPlaying ? <MdOutlinePause size={24} /> : <MdPlayArrow size={24} />}
        </button>
        
        <div className="time-display">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
                
        <div className="volume-control">
          <button onClick={() => setIsMuted(!isMuted)} className="volume-btn">
            {isMuted ? <MdVolumeOff size={20} /> : 
              volume > 0.5 ? <MdVolumeUp size={20} /> : <MdVolumeDown size={20} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              wavesurferRef.current.setVolume(parseFloat(e.target.value));
              if (isMuted && e.target.value > 0) setIsMuted(false);
            }}
          />
        </div>
      </div>

      <div className="comments-section">
        <div className="comments-header">
          <h3>Comments</h3>
          <button 
            onClick={startNewComment}
            className="add-comment-btn"
          >
            <FaComment /> New Comment
          </button>
        </div>

        {(isCreatingComment || activeComment?.id === null) && (
          <div className="comment-form">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Content..."
              rows={3}
            />
            
            <div className="regions-list">
              <h4>Added Regions:</h4>
              {selectedRegions.length === 0 ? (
                <p>No regions (general comment)</p>
              ) : (
                selectedRegions.map((region, index) => (
                  <div key={index} className="region-item">
                    <span>
                      {formatTime(region.start)} - {formatTime(region.end)}
                    </span>
                    <button 
                      onClick={() => removeRegionFromComment(index)}
                      className="remove-region-btn"
                    >
                      <FaMinus />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div className="form-actions">
              <button 
                onClick={addRegionToComment}
                className="action-btn"
              >
                <FaPlus /> Add Region
              </button>
              
              <div>
                <button 
                  onClick={cancelComment}
                  className="action-btn cancel"
                >
                  Anuluj
                </button>
                <button 
                  onClick={saveComment}
                  className="action-btn save"
                  disabled={!commentText.trim()}
                >
                  Zapisz
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="comments-list">
          {comments.map(comment => (
            <div 
              key={comment.id} 
              className={`comment-card ${activeComment?.id === comment.id ? 'active' : ''}`}
            >
              <div className="comment-header">
                <FaUser className="user-icon" />
                <span className="comment-author">
                  {comment.user?.name || 'Anonymous User'}
                </span>
                <span className="comment-date">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteComment(comment.id);
                  }}
                  className="delete-comment-btn"
                >
                  <FaTrash />
                </button>
              </div>
              
              <div className="comment-content">
                <p>{comment.content}</p>
                
                {comment.startTime && comment.endTime && (
                  <>
                    <CommentPlayer 
                      audioUrl={audioUrl} 
                      startTime={comment.startTime} 
                      endTime={comment.endTime}
                      color={comment.color}
                    />
                    <div className="comment-timestamps">
                      Fragment: {formatTime(comment.startTime)} - {formatTime(comment.endTime)}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
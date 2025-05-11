import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import "./AudioPlayer.css";
import { MdPlayArrow, MdOutlinePause, MdVolumeDown, MdVolumeUp, MdVolumeOff } from "react-icons/md";

const AudioPlayer = ({ 
    audioUrl, 
    audioType = 'audio/mpeg',
    isPlaying = false, // nowy prop - informuje czy ten player powinien grać
    onPlay,    // callback wywoływany przy play
    onPause,   // callback wywoływany przy pause
    onEnd      // callback wywoływany przy zakończeniu
    }) => {
    const waveformRef = useRef(null);
    const wavesurferRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        if (!waveformRef.current || !audioUrl) return;

        wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: [
            "rgba(252, 68, 47, 1)",
            "rgba(255, 83, 5, 1)",
        ],
        progressColor: [
            "rgba(252, 68, 47, .5)",
            "rgba(255, 83, 5, .5)",
        ],
        cursorColor: '#e64900',
        barWidth: 3,
        barRadius: 1,
        cursorWidth: 3,
        height: 40,
        barGap: 3,
        responsive: true,
        });

        wavesurferRef.current.load(audioUrl);
        wavesurferRef.current.setVolume(volume);

        wavesurferRef.current.on('ready', () => {
        setDuration(wavesurferRef.current.getDuration());
        });

        wavesurferRef.current.on('audioprocess', () => {
        setCurrentTime(wavesurferRef.current.getCurrentTime());
        });

        wavesurferRef.current.on('finish', () => {
        setIsPlaying(false);
        });

        return () => {
        wavesurferRef.current.destroy();
        };
    }, [audioUrl]);

    const togglePlayPause = () => {
        if (wavesurferRef.current) {
            if (isPlaying) {
                wavesurferRef.current.pause();
                onPause?.();
            } else {
                wavesurferRef.current.play();
                onPlay?.();
            }
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        
        if (wavesurferRef.current) {
        wavesurferRef.current.setVolume(newVolume);
        }
        
        if (isMuted && newVolume > 0) {
        setIsMuted(false);
        }
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

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    useEffect(() => {
        if (wavesurferRef.current) {
            if (isPlaying) {
                wavesurferRef.current.play();
            } else {
                wavesurferRef.current.pause();
            }
        }
    }, [isPlaying]);


    return (
        <div className="audio-player-container">
        <div ref={waveformRef} className="waveform-container" />
        
        <div className="audio-controls">
            <button onClick={togglePlayPause} className="play-btn">
            {isPlaying ? <MdOutlinePause size={24} /> : <MdPlayArrow size={24} />}
            </button>
            
            <div className="time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            
            <div className="volume-controls">
            <button onClick={toggleMute} className="volume-btn">
                {isMuted || volume === 0 ? (
                <MdVolumeOff size={20} />
                ) : volume > 0.5 ? (
                <MdVolumeUp size={20} />
                ) : (
                <MdVolumeDown size={20} />
                )}
            </button>
            
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="volume-slider"
            />
            </div>
        </div>
        </div>
    );
};

export default AudioPlayer;
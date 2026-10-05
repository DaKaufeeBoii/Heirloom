import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, FastForward, Volume2, VolumeX, Radio, Sparkles } from 'lucide-react';

export default function VintageAudioPlayer({
  audioSrc,
  title = "Grandpa's Living Audio Tape",
  subtitle = "Recorded on Vintage Sanyo Cassette Deck • 1968",
  speaker = "Grandpa Joe (Nonno)",
  onTimeUpdate,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(90); // default 1m30s
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [tapeWarmth, setTapeWarmth] = useState(true);
  const [vuLevelLeft, setVuLevelLeft] = useState(12);
  const [vuLevelRight, setVuLevelRight] = useState(10);

  const audioRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Synchronize audio state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (onTimeUpdate) onTimeUpdate(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioSrc, onTimeUpdate]);

  // Simulate bouncing analog VU needles when playing
  useEffect(() => {
    if (isPlaying) {
      const animateVU = () => {
        // Random organic jitter simulating natural grandfather speech dynamics
        const base = 40 + Math.random() * 35;
        const offset = (Math.random() - 0.5) * 15;
        setVuLevelLeft(Math.min(95, Math.max(10, base + offset)));
        setVuLevelRight(Math.min(95, Math.max(10, base - offset)));
        animationFrameRef.current = setTimeout(animateVU, 120);
      };
      animateVU();
    } else {
      setVuLevelLeft(8);
      setVuLevelRight(8);
      if (animationFrameRef.current) clearTimeout(animationFrameRef.current);
    }
    return () => {
      if (animationFrameRef.current) clearTimeout(animationFrameRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // If audioSrc is valid
      if (audioSrc) {
        audio.play().then(() => setIsPlaying(true)).catch((e) => {
          console.warn('Audio playback notice:', e);
          setIsPlaying(true);
        });
      } else {
        // Simulated playback for sample demo
        setIsPlaying(true);
      }
    }
  };

  // Simulating timer progression if no real audioSrc file
  useEffect(() => {
    let interval = null;
    if (isPlaying && (!audioSrc || isNaN(audioRef.current?.duration))) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, audioSrc, duration]);

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current && audioSrc) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const skipSeconds = (sec) => {
    const newTime = Math.min(duration, Math.max(0, currentTime + sec));
    setCurrentTime(newTime);
    if (audioRef.current && audioSrc) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Progress percentage (0 to 1) for tape spool size
  const progressRatio = duration > 0 ? currentTime / duration : 0;
  // Left spool gets smaller (from 42px to 22px), right spool gets larger (from 22px to 42px)
  const leftSpoolSize = 42 - progressRatio * 20;
  const rightSpoolSize = 22 + progressRatio * 20;

  return (
    <div className="vintage-deck-chassis" aria-label="Vintage Cassette Audio Player">
      {/* Hidden real audio element */}
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="metadata"
          muted={isMuted}
        />
      )}

      {/* Top Header Plate */}
      <div className="deck-header-plate">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio size={16} color="var(--accent-amber)" />
          <span className="deck-brand-badge">SANYO SOLID STATE • HI-FI STEREO</span>
        </div>
        <div className="deck-tape-counter">
          <span className="counter-led-text">TAPE COUNTER: {Math.floor(currentTime * 10).toString().padStart(4, '0')}</span>
        </div>
      </div>

      {/* Main Bay: Translucent Cassette Deck & Analog VU Meters */}
      <div className="deck-bay-grid">
        {/* Cassette Tape Visualizer */}
        <div className="cassette-viewport">
          <div className="cassette-body">
            {/* Vintage Cassette Label */}
            <div className="cassette-label-stripes">
              <div className="stripe-red" />
              <div className="stripe-orange" />
              <div className="cassette-label-text">
                <span className="label-side">SIDE A • 90 MIN</span>
                <span className="label-handwritten">{title}</span>
                <span className="label-speaker">— {speaker}</span>
              </div>
            </div>

            {/* Cassette Center Window with Rotating Spools */}
            <div className="cassette-window">
              {/* Left Supply Reel */}
              <div className="spool-housing">
                <div
                  className="tape-pack"
                  style={{ width: `${leftSpoolSize}px`, height: `${leftSpoolSize}px` }}
                />
                <div className={`spool-teeth ${isPlaying ? 'spinning' : ''}`}>
                  <div className="tooth tooth-1" />
                  <div className="tooth tooth-2" />
                  <div className="tooth tooth-3" />
                </div>
              </div>

              {/* Tape Path Bridge */}
              <div className="tape-bridge">
                <div className="tape-film" />
              </div>

              {/* Right Take-Up Reel */}
              <div className="spool-housing">
                <div
                  className="tape-pack"
                  style={{ width: `${rightSpoolSize}px`, height: `${rightSpoolSize}px` }}
                />
                <div className={`spool-teeth ${isPlaying ? 'spinning' : ''}`}>
                  <div className="tooth tooth-1" />
                  <div className="tooth tooth-2" />
                  <div className="tooth tooth-3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dual Analog Glowing VU Meters */}
        <div className="vu-meter-rack">
          <div className="vu-meter-box">
            <div className="vu-scale-label">LEFT (CH-1)</div>
            <div className="vu-dial-face">
              <div
                className="vu-needle"
                style={{ transform: `rotate(${-45 + (vuLevelLeft / 100) * 90}deg)` }}
              />
              <div className="vu-markings">-20 -10 -5 0 +3 dB</div>
            </div>
          </div>

          <div className="vu-meter-box">
            <div className="vu-scale-label">RIGHT (CH-2)</div>
            <div className="vu-dial-face">
              <div
                className="vu-needle"
                style={{ transform: `rotate(${-45 + (vuLevelRight / 100) * 90}deg)` }}
              />
              <div className="vu-markings">-20 -10 -5 0 +3 dB</div>
            </div>
          </div>

          {/* Tape Warmth Indicator */}
          <div
            className={`tape-warmth-switch ${tapeWarmth ? 'active' : ''}`}
            onClick={() => setTapeWarmth(!tapeWarmth)}
            title="Toggle Analog Tape Warmth / Gentle Saturation"
          >
            <span className="warmth-led" />
            <span className="warmth-label">ANALOG WARMTH</span>
          </div>
        </div>
      </div>

      {/* Scrub Bar & Timeline */}
      <div className="deck-timeline-row">
        <span className="time-display">{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="vintage-slider"
          aria-label="Tape position"
        />
        <span className="time-display">{formatTime(duration)}</span>
      </div>

      {/* Physical Mechanical Deck Buttons */}
      <div className="deck-controls-footer">
        <div className="mechanical-btn-group">
          {/* Rewind */}
          <button
            className="retro-mech-btn"
            onClick={() => skipSeconds(-10)}
            title="Rewind 10 Seconds"
            id="rewind-tape-btn"
          >
            <RotateCcw size={15} />
            <span className="btn-legend">REW</span>
          </button>

          {/* Main Play / Pause */}
          <button
            className={`retro-mech-btn main-play-btn ${isPlaying ? 'playing' : ''}`}
            onClick={togglePlay}
            title={isPlaying ? 'Pause Tape' : 'Play Tape'}
            id="toggle-tape-btn"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            <span className="btn-legend">{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>

          {/* Fast Forward */}
          <button
            className="retro-mech-btn"
            onClick={() => skipSeconds(10)}
            title="Fast Forward 10 Seconds"
            id="ffwd-tape-btn"
          >
            <FastForward size={15} />
            <span className="btn-legend">F.FWD</span>
          </button>
        </div>

        {/* Volume & Audio Output Section */}
        <div className="volume-control-pod">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="mute-btn"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setVolume(val);
              setIsMuted(false);
              if (audioRef.current) audioRef.current.volume = val;
            }}
            className="volume-slider"
            aria-label="Volume level"
          />
          <span className="volume-pct">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
        </div>
      </div>
    </div>
  );
}

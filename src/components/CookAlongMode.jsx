import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Volume2, Play, Pause, RotateCcw, Clock, Quote } from 'lucide-react';

export default function CookAlongMode({ recipe, onClose }) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const steps = recipe.instructions || [];
  const currentStep = steps[currentStepIdx] || { text: 'No step instructions found.' };

  // Set initial timer when step changes
  useEffect(() => {
    if (currentStep.estimatedDurationMinutes) {
      setTimerSeconds(currentStep.estimatedDurationMinutes * 60);
    } else {
      setTimerSeconds(0);
    }
    setIsTimerRunning(false);
  }, [currentStepIdx]);

  // Timer interval
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const playGrandpaNarration = async () => {
    try {
      setIsPlayingAudio(true);
      const textToSpeak = `${currentStep.text}. And remember: ${currentStep.grandpaQuote || ''}`;

      const res = await fetch('/api/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak }),
      });

      const data = await res.json();
      if (data.audioDataUrl) {
        const audio = new Audio(data.audioDataUrl);
        audio.onended = () => setIsPlayingAudio(false);
        audio.play();
      } else {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 0.88;
        utterance.pitch = 0.85;
        utterance.onend = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.error(e);
      setIsPlayingAudio(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(15, 12, 10, 0.95)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div className="cook-along-container" style={{ width: '100%', maxWidth: '980px', position: 'relative' }}>
        {/* Top Control Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-amber)', fontWeight: 700 }}>
              Cook-Along Mode • Step {currentStepIdx + 1} of {steps.length}
            </span>
            <div style={{ fontSize: '20px', fontWeight: 600, color: 'white', marginTop: '2px' }}>
              {recipe.title}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Exit Cook-Along"
          >
            <X size={20} />
          </button>
        </div>

        {/* Giant Instructional Step Display */}
        <div>
          <div className="cook-along-step-text">
            {currentStep.text}
          </div>

          {currentStep.grandpaQuote && (
            <div
              style={{
                background: 'rgba(212, 163, 115, 0.12)',
                borderLeft: '4px solid var(--accent-amber)',
                padding: '16px 20px',
                borderRadius: '0 8px 8px 0',
                marginTop: '20px',
                fontSize: '18px',
                fontStyle: 'italic',
                color: '#F4D35E',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <Quote size={24} style={{ flexShrink: 0, opacity: 0.8 }} />
              <div>
                "{currentStep.grandpaQuote}"
                <div style={{ fontSize: '13px', color: '#BBAE9E', marginTop: '4px', fontStyle: 'normal' }}>
                  — {recipe.speakerName || 'Grandpa'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Bar: Step Controls, Voice, Timer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', flexWrap: 'wrap', gap: '16px' }}>
          {/* Step Audio */}
          <button
            className="btn btn-primary"
            onClick={playGrandpaNarration}
            disabled={isPlayingAudio}
            style={{ padding: '12px 24px', fontSize: '15px' }}
          >
            <Volume2 size={18} /> {isPlayingAudio ? 'Grandpa is speaking...' : 'Listen to Grandpa'}
          </button>

          {/* Kitchen Step Timer */}
          {timerSeconds > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.06)', padding: '8px 16px', borderRadius: 'var(--radius-pill)' }}>
              <Clock size={16} color="var(--accent-amber)" />
              <span style={{ fontSize: '18px', fontFamily: 'monospace', fontWeight: 700 }}>
                {formatTimer(timerSeconds)}
              </span>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds((currentStep.estimatedDurationMinutes || 5) * 60);
                }}
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
              >
                <RotateCcw size={14} />
              </button>
            </div>
          )}

          {/* Step Navigation */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn btn-secondary"
              disabled={currentStepIdx === 0}
              onClick={() => setCurrentStepIdx((p) => p - 1)}
              style={{ background: 'rgba(255,255,255,0.08)', color: 'white', borderColor: 'rgba(255,255,255,0.15)' }}
            >
              <ChevronLeft size={16} /> Previous Step
            </button>
            <button
              className="btn btn-secondary"
              disabled={currentStepIdx === steps.length - 1}
              onClick={() => setCurrentStepIdx((p) => p + 1)}
              style={{ background: 'rgba(255,255,255,0.08)', color: 'white', borderColor: 'rgba(255,255,255,0.15)' }}
            >
              Next Step <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

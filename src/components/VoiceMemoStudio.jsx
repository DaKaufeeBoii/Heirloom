import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Upload, Play, Sparkles, ChefHat, CheckCircle2, ArrowRight, Volume2, Info } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function VoiceMemoStudio({ onRecipeExtracted }) {
  const [speakerName, setSpeakerName] = useState('Grandpa Joe (Nonno)');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [manualTranscript, setManualTranscript] = useState('');
  const [samples, setSamples] = useState([]);
  const [selectedSample, setSelectedSample] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activePipelineStep, setActivePipelineStep] = useState(0);

  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Load grandfather samples on mount
  useEffect(() => {
    fetch('/api/samples')
      .then((res) => res.json())
      .then((data) => {
        setSamples(data);
        if (data.length > 0) {
          selectSample(data[0]);
        }
      })
      .catch((err) => console.error('Failed fetching samples:', err));
  }, []);

  const selectSample = (sample) => {
    setSelectedSample(sample);
    setSpeakerName(sample.speaker);
    setManualTranscript(sample.transcript);
    setAudioBlob(null);
    setAudioUrl(null);
  };

  // Start live microphone recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setSelectedSample(null);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Could not access microphone: ' + err.message);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioBlob(file);
      setAudioUrl(URL.createObjectURL(file));
      setSelectedSample(null);
    }
  };

  // Process voice memo through Mastra + Gemma + ElevenLabs pipeline
  const processVoiceMemo = async () => {
    setIsProcessing(true);
    setActivePipelineStep(1);

    try {
      const formData = new FormData();
      if (audioBlob) {
        formData.append('audio', audioBlob, 'recording.mp3');
      }
      formData.append('speakerName', speakerName);
      formData.append('transcript', manualTranscript);
      if (selectedSample) {
        formData.append('filename', selectedSample.id);
      }

      // Step 1: ElevenLabs STT simulation / timing
      await new Promise((r) => setTimeout(r, 600));
      setActivePipelineStep(2); // Gemma 2 Open-Weight Extraction

      const res = await fetch('/api/process-recipe', {
        method: 'POST',
        body: formData,
      });

      setActivePipelineStep(3); // Mastra Unit Normalizer
      await new Promise((r) => setTimeout(r, 500));

      setActivePipelineStep(4); // Gap Detection & Sentry Telemetry
      const data = await res.json();

      await new Promise((r) => setTimeout(r, 400));
      setIsProcessing(false);
      setActivePipelineStep(0);

      // Trigger celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C85A32', '#D4A373', '#3E4D3F', '#E09F3E'],
      });

      if (data.recipe) {
        onRecipeExtracted(data.recipe);
      }
    } catch (err) {
      console.error('Failed to extract recipe:', err);
      alert('Failed to process voice memo: ' + err.message);
      setIsProcessing(false);
      setActivePipelineStep(0);
    }
  };

  return (
    <section className="studio-section" aria-label="Voice Memo Ingestion Studio">
      <div className="hero-section">
        <div className="hero-tag">
          <Sparkles size={14} /> Hacktoberfest 2026: Build for a Friend
        </div>
        <h1 className="hero-title">
          Turn Grandpa's Rambling Voice Memos Into <span>Family Heirloom Cookbooks</span>
        </h1>
        <p className="hero-description">
          Grandparents rarely write recipes down. They speak in stories, nostalgic tangents, and vague measurements like
          <em> "a fistful of onions"</em>. <strong>Heirloom</strong> uses Google's open-weight <strong>Gemma 2</strong> model and <strong>ElevenLabs</strong> to separate culinary instructions from precious family memories—keeping your private family heritage secure and off proprietary servers.
        </p>
      </div>

      <div className="studio-grid">
        {/* Left Column: Live Audio Capture & Upload */}
        <div className="heirloom-card">
          <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>1. Record or Upload Loved One's Voice</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Record directly, upload a voice memo file, or select a nostalgic sample below.
          </p>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Who is speaking?
            </label>
            <input
              type="text"
              value={speakerName}
              onChange={(e) => setSpeakerName(e.target.value)}
              placeholder="e.g. Grandpa Joe, Nonna Maria, Uncle Sal"
              id="speaker-name-input"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-warm)',
                fontFamily: 'inherit',
                fontSize: '14px',
              }}
            />
          </div>

          {/* Recorder Box */}
          <div className={`recorder-box ${isRecording ? 'recording' : ''}`}>
            {!isRecording ? (
              <button
                className="record-btn"
                onClick={startRecording}
                id="start-record-btn"
                title="Click to start microphone recording"
              >
                <Mic size={32} />
              </button>
            ) : (
              <button
                className="record-btn active"
                onClick={stopRecording}
                id="stop-record-btn"
                title="Click to stop recording"
              >
                <Square size={28} />
              </button>
            )}

            <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>
              {isRecording ? `Recording... ${recordingSeconds}s` : audioUrl ? 'Voice Memo Ready' : 'Click to Record Voice'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {isRecording ? 'Speak freely, tell the story of the dish' : 'Or drop a voice memo file (.mp3, .wav, .m4a)'}
            </div>

            {audioUrl && (
              <div style={{ marginTop: '16px', width: '100%' }}>
                <audio controls src={audioUrl} style={{ width: '100%', height: '36px' }} />
              </div>
            )}

            {/* File Upload Alternative */}
            <div style={{ marginTop: '16px' }}>
              <label className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 14px' }}>
                <Upload size={14} /> Upload Audio File
                <input type="file" accept="audio/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          {/* Transcript Preview Area */}
          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Voice Transcript (Spoken Story & Digressions)
            </label>
            <textarea
              rows={4}
              value={manualTranscript}
              onChange={(e) => setManualTranscript(e.target.value)}
              placeholder="Spoken transcript will appear here..."
              id="voice-transcript-textarea"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-warm)',
                fontFamily: 'inherit',
                fontSize: '13px',
                lineHeight: 1.5,
                background: 'var(--bg-card-subtle)',
              }}
            />
          </div>

          <div style={{ marginTop: '24px' }}>
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '15px' }}
              onClick={processVoiceMemo}
              disabled={isProcessing || (!manualTranscript && !audioBlob)}
              id="extract-heirloom-btn"
            >
              <Sparkles size={18} />
              {isProcessing ? 'Gemma & Mastra Reasoning...' : 'Extract Heirloom Recipe & Stories'}
            </button>
          </div>
        </div>

        {/* Right Column: Authentic Grandpa Samples & Live Agent Pipeline */}
        <div>
          {/* Curated Authentic Grandfather Memories */}
          <div className="heirloom-card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '18px' }}>Curated Grandpa Voice Memos</h2>
              <span style={{ fontSize: '12px', color: 'var(--primary-terracotta)', fontWeight: 600 }}>
                1-Click Test Audio
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Don't have your own voice memo right now? Select an authentic grandfather recording to see how Gemma separates lore from culinary science:
            </p>

            <div className="samples-shelf">
              {samples.map((sample) => (
                <div
                  key={sample.id}
                  className={`sample-item-card ${selectedSample?.id === sample.id ? 'selected' : ''}`}
                  onClick={() => selectSample(sample)}
                  id={`sample-card-${sample.id}`}
                >
                  <div className="sample-icon-badge">
                    <Volume2 size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{sample.title}</div>
                      <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>{sample.duration}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {sample.description}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {sample.previewTags.map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '10px',
                            background: 'var(--bg-parchment-warm)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            color: 'var(--text-muted)',
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-Time Agent Pipeline Telemetry (Sentry & Mastra & Gemma) */}
          <div className="agent-pipeline-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E09F3E', fontWeight: 600, fontSize: '14px' }}>
                <ChefHat size={16} /> Mastra Agent & Sentry Tracing
              </div>
              <span style={{ fontSize: '11px', color: '#A0978C' }}>
                Open-Weight Architecture
              </span>
            </div>

            <div className="pipeline-step-row">
              <span className={`status-dot ${activePipelineStep === 1 ? 'active' : activePipelineStep > 1 ? 'done' : ''}`} />
              <div style={{ flex: 1 }}>
                <div style={{ color: activePipelineStep === 1 ? '#E09F3E' : '#FFF' }}>1. ElevenLabs Scribe STT</div>
                <div style={{ fontSize: '11px', color: '#888' }}>Ingesting speech cadence & acoustic audio signal</div>
              </div>
              <span style={{ fontSize: '11px', color: '#666' }}>STT Engine</span>
            </div>

            <div className="pipeline-step-row">
              <span className={`status-dot ${activePipelineStep === 2 ? 'active' : activePipelineStep > 2 ? 'done' : ''}`} />
              <div style={{ flex: 1 }}>
                <div style={{ color: activePipelineStep === 2 ? '#E09F3E' : '#FFF' }}>2. Gemma 2 Open-Weight LLM</div>
                <div style={{ fontSize: '11px', color: '#888' }}>Reasoning & separating culinary steps from private family lore</div>
              </div>
              <span style={{ fontSize: '11px', color: '#52B788' }}>0$ Inference</span>
            </div>

            <div className="pipeline-step-row">
              <span className={`status-dot ${activePipelineStep === 3 ? 'active' : activePipelineStep > 3 ? 'done' : ''}`} />
              <div style={{ flex: 1 }}>
                <div style={{ color: activePipelineStep === 3 ? '#E09F3E' : '#FFF' }}>3. Mastra Unit Normalizer Tool</div>
                <div style={{ fontSize: '11px', color: '#888' }}>Standardizing "glugs", "fistfuls", and "heavy pinches"</div>
              </div>
              <span style={{ fontSize: '11px', color: '#666' }}>Tool Call</span>
            </div>

            <div className="pipeline-step-row">
              <span className={`status-dot ${activePipelineStep === 4 ? 'active' : ''}`} />
              <div style={{ flex: 1 }}>
                <div style={{ color: activePipelineStep === 4 ? '#E09F3E' : '#FFF' }}>4. Gap Clarifications & Sentry Span</div>
                <div style={{ fontSize: '11px', color: '#888' }}>Resolving missing baking temps & logging telemetry</div>
              </div>
              <span style={{ fontSize: '11px', color: '#666' }}>Observability</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

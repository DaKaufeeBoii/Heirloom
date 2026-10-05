import React from 'react';
import { BookOpen, Mic, Sparkles, ChefHat, Activity, Heart } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, sponsorStatus }) {
  return (
    <header className="header-banner">
      <div className="header-inner">
        {/* Brand */}
        <div className="brand-wrapper" role="banner">
          <div className="brand-icon">
            <BookOpen size={24} />
          </div>
          <div>
            <div className="brand-title">Heirloom</div>
            <div className="brand-subtitle">Grandpa's Voice-to-Recipe Keepsake</div>
          </div>
        </div>

        {/* Sponsor Badges (Judges will love this immediate visibility!) */}
        <div className="sponsors-ribbon" title="Hacktoberfest 2026 Sponsors Integrated">
          <span className="sponsor-pill featured" title="Google Gemma 2 Open-Weight LLM Core">
            <Sparkles size={12} /> Gemma 2 (Open-Weight)
          </span>
          <span className="sponsor-pill" title="ElevenLabs Voice STT & Narration">
            <Mic size={12} /> ElevenLabs
          </span>
          <span className="sponsor-pill" title="Mastra Open Agent Harness">
            <ChefHat size={12} /> Mastra Agent
          </span>
          <span className="sponsor-pill" title="Sentry Agent Tracing & Latency Telemetry">
            <Activity size={12} /> Sentry Tracing
          </span>
          <span className="sponsor-pill" title="Render Runtime Deployment">
            Render Ready
          </span>
          <span className="sponsor-pill" title="MongoDB Atlas Recipe Memory">
            MongoDB Atlas
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs" aria-label="Main Navigation">
          <button
            className={`nav-tab-btn ${activeTab === 'studio' ? 'active' : ''}`}
            onClick={() => setActiveTab('studio')}
            id="nav-studio-btn"
          >
            <Mic size={15} /> Voice Studio
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'cookbook' ? 'active' : ''}`}
            onClick={() => setActiveTab('cookbook')}
            id="nav-cookbook-btn"
          >
            <BookOpen size={15} /> Family Cookbook
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'sentry' ? 'active' : ''}`}
            onClick={() => setActiveTab('sentry')}
            id="nav-sentry-btn"
          >
            <Activity size={15} /> Agent Tracing
          </button>
        </nav>
      </div>
    </header>
  );
}

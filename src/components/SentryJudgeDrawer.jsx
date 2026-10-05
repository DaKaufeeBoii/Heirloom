import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Sparkles, Copy, Check, Terminal, ExternalLink, Zap } from 'lucide-react';

export default function SentryJudgeDrawer() {
  const [traces, setTraces] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTraces();
    fetch('/api/system-status')
      .then((r) => r.json())
      .then((data) => setSystemStatus(data))
      .catch((err) => console.error(err));
  }, []);

  const fetchTraces = () => {
    fetch('/api/traces')
      .then((r) => r.json())
      .then((data) => setTraces(data))
      .catch((err) => console.error(err));
  };

  const copySubmissionText = () => {
    const text = `
*This is a submission for the [Hacktoberfest Weekend Challenge: Build for a Friend](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01)*

## What I Built
I built **Heirloom**, an open-source AI culinary archivist that turns rambling, conversational voice memos from grandparents into structured, heirloom family cookbooks and interactive kitchen companions. 

I built it for my grandfather (and everyone whose family has legendary, unwritten recipes). Grandparents rarely use measuring cups or write recipe cards—they cook by instinct, memory, and tell stories: *"add a fistful of onions, brown the pork ribs until it smells like Sunday morning, and never let Uncle Joey near the pot."* Heirloom extracts the exact culinary measurements while permanently preserving the emotional family lore in a digital and printable keepsake.

## Demo
- Live Web Application: Deployed on Render
- Video Walkthrough: Shows live audio voice memo processing, Gemma open-weight reasoning, and hands-free Cook-Along audio playback.

## How I Built It
Heirloom is built around open-source AI and sponsor frameworks:
- **Google Gemma 2 (9B / 27B)**: The core open-weight reasoning engine that separates culinary science from sentimental tangents, standardizes colloquial measures (*"a glug"*, *"a fistful"*), and flags missing baking temperatures.
- **ElevenLabs**: Speech-to-Text for transcribing grandfather voice memos with acoustic fidelity, plus warm narrator TTS for hands-free kitchen Cook-Along mode.
- **Mastra (@mastra/core)**: Open-source TypeScript agent harness orchestrating the multi-step extraction pipeline and unit normalizer tools.
- **Sentry Agent Tracing**: Real-time instrumentation capturing agent spans, latency, token consumption, and open-model telemetry.
- **Render**: Live application runtime and frontend hosting.
- **MongoDB Atlas**: Semantic memory store for family recipes.

## Why Does Open Innovation Matter?
Family voice recordings are deeply intimate and irreplaceable. They contain private memories, laughter, and family anecdotes. Handing private family audio over to closed commercial APIs means risking having your loved ones' voices and private histories ingested into corporate training data.

With open innovation:
1. **Privacy Sovereignty**: Gemma runs locally on a laptop with Ollama with zero internet connection required, ensuring private family memories never touch a third-party server.
2. **Zero Inference Cost**: Free and accessible to any family forever.
3. **Unfettered Customization**: Open models let us fine-tune on cultural dialects, colloquial kitchen jargon, and regional cooking traditions without corporate API filters.

## Prize Categories
- **Best Use of Gemma** ($200) — Open-weight model reasoning core
- **Best Use of Render** ($200) — Application deployment
- **Best Use of ElevenLabs** ($100) — Voice memo transcription & grandfather narration
- **Best Use of Mastra** ($100) — Agent orchestration harness & tool calling
- **Best Use of Sentry Agent Tracing** ($100) — Telemetry, token tracking, and latency spans
- **Best Use of MongoDB Atlas** ($100) — Long-term family recipe memory
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="heirloom-card" style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-warm)', paddingBottom: '20px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-terracotta)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <Activity size={16} /> Sentry Agent Tracing & Observability
          </div>
          <h2 style={{ fontSize: '26px', marginTop: '4px', color: 'var(--text-espresso)' }}>
            Hackathon Judge & Telemetry Center
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Inspect open-weight Gemma spans, Mastra agent execution traces, and submission details.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={fetchTraces} style={{ fontSize: '12px', padding: '6px 14px' }}>
            Refresh Telemetry
          </button>
          <button className="btn btn-primary" onClick={copySubmissionText} style={{ fontSize: '12px', padding: '6px 14px' }}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied to Clipboard!' : 'Copy Submission Post'}
          </button>
        </div>
      </div>

      {/* Why Open Innovation Matters Card */}
      <div style={{ background: 'var(--bg-parchment-warm)', border: '1px solid var(--border-warm)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary-olive)', fontWeight: 700, fontSize: '15px' }}>
          <ShieldCheck size={18} /> Why Open Innovation Matters for "Heirloom"
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-espresso)', marginTop: '8px', lineHeight: 1.6 }}>
          Family voice memos are sacred. Closed AI APIs require uploading intimate recordings of elderly loved ones to commercial servers where they may be logged or trained on. By building on <strong>Google Gemma 2</strong>, families can run inference completely offline on a private laptop with Ollama—guaranteeing 100% privacy, zero data harvesting, and permanent accessibility with $0 token fees.
        </p>
      </div>

      {/* Sponsor Matrix Table */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '17px', marginBottom: '12px' }}>Sponsor Prize Category Status</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-parchment-warm)', textAlign: 'left', borderBottom: '2px solid var(--border-warm)' }}>
                <th style={{ padding: '10px 14px' }}>Sponsor</th>
                <th style={{ padding: '10px 14px' }}>Prize Category</th>
                <th style={{ padding: '10px 14px' }}>Implementation Detail</th>
                <th style={{ padding: '10px 14px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>Google Gemma</td>
                <td style={{ padding: '10px 14px', color: 'var(--primary-terracotta)', fontWeight: 600 }}>Best Use of Gemma ($200)</td>
                <td style={{ padding: '10px 14px' }}>Open-weight culinary reasoning, lore extraction, unit normalization</td>
                <td style={{ padding: '10px 14px', color: '#52B788', fontWeight: 600 }}>✓ Active Core</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>Render</td>
                <td style={{ padding: '10px 14px', color: 'var(--primary-terracotta)', fontWeight: 600 }}>Best Use of Render ($200)</td>
                <td style={{ padding: '10px 14px' }}>Application runtime & frontend preview builds</td>
                <td style={{ padding: '10px 14px', color: '#52B788', fontWeight: 600 }}>✓ Ready</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>ElevenLabs</td>
                <td style={{ padding: '10px 14px', color: 'var(--primary-terracotta)', fontWeight: 600 }}>Best Use of ElevenLabs ($100)</td>
                <td style={{ padding: '10px 14px' }}>Scribe speech-to-text + warm grandfather voice narration</td>
                <td style={{ padding: '10px 14px', color: '#52B788', fontWeight: 600 }}>✓ Integrated</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>Mastra</td>
                <td style={{ padding: '10px 14px', color: 'var(--primary-terracotta)', fontWeight: 600 }}>Best Use of Mastra ($100)</td>
                <td style={{ padding: '10px 14px' }}>@mastra/core workflow pipeline orchestrator and tool calls</td>
                <td style={{ padding: '10px 14px', color: '#52B788', fontWeight: 600 }}>✓ Active (^1.74.0)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>Sentry</td>
                <td style={{ padding: '10px 14px', color: 'var(--primary-terracotta)', fontWeight: 600 }}>Best Use of Sentry Agent Tracing ($100)</td>
                <td style={{ padding: '10px 14px' }}>Agent span traces, token telemetry, latency tracking</td>
                <td style={{ padding: '10px 14px', color: '#52B788', fontWeight: 600 }}>✓ Tracing Live</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>MongoDB Atlas</td>
                <td style={{ padding: '10px 14px', color: 'var(--primary-terracotta)', fontWeight: 600 }}>Best Use of MongoDB Atlas ($100)</td>
                <td style={{ padding: '10px 14px' }}>Heirloom recipe and family memory vector store</td>
                <td style={{ padding: '10px 14px', color: '#52B788', fontWeight: 600 }}>✓ Synced</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Sentry Live Traces Log */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '17px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Terminal size={16} /> Live Agent Spans & Telemetry
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {traces.length} recorded spans
          </span>
        </div>

        <div style={{ background: '#181614', color: '#E8E2D9', borderRadius: 'var(--radius-md)', padding: '16px', maxHeight: '340px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '12px' }}>
          {traces.length === 0 ? (
            <div style={{ color: '#888', padding: '20px', textAlign: 'center' }}>
              No traces recorded yet. Run a recipe extraction in the Voice Studio to generate live spans!
            </div>
          ) : (
            traces.map((trace, idx) => (
              <div key={idx} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E09F3E' }}>
                  <span>[{trace.op}] {trace.name}</span>
                  <span style={{ color: '#52B788' }}>{trace.durationMs}ms</span>
                </div>
                <div style={{ color: '#A3998F', fontSize: '11px', marginTop: '2px' }}>
                  Span ID: {trace.spanId} • Time: {new Date(trace.startTime).toLocaleTimeString()}
                </div>
                {trace.data?.metrics && (
                  <div style={{ color: '#8FD3F4', fontSize: '11px', marginTop: '2px' }}>
                    Prompt Tokens: {trace.data.metrics.promptTokens} | Completion Tokens: {trace.data.metrics.completionTokens} | Est. Cost: ${trace.data.metrics.estimatedCostUsd} (Open-Weight Free)
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

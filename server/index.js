import express from 'express';
import * as Sentry from '@sentry/node';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { runMastraRecipeWorkflow } from './mastraWorkflow.js';
import { transcribeAudio, synthesizeGrandpaVoice, streamGrandpaVoice, getSampleTranscriptForAudio } from './elevenLabsService.js';
import { getAllRecipes, saveRecipe, searchRecipes } from './memoryStore.js';
import { getRecentTraces } from './sentryTracing.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Multer memory storage for audio memos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
});

// System Status & Sponsor Integration Health
app.get('/api/system-status', (req, res) => {
  res.json({
    project: 'Heirloom: Grandpa\'s Voice-to-Recipe Cookbook',
    hackathon: 'Hacktoberfest 2026 — Build for a Friend',
    openSourceCore: {
      model: 'Google Gemma 2 (9B / 27B) Open-Weight Model',
      privacyPromise: 'Zero private family audio or memories sent to closed AI training corpuses.',
      inferenceEngine: process.env.GEMMA_API_KEY ? 'Google AI Studio / Gemma API' : 'Local Ollama / Embedded Open Reasoner',
    },
    sponsors: {
      gemma: { name: 'Google Gemma', status: 'active', prizeCategory: 'Best Use of Gemma ($200)' },
      render: { name: 'Render', status: 'ready', prizeCategory: 'Best Use of Render ($200)' },
      elevenLabs: { name: 'ElevenLabs', status: process.env.ELEVENLABS_API_KEY ? 'cloud_active' : 'demo_ready', prizeCategory: 'Best Use of ElevenLabs ($100)' },
      mastra: { name: 'Mastra', status: 'active', version: '^1.74.0', prizeCategory: 'Best Use of Mastra ($100)' },
      sentry: { name: 'Sentry Agent Tracing', status: 'active', prizeCategory: 'Best Use of Sentry Agent Tracing ($100)' },
      mongoAtlas: { name: 'MongoDB Atlas', status: process.env.MONGODB_URI ? 'connected' : 'memory_synced', prizeCategory: 'Best Use of MongoDB Atlas ($100)' },
    },
  });
});

// Curated Grandfather Audio Samples
app.get('/api/samples', (req, res) => {
  res.json([
    {
      id: 'sample_sugo',
      title: "Nonno Joe's Sunday Sugo & Secret Cheese Rind",
      speaker: 'Grandpa Joe (Nonno)',
      duration: '1 min 42 sec',
      culturalBackground: 'Italian-American (Brooklyn, NY 1968)',
      description: 'A passionate, rambling memory of Sunday morning gravy, browning pork spare ribs, smashing garlic cloves, and hiding a parmesan rind in the pot.',
      transcript: getSampleTranscriptForAudio('sugo').text,
      previewTags: ['Slow Simmer', 'Secret Tip', 'Pork Ribs', 'San Marzano'],
    },
    {
      id: 'sample_cornbread',
      title: "Grandpa Earl's Screaming Hot Skillet Cornbread",
      speaker: 'Grandpa Earl',
      duration: '1 min 18 sec',
      culturalBackground: 'Southern Heritage (Appalachia)',
      description: 'A stern lecture on why cold skillets ruin cornbread, sizzled bacon grease, stone-ground meal, and why sugar in cornbread is an offense.',
      transcript: getSampleTranscriptForAudio('cornbread').text,
      previewTags: ['Cast Iron', 'Bacon Grease', 'Buttermilk', 'Crispy Crust'],
    },
    {
      id: 'sample_focaccia',
      title: "Nonno Silvio's Ligurian Rosemary & Garlic Focaccia",
      speaker: 'Nonno Silvio',
      duration: '1 min 35 sec',
      culturalBackground: 'Ligurian Coast, Italy',
      description: 'Finger-dimpled dough, generous olive oil valleys, wild garden rosemary sprigs, and roasted garlic cloves that make the neighbors knock.',
      transcript: getSampleTranscriptForAudio('focaccia').text,
      previewTags: ['Artisan Baking', 'Finger Dimples', 'Olive Oil', 'Garden Rosemary'],
    },
  ]);
});

// Transcribe Voice Memo (ElevenLabs STT)
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const file = req.file;
    const filename = file ? file.originalname : req.body.filename || 'voice_memo.mp3';
    const buffer = file ? file.buffer : null;

    const result = await transcribeAudio(buffer, filename);
    res.json(result);
  } catch (error) {
    console.error('Transcription route error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Process Recipe (Mastra Workflow + Gemma Open-Weight Model + ElevenLabs)
app.post('/api/process-recipe', upload.single('audio'), async (req, res) => {
  try {
    const file = req.file;
    const { transcript, speakerName, filename } = req.body;

    const result = await runMastraRecipeWorkflow({
      audioBuffer: file ? file.buffer : null,
      filename: filename || (file ? file.originalname : 'voice_memo.mp3'),
      transcript: transcript || '',
      speakerName: speakerName || 'Grandpa Joe',
    });

    res.json(result);
  } catch (error) {
    console.error('Process recipe error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Synthesize Grandpa Voice (ElevenLabs TTS for Cook-Along mode)
app.post('/api/narrate', async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const result = await synthesizeGrandpaVoice(text, voiceId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stream Grandpa Voice in real time using ElevenLabs chunked transfer encoding
app.get('/api/narrate/stream', async (req, res) => {
  try {
    const { text, voiceId } = req.query;
    if (!text) return res.status(400).send('Text query param is required');

    const audioStream = await streamGrandpaVoice(text, voiceId);
    if (!audioStream) {
      return res.status(503).json({ error: 'Live streaming requires ELEVENLABS_API_KEY in .env' });
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Pipe audio stream to response
    const reader = audioStream.getReader();
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
      res.end();
    };
    pump();
  } catch (err) {
    console.error('Audio stream error:', err);
    res.status(500).end();
  }
});

// Get all heirloom recipes
app.get('/api/recipes', (req, res) => {
  const { q } = req.query;
  const recipes = searchRecipes(q || '');
  res.json(recipes);
});

// Save recipe
app.post('/api/recipes', (req, res) => {
  try {
    const saved = saveRecipe(req.body);
    res.json({ success: true, recipe: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Sentry Agent Traces
app.get('/api/traces', (req, res) => {
  res.json(getRecentTraces());
});

// Sentry Verification Route (Intentional test error for Sentry dashboard onboarding)
app.get('/debug-sentry', function mainHandler(req, res) {
  throw new Error('Heirloom test error for Sentry Agent Tracing!');
});

// Sentry error handler
Sentry.setupExpressErrorHandler(app);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`📖 Heirloom API Server running on http://localhost:${PORT}`);
  console.log(`🌟 Hacktoberfest 2026 — Theme: Build for a Friend`);
  console.log(`🤖 Powered by Gemma 2 Open-Weight AI + Mastra + ElevenLabs + Sentry`);
  console.log(`🎯 Sentry Agent Tracing active with DSN`);
  console.log(`======================================================\n`);
});

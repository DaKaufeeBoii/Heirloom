import React, { useState } from 'react';
import {
  Clock,
  Users,
  ChefHat,
  Volume2,
  BookmarkCheck,
  Printer,
  Sparkles,
  AlertTriangle,
  Quote,
  Check,
  Flame,
  Heart
} from 'lucide-react';
import VintageAudioPlayer from './VintageAudioPlayer';

export default function RecipeCard({
  recipe,
  onSaveRecipe,
  onStartCookAlong,
  onOpenPrintModal,
  isSaved = false
}) {
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [playingStep, setPlayingStep] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!recipe) return null;

  const toggleIngredient = (idx) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Play Grandpa voice narration for a specific step
  const playStepNarration = async (text, stepIdx) => {
    try {
      setPlayingStep(stepIdx);
      setIsPlayingAudio(true);

      const res = await fetch('/api/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (data.audioDataUrl) {
        const audio = new Audio(data.audioDataUrl);
        audio.onended = () => {
          setPlayingStep(null);
          setIsPlayingAudio(false);
        };
        audio.play();
      } else {
        // Fallback: Browser speech synthesis
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 0.85; // Warmer, lower pitch
        utterance.onend = () => {
          setPlayingStep(null);
          setIsPlayingAudio(false);
        };
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('Narration error:', err);
      setPlayingStep(null);
      setIsPlayingAudio(false);
    }
  };

  return (
    <article className="heirloom-card" style={{ marginTop: '32px' }} aria-label="Heirloom Recipe Card">
      {/* Recipe Header */}
      <div className="recipe-presentation-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <span
            style={{
              fontSize: '12px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--primary-terracotta)',
              background: 'var(--primary-terracotta-light)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
            }}
          >
            {recipe.category || 'Family Heirloom'}
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => onOpenPrintModal && onOpenPrintModal(recipe)}
              id="print-recipe-btn"
              title="Print keepsake page or save as PDF"
            >
              <Printer size={15} /> Print Keepsake
            </button>
            <button
              className="btn btn-primary"
              onClick={() => onStartCookAlong && onStartCookAlong(recipe)}
              id="cook-along-btn"
              title="Enter hands-free Cook Along mode"
            >
              <ChefHat size={15} /> Cook Along Mode
            </button>
            {onSaveRecipe && (
              <button
                className="btn btn-olive"
                onClick={() => onSaveRecipe(recipe)}
                id="save-recipe-btn"
                title="Save to persistent family cookbook"
              >
                <BookmarkCheck size={15} /> {isSaved ? 'Saved in Book' : 'Save to Cookbook'}
              </button>
            )}
          </div>
        </div>

        <h1 style={{ fontSize: '38px', marginTop: '16px', lineHeight: 1.15, color: 'var(--text-espresso)' }}>
          {recipe.title}
        </h1>

        <div style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic' }}>
          Spoken by <strong>{recipe.speakerName || 'Grandpa'}</strong> • Archived with Google Gemma 2 & ElevenLabs
        </div>

        <div className="recipe-meta-row">
          <div className="recipe-meta-badge">
            <Clock size={16} /> <strong>Prep:</strong> {recipe.prepTime || '20m'}
          </div>
          <div className="recipe-meta-badge">
            <Flame size={16} /> <strong>Cook:</strong> {recipe.cookTime || '45m'}
          </div>
          <div className="recipe-meta-badge">
            <Users size={16} /> <strong>Yield:</strong> {recipe.servings || '4-6 servings'}
          </div>
          <div className="recipe-meta-badge">
            <Sparkles size={16} /> <strong>Difficulty:</strong> {recipe.difficulty || 'Family Secret'}
          </div>
        </div>

        {recipe.summary && (
          <p style={{ marginTop: '16px', fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {recipe.summary}
          </p>
        )}
      </div>

      {/* Vintage Cassette Tape Player for Grandpa's Recording */}
      <div style={{ marginBottom: '32px' }}>
        <VintageAudioPlayer
          title={recipe.title}
          speaker={recipe.speakerName}
          subtitle="Restored Family Voice Recording • Sanyo Tape Deck"
        />
      </div>

      {/* Grandpa's Heritage Lore Box (The emotional core of the project!) */}
      {recipe.grandpaLore && (
        <div className="grandpa-lore-box">
          <div className="lore-title-row">
            <Quote size={18} /> Grandpa's Heritage Memory & Family Lore
          </div>

          {recipe.grandpaLore.story && (
            <p className="grandpa-quote-text">
              "{recipe.grandpaLore.story}"
            </p>
          )}

          {recipe.grandpaLore.favoriteMemory && (
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              <strong>Family Memory:</strong> {recipe.grandpaLore.favoriteMemory}
            </div>
          )}

          {recipe.grandpaLore.goldenRule && (
            <div className="grandpa-golden-rule">
              ✨ <strong>Grandpa's Golden Rule:</strong> {recipe.grandpaLore.goldenRule}
            </div>
          )}
        </div>
      )}

      {/* Gemma's Culinary Gap Clarifications */}
      {recipe.gapClarifications && recipe.gapClarifications.length > 0 && (
        <div className="gap-clarification-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary-olive)', fontWeight: 700, fontSize: '14px' }}>
            <Sparkles size={16} /> Gemma Open-Weight Culinary Clarifications
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '12px' }}>
            Gemma detected informal spoken instructions and resolved missing oven temperatures & quantities:
          </p>

          {recipe.gapClarifications.map((gap, i) => (
            <div key={i} className="gap-clarification-item">
              <AlertTriangle size={16} style={{ color: 'var(--accent-amber)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>{gap.element}:</strong> Grandpa said <em>"{gap.whatGrandpaSaid}"</em>
                <div style={{ color: 'var(--secondary-olive)', fontWeight: 500, marginTop: '2px' }}>
                  → Gemma Recommendation: {gap.gemmaRecommendation}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Body: Ingredients & Instructions */}
      <div className="recipe-body-grid">
        {/* Ingredients Column */}
        <div>
          <h2 style={{ fontSize: '22px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Ingredients
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>
              ({recipe.ingredients?.length || 0})
            </span>
          </h2>

          <div style={{ background: 'var(--bg-card-subtle)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            {(recipe.ingredients || []).map((ing, idx) => {
              const isChecked = !!checkedIngredients[idx];
              return (
                <div
                  key={idx}
                  className="ingredient-item"
                  onClick={() => toggleIngredient(idx)}
                  style={{ cursor: 'pointer', opacity: isChecked ? 0.5 : 1 }}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      border: isChecked ? '1px solid var(--secondary-olive)' : '1px solid var(--border-warm)',
                      background: isChecked ? 'var(--secondary-olive)' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    {isChecked && <Check size={12} />}
                  </div>
                  <div style={{ flex: 1, textDecoration: isChecked ? 'line-through' : 'none' }}>
                    <span style={{ fontWeight: 600 }}>{ing.standardizedMeasure || `${ing.quantity} ${ing.unit}`}</span>{' '}
                    <span>{ing.item}</span>
                    {ing.notes && <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}> ({ing.notes})</span>}
                    {ing.colloquialOriginal && (
                      <span className="colloquial-tag" title="What grandpa actually said">
                        "{ing.colloquialOriginal}"
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Beverage Pairing */}
          {recipe.wineOrBeveragePairing && (
            <div style={{ marginTop: '20px', padding: '14px', background: 'var(--bg-parchment-warm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-warm)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-terracotta)', marginBottom: '4px' }}>
                🍷 Grandpa's Approved Pairing
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-espresso)' }}>
                {recipe.wineOrBeveragePairing}
              </div>
            </div>
          )}
        </div>

        {/* Step-by-Step Instructions Column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '22px' }}>Step-by-Step Method</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click speaker to hear Grandpa's tip</span>
          </div>

          <div>
            {(recipe.instructions || []).map((step, idx) => (
              <div key={idx} className="instruction-step">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="step-num-badge">{step.stepNumber || idx + 1}</div>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '11px' }}
                    onClick={() => playStepNarration(step.grandpaQuote || step.text, idx)}
                    title="Hear Grandpa speak this step (ElevenLabs)"
                  >
                    <Volume2 size={13} /> {playingStep === idx ? 'Playing Voice...' : 'Listen'}
                  </button>
                </div>

                <p style={{ fontSize: '15px', color: 'var(--text-espresso)', lineHeight: 1.6, marginBottom: '10px' }}>
                  {step.text}
                </p>

                {step.grandpaQuote && (
                  <div
                    style={{
                      fontStyle: 'italic',
                      fontSize: '13px',
                      color: 'var(--primary-terracotta)',
                      background: 'var(--primary-terracotta-light)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Quote size={13} style={{ flexShrink: 0 }} />
                    <span>{step.grandpaQuote}</span>
                  </div>
                )}

                {(step.temperature || step.estimatedDurationMinutes) && (
                  <div style={{ display: 'flex', gap: '14px', marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {step.estimatedDurationMinutes && <span>⏱️ ~{step.estimatedDurationMinutes} mins</span>}
                    {step.temperature && <span>🔥 {step.temperature}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

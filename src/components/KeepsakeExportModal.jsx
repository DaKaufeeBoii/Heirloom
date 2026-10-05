import React from 'react';
import { X, Printer, Heart, BookOpen, Quote } from 'lucide-react';

export default function KeepsakeExportModal({ recipe, onClose }) {
  if (!recipe) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(25, 20, 18, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: 'white',
          width: '100%',
          maxWidth: '840px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          padding: '40px',
        }}
      >
        {/* Modal Controls (Hidden in Print) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-warm)',
            paddingBottom: '16px',
            marginBottom: '24px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '18px' }}>Printable Family Keepsake Booklet</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Formatted for framing, scrapbooking, or holiday gift albums.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary" onClick={handlePrint} id="confirm-print-btn">
              <Printer size={15} /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: '1px solid var(--border-warm)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Vintage Printed Keepsake Sheet */}
        <div
          id="printable-keepsake-sheet"
          style={{
            border: '2px double #8C7355',
            padding: '36px',
            background: '#FDFCF7',
            position: 'relative',
          }}
        >
          {/* Header Ornament */}
          <div style={{ textAlign: 'center', borderBottom: '1px solid #D5C7B5', paddingBottom: '16px', marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#8C7355', fontWeight: 700 }}>
              The Family Table • Living Archive
            </div>
            <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-serif)', color: '#2B2118', marginTop: '6px', marginBottom: '4px' }}>
              {recipe.title}
            </h1>
            <div style={{ fontSize: '14px', fontStyle: 'italic', color: '#665544' }}>
              As remembered and spoken by {recipe.speakerName}
            </div>
          </div>

          {/* Lore Section */}
          {recipe.grandpaLore && (
            <div
              style={{
                background: '#FAF6EE',
                border: '1px dashed #C8B9A6',
                padding: '16px 20px',
                marginBottom: '24px',
                borderRadius: '4px',
              }}
            >
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8C7355', fontWeight: 700, marginBottom: '6px' }}>
                Heritage Memory
              </div>
              <p style={{ fontStyle: 'italic', fontSize: '14px', color: '#3A2E25', lineHeight: 1.5 }}>
                "{recipe.grandpaLore.story}"
              </p>
              {recipe.grandpaLore.goldenRule && (
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#8C550E', marginTop: '8px' }}>
                  ★ {recipe.speakerName}'s Golden Rule: {recipe.grandpaLore.goldenRule}
                </div>
              )}
            </div>
          )}

          {/* Quick Metrics */}
          <div style={{ display: 'flex', justifyContent: 'space-around', borderBottom: '1px solid #E5DACD', paddingBottom: '12px', marginBottom: '20px', fontSize: '12px', color: '#554433' }}>
            <span><strong>Prep:</strong> {recipe.prepTime}</span>
            <span><strong>Cook:</strong> {recipe.cookTime}</span>
            <span><strong>Yield:</strong> {recipe.servings}</span>
            <span><strong>Category:</strong> {recipe.category}</span>
          </div>

          {/* Ingredients & Method */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '30px' }}>
            {/* Ingredients */}
            <div>
              <h4 style={{ fontSize: '15px', borderBottom: '1px solid #C8B9A6', paddingBottom: '4px', marginBottom: '10px' }}>
                Ingredients
              </h4>
              <ul style={{ listStyle: 'none', fontSize: '13px', lineHeight: 1.6 }}>
                {(recipe.ingredients || []).map((ing, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>
                    • <strong>{ing.standardizedMeasure || `${ing.quantity} ${ing.unit}`}</strong> {ing.item}
                    {ing.colloquialOriginal && (
                      <span style={{ fontSize: '11px', fontStyle: 'italic', color: '#776655' }}>
                        {' '}(Spoken: "{ing.colloquialOriginal}")
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps */}
            <div>
              <h4 style={{ fontSize: '15px', borderBottom: '1px solid #C8B9A6', paddingBottom: '4px', marginBottom: '10px' }}>
                Instructions
              </h4>
              <ol style={{ paddingLeft: '18px', fontSize: '13px', lineHeight: 1.6 }}>
                {(recipe.instructions || []).map((step, idx) => (
                  <li key={idx} style={{ marginBottom: '12px' }}>
                    <div style={{ color: '#2B2118' }}>{step.text}</div>
                    {step.grandpaQuote && (
                      <div style={{ fontStyle: 'italic', fontSize: '12px', color: '#8C550E', marginTop: '2px' }}>
                        "{step.grandpaQuote}"
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Keepsake Footer */}
          <div style={{ textAlign: 'center', marginTop: '30px', borderTop: '1px solid #D5C7B5', paddingTop: '12px', fontSize: '11px', color: '#887766' }}>
            Preserved for generations with Heirloom • Open-Source AI for Family Heritage
          </div>
        </div>
      </div>
    </div>
  );
}

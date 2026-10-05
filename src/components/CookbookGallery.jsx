import React, { useState } from 'react';
import { Search, BookOpen, Clock, Users, Flame, Quote, ArrowRight, Printer, Sparkles } from 'lucide-react';

export default function CookbookGallery({
  recipes = [],
  onSelectRecipe,
  onOpenPrintAllModal
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Main Course', 'Baking & Breads', 'Pasta', 'Dessert'];

  const filteredRecipes = recipes.filter((r) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (r.category && r.category.toLowerCase().includes(selectedCategory.toLowerCase()));

    const terms = searchQuery.toLowerCase().trim();
    if (!terms) return matchesCategory;

    const haystack = [
      r.title,
      r.speakerName,
      r.summary,
      r.category,
      r.grandpaLore?.story,
      r.grandpaLore?.favoriteMemory,
      ...(r.ingredients || []).map((i) => i.item),
    ]
      .join(' ')
      .toLowerCase();

    return matchesCategory && haystack.includes(terms);
  });

  return (
    <section className="cookbook-gallery-section" aria-label="Family Heirloom Cookbook Gallery">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '32px', color: 'var(--text-espresso)', lineHeight: 1.2 }}>
            The Family Heirloom Cookbook
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Archived recipes, unwritten wisdom, and treasured family voice recordings.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => onOpenPrintAllModal && onOpenPrintAllModal()}
          id="print-full-cookbook-btn"
        >
          <Printer size={16} /> Print Keepsake Book
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="Search by memory, dish name, or ingredient (e.g. 'Brooklyn 1968', 'bacon fat', 'garlic')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="cookbook-search-input"
            style={{
              width: '100%',
              padding: '10px 14px 10px 42px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-warm)',
              fontSize: '14px',
              fontFamily: 'inherit',
              background: 'white',
              boxShadow: 'var(--shadow-sm)',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`btn btn-secondary ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
              style={{
                fontSize: '12px',
                padding: '6px 14px',
                background: selectedCategory === cat ? 'var(--primary-terracotta)' : 'white',
                color: selectedCategory === cat ? 'white' : 'var(--text-espresso)',
                borderColor: selectedCategory === cat ? 'var(--primary-terracotta)' : 'var(--border-warm)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Cards Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="heirloom-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <BookOpen size={48} style={{ color: 'var(--accent-gold)', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '20px', color: 'var(--text-espresso)' }}>No recipes matched your search</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Try searching for a different memory or ingredient, or record a new voice memo in the Voice Studio!
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="heirloom-card"
              onClick={() => onSelectRecipe(recipe)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--primary-terracotta)',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {recipe.category || 'Heirloom Recipe'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                    {new Date(recipe.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                <h2 style={{ fontSize: '22px', lineHeight: 1.25, color: 'var(--text-espresso)', marginBottom: '6px' }}>
                  {recipe.title}
                </h2>

                <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '12px' }}>
                  Spoken by {recipe.speakerName}
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {recipe.summary}
                </p>

                {recipe.grandpaLore?.goldenRule && (
                  <div
                    style={{
                      background: 'var(--bg-parchment-warm)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      color: '#8C550E',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Quote size={12} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {recipe.grandpaLore.goldenRule}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginBottom: '12px' }}>
                  <span><Clock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{recipe.cookTime || '45m'}</span>
                  <span><Users size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{recipe.servings || '4 servings'}</span>
                  <span><Sparkles size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{recipe.ingredients?.length || 0} ingredients</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: 'var(--primary-terracotta)', fontWeight: 600, fontSize: '13px', gap: '4px' }}>
                  Open Recipe Card <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

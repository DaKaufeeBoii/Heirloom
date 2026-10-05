import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import VoiceMemoStudio from './components/VoiceMemoStudio';
import RecipeCard from './components/RecipeCard';
import CookbookGallery from './components/CookbookGallery';
import CookAlongMode from './components/CookAlongMode';
import KeepsakeExportModal from './components/KeepsakeExportModal';
import SentryJudgeDrawer from './components/SentryJudgeDrawer';
import confetti from 'canvas-confetti';

export default function App() {
  const [activeTab, setActiveTab] = useState('studio');
  const [recipes, setRecipes] = useState([]);
  const [activeRecipe, setActiveRecipe] = useState(null);
  const [isCookAlongOpen, setIsCookAlongOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printTargetRecipe, setPrintTargetRecipe] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);

  // Load recipes from server on mount
  useEffect(() => {
    loadRecipes();
    fetch('/api/system-status')
      .then((r) => r.json())
      .then((data) => setSystemStatus(data))
      .catch((e) => console.error(e));
  }, []);

  const loadRecipes = async () => {
    try {
      const res = await fetch('/api/recipes');
      const data = await res.json();
      setRecipes(data);
      if (!activeRecipe && data.length > 0) {
        setActiveRecipe(data[0]);
      }
    } catch (err) {
      console.error('Failed loading recipes:', err);
    }
  };

  const handleRecipeExtracted = (newRecipe) => {
    setActiveRecipe(newRecipe);
    // Automatically save or prompt save
    handleSaveRecipe(newRecipe);
    // Smooth scroll down to the generated recipe card
    setTimeout(() => {
      const el = document.getElementById('extracted-recipe-view');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const handleSaveRecipe = async (recipeToSave) => {
    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeToSave),
      });
      const data = await res.json();
      if (data.success) {
        loadRecipes();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    } catch (err) {
      console.error('Save recipe error:', err);
    }
  };

  const openPrintModal = (recipe) => {
    setPrintTargetRecipe(recipe || activeRecipe);
    setIsPrintModalOpen(true);
  };

  const isCurrentRecipeSaved = () => {
    return activeRecipe && recipes.some((r) => r.id === activeRecipe.id);
  };

  return (
    <div className="heirloom-app">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} sponsorStatus={systemStatus} />

      <main className="app-container">
        {/* Studio View */}
        {activeTab === 'studio' && (
          <div>
            <VoiceMemoStudio onRecipeExtracted={handleRecipeExtracted} />

            {/* Extracted Recipe Card View */}
            {activeRecipe && (
              <div id="extracted-recipe-view">
                <RecipeCard
                  recipe={activeRecipe}
                  onSaveRecipe={handleSaveRecipe}
                  onStartCookAlong={(rec) => {
                    setActiveRecipe(rec);
                    setIsCookAlongOpen(true);
                  }}
                  onOpenPrintModal={openPrintModal}
                  isSaved={isCurrentRecipeSaved()}
                />
              </div>
            )}
          </div>
        )}

        {/* Cookbook Gallery View */}
        {activeTab === 'cookbook' && (
          <div style={{ marginTop: '36px' }}>
            <CookbookGallery
              recipes={recipes}
              onSelectRecipe={(recipe) => {
                setActiveRecipe(recipe);
                setActiveTab('studio');
                setTimeout(() => {
                  const el = document.getElementById('extracted-recipe-view');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              onOpenPrintAllModal={() => openPrintModal(activeRecipe || recipes[0])}
            />
          </div>
        )}

        {/* Sentry & Hackathon Judge Drawer */}
        {activeTab === 'sentry' && (
          <div style={{ marginTop: '36px' }}>
            <SentryJudgeDrawer />
          </div>
        )}
      </main>

      {/* Kitchen Cook Along Fullscreen Overlay */}
      {isCookAlongOpen && activeRecipe && (
        <CookAlongMode
          recipe={activeRecipe}
          onClose={() => setIsCookAlongOpen(false)}
        />
      )}

      {/* Printable Keepsake Sheet Modal */}
      {isPrintModalOpen && printTargetRecipe && (
        <KeepsakeExportModal
          recipe={printTargetRecipe}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </div>
  );
}

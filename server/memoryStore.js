import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import { startAgentSpan } from './sentryTracing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const RECIPES_FILE = path.join(DATA_DIR, 'recipes.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed recipes
const INITIAL_HEIRLOOM_RECIPES = [
  {
    id: 'recipe_seed_1',
    title: "Nonno's Slow-Simmered Sunday Sugo",
    speakerName: "Grandpa Joe (Nonno)",
    category: "Main Course / Pasta",
    servings: "6 hearty bowls",
    prepTime: "25 mins",
    cookTime: "3 hours slow simmer",
    difficulty: "Family Secret",
    summary: "A sacred Sunday tomato sauce born in a 1968 Brooklyn walk-up, slow-simmered with browned pork spare ribs, crushed San Marzano tomatoes, and a parmesan rind.",
    ingredients: [
      { item: "San Marzano Whole Plum Tomatoes", quantity: "2", unit: "28-oz cans", colloquialOriginal: "two big yellow tins", standardizedMeasure: "2 cans (56 oz / 1.6kg)", notes: "Crushed gently by hand" },
      { item: "Pork Spare Ribs or Italian Sausage", quantity: "1", unit: "lb (450g)", colloquialOriginal: "nice cuts from Mr. Rossi", standardizedMeasure: "1 lb (450g)", notes: "Browned hard in olive oil" },
      { item: "Yellow Onion", quantity: "1", unit: "large", colloquialOriginal: "one big Spanish onion", standardizedMeasure: "1 large (300g)", notes: "Finely diced" },
      { item: "Fresh Garlic Cloves", quantity: "5", unit: "cloves", colloquialOriginal: "five fat cloves", standardizedMeasure: "5 cloves", notes: "Smashed flat, never chopped fine" },
      { item: "Extra Virgin Olive Oil", quantity: "2", unit: "glugs", colloquialOriginal: "two good glugs", standardizedMeasure: "2 tbsp (30 ml)", notes: "Cold pressed" },
      { item: "Aged Parmigiano Rind", quantity: "1", unit: "rind", colloquialOriginal: "cheese rind from the back of the fridge", standardizedMeasure: "1 piece (2-inch)", notes: "Simmered inside the pot" },
      { item: "Chianti Red Wine", quantity: "1/2", unit: "cup", colloquialOriginal: "one sip for cook, one splash for pot", standardizedMeasure: "1/2 cup (120 ml)", notes: "For deglazing browned bits" },
      { item: "Fresh Basil", quantity: "1", unit: "handful", colloquialOriginal: "a fistful from garden", standardizedMeasure: "approx. 1/2 cup loose (15g)", notes: "Torn off the heat" }
    ],
    instructions: [
      { stepNumber: 1, text: "Heat olive oil in a heavy Dutch oven. Brown meat on all sides until deep mahogany brown. Remove meat and set aside.", grandpaQuote: "Don't rush the browning! That crust on the pot is where all the Sunday joy lives.", estimatedDurationMinutes: 10, temperature: "Medium heat" },
      { stepNumber: 2, text: "Lower heat and cook onions and smashed garlic cloves until translucent and fragrant.", grandpaQuote: "Smash the garlic flat. If you burn it, throw it out and start over, I mean it!", estimatedDurationMinutes: 8, temperature: "Low-Medium heat" },
      { stepNumber: 3, text: "Deglaze pot with red wine, scraping up all fond from the bottom.", grandpaQuote: "Never cook with wine you wouldn't gladly drink with friends.", estimatedDurationMinutes: 4, temperature: "Simmer" },
      { stepNumber: 4, text: "Squish canned tomatoes by hand into the pot. Add meat back with the parmesan rind. Cover partially and simmer very gently.", grandpaQuote: "Drop in that dry cheese rind. That's Nonna's real secret.", estimatedDurationMinutes: 180, temperature: "Bare low simmer" },
      { stepNumber: 5, text: "Stir in torn fresh basil leaves right after killing the heat. Ladle over rigatoni.", grandpaQuote: "Basil goes in when the fire is dead so the perfume stays sweet.", estimatedDurationMinutes: 2, temperature: "Off heat" }
    ],
    grandpaLore: {
      story: "First made in 1968 after moving to Brooklyn. Nonno swore this exact sauce convinced Nonna's father that he was worthy of marrying his daughter.",
      favoriteMemory: "Uncle Anthony sneaking the crusty end of Italian bread into the bubbling pot behind Nonno's back.",
      goldenRule: "Patience is the only ingredient you can't buy at the grocery store."
    },
    gapClarifications: [
      { element: "Simmer Temperature", whatGrandpaSaid: "Leave it on until church bells ring", gemmaRecommendation: "Set lowest stove flame (~190°F / 88°C) and stir every 20 mins to prevent scorching.", isResolved: true }
    ],
    wineOrBeveragePairing: "A rustic Chianti Classico or sparkling mineral water with lemon",
    createdAt: "2026-10-01T08:30:00.000Z"
  },
  {
    id: 'recipe_seed_2',
    title: "Grandpa Earl's Cast Iron Skillet Cornbread",
    speakerName: "Grandpa Earl",
    category: "Baking & Breads",
    servings: "8 hearty wedges",
    prepTime: "12 mins",
    cookTime: "25 mins at 425°F",
    difficulty: "Easy",
    summary: "Crispy, crackling golden crust made in a screaming hot Griswold cast iron skillet with stone-ground cornmeal, smoky bacon fat, and tangy buttermilk.",
    ingredients: [
      { item: "Coarse Stone-Ground Yellow Cornmeal", quantity: "2", unit: "cups", colloquialOriginal: "two cups of the good coarse meal", standardizedMeasure: "2 cups (280g)", notes: "Non-degermed" },
      { item: "All-Purpose Flour", quantity: "1/2", unit: "cup", colloquialOriginal: "just a half cup of flour", standardizedMeasure: "1/2 cup (60g)", notes: "Unbleached" },
      { item: "Bacon Drippings / Fat", quantity: "2", unit: "tbsp", colloquialOriginal: "a big scoop from the coffee tin", standardizedMeasure: "2 tbsp (30g)", notes: "Rendered bacon grease" },
      { item: "Cultured Buttermilk", quantity: "1.5", unit: "cups", colloquialOriginal: "a mug and a half of thick buttermilk", standardizedMeasure: "1.5 cups (360 ml)", notes: "Room temperature" },
      { item: "Eggs", quantity: "2", unit: "large", colloquialOriginal: "two fresh eggs", standardizedMeasure: "2 large eggs", notes: "Beaten" },
      { item: "Wildflower Honey", quantity: "1", unit: "tsp", colloquialOriginal: "one tiny spoon of honey", standardizedMeasure: "1 tsp (7g)", notes: "Optional touch" },
      { item: "Baking Powder & Soda", quantity: "1", unit: "tsp each", colloquialOriginal: "a teaspoon of each to make it rise", standardizedMeasure: "1 tsp powder + 1/2 tsp soda", notes: "Fresh" }
    ],
    instructions: [
      { stepNumber: 1, text: "Place cast iron skillet with bacon fat inside the oven while preheating to 425°F (220°C).", grandpaQuote: "Get that skillet screaming hot! Don't you dare pour batter into cold iron.", estimatedDurationMinutes: 10, temperature: "425°F (220°C)" },
      { stepNumber: 2, text: "Whisk dry ingredients in one bowl; mix buttermilk and beaten eggs in another.", grandpaQuote: "Stir it quick with a wooden spoon—don't overbeat it or it gets tough as work boots!", estimatedDurationMinutes: 4, temperature: "Room temp" },
      { stepNumber: 3, text: "Pour batter directly into the smoking hot skillet. It should sizzle immediately around the edges.", grandpaQuote: "Hear that sizzle? That's your crispy bottom crust forming right now.", estimatedDurationMinutes: 1, temperature: "Hot pan" },
      { stepNumber: 4, text: "Bake for 22-25 minutes until top is deep golden and a toothpick emerges clean.", grandpaQuote: "Turn it out onto a wooden board. It should sing to you when it hits the wood.", estimatedDurationMinutes: 25, temperature: "425°F (220°C)" }
    ],
    grandpaLore: {
      story: "Baked in his mama's 1930 Griswold cast iron skillet that went through the Great Depression and three family moves.",
      favoriteMemory: "Slabbing salted honey butter on steaming hot slices on chilly autumn mornings.",
      goldenRule: "Never wash cast iron with soap, and never let anyone put sugar in real southern cornbread!"
    },
    gapClarifications: [
      { element: "Pan Preheating Time", whatGrandpaSaid: "Screaming hot", gemmaRecommendation: "Preheat skillet in oven for at least 10 minutes at 425°F so grease smokes lightly.", isResolved: true }
    ],
    wineOrBeveragePairing: "Sweet iced tea or a dark amber ale",
    createdAt: "2026-10-02T14:15:00.000Z"
  }
];

// MongoDB Atlas Client & Connection
let mongoClient = null;
let recipesCollection = null;
let isMongoConnected = false;

const MONGODB_URI = process.env.MONGODB_URI || '';

async function initMongoDB() {
  if (!MONGODB_URI) {
    console.log('[MongoDB Atlas] Running in local file store mode (Set MONGODB_URI to connect Atlas cluster).');
    return;
  }

  const span = startAgentSpan('mongodb.connect', 'db.connect', {
    uriPreview: MONGODB_URI.split('@')[1] || 'cluster',
  });

  try {
    mongoClient = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    await mongoClient.connect();
    const db = mongoClient.db('heirloom');
    recipesCollection = db.collection('recipes');
    isMongoConnected = true;

    // Check count and seed if empty
    const count = await recipesCollection.countDocuments();
    if (count === 0) {
      console.log('[MongoDB Atlas] Seeding initial heirloom family recipes into Atlas cluster...');
      await recipesCollection.insertMany(INITIAL_HEIRLOOM_RECIPES);
    }

    span.end({ status: 'connected', existingDocuments: count });
    console.log('[MongoDB Atlas] Successfully connected to Cluster0 (database: heirloom, collection: recipes)!');
  } catch (err) {
    span.end({ error: err.message, status: 'error' });
    console.warn('[MongoDB Atlas] Could not connect to Atlas cluster, using local persistent fallback:', err.message);
    isMongoConnected = false;
  }
}

// Start connection in background
initMongoDB();

// Load recipes from MongoDB Atlas or local JSON file
export async function getAllRecipesAsync() {
  if (isMongoConnected && recipesCollection) {
    const span = startAgentSpan('mongodb.find_all', 'db.query');
    try {
      const docs = await recipesCollection.find({}).toArray();
      span.end({ count: docs.length });
      // Map _id out for clean frontend consumption
      return docs.map(({ _id, ...r }) => r);
    } catch (e) {
      span.end({ error: e.message });
    }
  }
  return getAllRecipes();
}

export function getAllRecipes() {
  try {
    if (fs.existsSync(RECIPES_FILE)) {
      const data = fs.readFileSync(RECIPES_FILE, 'utf-8');
      return JSON.parse(data);
    }
    fs.writeFileSync(RECIPES_FILE, JSON.stringify(INITIAL_HEIRLOOM_RECIPES, null, 2));
    return INITIAL_HEIRLOOM_RECIPES;
  } catch (err) {
    console.error('[MemoryStore] Failed reading recipes:', err);
    return INITIAL_HEIRLOOM_RECIPES;
  }
}

export async function saveRecipeAsync(newRecipe) {
  // Save to MongoDB Atlas
  if (isMongoConnected && recipesCollection) {
    const span = startAgentSpan('mongodb.save_recipe', 'db.write', {
      recipeId: newRecipe.id,
      title: newRecipe.title,
    });
    try {
      await recipesCollection.updateOne(
        { id: newRecipe.id },
        { $set: newRecipe },
        { upsert: true }
      );
      span.end({ status: 'saved_to_atlas' });
    } catch (e) {
      span.end({ error: e.message, status: 'failed_atlas' });
    }
  }
  return saveRecipe(newRecipe);
}

export function saveRecipe(newRecipe) {
  const current = getAllRecipes();
  const existingIdx = current.findIndex(r => r.id === newRecipe.id);
  if (existingIdx >= 0) {
    current[existingIdx] = newRecipe;
  } else {
    current.unshift(newRecipe);
  }
  fs.writeFileSync(RECIPES_FILE, JSON.stringify(current, null, 2));
  return newRecipe;
}

export async function searchRecipesAsync(query = '') {
  if (isMongoConnected && recipesCollection && query.trim()) {
    const span = startAgentSpan('mongodb.search_recipes', 'db.search', { query });
    try {
      const regex = new RegExp(query.trim(), 'i');
      const docs = await recipesCollection.find({
        $or: [
          { title: regex },
          { speakerName: regex },
          { summary: regex },
          { 'grandpaLore.story': regex },
          { 'ingredients.item': regex },
        ]
      }).toArray();
      span.end({ results: docs.length });
      return docs.map(({ _id, ...r }) => r);
    } catch (e) {
      span.end({ error: e.message });
    }
  }
  return searchRecipes(query);
}

export function searchRecipes(query = '') {
  const all = getAllRecipes();
  if (!query.trim()) return all;

  const terms = query.toLowerCase().split(/\s+/);
  return all.filter((r) => {
    const haystack = [
      r.title,
      r.speakerName,
      r.summary,
      r.category,
      r.grandpaLore?.story,
      r.grandpaLore?.favoriteMemory,
      ...(r.ingredients || []).map(i => i.item),
    ].join(' ').toLowerCase();

    return terms.every(term => haystack.includes(term));
  });
}

export function isAtlasConnected() {
  return isMongoConnected;
}

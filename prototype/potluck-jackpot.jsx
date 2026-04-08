import { useState, useEffect, useRef } from "react";

// --- DATA ---
const CUISINES = [
  { name: "American Classic", emoji: "🍔", color: "#E74C3C", searchTag: "american comfort food" },
  { name: "Italian", emoji: "🍝", color: "#27AE60", searchTag: "italian" },
  { name: "Mexican", emoji: "🌮", color: "#F39C12", searchTag: "mexican" },
  { name: "Chinese", emoji: "🥡", color: "#C0392B", searchTag: "chinese" },
  { name: "Greek", emoji: "🫒", color: "#2980B9", searchTag: "greek" },
  { name: "Japanese", emoji: "🍣", color: "#8E44AD", searchTag: "japanese" },
  { name: "Indian", emoji: "🍛", color: "#D35400", searchTag: "indian" },
  { name: "French", emoji: "🥐", color: "#1ABC9C", searchTag: "french" },
  { name: "Thai", emoji: "🍜", color: "#E67E22", searchTag: "thai" },
  { name: "Random Mix", emoji: "🎲", color: "#9B59B6", searchTag: "international potluck" },
];

const RECIPES = {
  "American Classic": [
    { name: "Smoked Mac & Cheese", difficulty: "beginner", time: "45 min", servings: 8, rating: 4.8, source: "AllRecipes", sourceUrl: "https://www.allrecipes.com/recipe/11679/homemade-mac-and-cheese/", youtubeQuery: "smoked mac and cheese potluck recipe" },
    { name: "BBQ Pulled Pork Sliders", difficulty: "intermediate", time: "4 hrs", servings: 12, rating: 4.9, source: "Food Network", sourceUrl: "https://www.foodnetwork.com/recipes/pulled-pork", youtubeQuery: "bbq pulled pork sliders recipe" },
    { name: "Cornbread with Honey Butter", difficulty: "beginner", time: "30 min", servings: 10, rating: 4.7, source: "Tasty", sourceUrl: "https://tasty.co/recipe/cornbread", youtubeQuery: "easy cornbread honey butter recipe" },
    { name: "Beef Chili Con Carne", difficulty: "intermediate", time: "2 hrs", servings: 8, rating: 4.8, source: "Bon Appétit", sourceUrl: "https://www.bonappetit.com/recipe/bas-best-beef-chili", youtubeQuery: "best beef chili recipe" },
  ],
  "Italian": [
    { name: "Caprese Bruschetta", difficulty: "beginner", time: "20 min", servings: 8, rating: 4.7, source: "Epicurious", sourceUrl: "https://www.epicurious.com/recipes/food/views/bruschetta", youtubeQuery: "caprese bruschetta appetizer recipe" },
    { name: "Baked Ziti", difficulty: "beginner", time: "1 hr", servings: 10, rating: 4.9, source: "AllRecipes", sourceUrl: "https://www.allrecipes.com/recipe/18031/baked-ziti/", youtubeQuery: "baked ziti potluck recipe" },
    { name: "Chicken Piccata", difficulty: "intermediate", time: "40 min", servings: 6, rating: 4.8, source: "Food Network", sourceUrl: "https://www.foodnetwork.com/recipes/giada-de-laurentiis/chicken-piccata", youtubeQuery: "chicken piccata recipe easy" },
    { name: "Tiramisu", difficulty: "expert", time: "5 hrs", servings: 10, rating: 4.9, source: "NYT Cooking", sourceUrl: "https://cooking.nytimes.com/recipes/1018684-tiramisu", youtubeQuery: "classic tiramisu recipe from scratch" },
  ],
  "Mexican": [
    { name: "Street Corn Dip (Elote)", difficulty: "beginner", time: "25 min", servings: 8, rating: 4.9, source: "Tasty", sourceUrl: "https://tasty.co/recipe/street-corn-dip", youtubeQuery: "mexican street corn dip recipe" },
    { name: "Chicken Enchiladas Verdes", difficulty: "intermediate", time: "1 hr", servings: 8, rating: 4.8, source: "Serious Eats", sourceUrl: "https://www.seriouseats.com/enchiladas-verdes", youtubeQuery: "chicken enchiladas verdes from scratch" },
    { name: "Churros with Chocolate Sauce", difficulty: "intermediate", time: "1 hr", servings: 10, rating: 4.7, source: "AllRecipes", sourceUrl: "https://www.allrecipes.com/recipe/24700/churros/", youtubeQuery: "homemade churros chocolate sauce" },
    { name: "Birria Tacos", difficulty: "expert", time: "4 hrs", servings: 10, rating: 4.9, source: "YouTube Chef", sourceUrl: "https://www.youtube.com/results?search_query=birria+tacos+recipe", youtubeQuery: "birria tacos recipe step by step" },
  ],
  "Chinese": [
    { name: "Pork Potstickers", difficulty: "intermediate", time: "1 hr", servings: 8, rating: 4.8, source: "Woks of Life", sourceUrl: "https://thewoksoflife.com/potstickers/", youtubeQuery: "pork potstickers dumplings recipe" },
    { name: "Kung Pao Chicken", difficulty: "intermediate", time: "35 min", servings: 6, rating: 4.7, source: "Serious Eats", sourceUrl: "https://www.seriouseats.com/kung-pao-chicken", youtubeQuery: "kung pao chicken recipe easy" },
    { name: "Scallion Pancakes", difficulty: "beginner", time: "40 min", servings: 8, rating: 4.8, source: "NYT Cooking", sourceUrl: "https://cooking.nytimes.com/recipes/1020975-scallion-pancakes", youtubeQuery: "crispy scallion pancakes recipe" },
    { name: "Mapo Tofu", difficulty: "intermediate", time: "30 min", servings: 6, rating: 4.6, source: "Woks of Life", sourceUrl: "https://thewoksoflife.com/mapo-tofu-recipe/", youtubeQuery: "authentic mapo tofu recipe" },
  ],
  "Greek": [
    { name: "Spanakopita Bites", difficulty: "intermediate", time: "50 min", servings: 10, rating: 4.8, source: "Epicurious", sourceUrl: "https://www.epicurious.com/recipes/food/views/spanakopita", youtubeQuery: "spanakopita phyllo triangles recipe" },
    { name: "Chicken Souvlaki Platter", difficulty: "intermediate", time: "1 hr", servings: 8, rating: 4.9, source: "AllRecipes", sourceUrl: "https://www.allrecipes.com/recipe/172704/chicken-souvlaki/", youtubeQuery: "chicken souvlaki with tzatziki recipe" },
    { name: "Greek Lemon Potatoes", difficulty: "beginner", time: "1 hr", servings: 8, rating: 4.7, source: "Food Network", sourceUrl: "https://www.foodnetwork.com/recipes/greek-lemon-potatoes", youtubeQuery: "greek lemon roasted potatoes" },
    { name: "Baklava", difficulty: "expert", time: "2 hrs", servings: 12, rating: 4.9, source: "Tasty", sourceUrl: "https://tasty.co/recipe/baklava", youtubeQuery: "homemade baklava step by step" },
  ],
  "Japanese": [
    { name: "Gyoza", difficulty: "intermediate", time: "1 hr", servings: 8, rating: 4.8, source: "Just One Cookbook", sourceUrl: "https://www.justonecookbook.com/gyoza/", youtubeQuery: "japanese gyoza recipe crispy" },
    { name: "Teriyaki Meatballs", difficulty: "beginner", time: "40 min", servings: 8, rating: 4.7, source: "Tasty", sourceUrl: "https://tasty.co/recipe/teriyaki-meatballs", youtubeQuery: "teriyaki meatballs appetizer recipe" },
    { name: "Okonomiyaki", difficulty: "intermediate", time: "45 min", servings: 6, rating: 4.6, source: "Serious Eats", sourceUrl: "https://www.seriouseats.com/okonomiyaki-japanese-pancake", youtubeQuery: "okonomiyaki japanese pancake recipe" },
    { name: "Matcha Mochi", difficulty: "expert", time: "1 hr", servings: 10, rating: 4.8, source: "Just One Cookbook", sourceUrl: "https://www.justonecookbook.com/mochi-recipe/", youtubeQuery: "matcha mochi recipe easy" },
  ],
  "Indian": [
    { name: "Samosas", difficulty: "intermediate", time: "1.5 hrs", servings: 10, rating: 4.9, source: "Manjula's Kitchen", sourceUrl: "https://www.manjulaskitchen.com/samosa/", youtubeQuery: "crispy samosa recipe step by step" },
    { name: "Butter Chicken", difficulty: "intermediate", time: "1 hr", servings: 8, rating: 4.9, source: "AllRecipes", sourceUrl: "https://www.allrecipes.com/recipe/246717/indian-butter-chicken/", youtubeQuery: "butter chicken recipe from scratch" },
    { name: "Garlic Naan", difficulty: "beginner", time: "1 hr", servings: 8, rating: 4.8, source: "Tasty", sourceUrl: "https://tasty.co/recipe/garlic-naan", youtubeQuery: "homemade garlic naan no oven" },
    { name: "Mango Lassi Panna Cotta", difficulty: "expert", time: "4 hrs", servings: 8, rating: 4.7, source: "Bon Appétit", sourceUrl: "https://www.bonappetit.com/recipe/mango-panna-cotta", youtubeQuery: "mango panna cotta recipe" },
  ],
  "French": [
    { name: "French Onion Dip", difficulty: "beginner", time: "1 hr", servings: 8, rating: 4.7, source: "Serious Eats", sourceUrl: "https://www.seriouseats.com/french-onion-dip", youtubeQuery: "french onion dip from scratch" },
    { name: "Quiche Lorraine", difficulty: "intermediate", time: "1.5 hrs", servings: 8, rating: 4.8, source: "NYT Cooking", sourceUrl: "https://cooking.nytimes.com/recipes/1018894-quiche-lorraine", youtubeQuery: "quiche lorraine recipe classic" },
    { name: "Coq au Vin", difficulty: "expert", time: "3 hrs", servings: 8, rating: 4.9, source: "Food Network", sourceUrl: "https://www.foodnetwork.com/recipes/ina-garten/coq-au-vin", youtubeQuery: "coq au vin recipe step by step" },
    { name: "Crème Brûlée", difficulty: "intermediate", time: "5 hrs", servings: 6, rating: 4.9, source: "Epicurious", sourceUrl: "https://www.epicurious.com/recipes/food/views/creme-brulee", youtubeQuery: "creme brulee recipe easy" },
  ],
  "Thai": [
    { name: "Thai Peanut Noodle Salad", difficulty: "beginner", time: "30 min", servings: 8, rating: 4.8, source: "Cookie & Kate", sourceUrl: "https://cookieandkate.com/peanut-noodle-salad/", youtubeQuery: "thai peanut noodle salad cold" },
    { name: "Green Curry", difficulty: "intermediate", time: "45 min", servings: 6, rating: 4.7, source: "Serious Eats", sourceUrl: "https://www.seriouseats.com/thai-green-curry", youtubeQuery: "thai green curry recipe coconut milk" },
    { name: "Pad Thai", difficulty: "intermediate", time: "40 min", servings: 6, rating: 4.9, source: "Woks of Life", sourceUrl: "https://thewoksoflife.com/pad-thai/", youtubeQuery: "authentic pad thai recipe" },
    { name: "Mango Sticky Rice", difficulty: "beginner", time: "1 hr", servings: 6, rating: 4.8, source: "Tasty", sourceUrl: "https://tasty.co/recipe/mango-sticky-rice", youtubeQuery: "mango sticky rice dessert recipe" },
  ],
  "Random Mix": [
    { name: "Korean Fried Chicken Wings", difficulty: "intermediate", time: "1 hr", servings: 8, rating: 4.9, source: "Maangchi", sourceUrl: "https://www.maangchi.com/recipe/yangnyeom-tongdak", youtubeQuery: "korean fried chicken gochujang" },
    { name: "Peruvian Ceviche", difficulty: "intermediate", time: "30 min", servings: 6, rating: 4.7, source: "Serious Eats", sourceUrl: "https://www.seriouseats.com/peruvian-ceviche", youtubeQuery: "peruvian ceviche recipe traditional" },
    { name: "Moroccan Lamb Tagine", difficulty: "expert", time: "3 hrs", servings: 8, rating: 4.8, source: "NYT Cooking", sourceUrl: "https://cooking.nytimes.com/recipes/1017766-lamb-tagine", youtubeQuery: "moroccan lamb tagine recipe" },
    { name: "Brazilian Pão de Queijo", difficulty: "beginner", time: "35 min", servings: 10, rating: 4.9, source: "Food52", sourceUrl: "https://food52.com/recipes/brazilian-cheese-bread", youtubeQuery: "pao de queijo cheese bread recipe" },
  ],
};

const FRIENDS = [
  { name: "Marcus", avatar: "👨‍🦱", color: "#4ECDC4", status: "online" },
  { name: "Priya", avatar: "👩‍🦳", color: "#A06CD5", status: "online" },
  { name: "Jordan", avatar: "🧑‍🦲", color: "#FF9F43", status: "online" },
  { name: "Aisha", avatar: "👩", color: "#54A0FF", status: "away" },
  { name: "Tyler", avatar: "👨‍🦰", color: "#5F27CD", status: "online" },
  { name: "Mei", avatar: "👧", color: "#FF6348", status: "offline" },
  { name: "Diego", avatar: "👦", color: "#1DD1A1", status: "online" },
  { name: "Lena", avatar: "👩‍🦱", color: "#E056A0", status: "away" },
];

const DIFFICULTY_COLORS = {
  beginner: { bg: "#D5F5E3", text: "#1E8449", label: "⭐ Beginner" },
  intermediate: { bg: "#FEF9E7", text: "#B7950B", label: "⭐⭐ Intermediate" },
  expert: { bg: "#FADBD8", text: "#C0392B", label: "⭐⭐⭐ Expert" },
};

const generateCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

const getCountdownText = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;
  try {
    const eventDate = new Date(`${dateStr}T${timeStr}`);
    const now = new Date();
    const diff = eventDate - now;
    if (diff < 0) return "Happening now!";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `in ${days} day${days > 1 ? "s" : ""}, ${hours} hr${hours !== 1 ? "s" : ""}`;
    if (hours > 0) return `in ${hours} hour${hours > 1 ? "s" : ""}`;
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `in ${mins} minute${mins > 1 ? "s" : ""}`;
  } catch { return null; }
};

// --- RICH PAST POTLUCK DATA ---
const PAST_POTLUCKS_DATA = [
  {
    id: 1, name: "Taco Tuesday Throwdown", cuisine: { name: "Mexican", emoji: "🌮", color: "#F39C12" },
    date: "Mar 28, 2026", location: "Sarah's House", guests: 5,
    winner: { name: "Marcus", avatar: "👨‍🦱", dish: "Birria Tacos", score: 5 },
    assignments: [
      { guest: { name: "You (Host)", avatar: "⭐", color: "#FFD700" }, recipe: { name: "Street Corn Dip", difficulty: "beginner" }, score: 4 },
      { guest: { name: "Marcus", avatar: "👨‍🦱", color: "#4ECDC4" }, recipe: { name: "Birria Tacos", difficulty: "expert" }, score: 5 },
      { guest: { name: "Priya", avatar: "👩‍🦳", color: "#A06CD5" }, recipe: { name: "Churros", difficulty: "intermediate" }, score: 4 },
      { guest: { name: "Jordan", avatar: "🧑‍🦲", color: "#FF9F43" }, recipe: { name: "Chicken Enchiladas", difficulty: "intermediate" }, score: 3 },
      { guest: { name: "Aisha", avatar: "👩", color: "#54A0FF" }, recipe: { name: "Street Corn Dip", difficulty: "beginner" }, score: 4 },
    ],
    photos: [
      { user: "Marcus", emoji: "🌮", caption: "The birria was fire!" },
      { user: "Group", emoji: "🎉🍽️", caption: "The whole crew at Taco Tuesday!" },
    ],
  },
  {
    id: 2, name: "Sunday Italian Feast", cuisine: { name: "Italian", emoji: "🍝", color: "#27AE60" },
    date: "Mar 15, 2026", location: "Jordan's Backyard", guests: 7,
    winner: { name: "Mei", avatar: "👧", dish: "Tiramisu", score: 5 },
    assignments: [
      { guest: { name: "You (Host)", avatar: "⭐", color: "#FFD700" }, recipe: { name: "Baked Ziti", difficulty: "beginner" }, score: 4 },
      { guest: { name: "Mei", avatar: "👧", color: "#FF6348" }, recipe: { name: "Tiramisu", difficulty: "expert" }, score: 5 },
      { guest: { name: "Tyler", avatar: "👨‍🦰", color: "#5F27CD" }, recipe: { name: "Caprese Bruschetta", difficulty: "beginner" }, score: 3 },
      { guest: { name: "Diego", avatar: "👦", color: "#1DD1A1" }, recipe: { name: "Chicken Piccata", difficulty: "intermediate" }, score: 4 },
      { guest: { name: "Marcus", avatar: "👨‍🦱", color: "#4ECDC4" }, recipe: { name: "Baked Ziti", difficulty: "beginner" }, score: 4 },
      { guest: { name: "Priya", avatar: "👩‍🦳", color: "#A06CD5" }, recipe: { name: "Caprese Bruschetta", difficulty: "beginner" }, score: 5 },
      { guest: { name: "Lena", avatar: "👩‍🦱", color: "#E056A0" }, recipe: { name: "Chicken Piccata", difficulty: "intermediate" }, score: 3 },
    ],
    photos: [
      { user: "Mei", emoji: "🍰", caption: "My first tiramisu and it SLAPPED" },
      { user: "Group", emoji: "🍝👨‍👩‍👧‍👦", caption: "Italian feast in the backyard!" },
      { user: "Tyler", emoji: "🍅", caption: "Bruschetta game strong" },
    ],
  },
];

// All-time leaderboard from past potlucks
const ALL_TIME_STATS = [
  { name: "Marcus", avatar: "👨‍🦱", color: "#4ECDC4", potlucks: 6, avgScore: 4.7, wins: 3 },
  { name: "Mei", avatar: "👧", color: "#FF6348", potlucks: 4, avgScore: 4.6, wins: 2 },
  { name: "Priya", avatar: "👩‍🦳", color: "#A06CD5", potlucks: 5, avgScore: 4.4, wins: 1 },
  { name: "You", avatar: "⭐", color: "#FFD700", potlucks: 6, avgScore: 4.3, wins: 1 },
  { name: "Diego", avatar: "👦", color: "#1DD1A1", potlucks: 4, avgScore: 4.1, wins: 1 },
  { name: "Aisha", avatar: "👩", color: "#54A0FF", potlucks: 3, avgScore: 4.0, wins: 0 },
  { name: "Tyler", avatar: "👨‍🦰", color: "#5F27CD", potlucks: 5, avgScore: 3.8, wins: 0 },
  { name: "Jordan", avatar: "🧑‍🦲", color: "#FF9F43", potlucks: 4, avgScore: 3.6, wins: 0 },
];

// Community potlucks nearby
const COMMUNITY_POTLUCKS = [
  { name: "Neighborhood BBQ Bash", cuisine: { name: "American Classic", emoji: "🍔", color: "#E74C3C" }, host: "The Millers", distance: "0.3 mi", date: "Apr 12", time: "5:00 PM", spots: 4, total: 12, location: "Maple St Park Pavilion" },
  { name: "Elm Street Thai Night", cuisine: { name: "Thai", emoji: "🍜", color: "#E67E22" }, host: "David K.", distance: "0.5 mi", date: "Apr 18", time: "6:30 PM", spots: 6, total: 10, location: "124 Elm Street" },
  { name: "Block Party Potluck", cuisine: { name: "Random Mix", emoji: "🎲", color: "#9B59B6" }, host: "Oak Hill HOA", distance: "0.8 mi", date: "Apr 25", time: "4:00 PM", spots: 15, total: 30, location: "Oak Hill Community Center" },
];

// Feed
const FEED_POSTS = [
  { user: "Marcus", avatar: "👨‍🦱", color: "#4ECDC4", dish: "Birria Tacos", cuisine: "Mexican Night", photo: "🌮", caption: "First time making birria and I'm NEVER going back.", likes: 24, time: "2h ago", comments: [{ user: "Priya", text: "Recipe link please!! 🔥" }, { user: "Sarah", text: "These were insane" }] },
  { user: "Aisha", avatar: "👩", color: "#54A0FF", dish: "Baklava", cuisine: "Greek Feast", photo: "🍯", caption: "47 layers of phyllo and I counted every single one.", likes: 31, time: "1d ago", comments: [{ user: "Tyler", text: "Best dessert hands down" }] },
  { user: "Mei", avatar: "👧", color: "#FF6348", dish: "Gyoza", cuisine: "Japanese Night", photo: "🥟", caption: "The crispy bottoms!! Just One Cookbook tutorial was perfect.", likes: 18, time: "3d ago", comments: [{ user: "Diego", text: "Teach me 🙏" }] },
  { user: "Group Photo", avatar: "📸", color: "#FFD700", dish: null, cuisine: "Italian Feast — Mar 15", photo: "🍽️👨‍👩‍👧‍👦", caption: "The whole crew! 8 dishes, zero leftovers.", likes: 42, time: "2w ago", comments: [{ user: "Everyone", text: "🙋‍♀️🙋‍♂️🙋" }] },
];

// --- SHARED COMPONENTS ---
const Header = ({ screen, onBack, potluckName }) => (
  <div style={{ background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 50%, #FFC93C 100%)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 4px 15px rgba(255,107,107,0.3)" }}>
    {screen !== "home" && (
      <button onClick={onBack} style={{ background: "rgba(255,255,255,0.25)", border: "none", borderRadius: 12, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18, color: "#fff" }}>←</button>
    )}
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>🎰 Potluck Jackpot</div>
      {potluckName && screen !== "home" && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>{potluckName}</div>}
    </div>
    <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 12, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
  </div>
);

const BottomNav = ({ activeTab, onTab }) => (
  <div style={{ position: "sticky", bottom: 0, background: "#fff", borderTop: "1px solid #eee", display: "flex", padding: "10px 0 14px", boxShadow: "0 -2px 10px rgba(0,0,0,0.04)" }}>
    {[{ icon: "🏠", label: "Home", s: "home" }, { icon: "📸", label: "Feed", s: "feed" }, { icon: "👥", label: "Friends", s: "friends" }, { icon: "🏆", label: "Rankings", s: "rankings" }].map(tab => (
      <button key={tab.s} onClick={() => onTab(tab.s)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", textAlign: "center", opacity: activeTab === tab.s ? 1 : 0.4 }}>
        <div style={{ fontSize: 20 }}>{tab.icon}</div>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#555", marginTop: 2 }}>{tab.label}</div>
      </button>
    ))}
  </div>
);

const Pill = ({ bg, color, children }) => (
  <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, background: bg, color }}>{children}</span>
);

// --- HOME SCREEN ---
const HomeScreen = ({ onCreatePotluck, onJoinPotluck, onCommunity, pastPotlucks, activePotluck, onOpenActivePotluck, onOpenPastPotluck }) => (
  <div style={{ padding: 20 }}>
    {activePotluck && (
      <button onClick={onOpenActivePotluck} style={{ width: "100%", border: "none", cursor: "pointer", textAlign: "left", background: `linear-gradient(135deg, ${activePotluck.cuisine.color}15, ${activePotluck.cuisine.color}30)`, borderRadius: 20, padding: 20, marginBottom: 20, boxShadow: `0 4px 20px ${activePotluck.cuisine.color}25`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -10, fontSize: 80, opacity: 0.15 }}>{activePotluck.cuisine.emoji}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <Pill bg="#FF6B6B" color="#fff">UPCOMING</Pill>
          {activePotluck.date && activePotluck.time && <div style={{ fontSize: 12, fontWeight: 700, color: activePotluck.cuisine.color }}>{getCountdownText(activePotluck.date, activePotluck.time)}</div>}
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#333", marginBottom: 4 }}>{activePotluck.name || `${activePotluck.cuisine.name} Potluck`}</div>
        {activePotluck.date && <div style={{ fontSize: 13, color: "#666", marginBottom: 2 }}>📅 {new Date(activePotluck.date + "T00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}{activePotluck.time && ` at ${new Date("2000-01-01T" + activePotluck.time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`}</div>}
        {activePotluck.location && <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>📍 {activePotluck.location}</div>}
        {activePotluck.myRecipe && (
          <div style={{ background: "#fff", borderRadius: 12, padding: "10px 14px", marginTop: 8, display: "flex", alignItems: "center", gap: 10, border: `1px solid ${activePotluck.cuisine.color}30` }}>
            <div style={{ fontSize: 24 }}>👩‍🍳</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#999" }}>You're making:</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#333" }}>{activePotluck.myRecipe.name}</div>
            </div>
            <div style={{ fontSize: 13, color: activePotluck.cuisine.color, fontWeight: 700 }}>View →</div>
          </div>
        )}
        <div style={{ fontSize: 12, color: "#999", marginTop: 8 }}>👥 {activePotluck.guestCount} people · Code: <strong>PJ-{activePotluck.code}</strong></div>
      </button>
    )}

    {!activePotluck && (
      <div style={{ textAlign: "center", padding: "30px 20px", background: "linear-gradient(135deg, #FFF5F5 0%, #FFF8E1 100%)", borderRadius: 20, marginBottom: 24, border: "2px dashed #FFB74D" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🎲🍽️🎉</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 4 }}>Spin. Cook. Feast!</div>
        <div style={{ fontSize: 13, color: "#777", maxWidth: 260, margin: "0 auto" }}>Get assigned a random recipe, cook it up, and bring it to the potluck!</div>
      </div>
    )}

    <button onClick={onCreatePotluck} style={{ width: "100%", padding: "18px 20px", background: "linear-gradient(135deg, #FF6B6B, #FF8E53)", border: "none", borderRadius: 16, color: "#fff", fontSize: 17, fontWeight: 700, cursor: "pointer", marginBottom: 12, boxShadow: "0 4px 15px rgba(255,107,107,0.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
      <span style={{ fontSize: 22 }}>🎯</span> Host a Potluck
    </button>

    <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
      <button onClick={onJoinPotluck} style={{ flex: 1, padding: "16px", background: "#fff", border: "2px solid #FF6B6B", borderRadius: 16, color: "#FF6B6B", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        🔑 Join Code
      </button>
      <button onClick={onCommunity} style={{ flex: 1, padding: "16px", background: "#fff", border: "2px solid #4ECDC4", borderRadius: 16, color: "#4ECDC4", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        🏘️ Nearby
      </button>
    </div>

    {pastPotlucks.length > 0 && (
      <>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 12 }}>Past Potlucks</div>
        {pastPotlucks.map((p, i) => (
          <button key={i} onClick={() => onOpenPastPotluck(p)} style={{ width: "100%", background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 12, border: "none", cursor: "pointer", textAlign: "left" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: p.cuisine.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{p.cuisine.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#333" }}>{p.name}</div>
              <div style={{ fontSize: 12, color: "#999" }}>{p.cuisine.name} · {p.guests} guests</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "#aaa" }}>{p.date}</div>
              <div style={{ fontSize: 11, color: "#FF6B6B" }}>View recap →</div>
            </div>
          </button>
        ))}
      </>
    )}
  </div>
);

// --- PAST POTLUCK RECAP ---
const PastPotluckRecap = ({ potluck }) => {
  const trophies = ["🥇", "🥈", "🥉"];
  const sorted = [...potluck.assignments].sort((a, b) => (b.score || 0) - (a.score || 0));
  return (
    <div style={{ padding: 20 }}>
      <div style={{ textAlign: "center", padding: "20px", background: `linear-gradient(135deg, ${potluck.cuisine.color}10, ${potluck.cuisine.color}25)`, borderRadius: 18, marginBottom: 20 }}>
        <div style={{ fontSize: 40 }}>{potluck.cuisine.emoji}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#333", marginTop: 4 }}>{potluck.name}</div>
        <div style={{ fontSize: 13, color: "#777", marginTop: 2 }}>📅 {potluck.date} · 📍 {potluck.location}</div>
        <div style={{ fontSize: 13, color: "#999" }}>{potluck.guests} guests · {potluck.cuisine.name}</div>
      </div>

      {/* Winner spotlight */}
      <div style={{ background: "#FFFDE7", border: "2px solid #FFD700", borderRadius: 16, padding: "16px", textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 32 }}>🏆</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#333" }}>Champion: {potluck.winner.name} {potluck.winner.avatar}</div>
        <div style={{ fontSize: 14, color: "#FF6B6B", fontWeight: 600 }}>{potluck.winner.dish}</div>
        <div style={{ fontSize: 18, marginTop: 4 }}>{"⭐".repeat(potluck.winner.score)}</div>
      </div>

      {/* All ratings */}
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 10 }}>Final Standings</div>
      {sorted.map((a, i) => (
        <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", marginBottom: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 20, width: 28, textAlign: "center" }}>{trophies[i] || `#${i + 1}`}</div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: a.guest.color + "25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{a.guest.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#333" }}>{a.guest.name}</div>
            <div style={{ fontSize: 12, color: "#999" }}>{a.recipe.name}</div>
          </div>
          <div style={{ fontSize: 13 }}>{"⭐".repeat(a.score || 0)}</div>
        </div>
      ))}

      {/* Photos */}
      {potluck.photos && potluck.photos.length > 0 && (
        <>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 10, marginTop: 20 }}>Photos</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {potluck.photos.map((p, i) => (
              <div key={i} style={{ background: `linear-gradient(135deg, ${potluck.cuisine.color}15, ${potluck.cuisine.color}30)`, borderRadius: 14, padding: "24px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 40 }}>{p.emoji}</div>
                <div style={{ fontSize: 11, color: "#555", marginTop: 6, fontWeight: 600 }}>{p.user}</div>
                <div style={{ fontSize: 11, color: "#999" }}>{p.caption}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// --- COMMUNITY POTLUCKS ---
const CommunityScreen = ({ onJoinCommunity }) => {
  const [radius, setRadius] = useState("1");
  return (
    <div style={{ padding: 20 }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 40 }}>🏘️</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#333", marginTop: 4 }}>Community Potlucks</div>
        <div style={{ fontSize: 13, color: "#999" }}>Open potlucks happening near you</div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, justifyContent: "center" }}>
        {["0.5", "1", "3", "5"].map(r => (
          <button key={r} onClick={() => setRadius(r)} style={{ padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", border: radius === r ? "2px solid #4ECDC4" : "2px solid #eee", background: radius === r ? "#E8FFF8" : "#fff", color: radius === r ? "#4ECDC4" : "#999" }}>{r} mi</button>
        ))}
      </div>

      {COMMUNITY_POTLUCKS.map((cp, i) => (
        <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "16px", marginBottom: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: cp.cuisine.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{cp.cuisine.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#333" }}>{cp.name}</div>
              <div style={{ fontSize: 12, color: "#999" }}>Hosted by {cp.host} · {cp.distance} away</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>📅 {cp.date} at {cp.time}</div>
          <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>📍 {cp.location}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#eee", overflow: "hidden" }}>
              <div style={{ width: `${((cp.total - cp.spots) / cp.total) * 100}%`, height: "100%", background: cp.spots < 5 ? "#FF6B6B" : "#4ECDC4", borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 12, color: cp.spots < 5 ? "#FF6B6B" : "#999", fontWeight: 600 }}>{cp.spots} spots left</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => onJoinCommunity(cp)} style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg, #4ECDC4, #44BD9E)", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Join & Spin!</button>
            <button style={{ padding: "12px 16px", background: "#F8F9FA", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, color: "#999", cursor: "pointer" }}>Maybe</button>
          </div>
        </div>
      ))}

      <div style={{ textAlign: "center", marginTop: 16, padding: "20px", background: "#F8F9FA", borderRadius: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>Host a Community Potluck</div>
        <div style={{ fontSize: 12, color: "#999", marginBottom: 12 }}>Open your potluck to neighbors within a radius</div>
        <button style={{ padding: "12px 24px", background: "linear-gradient(135deg, #FF6B6B, #FF8E53)", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>🏘️ Create Community Potluck</button>
      </div>
    </div>
  );
};

// --- RSVP SCREEN (invited view) ---
const RsvpScreen = ({ potluck, onAccept, onDecline }) => (
  <div style={{ padding: 20, textAlign: "center" }}>
    <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
    <div style={{ fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 4 }}>You're Invited!</div>
    <div style={{ fontSize: 13, color: "#999", marginBottom: 20 }}>
      {potluck.hostName || "Your friend"} invited you to a potluck
    </div>
    <div style={{ background: `linear-gradient(135deg, ${potluck.cuisine.color}10, ${potluck.cuisine.color}25)`, borderRadius: 18, padding: "20px", marginBottom: 20 }}>
      <div style={{ fontSize: 40 }}>{potluck.cuisine.emoji}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#333", marginTop: 8 }}>{potluck.name || `${potluck.cuisine.name} Potluck`}</div>
      {potluck.date && <div style={{ fontSize: 14, color: "#555", marginTop: 8 }}>📅 {new Date(potluck.date + "T00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}{potluck.time && ` at ${new Date("2000-01-01T" + potluck.time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`}</div>}
      {potluck.location && <div style={{ fontSize: 14, color: "#555", marginTop: 4 }}>📍 {potluck.location}</div>}
      <div style={{ fontSize: 13, color: "#999", marginTop: 8 }}>👥 {potluck.guestCount || 4} people so far · Code: PJ-{potluck.code}</div>
    </div>
    <div style={{ display: "flex", gap: 12 }}>
      <button onClick={onAccept} style={{ flex: 1, padding: "16px", background: "linear-gradient(135deg, #4ECDC4, #44BD9E)", border: "none", borderRadius: 14, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>✅ I'm In!</button>
      <button onClick={onDecline} style={{ flex: 1, padding: "16px", background: "#fff", border: "2px solid #FF6B6B", borderRadius: 14, color: "#FF6B6B", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>❌ Can't Make It</button>
    </div>
  </div>
);

const DeclinedScreen = ({ onHome }) => (
  <div style={{ padding: 40, textAlign: "center" }}>
    <div style={{ fontSize: 48, marginBottom: 12 }}>😢</div>
    <div style={{ fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 4 }}>No worries!</div>
    <div style={{ fontSize: 13, color: "#999", marginBottom: 24 }}>We'll miss you. You can always join the next one!</div>
    <button onClick={onHome} style={{ padding: "14px 30px", background: "linear-gradient(135deg, #FF6B6B, #FF8E53)", border: "none", borderRadius: 14, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Back to Home</button>
  </div>
);

// --- RANKINGS (All-Time Leaderboard) ---
const RankingsScreen = () => {
  const trophies = ["🥇", "🥈", "🥉"];
  return (
    <div style={{ padding: 20 }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 40 }}>🏆</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#333", marginTop: 4 }}>All-Time Rankings</div>
        <div style={{ fontSize: 13, color: "#999" }}>Across all your potlucks</div>
      </div>

      {/* Top 3 podium */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 8, marginBottom: 24 }}>
        {[1, 0, 2].map(idx => {
          const p = ALL_TIME_STATS[idx];
          const heights = [140, 110, 90];
          const order = [1, 0, 2];
          return (
            <div key={idx} style={{ textAlign: "center", width: 100 }}>
              <div style={{ fontSize: 28 }}>{p.avatar}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#333", marginTop: 2 }}>{p.name}</div>
              <div style={{ fontSize: 20, marginTop: 2 }}>{trophies[idx]}</div>
              <div style={{ height: heights[order[idx === 0 ? 1 : idx === 1 ? 0 : 2]], background: `linear-gradient(180deg, ${p.color}40, ${p.color}15)`, borderRadius: "12px 12px 0 0", marginTop: 6, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#333" }}>{p.wins}</div>
                <div style={{ fontSize: 10, color: "#777" }}>wins</div>
                <div style={{ fontSize: 11, color: "#999" }}>⭐ {p.avgScore} avg</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full list */}
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 10 }}>Full Standings</div>
      {ALL_TIME_STATS.map((p, i) => (
        <div key={i} style={{ background: i < 3 ? "#FFFDE7" : "#fff", borderRadius: 14, padding: "12px 14px", marginBottom: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 10, border: i < 3 ? `1px solid ${["#FFD700", "#C0C0C0", "#CD7F32"][i]}40` : "1px solid #f0f0f0" }}>
          <div style={{ fontSize: 18, width: 28, textAlign: "center", fontWeight: 700, color: i < 3 ? "#333" : "#999" }}>{trophies[i] || `#${i + 1}`}</div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: p.color + "25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{p.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#333" }}>{p.name}</div>
            <div style={{ fontSize: 11, color: "#999" }}>{p.potlucks} potlucks · {p.wins} win{p.wins !== 1 ? "s" : ""}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#FF6B6B" }}>⭐ {p.avgScore}</div>
            <div style={{ fontSize: 10, color: "#bbb" }}>avg rating</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- FRIENDS TAB ---
const FriendsScreen = ({ onInvite }) => {
  const statusColors = { online: "#2ECC71", away: "#F39C12", offline: "#BDC3C7" };
  const statusLabels = { online: "Online", away: "Away", offline: "Offline" };
  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 4 }}>Your Friends</div>
      <div style={{ fontSize: 13, color: "#999", marginBottom: 16 }}>{FRIENDS.length} friends on Potluck Jackpot</div>
      <button style={{ width: "100%", padding: "14px 16px", background: "linear-gradient(135deg, #4ECDC4, #44BD9E)", border: "none", borderRadius: 14, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>➕ Invite New Friends to the App</button>
      {FRIENDS.map(f => (
        <div key={f.name} style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", marginBottom: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: f.color + "25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{f.avatar}</div>
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderRadius: "50%", background: statusColors[f.status], border: "2px solid #fff" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#333" }}>{f.name}</div>
            <div style={{ fontSize: 12, color: "#999" }}>{statusLabels[f.status]} · {ALL_TIME_STATS.find(s => s.name === f.name)?.potlucks || 2} potlucks</div>
          </div>
          <button onClick={() => onInvite(f.name)} style={{ padding: "8px 14px", background: "#FFF0F0", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 600, color: "#FF6B6B", cursor: "pointer" }}>Invite</button>
        </div>
      ))}
    </div>
  );
};

// --- FEED ---
const FeedScreen = () => {
  const [likedPosts, setLikedPosts] = useState({});
  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 4 }}>Potluck Feed</div>
      <div style={{ fontSize: 13, color: "#999", marginBottom: 16 }}>Photos, dishes & good times from your crew</div>
      <button style={{ width: "100%", padding: "14px 16px", background: "linear-gradient(135deg, #4ECDC4, #44BD9E)", border: "none", borderRadius: 14, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>📸 Share a Photo</button>
      {FEED_POSTS.map((post, i) => (
        <div key={i} style={{ background: "#fff", borderRadius: 18, marginBottom: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px 0" }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: post.color + "25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{post.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#333" }}>{post.user}</div>
              <div style={{ fontSize: 11, color: "#999" }}>{post.cuisine} · {post.time}</div>
            </div>
          </div>
          <div style={{ margin: "12px 16px", height: 180, borderRadius: 14, background: `linear-gradient(135deg, ${post.color}15, ${post.color}30)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, position: "relative" }}>
            {post.photo}
            {post.dish && <div style={{ position: "absolute", bottom: 10, left: 12, background: "rgba(0,0,0,0.6)", color: "#fff", padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{post.dish}</div>}
          </div>
          <div style={{ padding: "0 16px 14px" }}>
            <div style={{ fontSize: 13, color: "#444", lineHeight: 1.5, marginBottom: 10 }}>{post.caption}</div>
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 10 }}>
              <button onClick={() => setLikedPosts(p => ({ ...p, [i]: !p[i] }))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: likedPosts[i] ? "#FF6B6B" : "#999", fontWeight: 600 }}>{likedPosts[i] ? "❤️" : "🤍"} {post.likes + (likedPosts[i] ? 1 : 0)}</button>
              <span style={{ fontSize: 14, color: "#999" }}>💬 {post.comments.length}</span>
            </div>
            {post.comments.map((c, j) => (
              <div key={j} style={{ fontSize: 12, color: "#666", marginBottom: 3 }}><span style={{ fontWeight: 700, color: "#333" }}>{c.user}</span> {c.text}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// --- JOIN CODE ---
const JoinCodeScreen = ({ onJoin }) => {
  const [code, setCode] = useState("");
  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🔑</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 4 }}>Join a Potluck</div>
      <div style={{ fontSize: 13, color: "#999", marginBottom: 24 }}>Enter the 6-character code your host shared</div>
      <input value={code} onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))} placeholder="ABC123" style={{ width: "80%", maxWidth: 240, textAlign: "center", fontSize: 28, fontWeight: 800, letterSpacing: 8, padding: 16, border: "3px solid #eee", borderRadius: 16, outline: "none", fontFamily: "monospace", color: "#333" }} />
      <div style={{ fontSize: 12, color: "#bbb", marginTop: 8, marginBottom: 24 }}>Codes look like: <strong>PJ-K7M2XR</strong></div>
      {code.length === 6 && <button onClick={() => onJoin(code)} style={{ padding: "16px 40px", background: "linear-gradient(135deg, #FF6B6B, #FF8E53)", border: "none", borderRadius: 14, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 15px rgba(255,107,107,0.35)" }}>Join Potluck →</button>}
    </div>
  );
};

// --- POTLUCK DETAILS (date/time/location) ---
const PotluckDetailsScreen = ({ cuisine, onNext }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [name, setName] = useState(`${cuisine.name} Night`);
  return (
    <div style={{ padding: 20 }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 48 }}>{cuisine.emoji}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#333", marginTop: 4 }}>{cuisine.name} Potluck</div>
        <div style={{ fontSize: 13, color: "#999" }}>Set the details for your gathering</div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>Potluck Name</label>
        <input value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "2px solid #eee", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>📅 Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: "100%", padding: "14px 12px", borderRadius: 12, border: "2px solid #eee", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>🕐 Time</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ width: "100%", padding: "14px 12px", borderRadius: 12, border: "2px solid #eee", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
        </div>
      </div>
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>📍 Location</label>
        <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Sarah's house, The park pavilion..." style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "2px solid #eee", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
      </div>
      <button onClick={() => onNext({ name, date, time, location })} style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #FF6B6B, #FF8E53)", border: "none", borderRadius: 14, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 15px rgba(255,107,107,0.35)" }}>Next: Invite Friends →</button>
    </div>
  );
};

// --- THEME PICKER ---
const ThemePickerScreen = ({ onSelectTheme, difficultyFilter, setDifficultyFilter }) => (
  <div style={{ padding: 20 }}>
    <div style={{ fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 4 }}>Pick a Theme</div>
    <div style={{ fontSize: 13, color: "#999", marginBottom: 16 }}>Recipes sourced from top-rated sites</div>
    <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
      {["all", "beginner", "intermediate", "expert"].map(d => (
        <button key={d} onClick={() => setDifficultyFilter(d)} style={{ padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", border: difficultyFilter === d ? "2px solid #FF6B6B" : "2px solid #eee", background: difficultyFilter === d ? "#FFF0F0" : "#fff", color: difficultyFilter === d ? "#FF6B6B" : "#999" }}>{d === "all" ? "All Levels" : d.charAt(0).toUpperCase() + d.slice(1)}</button>
      ))}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {CUISINES.map(c => (
        <button key={c.name} onClick={() => onSelectTheme(c)} style={{ background: "#fff", border: `2px solid ${c.color}30`, borderRadius: 16, padding: "18px 14px", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = c.color; e.currentTarget.style.transform = "scale(1.03)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = c.color + "30"; e.currentTarget.style.transform = "scale(1)"; }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>{c.emoji}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: c.color }}>{c.name}</div>
          <div style={{ fontSize: 10, color: "#bbb", marginTop: 2 }}>{RECIPES[c.name]?.length} recipes</div>
        </button>
      ))}
    </div>
  </div>
);

// --- INVITE FRIENDS + CODE ---
const InviteFriendsScreen = ({ friends, invited, rsvps, onToggle, onNext, potluckCode }) => (
  <div style={{ padding: 20 }}>
    <div style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: 18, padding: "18px 20px", marginBottom: 20, color: "#fff", textAlign: "center" }}>
      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Your Potluck Code</div>
      <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: 6, fontFamily: "monospace", background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 16px", display: "inline-block", marginBottom: 8 }}>PJ-{potluckCode}</div>
      <div style={{ fontSize: 12, opacity: 0.7 }}>Share this code so friends can join!</div>
      <button style={{ marginTop: 10, padding: "10px 20px", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>📋 Copy Code &nbsp;·&nbsp; 📱 Text to Friends</button>
    </div>
    <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 4 }}>Invite from contacts</div>
    <div style={{ fontSize: 12, color: "#999", marginBottom: 14 }}>They can accept or decline from their device</div>
    {friends.map(f => {
      const isInvited = invited.includes(f.name);
      const rsvp = rsvps[f.name];
      return (
        <button key={f.name} onClick={() => !rsvp && onToggle(f.name)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", marginBottom: 8, background: isInvited ? f.color + "12" : "#fff", border: `2px solid ${isInvited ? f.color : "#eee"}`, borderRadius: 14, cursor: rsvp ? "default" : "pointer", transition: "all 0.2s" }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: f.color + "25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{f.avatar}</div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#333" }}>{f.name}</div>
            {rsvp && <div style={{ fontSize: 11, color: rsvp === "accepted" ? "#27AE60" : "#FF6B6B", fontWeight: 600 }}>{rsvp === "accepted" ? "✅ Accepted" : "❌ Declined"}</div>}
          </div>
          {!rsvp && (
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: isInvited ? f.color : "#eee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", transition: "all 0.2s" }}>{isInvited ? "✓" : ""}</div>
          )}
        </button>
      );
    })}
    {invited.length > 0 && (
      <button onClick={onNext} style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #FF6B6B, #FF8E53)", border: "none", borderRadius: 14, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 16, boxShadow: "0 4px 15px rgba(255,107,107,0.35)" }}>Start the Spin! ({invited.filter(n => rsvps[n] !== "declined").length + 1} people) →</button>
    )}
  </div>
);

// --- SPIN WHEEL ---
const SpinWheel = ({ cuisine, guests, onComplete }) => {
  const [spinning, setSpinning] = useState(false);
  const [myRecipe, setMyRecipe] = useState(null);
  const [othersStatus, setOthersStatus] = useState({});
  const [wheelAngle, setWheelAngle] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const recipes = RECIPES[cuisine.name] || RECIPES["Random Mix"];
  const guestObjects = guests.map(n => FRIENDS.find(f => f.name === n) || { name: n, avatar: "👤", color: "#ccc" });
  const spinMyWheel = () => {
    if (spinning) return;
    setSpinning(true);
    const pick = recipes[Math.floor(Math.random() * recipes.length)];
    setWheelAngle(prev => prev + 1440 + Math.random() * 720);
    setTimeout(() => {
      setSpinning(false);
      setMyRecipe(pick);
      guestObjects.forEach((g, i) => {
        setTimeout(() => {
          setOthersStatus(prev => ({ ...prev, [g.name]: { status: "spinning" } }));
          setTimeout(() => {
            const guestPick = recipes[Math.floor(Math.random() * recipes.length)];
            setOthersStatus(prev => ({ ...prev, [g.name]: { status: "done", recipe: guestPick } }));
          }, 1500);
        }, (i + 1) * 1800);
      });
      setTimeout(() => setAllDone(true), (guestObjects.length + 1) * 1800 + 500);
    }, 3000);
  };
  const getAssignments = () => {
    const result = [{ guest: { name: "You (Host)", avatar: "⭐", color: "#FFD700" }, recipe: myRecipe }];
    guestObjects.forEach(g => { if (othersStatus[g.name]?.recipe) result.push({ guest: g, recipe: othersStatus[g.name].recipe }); });
    return result;
  };
  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      {!myRecipe ? (
        <>
          <div style={{ fontSize: 14, color: "#999", marginBottom: 4 }}>Everyone spins from their own device!</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 20 }}>⭐ Your Turn to Spin!</div>
          <div style={{ position: "relative", width: 260, height: 260, margin: "0 auto 24px" }}>
            <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", fontSize: 28, zIndex: 10 }}>▼</div>
            <div style={{ width: 260, height: 260, borderRadius: "50%", background: `conic-gradient(${recipes.map((r, i) => { const colors = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A06CD5", "#FF9F43", "#54A0FF", "#5F27CD", "#1DD1A1"]; return `${colors[i % colors.length]} ${(i / recipes.length) * 100}% ${((i + 1) / recipes.length) * 100}%`; }).join(", ")})`, transform: `rotate(${wheelAngle}deg)`, transition: spinning ? "transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none", boxShadow: "0 8px 30px rgba(0,0,0,0.15), inset 0 0 0 6px rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, position: "absolute" }}>{cuisine.emoji}</div>
            </div>
          </div>
          <button onClick={spinMyWheel} disabled={spinning} style={{ padding: "16px 40px", background: spinning ? "#ccc" : "linear-gradient(135deg, #FF6B6B, #FF8E53)", border: "none", borderRadius: 14, color: "#fff", fontSize: 18, fontWeight: 700, cursor: spinning ? "default" : "pointer", boxShadow: spinning ? "none" : "0 4px 15px rgba(255,107,107,0.35)" }}>{spinning ? "🎰 Spinning..." : "🎰 SPIN!"}</button>
        </>
      ) : (
        <>
          <div style={{ background: "#fff", borderRadius: 18, padding: 20, marginBottom: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 14, color: "#FF6B6B", fontWeight: 700, marginBottom: 6 }}>🎉 YOUR JACKPOT!</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#333", marginBottom: 8 }}>{myRecipe.name}</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 10 }}>
              <Pill bg={DIFFICULTY_COLORS[myRecipe.difficulty].bg} color={DIFFICULTY_COLORS[myRecipe.difficulty].text}>{DIFFICULTY_COLORS[myRecipe.difficulty].label}</Pill>
              <Pill bg="#E8F4FD" color="#2980B9">⏱ {myRecipe.time}</Pill>
              <Pill bg="#FEF3E2" color="#E67E22">⭐ {myRecipe.rating} on {myRecipe.source}</Pill>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <a href={myRecipe.sourceUrl} target="_blank" rel="noreferrer" style={{ padding: "10px 16px", background: "#4ECDC4", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>📖 Recipe</a>
              <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(myRecipe.youtubeQuery)}`} target="_blank" rel="noreferrer" style={{ padding: "10px 16px", background: "#FF0000", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>▶️ YouTube</a>
            </div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 12, textAlign: "left" }}>Waiting for others...</div>
          {guestObjects.map(g => { const s = othersStatus[g.name]; return (
            <div key={g.name} style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", marginBottom: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: g.color + "25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{g.avatar}</div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#333" }}>{g.name}</div>
                <div style={{ fontSize: 12, color: s?.status === "done" ? "#27AE60" : s?.status === "spinning" ? "#F39C12" : "#bbb" }}>{s?.status === "done" ? `✅ ${s.recipe.name}` : s?.status === "spinning" ? "🎰 Spinning..." : "⏳ Waiting..."}</div>
              </div>
            </div>
          ); })}
          {allDone && <button onClick={() => onComplete(getAssignments())} style={{ width: "100%", padding: "16px", marginTop: 16, background: "linear-gradient(135deg, #4ECDC4, #44BD9E)", border: "none", borderRadius: 14, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>🍽️ Everyone's In — View the Menu!</button>}
        </>
      )}
    </div>
  );
};

// --- MY POTLUCK VIEW ---
const MyPotluckScreen = ({ activePotluck, assignments, onViewRecipe, onRate, onGoToFeed }) => {
  const myAssignment = assignments.find(a => a.guest.name === "You (Host)");
  return (
    <div style={{ padding: 20 }}>
      <div style={{ background: `linear-gradient(135deg, ${activePotluck.cuisine.color}10, ${activePotluck.cuisine.color}25)`, borderRadius: 18, padding: "18px 20px", marginBottom: 16, border: `1px solid ${activePotluck.cuisine.color}30` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 36 }}>{activePotluck.cuisine.emoji}</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#333" }}>{activePotluck.name || `${activePotluck.cuisine.name} Potluck`}</div>
            <div style={{ fontSize: 12, color: "#999" }}>Code: PJ-{activePotluck.code}</div>
          </div>
        </div>
        {activePotluck.date && <div style={{ fontSize: 14, color: "#555", marginBottom: 2 }}>📅 {new Date(activePotluck.date + "T00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}{activePotluck.time && ` at ${new Date("2000-01-01T" + activePotluck.time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`}</div>}
        {activePotluck.location && <div style={{ fontSize: 14, color: "#555" }}>📍 {activePotluck.location}</div>}
        {activePotluck.date && activePotluck.time && <div style={{ marginTop: 8, padding: "6px 12px", borderRadius: 8, display: "inline-block", background: "#FF6B6B", color: "#fff", fontSize: 13, fontWeight: 700 }}>⏰ {getCountdownText(activePotluck.date, activePotluck.time)}</div>}
      </div>
      {myAssignment && (
        <div style={{ background: "#fff", borderRadius: 18, padding: 18, marginBottom: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "2px solid #FFE0B2" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#FF6B6B", marginBottom: 6 }}>👩‍🍳 YOUR ASSIGNMENT</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#333", marginBottom: 8 }}>{myAssignment.recipe.name}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <Pill bg={DIFFICULTY_COLORS[myAssignment.recipe.difficulty].bg} color={DIFFICULTY_COLORS[myAssignment.recipe.difficulty].text}>{DIFFICULTY_COLORS[myAssignment.recipe.difficulty].label}</Pill>
            <Pill bg="#E8F4FD" color="#2980B9">⏱ {myAssignment.recipe.time}</Pill>
            <Pill bg="#FEF3E2" color="#E67E22">⭐ {myAssignment.recipe.rating}</Pill>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <a href={myAssignment.recipe.sourceUrl} target="_blank" rel="noreferrer" style={{ flex: 1, padding: 12, background: "#4ECDC4", borderRadius: 12, textAlign: "center", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>📖 Full Recipe</a>
            <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(myAssignment.recipe.youtubeQuery)}`} target="_blank" rel="noreferrer" style={{ flex: 1, padding: 12, background: "#FF0000", borderRadius: 12, textAlign: "center", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>▶️ YouTube</a>
          </div>
        </div>
      )}
      <button onClick={onGoToFeed} style={{ width: "100%", padding: 14, marginBottom: 16, background: "linear-gradient(135deg, #667eea, #764ba2)", border: "none", borderRadius: 14, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>📸 Share a Photo to the Feed</button>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 10 }}>What Everyone's Making</div>
      {assignments.filter(a => a.guest.name !== "You (Host)").map((a, i) => (
        <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", marginBottom: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: a.guest.color + "25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{a.guest.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#333" }}>{a.guest.name}</div>
            <div style={{ fontSize: 13, color: "#FF6B6B", fontWeight: 600 }}>{a.recipe.name}</div>
          </div>
          <button onClick={() => onViewRecipe(a)} style={{ background: "#F8F9FA", border: "none", borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 600, color: "#555", cursor: "pointer" }}>View</button>
        </div>
      ))}
      <button onClick={onRate} style={{ width: "100%", padding: 14, marginTop: 12, background: "linear-gradient(135deg, #A06CD5, #7C4DFF)", border: "none", borderRadius: 14, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>⭐ Rate the Dishes</button>
    </div>
  );
};

// --- RECIPE DETAIL ---
const RecipeDetail = ({ assignment }) => {
  const { recipe, guest } = assignment;
  return (
    <div style={{ padding: 20 }}>
      <div style={{ background: "linear-gradient(135deg, #FFF5F5, #FFF8E1)", borderRadius: 18, padding: "24px 20px", textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 14, color: "#999", marginBottom: 4 }}>Assigned to {guest.name} {guest.avatar}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#333", marginBottom: 10 }}>{recipe.name}</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <Pill bg={DIFFICULTY_COLORS[recipe.difficulty].bg} color={DIFFICULTY_COLORS[recipe.difficulty].text}>{DIFFICULTY_COLORS[recipe.difficulty].label}</Pill>
          <Pill bg="#E8F4FD" color="#2980B9">⏱ {recipe.time}</Pill>
          <Pill bg="#F0E6FF" color="#7C4DFF">🍽 Serves {recipe.servings}</Pill>
        </div>
      </div>
      <div style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 28 }}>⭐</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#333" }}>{recipe.rating} Rating on {recipe.source}</div>
          <div style={{ fontSize: 12, color: "#999" }}>Top-rated community recipe</div>
        </div>
      </div>
      <a href={recipe.sourceUrl} target="_blank" rel="noreferrer" style={{ width: "100%", padding: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "linear-gradient(135deg, #4ECDC4, #44BD9E)", border: "none", borderRadius: 14, color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 10, textDecoration: "none", boxSizing: "border-box" }}>📖 View Full Recipe on {recipe.source}</a>
      <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.youtubeQuery)}`} target="_blank" rel="noreferrer" style={{ width: "100%", padding: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "linear-gradient(135deg, #FF0000, #CC0000)", border: "none", borderRadius: 14, color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 10, textDecoration: "none", boxSizing: "border-box" }}>▶️ Watch YouTube Tutorial</a>
      <button style={{ width: "100%", padding: 14, background: "#fff", border: "2px solid #FF6B6B", borderRadius: 14, color: "#FF6B6B", fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>📸 Share a Photo</button>
      <button style={{ width: "100%", padding: 14, background: "#fff", border: "2px solid #A06CD5", borderRadius: 14, color: "#A06CD5", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>💬 Chat with the Group</button>
    </div>
  );
};

// --- RATING & LEADERBOARD ---
const RatingScreen = ({ assignments, onFinish }) => {
  const [ratings, setRatings] = useState({});
  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 4 }}>Rate the Dishes!</div>
      <div style={{ fontSize: 13, color: "#999", marginBottom: 20 }}>How did everyone do? Tap the stars!</div>
      {assignments.map((a, i) => (
        <div key={i} style={{ background: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 24 }}>{a.guest.avatar}</span>
            <div><div style={{ fontWeight: 700, fontSize: 14, color: "#333" }}>{a.guest.name}</div><div style={{ fontSize: 13, color: "#FF6B6B" }}>{a.recipe.name}</div></div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button key={star} onClick={() => setRatings(p => ({ ...p, [a.guest.name]: star }))} style={{ background: "none", border: "none", fontSize: 28, cursor: "pointer", opacity: (ratings[a.guest.name] || 0) >= star ? 1 : 0.25, transform: (ratings[a.guest.name] || 0) >= star ? "scale(1.1)" : "scale(1)", transition: "all 0.2s" }}>⭐</button>
            ))}
          </div>
        </div>
      ))}
      {Object.keys(ratings).length === assignments.length && (
        <button onClick={() => onFinish(ratings)} style={{ width: "100%", padding: 16, background: "linear-gradient(135deg, #FFD700, #FF8E53)", border: "none", borderRadius: 14, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 12 }}>🏆 See the Winner!</button>
      )}
    </div>
  );
};

const EventLeaderboardScreen = ({ assignments, ratings, onHome }) => {
  const sorted = [...assignments].map(a => ({ ...a, score: ratings[a.guest.name] || 0 })).sort((a, b) => b.score - a.score);
  const trophies = ["🥇", "🥈", "🥉"];
  return (
    <div style={{ padding: 20 }}>
      <div style={{ textAlign: "center", padding: "24px 20px", background: "linear-gradient(135deg, #FFF8E1, #FFF5F5)", borderRadius: 18, marginBottom: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#333" }}>Potluck Champion!</div>
        <div style={{ fontSize: 32, marginTop: 8 }}>{sorted[0].guest.avatar}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#FF6B6B", marginTop: 4 }}>{sorted[0].guest.name}</div>
        <div style={{ fontSize: 14, color: "#777" }}>with {sorted[0].recipe.name}</div>
        <div style={{ fontSize: 22, marginTop: 4 }}>{"⭐".repeat(sorted[0].score)}</div>
      </div>
      {sorted.map((a, i) => (
        <div key={i} style={{ background: i === 0 ? "#FFFDE7" : "#fff", borderRadius: 14, padding: "12px 14px", marginBottom: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 10, border: i === 0 ? "2px solid #FFD700" : "1px solid #f0f0f0" }}>
          <div style={{ fontSize: 22, width: 32, textAlign: "center" }}>{trophies[i] || `#${i + 1}`}</div>
          <span style={{ fontSize: 22 }}>{a.guest.avatar}</span>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 14, color: "#333" }}>{a.guest.name}</div><div style={{ fontSize: 12, color: "#999" }}>{a.recipe.name}</div></div>
          <div style={{ fontSize: 14 }}>{"⭐".repeat(a.score)}</div>
        </div>
      ))}
      <button style={{ width: "100%", padding: 14, background: "#fff", border: "2px solid #4ECDC4", borderRadius: 14, color: "#4ECDC4", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 12 }}>📸 Take a Group Photo!</button>
      <button onClick={onHome} style={{ width: "100%", padding: 16, marginTop: 10, background: "linear-gradient(135deg, #FF6B6B, #FF8E53)", border: "none", borderRadius: 14, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>🎲 Host Another Potluck!</button>
    </div>
  );
};

// --- MAIN APP ---
export default function PotluckJackpot() {
  const [screen, setScreen] = useState("home");
  const [activeTab, setActiveTab] = useState("home");
  const [cuisine, setCuisine] = useState(null);
  const [invited, setInvited] = useState([]);
  const [rsvps, setRsvps] = useState({});
  const [assignments, setAssignments] = useState([]);
  const [ratings, setRatings] = useState({});
  const [viewRecipe, setViewRecipe] = useState(null);
  const [potluckCode, setPotluckCode] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [activePotluck, setActivePotluck] = useState(null);
  const [potluckDetails, setPotluckDetails] = useState({});
  const [selectedPastPotluck, setSelectedPastPotluck] = useState(null);
  const [pastPotlucks] = useState(PAST_POTLUCKS_DATA);

  const potluckName = cuisine ? `${potluckDetails.name || cuisine.name + " Potluck"}` : "";

  const toggleInvite = (name) => {
    setInvited(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
    // Simulate RSVP responses after invite
    if (!rsvps[name]) {
      setTimeout(() => {
        const willAccept = Math.random() > 0.15; // 85% accept rate
        setRsvps(prev => ({ ...prev, [name]: willAccept ? "accepted" : "declined" }));
      }, 1500 + Math.random() * 2000);
    }
  };

  const finishPotluck = () => {
    setActivePotluck(null);
    setScreen("home"); setActiveTab("home");
    setCuisine(null); setInvited([]); setAssignments([]); setRsvps({});
    setRatings({}); setViewRecipe(null); setPotluckDetails({});
  };

  const goHome = () => { setScreen("home"); setActiveTab("home"); setViewRecipe(null); setSelectedPastPotluck(null); };

  const goBack = () => {
    if (viewRecipe) { setViewRecipe(null); return; }
    if (selectedPastPotluck) { setSelectedPastPotluck(null); setScreen("home"); return; }
    const map = { joinCode: "home", theme: "home", details: "theme", invite: "details", spin: "invite", myPotluck: "home", rate: "myPotluck", eventLeaderboard: "rate", feed: "home", friends: "home", community: "home", rsvp: "home", declined: "home", pastRecap: "home", rankings: "home" };
    setScreen(map[screen] || "home");
    if (map[screen] === "home") setActiveTab("home");
  };

  const handleTab = (tab) => {
    setActiveTab(tab); setViewRecipe(null); setSelectedPastPotluck(null);
    if (tab === "home") goHome();
    else if (tab === "feed") setScreen("feed");
    else if (tab === "friends") setScreen("friends");
    else if (tab === "rankings") setScreen("rankings");
  };

  const handleSpinComplete = (a) => {
    setAssignments(a);
    const myRecipe = a.find(x => x.guest.name === "You (Host)")?.recipe;
    setActivePotluck({ cuisine, code: potluckCode, guestCount: a.length, myRecipe, date: potluckDetails.date, time: potluckDetails.time, location: potluckDetails.location, name: potluckDetails.name });
    setScreen("myPotluck");
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", minHeight: "100vh", background: "#F8F9FA", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", position: "relative", boxShadow: "0 0 40px rgba(0,0,0,0.08)" }}>
      <Header screen={screen} onBack={goBack} potluckName={potluckName} />
      <div style={{ paddingBottom: 70 }}>
        {viewRecipe ? <RecipeDetail assignment={viewRecipe} />
        : selectedPastPotluck ? <PastPotluckRecap potluck={selectedPastPotluck} />
        : screen === "home" ? <HomeScreen onCreatePotluck={() => { setPotluckCode(generateCode()); setScreen("theme"); }} onJoinPotluck={() => setScreen("joinCode")} onCommunity={() => setScreen("community")} pastPotlucks={pastPotlucks} activePotluck={activePotluck} onOpenActivePotluck={() => setScreen("myPotluck")} onOpenPastPotluck={(p) => { setSelectedPastPotluck(p); setScreen("pastRecap"); }} />
        : screen === "joinCode" ? <JoinCodeScreen onJoin={(code) => { setPotluckCode(code); setScreen("rsvp"); }} />
        : screen === "rsvp" ? <RsvpScreen potluck={{ cuisine: CUISINES[3], name: "Chinese Feast", date: "2026-04-12", time: "18:00", location: "Marcus's Place", code: potluckCode, guestCount: 5, hostName: "Marcus" }} onAccept={() => setScreen("theme")} onDecline={() => setScreen("declined")} />
        : screen === "declined" ? <DeclinedScreen onHome={goHome} />
        : screen === "community" ? <CommunityScreen onJoinCommunity={(cp) => { setCuisine(cp.cuisine); setPotluckCode(generateCode()); setScreen("rsvp"); }} />
        : screen === "feed" ? <FeedScreen />
        : screen === "friends" ? <FriendsScreen onInvite={(name) => alert(`Invitation sent to ${name}!`)} />
        : screen === "rankings" ? <RankingsScreen />
        : screen === "theme" ? <ThemePickerScreen onSelectTheme={(c) => { setCuisine(c); setScreen("details"); }} difficultyFilter={difficultyFilter} setDifficultyFilter={setDifficultyFilter} />
        : screen === "details" ? <PotluckDetailsScreen cuisine={cuisine} onNext={(d) => { setPotluckDetails(d); setScreen("invite"); }} />
        : screen === "invite" ? <InviteFriendsScreen friends={FRIENDS} invited={invited} rsvps={rsvps} onToggle={toggleInvite} onNext={() => setScreen("spin")} potluckCode={potluckCode} />
        : screen === "spin" ? <SpinWheel cuisine={cuisine} guests={invited.filter(n => rsvps[n] !== "declined")} onComplete={handleSpinComplete} />
        : screen === "myPotluck" ? <MyPotluckScreen activePotluck={activePotluck} assignments={assignments} onViewRecipe={(a) => setViewRecipe(a)} onRate={() => setScreen("rate")} onGoToFeed={() => { setScreen("feed"); setActiveTab("feed"); }} />
        : screen === "rate" ? <RatingScreen assignments={assignments} onFinish={(r) => { setRatings(r); setScreen("eventLeaderboard"); }} />
        : screen === "eventLeaderboard" ? <EventLeaderboardScreen assignments={assignments} ratings={ratings} onHome={finishPotluck} />
        : null}
      </div>
      <BottomNav activeTab={activeTab} onTab={handleTab} />
    </div>
  );
}
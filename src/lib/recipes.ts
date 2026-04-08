/**
 * Recipe Search Logic
 *
 * Provides recipes by cuisine theme. Uses a built-in recipe database
 * so we don't need an external API key to get started. Each recipe
 * includes a name, source URL, difficulty, cook time, and a YouTube
 * search query so users can find video tutorials.
 *
 * In the future, this can be extended to call external APIs like
 * Edamam, Spoonacular, or TheMealDB for more variety.
 */

export interface Recipe {
  name: string
  url: string
  source: string
  difficulty: 'Beginner' | 'Intermediate' | 'Expert'
  time: string
  youtubeQuery: string
}

// Built-in recipe database organized by cuisine theme
// Each cuisine has a good mix of difficulty levels
const RECIPE_DATABASE: Record<string, Recipe[]> = {
  'American Classic': [
    { name: 'Classic Cheeseburgers', url: 'https://www.allrecipes.com/recipe/25473/the-perfect-basic-burger/', source: 'AllRecipes', difficulty: 'Beginner', time: '30 min', youtubeQuery: 'classic cheeseburger recipe' },
    { name: 'Mac and Cheese', url: 'https://www.allrecipes.com/recipe/11679/homemade-mac-and-cheese/', source: 'AllRecipes', difficulty: 'Beginner', time: '35 min', youtubeQuery: 'homemade mac and cheese recipe' },
    { name: 'BBQ Pulled Pork', url: 'https://www.allrecipes.com/recipe/92462/slow-cooker-texas-pulled-pork/', source: 'AllRecipes', difficulty: 'Intermediate', time: '8 hrs', youtubeQuery: 'BBQ pulled pork slow cooker recipe' },
    { name: 'Buffalo Chicken Wings', url: 'https://www.allrecipes.com/recipe/187822/baked-buffalo-chicken-wings/', source: 'AllRecipes', difficulty: 'Beginner', time: '45 min', youtubeQuery: 'buffalo chicken wings recipe' },
    { name: 'New England Clam Chowder', url: 'https://www.allrecipes.com/recipe/12010/new-england-clam-chowder/', source: 'AllRecipes', difficulty: 'Intermediate', time: '1 hr', youtubeQuery: 'new england clam chowder recipe' },
    { name: 'Southern Fried Chicken', url: 'https://www.allrecipes.com/recipe/8392/breaded-chicken-fingers/', source: 'AllRecipes', difficulty: 'Intermediate', time: '1.5 hrs', youtubeQuery: 'southern fried chicken recipe' },
    { name: 'Smoked Brisket', url: 'https://www.allrecipes.com/recipe/257948/simple-beef-brisket/', source: 'AllRecipes', difficulty: 'Expert', time: '12 hrs', youtubeQuery: 'smoked brisket recipe beginner' },
    { name: 'Apple Pie', url: 'https://www.allrecipes.com/recipe/12682/apple-pie-by-grandma-ople/', source: 'AllRecipes', difficulty: 'Intermediate', time: '2 hrs', youtubeQuery: 'homemade apple pie recipe' },
  ],
  'Italian': [
    { name: 'Spaghetti Carbonara', url: 'https://www.allrecipes.com/recipe/11973/spaghetti-carbonara-ii/', source: 'AllRecipes', difficulty: 'Beginner', time: '25 min', youtubeQuery: 'spaghetti carbonara recipe authentic' },
    { name: 'Margherita Pizza', url: 'https://www.allrecipes.com/recipe/258268/simple-margherita-pizza/', source: 'AllRecipes', difficulty: 'Intermediate', time: '1.5 hrs', youtubeQuery: 'margherita pizza recipe from scratch' },
    { name: 'Chicken Parmesan', url: 'https://www.allrecipes.com/recipe/223042/chicken-parmesan/', source: 'AllRecipes', difficulty: 'Intermediate', time: '45 min', youtubeQuery: 'chicken parmesan recipe' },
    { name: 'Tiramisu', url: 'https://www.allrecipes.com/recipe/21412/tiramisu-ii/', source: 'AllRecipes', difficulty: 'Intermediate', time: '4 hrs', youtubeQuery: 'tiramisu recipe easy' },
    { name: 'Bruschetta', url: 'https://www.allrecipes.com/recipe/12898/bruschetta/', source: 'AllRecipes', difficulty: 'Beginner', time: '15 min', youtubeQuery: 'bruschetta recipe' },
    { name: 'Risotto ai Funghi', url: 'https://www.allrecipes.com/recipe/85389/gourmet-mushroom-risotto/', source: 'AllRecipes', difficulty: 'Intermediate', time: '45 min', youtubeQuery: 'mushroom risotto recipe' },
    { name: 'Lasagna Bolognese', url: 'https://www.allrecipes.com/recipe/23600/worlds-best-lasagna/', source: 'AllRecipes', difficulty: 'Expert', time: '3 hrs', youtubeQuery: 'lasagna bolognese recipe from scratch' },
    { name: 'Caprese Salad', url: 'https://www.allrecipes.com/recipe/21235/insalata-caprese-ii/', source: 'AllRecipes', difficulty: 'Beginner', time: '10 min', youtubeQuery: 'caprese salad recipe' },
  ],
  'Mexican': [
    { name: 'Street Tacos al Pastor', url: 'https://www.allrecipes.com/recipe/257641/tacos-al-pastor/', source: 'AllRecipes', difficulty: 'Intermediate', time: '1 hr', youtubeQuery: 'tacos al pastor recipe' },
    { name: 'Chicken Enchiladas', url: 'https://www.allrecipes.com/recipe/8900/chicken-enchiladas-ii/', source: 'AllRecipes', difficulty: 'Beginner', time: '45 min', youtubeQuery: 'chicken enchiladas recipe easy' },
    { name: 'Fresh Guacamole', url: 'https://www.allrecipes.com/recipe/14231/best-guacamole/', source: 'AllRecipes', difficulty: 'Beginner', time: '10 min', youtubeQuery: 'fresh guacamole recipe' },
    { name: 'Beef Birria Tacos', url: 'https://www.allrecipes.com/recipe/282427/birria-tacos/', source: 'AllRecipes', difficulty: 'Expert', time: '4 hrs', youtubeQuery: 'birria tacos recipe' },
    { name: 'Chicken Tamales', url: 'https://www.allrecipes.com/recipe/34759/real-homemade-tamales/', source: 'AllRecipes', difficulty: 'Expert', time: '5 hrs', youtubeQuery: 'chicken tamales recipe from scratch' },
    { name: 'Churros with Chocolate', url: 'https://www.allrecipes.com/recipe/24700/churros/', source: 'AllRecipes', difficulty: 'Intermediate', time: '1 hr', youtubeQuery: 'churros recipe with chocolate sauce' },
    { name: 'Pozole Rojo', url: 'https://www.allrecipes.com/recipe/72977/pozole-rojo/', source: 'AllRecipes', difficulty: 'Intermediate', time: '2.5 hrs', youtubeQuery: 'pozole rojo recipe' },
    { name: 'Elote (Mexican Street Corn)', url: 'https://www.allrecipes.com/recipe/262501/mexican-street-corn-esquites/', source: 'AllRecipes', difficulty: 'Beginner', time: '20 min', youtubeQuery: 'elote mexican street corn recipe' },
  ],
  'Chinese': [
    { name: 'Kung Pao Chicken', url: 'https://www.allrecipes.com/recipe/91499/kung-pao-chicken/', source: 'AllRecipes', difficulty: 'Intermediate', time: '30 min', youtubeQuery: 'kung pao chicken recipe' },
    { name: 'Pork Fried Rice', url: 'https://www.allrecipes.com/recipe/79543/chinese-pork-fried-rice/', source: 'AllRecipes', difficulty: 'Beginner', time: '25 min', youtubeQuery: 'pork fried rice recipe' },
    { name: 'Mapo Tofu', url: 'https://www.allrecipes.com/recipe/46822/the-best-szechwan-mapo-doufu/', source: 'AllRecipes', difficulty: 'Intermediate', time: '30 min', youtubeQuery: 'mapo tofu recipe authentic' },
    { name: 'Pork Dumplings', url: 'https://www.allrecipes.com/recipe/88240/chinese-pork-dumplings/', source: 'AllRecipes', difficulty: 'Expert', time: '2 hrs', youtubeQuery: 'pork dumplings recipe from scratch' },
    { name: 'Sweet and Sour Pork', url: 'https://www.allrecipes.com/recipe/22458/sweet-and-sour-pork-iii/', source: 'AllRecipes', difficulty: 'Intermediate', time: '45 min', youtubeQuery: 'sweet and sour pork recipe' },
    { name: 'Hot and Sour Soup', url: 'https://www.allrecipes.com/recipe/18839/chinese-hot-and-sour-soup/', source: 'AllRecipes', difficulty: 'Beginner', time: '30 min', youtubeQuery: 'hot and sour soup recipe' },
    { name: 'Peking Duck', url: 'https://www.allrecipes.com/recipe/22511/hoisin-duck-wraps/', source: 'AllRecipes', difficulty: 'Expert', time: '24 hrs', youtubeQuery: 'peking duck recipe at home' },
    { name: 'Chow Mein', url: 'https://www.allrecipes.com/recipe/23866/lo-mein-noodles/', source: 'AllRecipes', difficulty: 'Beginner', time: '20 min', youtubeQuery: 'chow mein recipe easy' },
  ],
  'Greek': [
    { name: 'Moussaka', url: 'https://www.allrecipes.com/recipe/18349/moussaka/', source: 'AllRecipes', difficulty: 'Expert', time: '2.5 hrs', youtubeQuery: 'moussaka recipe authentic greek' },
    { name: 'Chicken Souvlaki', url: 'https://www.allrecipes.com/recipe/172704/chicken-souvlaki/', source: 'AllRecipes', difficulty: 'Beginner', time: '40 min', youtubeQuery: 'chicken souvlaki recipe' },
    { name: 'Spanakopita', url: 'https://www.allrecipes.com/recipe/14541/the-best-spinach-and-feta-pie/', source: 'AllRecipes', difficulty: 'Intermediate', time: '1.5 hrs', youtubeQuery: 'spanakopita recipe' },
    { name: 'Greek Salad', url: 'https://www.allrecipes.com/recipe/14373/greek-salad-i/', source: 'AllRecipes', difficulty: 'Beginner', time: '15 min', youtubeQuery: 'greek salad recipe authentic' },
    { name: 'Baklava', url: 'https://www.allrecipes.com/recipe/9454/greek-baklava/', source: 'AllRecipes', difficulty: 'Intermediate', time: '1.5 hrs', youtubeQuery: 'baklava recipe' },
    { name: 'Gyros with Tzatziki', url: 'https://www.allrecipes.com/recipe/100080/lamb-gyros/', source: 'AllRecipes', difficulty: 'Intermediate', time: '1 hr', youtubeQuery: 'gyros recipe with tzatziki' },
    { name: 'Pastitsio', url: 'https://www.allrecipes.com/recipe/72404/pastitsio-greek-lasagna/', source: 'AllRecipes', difficulty: 'Expert', time: '2 hrs', youtubeQuery: 'pastitsio recipe greek lasagna' },
    { name: 'Dolmades (Stuffed Grape Leaves)', url: 'https://www.allrecipes.com/recipe/23459/dolmades-stuffed-grape-leaves/', source: 'AllRecipes', difficulty: 'Intermediate', time: '1.5 hrs', youtubeQuery: 'dolmades stuffed grape leaves recipe' },
  ],
  'Japanese': [
    { name: 'Chicken Katsu Curry', url: 'https://www.allrecipes.com/recipe/72068/chicken-katsu/', source: 'AllRecipes', difficulty: 'Intermediate', time: '45 min', youtubeQuery: 'chicken katsu curry recipe' },
    { name: 'Miso Ramen', url: 'https://www.allrecipes.com/recipe/234394/miso-ramen/', source: 'AllRecipes', difficulty: 'Intermediate', time: '1.5 hrs', youtubeQuery: 'miso ramen recipe from scratch' },
    { name: 'California Rolls', url: 'https://www.allrecipes.com/recipe/22935/california-roll-sushi/', source: 'AllRecipes', difficulty: 'Intermediate', time: '1 hr', youtubeQuery: 'california roll sushi recipe' },
    { name: 'Teriyaki Salmon', url: 'https://www.allrecipes.com/recipe/228285/teriyaki-salmon/', source: 'AllRecipes', difficulty: 'Beginner', time: '25 min', youtubeQuery: 'teriyaki salmon recipe' },
    { name: 'Gyoza (Pan-Fried Dumplings)', url: 'https://www.allrecipes.com/recipe/236843/gyoza-japanese-potstickers/', source: 'AllRecipes', difficulty: 'Intermediate', time: '1 hr', youtubeQuery: 'gyoza recipe japanese dumplings' },
    { name: 'Tonkotsu Ramen', url: 'https://www.allrecipes.com/recipe/240890/tonkotsu-ramen/', source: 'AllRecipes', difficulty: 'Expert', time: '12 hrs', youtubeQuery: 'tonkotsu ramen recipe from scratch' },
    { name: 'Onigiri (Rice Balls)', url: 'https://www.allrecipes.com/recipe/140422/onigiri-japanese-rice-balls/', source: 'AllRecipes', difficulty: 'Beginner', time: '30 min', youtubeQuery: 'onigiri rice balls recipe' },
    { name: 'Tempura Vegetables', url: 'https://www.allrecipes.com/recipe/61404/tempura-vegetables/', source: 'AllRecipes', difficulty: 'Beginner', time: '30 min', youtubeQuery: 'tempura vegetables recipe' },
  ],
  'Indian': [
    { name: 'Butter Chicken', url: 'https://www.allrecipes.com/recipe/141169/indian-butter-chicken-murgh-makhani/', source: 'AllRecipes', difficulty: 'Intermediate', time: '1 hr', youtubeQuery: 'butter chicken recipe' },
    { name: 'Chicken Tikka Masala', url: 'https://www.allrecipes.com/recipe/45736/chicken-tikka-masala/', source: 'AllRecipes', difficulty: 'Intermediate', time: '1.5 hrs', youtubeQuery: 'chicken tikka masala recipe' },
    { name: 'Naan Bread', url: 'https://www.allrecipes.com/recipe/14565/naan/', source: 'AllRecipes', difficulty: 'Intermediate', time: '2 hrs', youtubeQuery: 'naan bread recipe easy' },
    { name: 'Dal Tadka (Lentil Curry)', url: 'https://www.allrecipes.com/recipe/236564/pressure-cooker-indian-dal/', source: 'AllRecipes', difficulty: 'Beginner', time: '40 min', youtubeQuery: 'dal tadka recipe' },
    { name: 'Samosas', url: 'https://www.allrecipes.com/recipe/33284/amazing-samosas/', source: 'AllRecipes', difficulty: 'Expert', time: '2 hrs', youtubeQuery: 'samosa recipe from scratch' },
    { name: 'Palak Paneer', url: 'https://www.allrecipes.com/recipe/229293/palak-paneer/', source: 'AllRecipes', difficulty: 'Intermediate', time: '45 min', youtubeQuery: 'palak paneer recipe' },
    { name: 'Biryani', url: 'https://www.allrecipes.com/recipe/70191/indian-chicken-biryani/', source: 'AllRecipes', difficulty: 'Expert', time: '2.5 hrs', youtubeQuery: 'chicken biryani recipe' },
    { name: 'Mango Lassi', url: 'https://www.allrecipes.com/recipe/30543/mango-lassi/', source: 'AllRecipes', difficulty: 'Beginner', time: '5 min', youtubeQuery: 'mango lassi recipe' },
  ],
  'French': [
    { name: 'Coq au Vin', url: 'https://www.allrecipes.com/recipe/221099/coq-au-vin/', source: 'AllRecipes', difficulty: 'Expert', time: '2.5 hrs', youtubeQuery: 'coq au vin recipe' },
    { name: 'French Onion Soup', url: 'https://www.allrecipes.com/recipe/13309/rich-and-simple-french-onion-soup/', source: 'AllRecipes', difficulty: 'Intermediate', time: '1.5 hrs', youtubeQuery: 'french onion soup recipe' },
    { name: 'Crêpes', url: 'https://www.allrecipes.com/recipe/16383/basic-crepes/', source: 'AllRecipes', difficulty: 'Beginner', time: '30 min', youtubeQuery: 'french crepes recipe' },
    { name: 'Quiche Lorraine', url: 'https://www.allrecipes.com/recipe/18082/quiche-lorraine-i/', source: 'AllRecipes', difficulty: 'Intermediate', time: '1 hr', youtubeQuery: 'quiche lorraine recipe' },
    { name: 'Beef Bourguignon', url: 'https://www.allrecipes.com/recipe/21545/beef-bourguignon-i/', source: 'AllRecipes', difficulty: 'Expert', time: '3 hrs', youtubeQuery: 'beef bourguignon recipe' },
    { name: 'Ratatouille', url: 'https://www.allrecipes.com/recipe/222006/disneys-ratatouille/', source: 'AllRecipes', difficulty: 'Intermediate', time: '1 hr', youtubeQuery: 'ratatouille recipe' },
    { name: 'Crème Brûlée', url: 'https://www.allrecipes.com/recipe/24914/creme-brulee/', source: 'AllRecipes', difficulty: 'Intermediate', time: '5 hrs', youtubeQuery: 'creme brulee recipe' },
    { name: 'Croissants', url: 'https://www.allrecipes.com/recipe/6804/easy-croissants/', source: 'AllRecipes', difficulty: 'Expert', time: '12 hrs', youtubeQuery: 'croissants recipe from scratch' },
  ],
  'Thai': [
    { name: 'Pad Thai', url: 'https://www.allrecipes.com/recipe/42518/easy-pad-thai/', source: 'AllRecipes', difficulty: 'Intermediate', time: '30 min', youtubeQuery: 'pad thai recipe authentic' },
    { name: 'Green Curry', url: 'https://www.allrecipes.com/recipe/228862/quick-thai-green-curry/', source: 'AllRecipes', difficulty: 'Beginner', time: '30 min', youtubeQuery: 'thai green curry recipe' },
    { name: 'Tom Yum Soup', url: 'https://www.allrecipes.com/recipe/228061/authentic-tom-yum-soup/', source: 'AllRecipes', difficulty: 'Beginner', time: '25 min', youtubeQuery: 'tom yum soup recipe' },
    { name: 'Massaman Curry', url: 'https://www.allrecipes.com/recipe/72144/massaman-curry/', source: 'AllRecipes', difficulty: 'Intermediate', time: '1.5 hrs', youtubeQuery: 'massaman curry recipe' },
    { name: 'Thai Basil Chicken (Pad Krapow)', url: 'https://www.allrecipes.com/recipe/257938/easy-thai-basil-chicken-pad-krapow-gai/', source: 'AllRecipes', difficulty: 'Beginner', time: '20 min', youtubeQuery: 'pad krapow thai basil chicken recipe' },
    { name: 'Mango Sticky Rice', url: 'https://www.allrecipes.com/recipe/150313/thai-sweet-sticky-rice-with-mango-khao-neeo-mamuang/', source: 'AllRecipes', difficulty: 'Intermediate', time: '1.5 hrs', youtubeQuery: 'mango sticky rice recipe' },
    { name: 'Larb (Thai Meat Salad)', url: 'https://www.allrecipes.com/recipe/237497/thai-larb/', source: 'AllRecipes', difficulty: 'Beginner', time: '20 min', youtubeQuery: 'larb recipe thai meat salad' },
    { name: 'Red Curry with Shrimp', url: 'https://www.allrecipes.com/recipe/175245/thai-red-curry-with-shrimp/', source: 'AllRecipes', difficulty: 'Intermediate', time: '30 min', youtubeQuery: 'thai red curry shrimp recipe' },
  ],
}

/**
 * Get a random recipe for a given cuisine theme.
 * If "Random Mix" is selected, picks from all cuisines.
 * Can optionally filter by difficulty level.
 */
export function getRandomRecipe(
  cuisine: string,
  difficulty?: 'Beginner' | 'Intermediate' | 'Expert',
  excludeNames?: string[]
): Recipe {
  let pool: Recipe[]

  if (cuisine === 'Random Mix') {
    // Combine all cuisines
    pool = Object.values(RECIPE_DATABASE).flat()
  } else {
    pool = RECIPE_DATABASE[cuisine] || RECIPE_DATABASE['American Classic']
  }

  // Filter by difficulty if specified
  if (difficulty) {
    const filtered = pool.filter(r => r.difficulty === difficulty)
    if (filtered.length > 0) pool = filtered
  }

  // Exclude recipes already assigned to other members
  if (excludeNames && excludeNames.length > 0) {
    const filtered = pool.filter(r => !excludeNames.includes(r.name))
    if (filtered.length > 0) pool = filtered
  }

  // Pick a random recipe from the remaining pool
  const index = Math.floor(Math.random() * pool.length)
  return pool[index]
}

/**
 * Get all recipes for a cuisine (used by the spin wheel to show options)
 */
export function getRecipesForCuisine(cuisine: string): Recipe[] {
  if (cuisine === 'Random Mix') {
    return Object.values(RECIPE_DATABASE).flat()
  }
  return RECIPE_DATABASE[cuisine] || RECIPE_DATABASE['American Classic']
}

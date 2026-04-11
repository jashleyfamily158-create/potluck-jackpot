/**
 * Event Themes Catalog
 *
 * In addition to a cuisine theme, each potluck can optionally have an "event theme"
 * — the vibe, occasion, or dress code that gives the gathering personality.
 *
 * Themes are organized into categories so the picker can show them grouped, and
 * each one has an emoji, brand color, short tagline, and a few example dish ideas
 * (so guests get inspiration even before they spin the recipe wheel).
 */

export interface EventTheme {
  name: string
  emoji: string
  color: string
  category: EventCategory
  tagline: string
  ideas: string[]      // dish or activity ideas to inspire guests
  dressCode?: string   // optional outfit suggestion for extra fun
}

export type EventCategory =
  | 'Holidays'
  | 'Sports & Game Day'
  | 'Game Night'
  | 'Movies & TV'
  | 'Decades & Eras'
  | 'Vibes & Atmosphere'
  | 'Course-Focused'
  | 'Competition'
  | 'Around the World'
  | 'Quirky & Whimsical'

export const EVENT_CATEGORIES: { name: EventCategory; emoji: string }[] = [
  { name: 'Holidays',           emoji: '🎄' },
  { name: 'Sports & Game Day',  emoji: '⚾' },
  { name: 'Game Night',         emoji: '🎲' },
  { name: 'Movies & TV',        emoji: '🎬' },
  { name: 'Decades & Eras',     emoji: '🕰️' },
  { name: 'Vibes & Atmosphere', emoji: '🌴' },
  { name: 'Course-Focused',     emoji: '🍽️' },
  { name: 'Competition',        emoji: '🏆' },
  { name: 'Around the World',   emoji: '🌍' },
  { name: 'Quirky & Whimsical', emoji: '🎩' },
]

export const EVENT_THEMES: EventTheme[] = [
  // ─── 🎄 HOLIDAYS ─────────────────────────────────────────────────────────────
  { name: 'Christmas Cookie Swap',  emoji: '🎄', color: '#C0392B', category: 'Holidays',
    tagline: "Bring a dozen, leave with a dozen — Santa-approved.",
    ideas: ['Sugar cookies', 'Gingerbread', 'Snickerdoodles', 'Hot cocoa bar'],
    dressCode: 'Ugly sweaters encouraged' },
  { name: 'Easter Brunch',          emoji: '🐰', color: '#F1C40F', category: 'Holidays',
    tagline: "Pastel everything and a hidden egg or three.",
    ideas: ['Deviled eggs', 'Honey ham', 'Carrot cake', 'Mimosas'] },
  { name: 'Friendsgiving',          emoji: '🦃', color: '#D35400', category: 'Holidays',
    tagline: "All the gratitude, none of the family drama.",
    ideas: ['Roast turkey', 'Stuffing', 'Cranberry sauce', 'Pumpkin pie'] },
  { name: 'Halloween Spooktacular', emoji: '🎃', color: '#FF6B00', category: 'Holidays',
    tagline: "Costumes mandatory. Candy negotiable.",
    ideas: ['Witches\' brew punch', 'Mummy hot dogs', 'Eyeball cake pops'],
    dressCode: 'Costumes required' },
  { name: "Valentine's Sweethearts", emoji: '💘', color: '#E91E63', category: 'Holidays',
    tagline: "Red, pink, and a little bit cheesy.",
    ideas: ['Heart-shaped pizza', 'Chocolate fondue', 'Strawberry shortcake'] },
  { name: "New Year's Eve Bash",    emoji: '🎆', color: '#FFD700', category: 'Holidays',
    tagline: "Champagne, sparklers, and big resolutions.",
    ideas: ['Cocktail shrimp', 'Champagne towers', 'Midnight snacks'],
    dressCode: 'Glitter & gold' },
  { name: "St. Patrick's Day",      emoji: '🍀', color: '#27AE60', category: 'Holidays',
    tagline: "Wear green or get pinched.",
    ideas: ['Corned beef', 'Shepherd\'s pie', 'Soda bread', 'Green beer'] },
  { name: '4th of July Cookout',    emoji: '🎇', color: '#3498DB', category: 'Holidays',
    tagline: "Stars, stripes, and serious BBQ.",
    ideas: ['Burgers', 'Watermelon', 'Apple pie', 'Red, white & blue parfaits'] },
  { name: 'Cinco de Mayo Fiesta',   emoji: '🪅', color: '#F39C12', category: 'Holidays',
    tagline: "Tacos, margaritas, mariachi.",
    ideas: ['Street tacos', 'Guac bar', 'Margaritas', 'Churros'] },
  { name: 'Hanukkah Celebration',   emoji: '🕎', color: '#2980B9', category: 'Holidays',
    tagline: "Eight crazy nights, one great potluck.",
    ideas: ['Latkes', 'Brisket', 'Sufganiyot', 'Matzo ball soup'] },
  { name: 'Lunar New Year',         emoji: '🧧', color: '#C0392B', category: 'Holidays',
    tagline: "Red envelopes and lucky dumplings.",
    ideas: ['Dumplings', 'Long-life noodles', 'Spring rolls', 'Sticky rice cake'] },
  { name: 'Mardi Gras',             emoji: '🎭', color: '#8E44AD', category: 'Holidays',
    tagline: "Beads, brass bands, and king cake.",
    ideas: ['Jambalaya', 'Gumbo', 'Beignets', 'King cake'],
    dressCode: 'Purple, green, and gold' },
  { name: 'Oktoberfest',            emoji: '🍺', color: '#E67E22', category: 'Holidays',
    tagline: "Lederhosen optional, pretzels mandatory.",
    ideas: ['Bratwurst', 'Pretzels', 'Sauerkraut', 'Apple strudel'] },
  { name: 'Diwali Feast',           emoji: '🪔', color: '#F1C40F', category: 'Holidays',
    tagline: "Festival of lights, festival of flavor.",
    ideas: ['Samosas', 'Biryani', 'Gulab jamun', 'Mango lassi'] },

  // ─── ⚾ SPORTS & GAME DAY ────────────────────────────────────────────────────
  { name: 'Take Me Out to the Ballgame', emoji: '⚾', color: '#1565C0', category: 'Sports & Game Day',
    tagline: "Hot dogs, cracker jacks, seventh-inning stretches.",
    ideas: ['Hot dogs', 'Soft pretzels', 'Nachos', 'Cracker Jack'] },
  { name: 'Super Bowl Sunday',     emoji: '🏈', color: '#1A1A1A', category: 'Sports & Game Day',
    tagline: "Wings, dips, and trash-talking the commercials.",
    ideas: ['Buffalo wings', 'Seven-layer dip', 'Chili', 'Pigs in a blanket'] },
  { name: 'March Madness Bracket', emoji: '🏀', color: '#FF6B00', category: 'Sports & Game Day',
    tagline: "Brackets busted by 9pm, friendships tested by 11.",
    ideas: ['Sliders', 'Loaded fries', 'Pretzel bites', 'Beer flights'] },
  { name: 'World Cup Watch Party', emoji: '⚽', color: '#27AE60', category: 'Sports & Game Day',
    tagline: "Pick a team, defend it loudly.",
    ideas: ['Empanadas', 'Fish & chips', 'Bratwurst', 'Pavlova'] },
  { name: 'Tailgate Party',        emoji: '🛻', color: '#E74C3C', category: 'Sports & Game Day',
    tagline: "Cook in the parking lot, eat off the truck bed.",
    ideas: ['Ribs', 'Mac & cheese', 'Coleslaw', 'Cornhole'] },
  { name: 'Olympics Opening',      emoji: '🥇', color: '#FFD700', category: 'Sports & Game Day',
    tagline: "One dish per country — represent!",
    ideas: ['Sushi', 'Pasta', 'Tacos', 'Schnitzel'] },
  { name: 'Boxing Match Night',    emoji: '🥊', color: '#C0392B', category: 'Sports & Game Day',
    tagline: "Round one: appetizers. Round twelve: dessert.",
    ideas: ['Steak bites', 'Stuffed peppers', 'Heavy stews'] },

  // ─── 🎲 GAME NIGHT ──────────────────────────────────────────────────────────
  { name: 'Mafia / Werewolf Night', emoji: '🐺', color: '#5D4037', category: 'Game Night',
    tagline: "Trust no one. Especially the quiet one.",
    ideas: ['Italian sandwiches', 'Cannoli', 'Red wine', 'Dim lighting'] },
  { name: 'Board Game Bonanza',     emoji: '♟️', color: '#34495E', category: 'Game Night',
    tagline: "Settlers, Catan, and snacks for hours.",
    ideas: ['Finger foods', 'Dips', 'Chip bar', 'Energy bites'] },
  { name: 'Poker Night',            emoji: '♠️', color: '#1A1A1A', category: 'Game Night',
    tagline: "Bring chips. Both kinds.",
    ideas: ['Sliders', 'Wings', 'Whiskey sours', 'Pretzels'],
    dressCode: 'Sunglasses & poker faces' },
  { name: 'Casino Royale',          emoji: '🎰', color: '#FFD700', category: 'Game Night',
    tagline: "Vegas vibes, no flight required.",
    ideas: ['Cocktail shrimp', 'Mini steaks', 'Martinis', 'Baked Alaska'],
    dressCode: 'Black tie' },
  { name: 'Trivia Night',           emoji: '🧠', color: '#7C4DFF', category: 'Game Night',
    tagline: "Bring your team and your useless knowledge.",
    ideas: ['Bar food', 'Pub pretzels', 'Beer flights'] },
  { name: 'Murder Mystery Dinner',  emoji: '🔪', color: '#7B1FA2', category: 'Game Night',
    tagline: "Whodunit? Everyone has a motive.",
    ideas: ['Beef Wellington', 'Vintage cocktails', 'Cherries jubilee'],
    dressCode: 'Period costume' },
  { name: 'Karaoke Night',          emoji: '🎤', color: '#E91E63', category: 'Game Night',
    tagline: "Liquid courage and questionable singing.",
    ideas: ['Bao buns', 'Gyoza', 'Edamame', 'Sake'] },
  { name: 'Bingo Night',            emoji: '🎱', color: '#FF5722', category: 'Game Night',
    tagline: "B-12 has never been so exciting.",
    ideas: ['Cocktail meatballs', 'Cheese balls', 'Punch bowl'] },
  { name: 'Charades Championship',  emoji: '🎭', color: '#9B59B6', category: 'Game Night',
    tagline: "No talking. Lots of yelling.",
    ideas: ['Easy finger foods', 'No-mess snacks'] },

  // ─── 🎬 MOVIES & TV ──────────────────────────────────────────────────────────
  { name: 'Oscars Watch Party',     emoji: '🏆', color: '#FFD700', category: 'Movies & TV',
    tagline: "Best Picture predictions on a napkin.",
    ideas: ['Mini bites', 'Champagne', 'Popcorn bar'],
    dressCode: 'Red carpet glam' },
  { name: 'Hogwarts Feast',         emoji: '⚡', color: '#7B1FA2', category: 'Movies & TV',
    tagline: "Butterbeer, pumpkin pasties, and floating candles.",
    ideas: ['Treacle tart', 'Pumpkin juice', 'Butterbeer', 'Cauldron cakes'],
    dressCode: 'House colors' },
  { name: 'Bridgerton Tea',         emoji: '👑', color: '#E91E63', category: 'Movies & TV',
    tagline: "Diamond of the season, dahling.",
    ideas: ['Cucumber sandwiches', 'Scones', 'Petit fours', 'Earl Grey'],
    dressCode: 'Regency formal' },
  { name: 'May the 4th (Star Wars)', emoji: '🚀', color: '#1A237E', category: 'Movies & TV',
    tagline: "Use the fork, Luke.",
    ideas: ['Bantha milk (blue)', 'Wookiee cookies', 'Yoda soda'],
    dressCode: 'Jedi robes' },
  { name: 'Marvel Movie Marathon',  emoji: '🦸', color: '#C0392B', category: 'Movies & TV',
    tagline: "Avengers assemble — at the buffet.",
    ideas: ['Shawarma', 'Asgardian feast', 'Infinity stone cake pops'] },
  { name: '80s Movie Night',        emoji: '📼', color: '#FF1493', category: 'Movies & TV',
    tagline: "Goonies never say die.",
    ideas: ['Pizza bagels', 'Jello salad', 'Tang punch', 'Twinkies'],
    dressCode: 'Neon & leg warmers' },
  { name: 'Disney Princess Tea',    emoji: '👸', color: '#E91E63', category: 'Movies & TV',
    tagline: "Enchanted snacks for everyone.",
    ideas: ['Tea sandwiches', 'Glass slipper cookies', 'Tiana\'s beignets'] },
  { name: 'Studio Ghibli Night',    emoji: '🐉', color: '#4DD0E1', category: 'Movies & TV',
    tagline: "Calcifer cooked it.",
    ideas: ['Bento boxes', 'Onigiri', 'Ramen', 'Howl\'s breakfast'] },
  { name: 'James Bond Night',       emoji: '🕴️', color: '#1A1A1A', category: 'Movies & TV',
    tagline: "Shaken, not stirred.",
    ideas: ['Beluga caviar', 'Vesper martinis', 'Smoked salmon'],
    dressCode: 'Tuxedos & evening gowns' },
  { name: 'The Bear (Kitchen Chaos)', emoji: '🔥', color: '#E74C3C', category: 'Movies & TV',
    tagline: '"Yes chef!" — everyone, all night.',
    ideas: ['Italian beef sandwiches', 'Risotto', 'Tiramisu'] },

  // ─── 🕰️ DECADES & ERAS ──────────────────────────────────────────────────────
  { name: 'Roaring 20s Gatsby',     emoji: '🥂', color: '#FFD700', category: 'Decades & Eras',
    tagline: "Old sport, the bar is over here.",
    ideas: ['Deviled eggs', 'Champagne towers', 'Waldorf salad'],
    dressCode: 'Flapper dresses & suspenders' },
  { name: '50s Diner / Sock Hop',   emoji: '🍦', color: '#E91E63', category: 'Decades & Eras',
    tagline: "Milkshakes, jukebox, poodle skirts.",
    ideas: ['Burgers', 'Milkshakes', 'Onion rings', 'Banana splits'],
    dressCode: 'Greasers & bobby socks' },
  { name: '60s Hippie Love-In',     emoji: '☮️', color: '#FF6B00', category: 'Decades & Eras',
    tagline: "Far out, man. Pass the granola.",
    ideas: ['Granola', 'Veggie wraps', 'Tie-dye cake'],
    dressCode: 'Tie-dye & flower crowns' },
  { name: '70s Disco Inferno',      emoji: '🪩', color: '#FFD700', category: 'Decades & Eras',
    tagline: "Burn baby burn — under the disco ball.",
    ideas: ['Fondue', 'Cheese ball', 'Devilled eggs', 'Pineapple upside-down cake'],
    dressCode: 'Bell bottoms & sequins' },
  { name: '80s Neon Throwback',     emoji: '🕹️', color: '#FF1493', category: 'Decades & Eras',
    tagline: "Big hair, bigger snacks.",
    ideas: ['Bagel bites', 'Ranch dip', 'Tab cola', 'Rice Krispie treats'],
    dressCode: 'Neon & shoulder pads' },
  { name: '90s Nostalgia',          emoji: '📼', color: '#9B59B6', category: 'Decades & Eras',
    tagline: "Pizza Lunchables and Surge.",
    ideas: ['Bagel bites', 'Pizza rolls', 'Dunkaroos', 'Capri Sun'],
    dressCode: 'Flannel & frosted tips' },
  { name: 'Y2K Party',              emoji: '💿', color: '#7C4DFF', category: 'Decades & Eras',
    tagline: "It\'s the end of the world — eat dessert first.",
    ideas: ['Mini quiches', 'Cosmos', 'Crystal Pepsi', 'Y2K cake'],
    dressCode: 'Low rise jeans & velour' },
  { name: 'Medieval Feast',         emoji: '🏰', color: '#5D4037', category: 'Decades & Eras',
    tagline: "Hear ye, hear ye — eat ye, eat ye.",
    ideas: ['Turkey legs', 'Mead', 'Beef stew', 'Bread bowls'],
    dressCode: 'Knights, kings & queens' },
  { name: 'Renaissance Faire',      emoji: '🎻', color: '#8E44AD', category: 'Decades & Eras',
    tagline: "Huzzah! And also... huzzah!",
    ideas: ['Roasted meats', 'Fruit & cheese boards', 'Mead'] },
  { name: 'Victorian Tea',          emoji: '🫖', color: '#7B1FA2', category: 'Decades & Eras',
    tagline: "Pinkies up, dahling.",
    ideas: ['Crumpets', 'Cucumber sandwiches', 'Petit fours', 'Earl Grey'],
    dressCode: 'Lace & top hats' },
  { name: 'Wild West Saloon',       emoji: '🤠', color: '#D35400', category: 'Decades & Eras',
    tagline: "This town ain\'t big enough for both these casseroles.",
    ideas: ['BBQ', 'Cornbread', 'Chili', 'Whiskey'],
    dressCode: 'Cowboy hats & boots' },

  // ─── 🌴 VIBES & ATMOSPHERE ───────────────────────────────────────────────────
  { name: 'Tiki Tropical Luau',     emoji: '🌺', color: '#FF6B00', category: 'Vibes & Atmosphere',
    tagline: "Leis, ukuleles, frozen drinks.",
    ideas: ['Pulled pork sliders', 'Pineapple skewers', 'Mai tais', 'Coconut cake'],
    dressCode: 'Hawaiian shirts & grass skirts' },
  { name: 'Beach Bonfire',          emoji: '🔥', color: '#FF8E53', category: 'Vibes & Atmosphere',
    tagline: "Sand in your shoes, stars overhead.",
    ideas: ['Foil packs', 'Hot dogs', 'S\'mores', 'Beach beers'] },
  { name: 'Cozy Cabin',             emoji: '🏔️', color: '#5D4037', category: 'Vibes & Atmosphere',
    tagline: "Flannel, fireplace, comfort food.",
    ideas: ['Beef stew', 'Cornbread', 'Hot toddy', 'Apple crumble'] },
  { name: 'Garden Party',           emoji: '🌻', color: '#27AE60', category: 'Vibes & Atmosphere',
    tagline: "Fresh flowers, fresh snacks.",
    ideas: ['Tea sandwiches', 'Lemonade', 'Strawberry shortcake'] },
  { name: 'Pool Party',             emoji: '🩱', color: '#4ECDC4', category: 'Vibes & Atmosphere',
    tagline: "Bring sunscreen and salads.",
    ideas: ['Watermelon', 'Pasta salad', 'Frozen drinks', 'Fruit skewers'] },
  { name: 'Rooftop Soirée',         emoji: '🌃', color: '#7C4DFF', category: 'Vibes & Atmosphere',
    tagline: "Skyline, small bites, sparkling wine.",
    ideas: ['Crostini', 'Charcuterie', 'Prosecco', 'Macarons'] },
  { name: 'Black Tie Gala',         emoji: '🎩', color: '#1A1A1A', category: 'Vibes & Atmosphere',
    tagline: "Formal, fabulous, fancy.",
    ideas: ['Hors d\'oeuvres', 'Beef tenderloin', 'Crème brûlée'],
    dressCode: 'Formal attire' },
  { name: 'Pajama Brunch',          emoji: '🥞', color: '#E91E63', category: 'Vibes & Atmosphere',
    tagline: "Stay in your jammies. Bring waffles.",
    ideas: ['Pancakes', 'Waffles', 'Bacon', 'Mimosas'],
    dressCode: 'PJs only' },
  { name: 'Picnic in the Park',     emoji: '🧺', color: '#27AE60', category: 'Vibes & Atmosphere',
    tagline: "Blanket, basket, sunshine.",
    ideas: ['Sandwiches', 'Pasta salad', 'Lemonade', 'Cookies'] },
  { name: 'Speakeasy Prohibition',  emoji: '🥃', color: '#5D4037', category: 'Vibes & Atmosphere',
    tagline: "Knock three times. Password: jackpot.",
    ideas: ['Old fashioneds', 'Deviled eggs', 'Bootleg punch'],
    dressCode: '1920s formal' },
  { name: 'Wine & Cheese Night',    emoji: '🧀', color: '#7B1FA2', category: 'Vibes & Atmosphere',
    tagline: "Each guest brings a bottle and a wedge.",
    ideas: ['Cheese boards', 'Crackers', 'Grapes', 'Quince paste'] },
  { name: 'Tea Party',              emoji: '🍵', color: '#1ABC9C', category: 'Vibes & Atmosphere',
    tagline: "Polite conversation, pristine pastries.",
    ideas: ['Scones', 'Finger sandwiches', 'Petit fours', 'Loose leaf tea'] },

  // ─── 🍽️ COURSE-FOCUSED ──────────────────────────────────────────────────────
  { name: 'Appetizer Night',        emoji: '🥟', color: '#F39C12', category: 'Course-Focused',
    tagline: "Tiny food, big personality.",
    ideas: ['Bruschetta', 'Stuffed mushrooms', 'Spring rolls', 'Cheese board'] },
  { name: 'Dessert Bar',            emoji: '🍰', color: '#E91E63', category: 'Course-Focused',
    tagline: "Skip dinner. Go straight to sugar.",
    ideas: ['Cupcakes', 'Brownies', 'Cheesecake', 'Macarons'] },
  { name: 'Brunch for Dinner',      emoji: '🥞', color: '#FFD700', category: 'Course-Focused',
    tagline: "Pajamas optional. Pancakes mandatory.",
    ideas: ['Eggs benedict', 'Waffles', 'Hash browns', 'Mimosas'] },
  { name: 'Taco Tuesday',           emoji: '🌮', color: '#F39C12', category: 'Course-Focused',
    tagline: "Build-your-own bar. Endless toppings.",
    ideas: ['Carnitas', 'Salsas', 'Guac', 'Margaritas'] },
  { name: 'Pizza Party',            emoji: '🍕', color: '#E74C3C', category: 'Course-Focused',
    tagline: "Everyone brings a slice (or a whole pie).",
    ideas: ['Margherita', 'Pepperoni', 'White pizza', 'Garlic knots'] },
  { name: 'Soup Sunday',            emoji: '🍲', color: '#E67E22', category: 'Course-Focused',
    tagline: "Cozy bowls all afternoon long.",
    ideas: ['Tomato bisque', 'Chili', 'French onion', 'Crusty bread'] },
  { name: 'Salad Bar',              emoji: '🥗', color: '#27AE60', category: 'Course-Focused',
    tagline: "Greens, dressings, and that one fruity one.",
    ideas: ['Caesar', 'Greek', 'Cobb', 'Fruit salad'] },
  { name: 'Charcuterie Showdown',   emoji: '🥓', color: '#8E44AD', category: 'Course-Focused',
    tagline: "Boards, boards, and more boards.",
    ideas: ['Meats', 'Cheeses', 'Olives', 'Honey'] },
  { name: 'Fondue Night',           emoji: '🫕', color: '#FFD700', category: 'Course-Focused',
    tagline: "If you drop it, you owe a song.",
    ideas: ['Cheese fondue', 'Chocolate fondue', 'Bread cubes', 'Fruit'] },
  { name: 'BBQ Cookout',            emoji: '🍖', color: '#C0392B', category: 'Course-Focused',
    tagline: "Smoker on, music up.",
    ideas: ['Ribs', 'Brisket', 'Coleslaw', 'Cornbread'] },
  { name: 'Breakfast Buffet',       emoji: '🍳', color: '#FF8E53', category: 'Course-Focused',
    tagline: "Eggs every which way.",
    ideas: ['Omelet bar', 'Bacon', 'Yogurt parfaits', 'Croissants'] },
  { name: 'Late-Night Snack Attack', emoji: '🍿', color: '#7C4DFF', category: 'Course-Focused',
    tagline: "Past 10pm — anything goes.",
    ideas: ['Pizza rolls', 'Loaded fries', 'Mozz sticks', 'Milkshakes'] },

  // ─── 🏆 COMPETITION ──────────────────────────────────────────────────────────
  { name: 'Iron Chef Battle',       emoji: '⚔️', color: '#C0392B', category: 'Competition',
    tagline: "Secret ingredient revealed at the door.",
    ideas: ['Whatever uses the secret ingredient'] },
  { name: 'Chopped Mystery Box',    emoji: '📦', color: '#34495E', category: 'Competition',
    tagline: "Random ingredients, 30 minutes, go.",
    ideas: ['Use 4 mystery ingredients in one dish'] },
  { name: 'Chili Cook-Off',         emoji: '🌶️', color: '#E74C3C', category: 'Competition',
    tagline: "Heat, beans, and bragging rights.",
    ideas: ['Beef chili', 'White chicken chili', 'Vegan chili'] },
  { name: 'Bake-Off',               emoji: '🧁', color: '#F1C40F', category: 'Competition',
    tagline: "On your marks, get set, BAKE.",
    ideas: ['Layer cake', 'Pies', 'Bread', 'Pastries'] },
  { name: 'Salsa Showdown',         emoji: '🥫', color: '#F39C12', category: 'Competition',
    tagline: "Mild to face-melting — bring your A game.",
    ideas: ['Pico', 'Salsa verde', 'Mango habanero', 'Tortilla chips'] },
  { name: 'Best Dish Wins',         emoji: '🏅', color: '#FFD700', category: 'Competition',
    tagline: "One winner. Eternal glory.",
    ideas: ['Bring your signature dish'] },
  { name: 'Secret Ingredient Challenge', emoji: '🔐', color: '#7B1FA2', category: 'Competition',
    tagline: "Everyone uses the same one. Wildly different results.",
    ideas: ['Build a dish around the secret ingredient'] },

  // ─── 🌍 AROUND THE WORLD ─────────────────────────────────────────────────────
  { name: 'Around the World',       emoji: '🌍', color: '#3498DB', category: 'Around the World',
    tagline: "One dish per country. Passport required.",
    ideas: ['Sushi', 'Pasta', 'Tacos', 'Curry'] },
  { name: 'Bollywood Night',        emoji: '💃', color: '#FF1493', category: 'Around the World',
    tagline: "Sequins, samosas, dance numbers.",
    ideas: ['Samosas', 'Butter chicken', 'Naan', 'Mango lassi'],
    dressCode: 'Bright colors & sparkles' },
  { name: 'Parisian Bistro',        emoji: '🥖', color: '#1ABC9C', category: 'Around the World',
    tagline: "Berets, baguettes, and chanson.",
    ideas: ['Quiche', 'Baguettes', 'Cheese', 'Crème brûlée'] },
  { name: 'Japanese Izakaya',       emoji: '🍶', color: '#8E44AD', category: 'Around the World',
    tagline: "Small plates, sake, and great conversation.",
    ideas: ['Yakitori', 'Edamame', 'Gyoza', 'Sake'] },
  { name: 'Mexican Cantina',        emoji: '🪅', color: '#F39C12', category: 'Around the World',
    tagline: "Margaritas, mariachi, fiesta.",
    ideas: ['Tacos', 'Quesadillas', 'Margaritas', 'Flan'] },
  { name: 'Greek Taverna',          emoji: '🫒', color: '#2980B9', category: 'Around the World',
    tagline: "Opa! Smash a plate (made of paper).",
    ideas: ['Spanakopita', 'Souvlaki', 'Tzatziki', 'Baklava'] },
  { name: 'Hawaiian Luau',          emoji: '🌺', color: '#FF6B00', category: 'Around the World',
    tagline: "Kalua pork and shave ice.",
    ideas: ['Kalua pork', 'Poke', 'Pineapple', 'Mai tais'] },

  // ─── 🎩 QUIRKY & WHIMSICAL ───────────────────────────────────────────────────
  { name: "Pirate's Cove",          emoji: '🏴‍☠️', color: '#1A1A1A', category: 'Quirky & Whimsical',
    tagline: "Yarrr! Where be the rum?",
    ideas: ['Fish & chips', 'Rum punch', 'Treasure cookies'],
    dressCode: 'Pirates ahoy' },
  { name: 'Under the Sea',          emoji: '🐙', color: '#4ECDC4', category: 'Quirky & Whimsical',
    tagline: "Mermaids welcome.",
    ideas: ['Seafood platter', 'Blue cocktails', 'Fish-shaped cookies'] },
  { name: 'Alice in Wonderland',    emoji: '🐇', color: '#E91E63', category: 'Quirky & Whimsical',
    tagline: "Eat me. Drink me. We\'re all mad here.",
    ideas: ['Tea sandwiches', 'Tiered cakes', 'Mismatched teacups'],
    dressCode: 'Costume optional' },
  { name: 'Jurassic Picnic',        emoji: '🦖', color: '#27AE60', category: 'Quirky & Whimsical',
    tagline: "Hold onto your butts.",
    ideas: ['Dino nuggets', 'Fossil cookies', 'Volcano cake'] },
  { name: 'Space Odyssey',          emoji: '🛸', color: '#1A237E', category: 'Quirky & Whimsical',
    tagline: "Out of this world snacks.",
    ideas: ['Galaxy cake', 'Astronaut ice cream', 'Star punch'] },
  { name: 'Hollywood Glam',         emoji: '🎬', color: '#FFD700', category: 'Quirky & Whimsical',
    tagline: "Walk the red carpet to the buffet.",
    ideas: ['Mini bites', 'Champagne', 'Star cookies'],
    dressCode: 'Red carpet' },
  { name: 'Toga Toga!',             emoji: '🏛️', color: '#FFD700', category: 'Quirky & Whimsical',
    tagline: "Drape a sheet. Hail Caesar.",
    ideas: ['Greek salad', 'Grapes', 'Lamb', 'Wine'],
    dressCode: 'Bedsheets & laurels' },
  { name: 'Detective Noir',         emoji: '🕵️', color: '#1A1A1A', category: 'Quirky & Whimsical',
    tagline: "It was a dark and stormy potluck...",
    ideas: ['Whiskey', 'Steak', 'Cigars (chocolate)'] },
  { name: 'Backwards Dinner',       emoji: '🔄', color: '#9B59B6', category: 'Quirky & Whimsical',
    tagline: "Dessert first. Appetizers last. Embrace chaos.",
    ideas: ['Dessert → Mains → Apps → Drinks'] },
  { name: 'White Elephant Party',   emoji: '🎁', color: '#27AE60', category: 'Quirky & Whimsical',
    tagline: "Wrap something weird. Steal something better.",
    ideas: ['Cookies', 'Hot cocoa bar', 'Wrapping paper everywhere'] },
  { name: 'Ugly Sweater Party',     emoji: '🧶', color: '#C0392B', category: 'Quirky & Whimsical',
    tagline: "The uglier the better.",
    ideas: ['Comfort food', 'Hot cocoa', 'Cookies'],
    dressCode: 'The ugliest sweater you own' },
  { name: 'Hot Sauce Hall of Fame', emoji: '🥵', color: '#FF6B00', category: 'Quirky & Whimsical',
    tagline: "Bring your hottest. Bring milk.",
    ideas: ['Wings', 'Tacos', 'Anything that needs heat'] },
  { name: 'Color-Coded Dinner',     emoji: '🎨', color: '#7C4DFF', category: 'Quirky & Whimsical',
    tagline: "Pick a color. Every dish must match.",
    ideas: ['Beet everything', 'Yellow everything', 'Green everything'] },
]

/**
 * Get themes filtered by category. Pass null for all themes.
 */
export function getThemesByCategory(category: EventCategory | null): EventTheme[] {
  if (!category) return EVENT_THEMES
  return EVENT_THEMES.filter(t => t.category === category)
}

/**
 * Search themes by name, tagline, or category.
 */
export function searchThemes(query: string): EventTheme[] {
  if (!query.trim()) return EVENT_THEMES
  const q = query.toLowerCase()
  return EVENT_THEMES.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.tagline.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q)
  )
}

/**
 * Pick a random theme — used by the slot machine.
 */
export function randomTheme(): EventTheme {
  return EVENT_THEMES[Math.floor(Math.random() * EVENT_THEMES.length)]
}

/**
 * Look up a theme by name (case-sensitive). Returns undefined if not found.
 */
export function findTheme(name: string): EventTheme | undefined {
  return EVENT_THEMES.find(t => t.name === name)
}

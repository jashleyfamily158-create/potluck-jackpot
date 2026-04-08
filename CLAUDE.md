# Potluck Jackpot — Project Spec & Build Guide

## What This App Is

Potluck Jackpot is a social recipe game that encourages people to cook together. Users create potlucks, invite friends (via unique codes), spin a wheel to get randomly assigned a recipe from a chosen cuisine theme, cook the dish, bring it to the potluck, and then rate each other's dishes. There's also a social feed for sharing photos, an all-time leaderboard, and a community feature for neighborhood potlucks.

The founder is not a professional developer but is building this as a learning project with Claude Code's help. Prioritize clear explanations, simple architecture, and well-commented code. When in doubt, choose the simpler approach. Always explain what you're doing and why before writing code.

## Tech Stack

Use the following stack. Do not deviate without discussing with the user first.

- **Frontend:** Next.js 14+ (App Router) with React and Tailwind CSS
- **Backend/API:** Next.js API Routes (built into Next.js — no separate server needed)
- **Database:** Supabase (PostgreSQL with built-in auth, real-time subscriptions, and file storage)
- **Authentication:** Supabase Auth (email/password + magic links + social login)
- **File Storage:** Supabase Storage (for food photos)
- **Hosting:** Vercel (free tier, deploys automatically from GitHub)
- **Recipe Data:** External API calls to search for recipes (Edamam API free tier, or web scraping as fallback)
- **YouTube Links:** Construct YouTube search URLs dynamically based on recipe name

### Why This Stack
- Next.js + Vercel = zero server management, automatic deployments, works on all devices
- Supabase = database + auth + file storage + real-time, all in one free service
- Tailwind = fast styling without writing CSS files
- Total hosting cost: $0/month on free tiers until you hit thousands of users

## Database Schema

### Tables

```sql
-- Users (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users primary key,
  display_name text not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- Potlucks
create table potlucks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null,  -- 6 char code like "K7M2XR"
  cuisine_theme text not null,       -- "Italian", "Mexican", etc.
  host_id uuid references profiles(id) not null,
  event_date date,
  event_time time,
  location text,
  status text default 'pending',     -- pending, spinning, active, completed
  is_community boolean default false,
  community_radius_miles float,
  community_lat float,
  community_lng float,
  created_at timestamptz default now()
);

-- Potluck Members (who's invited/joined)
create table potluck_members (
  id uuid primary key default gen_random_uuid(),
  potluck_id uuid references potlucks(id) on delete cascade,
  user_id uuid references profiles(id),
  rsvp_status text default 'pending',  -- pending, accepted, declined
  assigned_recipe_name text,
  assigned_recipe_url text,
  assigned_recipe_source text,
  assigned_recipe_difficulty text,
  assigned_recipe_time text,
  assigned_recipe_youtube_query text,
  dish_rating float,                    -- average rating received from others
  joined_at timestamptz default now(),
  unique(potluck_id, user_id)
);

-- Ratings (who rated whom)
create table ratings (
  id uuid primary key default gen_random_uuid(),
  potluck_id uuid references potlucks(id) on delete cascade,
  rater_id uuid references profiles(id),
  ratee_id uuid references profiles(id),
  score integer check (score between 1 and 5),
  created_at timestamptz default now(),
  unique(potluck_id, rater_id, ratee_id)
);

-- Feed Posts (photos and captions)
create table feed_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  potluck_id uuid references potlucks(id),
  image_url text,
  caption text,
  is_group_photo boolean default false,
  created_at timestamptz default now()
);

-- Feed Likes
create table feed_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references feed_posts(id) on delete cascade,
  user_id uuid references profiles(id),
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

-- Feed Comments
create table feed_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references feed_posts(id) on delete cascade,
  user_id uuid references profiles(id),
  content text not null,
  created_at timestamptz default now()
);

-- Friendships
create table friendships (
  id uuid primary key default gen_random_uuid(),
  user_a uuid references profiles(id),
  user_b uuid references profiles(id),
  status text default 'pending',  -- pending, accepted
  created_at timestamptz default now()
);
```

## Core Features (Build in This Order)

### Phase 1: Foundation (Week 1)
1. Project setup (Next.js + Supabase + Tailwind + Vercel)
2. Auth system (sign up, log in, user profile)
3. Home screen with app shell and bottom navigation
4. Basic potluck creation (name, cuisine, date/time/location)
5. Invite code generation and join-by-code flow

### Phase 2: The Game Loop (Week 2)
6. Recipe sourcing — search external recipe APIs by cuisine theme, return top-rated results
7. Spin wheel mechanic — animated wheel that assigns a random recipe to the user
8. Real-time spin status — use Supabase real-time subscriptions so everyone sees when others have spun
9. Potluck dashboard — see your assignment, link to recipe/YouTube, see what others are making
10. RSVP accept/decline flow for invitees

### Phase 3: Social & Ratings (Week 3)
11. Rating system — after the potluck, rate each dish 1-5 stars
12. Event leaderboard — show winner and final standings for each potluck
13. Photo upload — take/upload food photos to the feed (Supabase Storage)
14. Social feed — scrollable feed of photos, likes, and comments
15. All-time rankings — aggregate stats across all potlucks

### Phase 4: Community & Polish (Week 4)
16. Friends system — add friends, see online status
17. Community potlucks — create public potlucks with a geo-fence radius
18. Nearby potluck browser — find and join open community potlucks
19. Push notifications (web push) — spin reminders, RSVP requests, rating prompts
20. Past potluck recaps — view history with photos, ratings, winner

## Design System

The app's visual identity is BRIGHT & PLAYFUL — game-show energy, bold colors, fun and inviting.

### Colors
- Primary gradient: `#FF6B6B` → `#FF8E53` → `#FFC93C` (warm sunset)
- Accent teal: `#4ECDC4`
- Accent purple: `#A06CD5` / `#7C4DFF`
- Success green: `#27AE60`
- Warning gold: `#FFD700`
- Background: `#F8F9FA`
- Card white: `#FFFFFF`

### Typography
- Font: System font stack (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)
- Headings: 800 weight, tight letter-spacing
- Body: 400-600 weight

### Component Patterns
- Cards: 14-18px border-radius, subtle box-shadow `0 2px 10px rgba(0,0,0,0.06)`
- Buttons: 14px border-radius, gradient backgrounds for primary, outlined for secondary
- Avatars: Round (50% radius) with colored background tints at 25% opacity
- Pills/badges: 8px border-radius, colored backgrounds with matching text
- Spacing: 20px page padding, 8-12px between cards

### Layout
- Mobile-first, max-width 400px centered (phone-like experience on desktop too)
- Sticky bottom navigation with 4 tabs: Home, Feed, Friends, Rankings
- Sticky header with gradient background, back button on sub-screens

## Cuisine Themes

Support these 10 themes. Each has an emoji and brand color:
- American Classic 🍔 #E74C3C
- Italian 🍝 #27AE60
- Mexican 🌮 #F39C12
- Chinese 🥡 #C0392B
- Greek 🫒 #2980B9
- Japanese 🍣 #8E44AD
- Indian 🍛 #D35400
- French 🥐 #1ABC9C
- Thai 🍜 #E67E22
- Random Mix 🎲 #9B59B6

## Recipe Difficulty Levels
- Beginner (⭐): Under 45 min, basic techniques
- Intermediate (⭐⭐): 45 min - 2 hrs, some skill required
- Expert (⭐⭐⭐): 2+ hrs or advanced techniques

## Key UX Details

### Invite Code Format
Codes are 6 characters (uppercase letters + digits, excluding ambiguous chars like O/0/I/1/l). Displayed as `PJ-XXXXXX`. Codes are case-insensitive on input.

### Spin Mechanic
- Host initiates the spin phase, which notifies all accepted members
- Each person spins their own wheel on their own device
- After spinning, the user sees their recipe assignment immediately
- Other users see real-time status updates (waiting → spinning → assigned)
- Once everyone has spun, the full menu is revealed

### Rating Rules
- You cannot rate your own dish
- All ratings are submitted simultaneously after the potluck
- Ratings are anonymous to other guests (only aggregates shown)
- The host can "close" rating after a set time

### Community Potlucks
- Host sets a radius (0.5 to 5 miles)
- Any user within that radius sees the potluck in their "Nearby" tab
- Host can set a max capacity
- Community potlucks show a progress bar of spots filled

## File Structure

```
potluck-jackpot/
├── CLAUDE.md              (this file)
├── app/
│   ├── layout.tsx         (root layout with nav)
│   ├── page.tsx           (home screen)
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── potluck/
│   │   ├── create/page.tsx
│   │   ├── join/page.tsx
│   │   ├── [id]/page.tsx        (potluck dashboard)
│   │   ├── [id]/spin/page.tsx
│   │   ├── [id]/rate/page.tsx
│   │   ├── [id]/results/page.tsx
│   │   └── [id]/recap/page.tsx
│   ├── feed/page.tsx
│   ├── friends/page.tsx
│   ├── rankings/page.tsx
│   ├── community/page.tsx
│   └── api/
│       ├── recipes/route.ts     (external recipe search)
│       └── potluck/
│           ├── create/route.ts
│           ├── join/route.ts
│           └── spin/route.ts
├── components/
│   ├── Header.tsx
│   ├── BottomNav.tsx
│   ├── SpinWheel.tsx
│   ├── RecipeCard.tsx
│   ├── FeedPost.tsx
│   ├── StarRating.tsx
│   ├── InviteCodeCard.tsx
│   ├── PotluckCard.tsx
│   └── CuisineGrid.tsx
├── lib/
│   ├── supabase.ts        (Supabase client)
│   ├── recipes.ts         (recipe search logic)
│   └── utils.ts           (shared helpers)
├── public/
│   └── ...
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── .env.local             (Supabase keys — NEVER commit this)
```

## Environment Variables Needed

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Reference Prototype

The interactive prototype is in `prototype/potluck-jackpot.jsx` — it demonstrates the complete user flow, screen designs, color system, and interaction patterns. Use it as the visual reference for building the real app. The prototype uses inline styles; the real app should use Tailwind CSS classes to achieve the same look.

## Important Notes for Claude Code

- Always explain what you're about to do before doing it
- After creating each major feature, help the user test it locally before moving on
- Use TypeScript throughout (not JavaScript)
- Write comments in the code explaining what each section does
- Keep components small and focused — one file per component
- Use Supabase Row Level Security (RLS) policies for data access control
- Never expose API keys or secrets in client-side code
- When working with the database, always use parameterized queries (Supabase handles this)
- The user should be able to deploy to Vercel after each phase and have a working (if incomplete) app

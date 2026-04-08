# Potluck Jackpot — Getting Started with Claude Code

## What You Need Before Starting

Before you open Claude Code, you'll need to set up a few free accounts and install a couple things. This takes about 20-30 minutes.

### 1. Install Node.js
Node.js is what runs your app on your computer during development.
- Go to https://nodejs.org
- Download the LTS (Long Term Support) version
- Run the installer, accept all defaults
- To verify it worked, open your terminal (Mac: Terminal app, Windows: Command Prompt) and type: `node --version` — you should see a version number

### 2. Install Git
Git tracks changes to your code and connects to GitHub.
- Go to https://git-scm.com/downloads
- Download and install for your OS
- Verify: `git --version`

### 3. Create a GitHub Account
GitHub stores your code online and connects to Vercel for deployment.
- Go to https://github.com and sign up (free)

### 4. Create a Supabase Account
Supabase is your database, user accounts, and file storage — all in one.
- Go to https://supabase.com and sign up (free)
- Click "New Project"
- Name it "potluck-jackpot"
- Set a database password (save this somewhere safe!)
- Choose a region close to you
- Wait for it to finish setting up (takes ~2 minutes)
- Once ready, go to Settings > API and copy these two values (you'll need them later):
  - `Project URL` (looks like https://xxxxx.supabase.co)
  - `anon public` key (a long string starting with "eyJ...")

### 5. Create a Vercel Account
Vercel hosts your app on the internet for free.
- Go to https://vercel.com and sign up with your GitHub account

### 6. Install Claude Code
- Follow the instructions at https://docs.anthropic.com/en/docs/claude-code/overview
- This gives you the `claude` command in your terminal

## Your First Session with Claude Code

### Step 1: Create the project folder
Open your terminal and run:
```
mkdir potluck-jackpot
cd potluck-jackpot
```

### Step 2: Copy files from Cowork into this folder
Copy these files from your Cowork downloads into the `potluck-jackpot` folder:
- `CLAUDE.md` (the project spec — Claude Code reads this automatically)
- `potluck-jackpot.jsx` → put this in a subfolder called `prototype/`

Your folder should look like:
```
potluck-jackpot/
├── CLAUDE.md
└── prototype/
    └── potluck-jackpot.jsx
```

### Step 3: Start Claude Code
In your terminal, from the `potluck-jackpot` folder, run:
```
claude
```

### Step 4: Tell Claude Code what to do
Claude Code will automatically read the CLAUDE.md file. Start with this message:

> "I'm building Potluck Jackpot. Please read CLAUDE.md for the full project spec. Let's start with Phase 1: set up the Next.js project with Supabase and Tailwind, create the auth system (signup/login), and build the home screen with bottom navigation. Walk me through each step and explain what you're doing."

Claude Code will then:
1. Create the Next.js project with all the right settings
2. Install the dependencies (Supabase, Tailwind, etc.)
3. Ask you to paste in your Supabase URL and key
4. Build the foundation code file by file

### Step 5: Test locally
After Claude Code finishes Phase 1, run:
```
npm run dev
```
Then open http://localhost:3000 in your browser. You should see your app!

### Step 6: Deploy to Vercel
When you're happy with what you have:
```
git init
git add .
git commit -m "Phase 1: Foundation"
```
Then push to GitHub and connect to Vercel (Claude Code can walk you through this).

## Tips for Working with Claude Code

1. **Work in phases.** Don't try to build everything at once. Follow the phases in CLAUDE.md. Get each phase working before moving to the next.

2. **Test constantly.** After Claude Code makes changes, refresh your browser and make sure things still work. If something breaks, tell Claude Code what you see.

3. **Describe what you see.** When something goes wrong, describe it in plain English: "I clicked the Create Potluck button and the page went white" or "I see an error message that says [paste error here]." Claude Code is great at debugging from descriptions.

4. **Ask why.** If Claude Code does something you don't understand, ask "Why did you do it that way?" or "What does this code do?" Learning as you go is the whole point.

5. **Save often.** Git commit after each feature works. This way if something breaks badly, you can go back.

6. **One thing at a time.** Don't ask for 5 features at once. Ask for one, test it, then move on.

## Phase-by-Phase Prompts

Here are the exact prompts to give Claude Code for each phase:

### Phase 1
> "Let's start Phase 1. Set up the Next.js project with TypeScript, Tailwind CSS, and Supabase. Create the auth system (signup, login, logout) and the app shell with the header and bottom navigation. Use the design system from CLAUDE.md."

### Phase 2
> "Phase 1 is working. Let's do Phase 2: the game loop. Build potluck creation (name, theme, date/time/location), invite code generation, the join-by-code flow, the spin wheel with recipe assignment, and the potluck dashboard where I can see my recipe and what everyone else is making. Use the Edamam API or similar for recipe search."

### Phase 3
> "Phase 2 is working. Let's do Phase 3: social and ratings. Build the star rating system for after potlucks, the event leaderboard, photo upload to the feed using Supabase Storage, the social feed with likes and comments, and the all-time rankings page."

### Phase 4
> "Phase 3 is working. Let's do Phase 4: community and polish. Build the friends system, community potlucks with geo-fencing, the nearby potluck browser, and the past potluck recap pages. Also add web push notifications for spin reminders and RSVP requests."

## When Things Go Wrong

Things WILL break. That's normal. Here's what to do:

- **White screen / blank page:** Tell Claude Code "The page is blank/white after your changes. Here's what the browser console says: [right-click > Inspect > Console tab > copy any red errors]"
- **"Module not found" error:** Tell Claude Code the exact error. It probably needs to install a package.
- **Database errors:** Share the error message. It's usually a missing table or wrong column name.
- **"It doesn't look right":** Screenshot it and describe what's wrong. "The button should be orange gradient but it's plain white."
- **Totally stuck:** You can always `git stash` to undo recent changes, or `git checkout .` to go back to your last commit.

## Cost Breakdown

Everything here is free to start:
- Supabase Free Tier: 500MB database, 1GB file storage, 50,000 monthly active users
- Vercel Free Tier: 100GB bandwidth, automatic deployments
- GitHub: Free for public and private repos
- Claude Code: Requires an Anthropic API subscription

You won't need to pay for hosting until you have thousands of active users.

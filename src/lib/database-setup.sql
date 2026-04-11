-- =============================================
-- Potluck Jackpot — Database Setup
-- =============================================
-- Run this entire script in Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query → paste → Run)
-- =============================================

-- Users (extends Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users primary key,
  display_name text not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- Potlucks
create table if not exists potlucks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null,
  cuisine_theme text not null,
  host_id uuid references profiles(id) not null,
  event_date date,
  event_time time,
  location text,
  status text default 'pending',
  is_community boolean default false,
  community_radius_miles float,
  community_lat float,
  community_lng float,
  created_at timestamptz default now()
);

-- Potluck Members (who joined each potluck)
create table if not exists potluck_members (
  id uuid primary key default gen_random_uuid(),
  potluck_id uuid references potlucks(id) on delete cascade,
  user_id uuid references profiles(id),
  rsvp_status text default 'pending',
  assigned_recipe_name text,
  assigned_recipe_url text,
  assigned_recipe_source text,
  assigned_recipe_difficulty text,
  assigned_recipe_time text,
  assigned_recipe_youtube_query text,
  dish_rating float,
  joined_at timestamptz default now(),
  unique(potluck_id, user_id)
);

-- Ratings (who rated whom)
create table if not exists ratings (
  id uuid primary key default gen_random_uuid(),
  potluck_id uuid references potlucks(id) on delete cascade,
  rater_id uuid references profiles(id),
  ratee_id uuid references profiles(id),
  score integer check (score between 1 and 5),
  created_at timestamptz default now(),
  unique(potluck_id, rater_id, ratee_id)
);

-- Feed Posts (photos and captions)
create table if not exists feed_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  potluck_id uuid references potlucks(id),
  image_url text,
  caption text,
  is_group_photo boolean default false,
  created_at timestamptz default now()
);

-- Feed Likes
create table if not exists feed_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references feed_posts(id) on delete cascade,
  user_id uuid references profiles(id),
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

-- Feed Comments
create table if not exists feed_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references feed_posts(id) on delete cascade,
  user_id uuid references profiles(id),
  content text not null,
  created_at timestamptz default now()
);

-- Friendships
create table if not exists friendships (
  id uuid primary key default gen_random_uuid(),
  user_a uuid references profiles(id),
  user_b uuid references profiles(id),
  status text default 'pending',
  created_at timestamptz default now()
);

-- =============================================
-- Row Level Security (RLS) Policies
-- These protect your data so users can only
-- access what they're supposed to.
-- =============================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table potlucks enable row level security;
alter table potluck_members enable row level security;
alter table ratings enable row level security;
alter table feed_posts enable row level security;
alter table feed_likes enable row level security;
alter table feed_comments enable row level security;
alter table friendships enable row level security;

-- Profiles: anyone can read, users can update their own
create policy "Profiles are viewable by everyone" on profiles
  for select using (true);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Potlucks: anyone can read, authenticated users can create
create policy "Potlucks are viewable by everyone" on potlucks
  for select using (true);

create policy "Authenticated users can create potlucks" on potlucks
  for insert with check (auth.uid() = host_id);

create policy "Hosts can update their potlucks" on potlucks
  for update using (auth.uid() = host_id);

create policy "Hosts can delete their own potlucks" on potlucks
  for delete using (auth.uid() = host_id);

-- Potluck Members: anyone can read, authenticated users can join
create policy "Potluck members are viewable by everyone" on potluck_members
  for select using (true);

create policy "Authenticated users can join potlucks" on potluck_members
  for insert with check (auth.uid() = user_id);

create policy "Users can update own membership" on potluck_members
  for update using (auth.uid() = user_id);

create policy "Hosts can delete members from their potlucks" on potluck_members
  for delete using (
    auth.uid() = user_id
    or auth.uid() in (
      select host_id from potlucks where id = potluck_id
    )
  );

-- Ratings: members can read, rate others
create policy "Ratings are viewable by potluck members" on ratings
  for select using (true);

create policy "Authenticated users can rate" on ratings
  for insert with check (auth.uid() = rater_id and auth.uid() != ratee_id);

create policy "Hosts can delete ratings from their potlucks" on ratings
  for delete using (
    auth.uid() in (
      select host_id from potlucks where id = potluck_id
    )
  );

-- Feed: anyone can read, users can post
create policy "Feed posts are viewable by everyone" on feed_posts
  for select using (true);

create policy "Users can create feed posts" on feed_posts
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own feed posts" on feed_posts
  for delete using (auth.uid() = user_id);

create policy "Hosts can delete feed posts from their potlucks" on feed_posts
  for delete using (
    auth.uid() in (
      select host_id from potlucks where id = potluck_id
    )
  );

-- Likes: anyone can read, users can like
create policy "Likes are viewable by everyone" on feed_likes
  for select using (true);

create policy "Users can like posts" on feed_likes
  for insert with check (auth.uid() = user_id);

create policy "Users can unlike posts" on feed_likes
  for delete using (auth.uid() = user_id);

-- Comments: anyone can read, users can comment
create policy "Comments are viewable by everyone" on feed_comments
  for select using (true);

create policy "Users can create comments" on feed_comments
  for insert with check (auth.uid() = user_id);

-- Friendships: participants can read
create policy "Users can view own friendships" on friendships
  for select using (auth.uid() = user_a or auth.uid() = user_b);

create policy "Users can send friend requests" on friendships
  for insert with check (auth.uid() = user_a);

create policy "Users can update friendship status" on friendships
  for update using (auth.uid() = user_b);

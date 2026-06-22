-- =============================================
-- SpreadHeads Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  display_name text not null,
  bio text default '',
  avatar_color text default '#38bdf8',
  points integer default 0,
  wins integer default 0,
  losses integer default 0,
  pushes integer default 0,
  streak integer default 0,
  streak_type text default 'W' check (streak_type in ('W', 'L')),
  longest_win_streak integer default 0,
  rank integer,
  created_at timestamptz default now()
);

-- Games
create table public.games (
  id uuid primary key default gen_random_uuid(),
  sport text not null,
  home_team text not null,
  away_team text not null,
  home_odds text,
  away_odds text,
  spread text,
  total text,
  game_time timestamptz not null,
  locked boolean default false,
  logo text default '🏈',
  result text check (result in ('home', 'away', 'push', null)),
  created_at timestamptz default now()
);

-- Picks
create table public.picks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  game_id uuid references public.games(id) on delete cascade not null,
  pick_type text not null check (pick_type in ('spread', 'ml', 'total')),
  pick_label text not null,
  pick_choice text not null,
  result text check (result in ('win', 'loss', 'push', 'pending')) default 'pending',
  points_earned integer default 0,
  created_at timestamptz default now(),
  unique(user_id, game_id)
);

-- Communities
create table public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  sport text default 'Multi',
  emoji text default '🏆',
  color text default '#38bdf8',
  category text default 'sport' check (category in ('sport', 'strategy')),
  privacy text default 'public' check (privacy in ('public', 'private')),
  creator_id uuid references public.profiles(id) on delete set null,
  member_count integer default 1,
  post_count integer default 0,
  trending boolean default false,
  recent_activity text default 'Just created',
  created_at timestamptz default now()
);

-- Community members
create table public.community_members (
  community_id uuid references public.communities(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (community_id, user_id)
);

-- Leagues
create table public.leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  sport text default 'Multi',
  emoji text default '🏆',
  color text default '#38bdf8',
  privacy text default 'private' check (privacy in ('public', 'private')),
  format text default 'season' check (format in ('season', 'weekly', 'daily')),
  commissioner_id uuid references public.profiles(id) on delete set null,
  max_members integer default 12,
  member_count integer default 1,
  prize text default 'Bragging rights',
  season text default '2025-2026',
  invite_code text unique default substring(md5(random()::text), 1, 8),
  created_at timestamptz default now()
);

-- League members
create table public.league_members (
  league_id uuid references public.leagues(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  rank integer,
  points integer default 0,
  joined_at timestamptz default now(),
  primary key (league_id, user_id)
);

-- Friends / follows
create table public.friendships (
  requester_id uuid references public.profiles(id) on delete cascade,
  addressee_id uuid references public.profiles(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz default now(),
  primary key (requester_id, addressee_id)
);

-- Articles
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  excerpt text default '',
  body text default '',
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null,
  category text not null,
  image text default '📰',
  tags text[] default '{}',
  read_time text default '5 min',
  like_count integer default 0,
  comment_count integer default 0,
  trending boolean default false,
  published_at timestamptz default now()
);

-- Article likes
create table public.article_likes (
  article_id uuid references public.articles(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  primary key (article_id, user_id)
);

-- =============================================
-- Row Level Security
-- =============================================

alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.picks enable row level security;
alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.leagues enable row level security;
alter table public.league_members enable row level security;
alter table public.friendships enable row level security;
alter table public.articles enable row level security;
alter table public.article_likes enable row level security;

-- Profiles: anyone can read, users manage their own
create policy "Profiles are public" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Games: public read
create policy "Games are public" on public.games for select using (true);

-- Picks: users see own picks
create policy "Users can read own picks" on public.picks for select using (auth.uid() = user_id);
create policy "Users can insert own picks" on public.picks for insert with check (auth.uid() = user_id);
create policy "Users can update own picks" on public.picks for update using (auth.uid() = user_id);

-- Communities: public read, auth users create
create policy "Communities are public" on public.communities for select using (true);
create policy "Auth users can create communities" on public.communities for insert with check (auth.uid() is not null);
create policy "Creators can update communities" on public.communities for update using (auth.uid() = creator_id);

-- Community members
create policy "Community members are public" on public.community_members for select using (true);
create policy "Users can join communities" on public.community_members for insert with check (auth.uid() = user_id);
create policy "Users can leave communities" on public.community_members for delete using (auth.uid() = user_id);

-- Leagues: public read, auth users create
create policy "Leagues are public" on public.leagues for select using (true);
create policy "Auth users can create leagues" on public.leagues for insert with check (auth.uid() is not null);
create policy "Commissioners can update leagues" on public.leagues for update using (auth.uid() = commissioner_id);

-- League members
create policy "League members are public" on public.league_members for select using (true);
create policy "Users can join leagues" on public.league_members for insert with check (auth.uid() = user_id);
create policy "Users can leave leagues" on public.league_members for delete using (auth.uid() = user_id);

-- Friendships
create policy "Friendships are public" on public.friendships for select using (true);
create policy "Users can send friend requests" on public.friendships for insert with check (auth.uid() = requester_id);
create policy "Users can update own friendships" on public.friendships for update using (auth.uid() = addressee_id or auth.uid() = requester_id);
create policy "Users can delete own friendships" on public.friendships for delete using (auth.uid() = addressee_id or auth.uid() = requester_id);

-- Articles: public read
create policy "Articles are public" on public.articles for select using (true);

-- Article likes
create policy "Likes are public" on public.article_likes for select using (true);
create policy "Users can like articles" on public.article_likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike articles" on public.article_likes for delete using (auth.uid() = user_id);

-- =============================================
-- Auto-create profile on signup
-- =============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- Seed: today's games
-- =============================================
insert into public.games (sport, home_team, away_team, home_odds, away_odds, spread, total, game_time, locked, logo) values
  ('NBA', 'Lakers', 'Warriors', '+110', '-130', 'LAL -2.5', 'O/U 228.5', now() + interval '5 hours', false, '🏀'),
  ('NBA', 'Celtics', 'Heat', '-150', '+130', 'BOS -3.5', 'O/U 215.0', now() + interval '6 hours', false, '🏀'),
  ('MLB', 'Yankees', 'Red Sox', '-125', '+105', 'NYY -1.5', 'O/U 9.0', now() - interval '1 hour', true, '⚾'),
  ('MLB', 'Dodgers', 'Padres', '-145', '+125', 'LAD -1.5', 'O/U 8.5', now() + interval '8 hours', false, '⚾'),
  ('NFL', 'Chiefs', 'Bills', '-115', '-105', 'KC -1.5', 'O/U 47.5', now() + interval '24 hours', false, '🏈'),
  ('NHL', 'Rangers', 'Bruins', '+120', '-140', 'BOS -1.5', 'O/U 6.0', now() + interval '4 hours', false, '🏒');

-- Seed: articles
insert into public.articles (title, excerpt, body, author_name, category, image, tags, read_time, like_count, comment_count, trending) values
  ('NBA Finals Preview: Who Has the Edge Going into Game 5?', 'We break down matchups, injury reports, and the tactical adjustments both teams need to make.', 'Full article content here...', 'Marcus Reid', 'NBA', '🏀', ARRAY['NBA Finals', 'Lakers', 'Celtics'], '5 min', 847, 124, true),
  ('The Sharper''s Guide to Line Shopping in 2025', 'Why moving from -110 to -105 can make or break your long-term profitability.', 'Full article content here...', 'Amanda Chen', 'Strategy', '📊', ARRAY['Strategy', 'Value', 'Sharp Money'], '8 min', 2140, 287, true),
  ('MLB Mid-Season Report: Which Teams Are for Real?', 'Pythagorean records don''t lie. We reveal which clubs are over-performing.', 'Full article content here...', 'Tom Gilligan', 'MLB', '⚾', ARRAY['MLB', 'Analytics', 'Mid-Season'], '6 min', 654, 89, false),
  ('NFL 2025 Season Preview: Dark Horse Contenders', 'Three teams flying under the radar that could shake up the playoffs.', 'Full article content here...', 'Derrick Layne', 'NFL', '🏈', ARRAY['NFL', 'Preview', 'Dark Horse'], '7 min', 1320, 201, false),
  ('Understanding Closing Line Value (CLV) and Why It Matters', 'CLV is the gold standard metric for serious bettors.', 'Full article content here...', 'Amanda Chen', 'Strategy', '📈', ARRAY['CLV', 'Strategy', 'Advanced'], '10 min', 3210, 412, true),
  ('NHL Offseason Moves That Could Reshape the League', 'Big trades and surprising free agent signings.', 'Full article content here...', 'Sarah Kovacs', 'NHL', '🏒', ARRAY['NHL', 'Offseason', 'Trades'], '4 min', 421, 53, false);

-- Seed: public communities
insert into public.communities (name, description, sport, emoji, color, category, privacy, member_count, post_count, trending, recent_activity) values
  ('NBA Sharp Shooters', 'Elite NBA picks community. Spread analysis, line movement, and sharp money tracking.', 'NBA', '🏀', '#f59e0b', 'sport', 'public', 2847, 1240, true, 'Line moved 2pts on Lakers game'),
  ('NFL Sunday Crew', 'Weekly NFL picks, injury reports, and game-day analysis for serious bettors.', 'NFL', '🏈', '#10b981', 'sport', 'public', 5621, 3870, false, 'Chiefs injury report just dropped'),
  ('Under Dogs United', 'We only back the underdog. Fade the public, trust the process.', 'Multi', '🐶', '#8b5cf6', 'strategy', 'public', 1203, 892, true, '+EV on tonight''s underdog'),
  ('MLB Moneyline Mob', 'Baseball-focused community. Pitching matchups, bullpen analysis, weather data.', 'MLB', '⚾', '#ef4444', 'sport', 'public', 987, 645, false, 'Cy Young race heating up'),
  ('Parlay Parlor', 'High-risk, high-reward. Share your biggest parlays and sweat them together.', 'Multi', '🎰', '#06b6d4', 'strategy', 'public', 4089, 5120, true, '5-leg parlay hit for $12k 🔥');

-- Seed: public leagues
insert into public.leagues (name, description, sport, emoji, color, privacy, format, max_members, member_count, prize, season) values
  ('Global Sharks', 'Public league open to all SpreadHeads. Top 3 win prizes.', 'Multi', '🌊', '#8b5cf6', 'public', 'season', 1000, 847, '$500 top prize', '2025-2026'),
  ('NBA Fanatics', 'Pure NBA pick''em all season long.', 'NBA', '🏀', '#f59e0b', 'public', 'season', 500, 234, 'Trophy + shoutout', '2025-2026'),
  ('MLB Summer Slam', 'Baseball season pick''em. Daily games, weekly scoring.', 'MLB', '⚾', '#ef4444', 'public', 'season', 200, 156, 'Gift card + bragging rights', '2025'),
  ('College Football Picks', 'NCAAF pick''em. Covers all major conferences.', 'NCAAF', '🎓', '#f97316', 'public', 'season', 500, 412, 'Annual trophy', '2025');

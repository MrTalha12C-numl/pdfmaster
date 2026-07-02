/*
# PDF Master - Initial Database Schema

1. New Tables
- `profiles` - User profile data extending auth.users
  - id (uuid, primary key, references auth.users)
  - full_name (text)
  - avatar_url (text)
  - created_at (timestamp)
  - updated_at (timestamp)

- `files` - Uploaded PDF files for processing
  - id (uuid, primary key)
  - user_id (uuid, references auth.users, nullable for anonymous uploads)
  - original_name (text)
  - file_path (text)
  - file_size (integer)
  - tool_used (text)
  - status (text: pending, processing, completed, failed, expired)
  - created_at (timestamp)
  - expires_at (timestamp, auto-delete after 1 hour)

- `tool_analytics` - Usage analytics for each tool
  - id (uuid, primary key)
  - tool_name (text)
  - user_id (uuid, nullable)
  - file_count (integer)
  - processing_time_ms (integer)
  - created_at (timestamp)

- `user_favorites` - User's favorite tools
  - id (uuid, primary key)
  - user_id (uuid, references auth.users)
  - tool_name (text)
  - created_at (timestamp)

- `blog_posts` - Blog articles
  - id (uuid, primary key)
  - title (text)
  - slug (text, unique)
  - excerpt (text)
  - content (text)
  - category (text)
  - featured_image_url (text)
  - author_id (uuid, references auth.users)
  - published (boolean)
  - published_at (timestamp)
  - created_at (timestamp)
  - updated_at (timestamp)

- `subscriptions` - Premium memberships
  - id (uuid, primary key)
  - user_id (uuid, references auth.users)
  - plan_type (text: free, premium)
  - stripe_customer_id (text)
  - stripe_subscription_id (text)
  - status (text: active, canceled, expired)
  - current_period_end (timestamp)
  - created_at (timestamp)
  - updated_at (timestamp)

- `site_settings` - Admin configurable settings
  - id (uuid, primary key)
  - key (text, unique)
  - value (text)
  - updated_at (timestamp)

- `visitor_stats` - Daily visitor statistics
  - id (uuid, primary key)
  - date (date, unique)
  - visitors_count (integer)
  - page_views (integer)
  - created_at (timestamp)

2. Security
- Enable RLS on all tables
- Owner-scoped policies for user data (files, favorites, subscriptions)
- Authenticated-only policies for admin operations
- Public read for blog posts (when published)
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
CREATE POLICY "users_read_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
CREATE POLICY "users_update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_insert_own_profile" ON profiles;
CREATE POLICY "users_insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- Files table
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  original_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer NOT NULL,
  tool_used text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT now() + interval '1 hour'
);

ALTER TABLE files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own_files" ON files;
CREATE POLICY "users_read_own_files" ON files FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_insert_own_files" ON files;
CREATE POLICY "users_insert_own_files" ON files FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_update_own_files" ON files;
CREATE POLICY "users_update_own_files" ON files FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_delete_own_files" ON files;
CREATE POLICY "users_delete_own_files" ON files FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Allow anonymous uploads
DROP POLICY IF EXISTS "anon_insert_files" ON files;
CREATE POLICY "anon_insert_files" ON files FOR INSERT
  TO anon WITH CHECK (user_id IS NULL);

DROP POLICY IF EXISTS "anon_read_files" ON files;
CREATE POLICY "anon_read_files" ON files FOR SELECT
  TO anon USING (user_id IS NULL);

-- Tool analytics table
CREATE TABLE IF NOT EXISTS tool_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  file_count integer DEFAULT 1,
  processing_time_ms integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tool_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_insert_analytics" ON tool_analytics;
CREATE POLICY "authenticated_insert_analytics" ON tool_analytics FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_insert_analytics" ON tool_analytics;
CREATE POLICY "anon_insert_analytics" ON tool_analytics FOR INSERT
  TO anon WITH CHECK (true);

-- User favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own_favorites" ON user_favorites;
CREATE POLICY "users_read_own_favorites" ON user_favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_insert_own_favorites" ON user_favorites;
CREATE POLICY "users_insert_own_favorites" ON user_favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_delete_own_favorites" ON user_favorites;
CREATE POLICY "users_delete_own_favorites" ON user_favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text,
  category text NOT NULL,
  featured_image_url text,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_published_posts" ON blog_posts;
CREATE POLICY "public_read_published_posts" ON blog_posts FOR SELECT
  TO anon, authenticated USING (published = true);

DROP POLICY IF EXISTS "authors_insert_posts" ON blog_posts;
CREATE POLICY "authors_insert_posts" ON blog_posts FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authors_update_posts" ON blog_posts;
CREATE POLICY "authors_update_posts" ON blog_posts FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type text NOT NULL DEFAULT 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  status text NOT NULL DEFAULT 'active',
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own_subscription" ON subscriptions;
CREATE POLICY "users_read_own_subscription" ON subscriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_insert_own_subscription" ON subscriptions;
CREATE POLICY "users_insert_own_subscription" ON subscriptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_update_own_subscription" ON subscriptions;
CREATE POLICY "users_update_own_subscription" ON subscriptions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_settings" ON site_settings;
CREATE POLICY "public_read_settings" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_update_settings" ON site_settings;
CREATE POLICY "authenticated_update_settings" ON site_settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_insert_settings" ON site_settings;
CREATE POLICY "authenticated_insert_settings" ON site_settings FOR INSERT
  TO authenticated WITH CHECK (true);

-- Visitor stats table
CREATE TABLE IF NOT EXISTS visitor_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL DEFAULT current_date,
  visitors_count integer DEFAULT 0,
  page_views integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE visitor_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_visitor_stats" ON visitor_stats;
CREATE POLICY "public_read_visitor_stats" ON visitor_stats FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_visitor_stats" ON visitor_stats;
CREATE POLICY "authenticated_insert_visitor_stats" ON visitor_stats FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_visitor_stats" ON visitor_stats;
CREATE POLICY "authenticated_update_visitor_stats" ON visitor_stats FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at);
CREATE INDEX IF NOT EXISTS idx_tool_analytics_tool_name ON tool_analytics(tool_name);
CREATE INDEX IF NOT EXISTS idx_tool_analytics_created_at ON tool_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_visitor_stats_date ON visitor_stats(date);

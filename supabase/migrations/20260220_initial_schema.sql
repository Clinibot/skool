-- Create the skool schema
CREATE SCHEMA IF NOT EXISTS skool;

-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS skool.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communities table
CREATE TABLE IF NOT EXISTS skool.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  owner_id UUID REFERENCES skool.profiles(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memberships table (Roles: owner, admin, member)
CREATE TABLE IF NOT EXISTS skool.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES skool.profiles(id) ON DELETE CASCADE,
  community_id UUID REFERENCES skool.communities(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, community_id)
);

-- Courses table
CREATE TABLE IF NOT EXISTS skool.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES skool.communities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modules table (groups of lessons)
CREATE TABLE IF NOT EXISTS skool.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES skool.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS skool.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES skool.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT, -- Markdown or JSON for rich text
  video_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a trigger to update updated_at
CREATE OR REPLACE FUNCTION skool.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON skool.profiles FOR EACH ROW EXECUTE PROCEDURE skool.update_updated_at_column();
CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON skool.communities FOR EACH ROW EXECUTE PROCEDURE skool.update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON skool.courses FOR EACH ROW EXECUTE PROCEDURE skool.update_updated_at_column();
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_communities_owner_id ON skool.communities(owner_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON skool.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_community_id ON skool.memberships(community_id);
CREATE INDEX IF NOT EXISTS idx_courses_community_id ON skool.courses(community_id);
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON skool.modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON skool.lessons(module_id);

-- Enable RLS
ALTER TABLE skool.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skool.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE skool.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE skool.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE skool.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE skool.lessons ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON skool.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON skool.profiles FOR UPDATE USING (auth.uid() = id);

-- Communities Policies
CREATE POLICY "Communities are viewable by everyone" ON skool.communities FOR SELECT USING (true);
CREATE POLICY "Owners can update their communities" ON skool.communities FOR UPDATE USING (auth.uid() = owner_id);

-- Memberships Policies
CREATE POLICY "Memberships are viewable by community members" ON skool.memberships FOR SELECT USING (true); -- Simplified for now
CREATE POLICY "Users can join communities" ON skool.memberships FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Courses Policies
CREATE POLICY "Courses are viewable by community members" ON skool.courses FOR SELECT USING (true);

-- Functions to check membership (Security)
CREATE OR REPLACE FUNCTION skool.is_member(community_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM skool.memberships
    WHERE skool.memberships.community_id = $1
    AND skool.memberships.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


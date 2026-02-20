-- 1. Create the skool schema first
CREATE SCHEMA IF NOT EXISTS skool;

-- 2. Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS skool.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  global_role TEXT CHECK (global_role IN ('creator', 'participant')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ... (rest of tables)

-- 14. Quizzes table
CREATE TABLE IF NOT EXISTS skool.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES skool.lessons(id) ON DELETE CASCADE,
  questions JSONB NOT NULL, -- Array of { question, options, correct_answer }
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Quiz Results table
CREATE TABLE IF NOT EXISTS skool.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES skool.quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES skool.profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and Policies for new tables
ALTER TABLE skool.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE skool.quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quizzes viewable by everyone" ON skool.quizzes FOR SELECT USING (true);
CREATE POLICY "Quiz results viewable by owner and creator" ON skool.quiz_results FOR SELECT USING (true); -- Simplified
CREATE POLICY "Users can insert their own results" ON skool.quiz_results FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 3. Function to handle new user creation (sync from auth.users to skool.profiles)
CREATE OR REPLACE FUNCTION skool.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO skool.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger to call the function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION skool.handle_new_user();

-- 5. Communities table
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

-- 6. Memberships table
CREATE TABLE IF NOT EXISTS skool.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES skool.profiles(id) ON DELETE CASCADE,
  community_id UUID REFERENCES skool.communities(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, community_id)
);

-- 7. Courses table
CREATE TABLE IF NOT EXISTS skool.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES skool.communities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Modules table
CREATE TABLE IF NOT EXISTS skool.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES skool.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Lessons table
CREATE TABLE IF NOT EXISTS skool.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES skool.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Utility: Trigger to update updated_at
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
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON skool.lessons FOR EACH ROW EXECUTE PROCEDURE skool.update_updated_at_column();

-- 11. Indexes
CREATE INDEX IF NOT EXISTS idx_communities_owner_id ON skool.communities(owner_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON skool.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_community_id ON skool.memberships(community_id);
CREATE INDEX IF NOT EXISTS idx_courses_community_id ON skool.courses(community_id);
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON skool.modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON skool.lessons(module_id);

-- 12. Row Level Security
ALTER TABLE skool.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skool.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE skool.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE skool.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE skool.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE skool.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON skool.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON skool.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Communities are viewable by everyone" ON skool.communities FOR SELECT USING (true);
CREATE POLICY "Owners can update their communities" ON skool.communities FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Memberships are viewable by everyone" ON skool.memberships FOR SELECT USING (true);
CREATE POLICY "Users can join communities" ON skool.memberships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Courses are viewable by everyone" ON skool.courses FOR SELECT USING (true);

-- 13. Security Helper Function
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

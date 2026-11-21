-- ZERO-LANG Initial Database Schema
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- Custom Types
-- ============================================

CREATE TYPE cefr_level AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');
CREATE TYPE learning_goal AS ENUM (
  'career_advancement',
  'academic_study',
  'migration_visa',
  'exam_preparation',
  'personal_growth',
  'social_integration'
);
CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed', 'mastered');
CREATE TYPE srs_state AS ENUM ('new', 'learning', 'review', 'relearning', 'mastered');
CREATE TYPE srs_rating AS ENUM ('again', 'hard', 'good', 'easy');
CREATE TYPE tutor_provider AS ENUM ('openai', 'anthropic', 'local', 'custom');
CREATE TYPE tutor_capability AS ENUM (
  'conversation',
  'writing_feedback',
  'pronunciation',
  'vocabulary_explanation',
  'grammar_explanation',
  'debate_partner',
  'interview_simulation',
  'presentation_coach'
);
CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');

-- ============================================
-- Profiles (extends auth.users)
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  native_language TEXT,
  known_languages TEXT[],
  timezone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ
);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Learner Profiles
-- ============================================

CREATE TABLE learner_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  current_level CEFR_LEVEL NOT NULL DEFAULT 'B2',
  target_level CEFR_LEVEL NOT NULL DEFAULT 'C1',
  primary_goal LEARNING_GOAL NOT NULL DEFAULT 'personal_growth',
  placement_completed BOOLEAN DEFAULT FALSE,
  placement_score JSONB,
  skill_profile JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_learner_profiles_updated_at
  BEFORE UPDATE ON learner_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Units
-- ============================================

CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  topic TEXT NOT NULL,
  level CEFR_LEVEL NOT NULL,
  "order" INT NOT NULL,
  estimated_hours NUMERIC(4,1) DEFAULT 0,
  prerequisites UUID[],
  vocabulary JSONB,
  learning_outcomes JSONB,
  assessment JSONB,
  metadata JSONB,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_units_updated_at
  BEFORE UPDATE ON units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_units_level ON units(level);
CREATE INDEX idx_units_topic ON units(topic);
CREATE INDEX idx_units_published ON units(published);

-- ============================================
-- Lessons
-- ============================================

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  "order" INT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  objectives TEXT[],
  content JSONB,
  activities JSONB,
  estimated_minutes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_lessons_unit_id ON lessons(unit_id);

-- ============================================
-- Vocabulary
-- ============================================

CREATE TABLE vocabulary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  lemma TEXT NOT NULL,
  part_of_speech TEXT,
  cefr_level CEFR_LEVEL NOT NULL,
  frequency_band INT DEFAULT 5,
  definitions JSONB,
  collocations TEXT[],
  word_family TEXT[],
  pronunciation JSONB,
  examples JSONB,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_vocabulary_updated_at
  BEFORE UPDATE ON vocabulary
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_vocabulary_unit_id ON vocabulary(unit_id);
CREATE INDEX idx_vocabulary_term ON vocabulary(term);

-- ============================================
-- User Progress
-- ============================================

CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  status PROGRESS_STATUS DEFAULT 'not_started',
  score NUMERIC(5,2),
  time_spent_seconds INT DEFAULT 0,
  attempts INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  mastery_level NUMERIC(3,2),
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, unit_id, lesson_id)
);

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_unit_id ON user_progress(unit_id);

-- ============================================
-- Skill Profiles
-- ============================================

CREATE TABLE skill_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  reading JSONB,
  listening JSONB,
  writing JSONB,
  speaking JSONB,
  vocabulary JSONB,
  grammar JSONB,
  overall CEFR_LEVEL DEFAULT 'B2',
  last_assessed TIMESTAMPTZ DEFAULT NOW(),
  evidence JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_skill_profiles_updated_at
  BEFORE UPDATE ON skill_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SRS Items
-- ============================================

CREATE TABLE srs_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vocabulary_id UUID NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  state SRS_STATE DEFAULT 'new',
  interval INT DEFAULT 0,
  ease_factor NUMERIC(3,2) DEFAULT 2.5,
  repetitions INT DEFAULT 0,
  lapses INT DEFAULT 0,
  last_reviewed TIMESTAMPTZ,
  next_review TIMESTAMPTZ DEFAULT NOW(),
  stability NUMERIC(10,2),
  difficulty NUMERIC(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, vocabulary_id)
);

CREATE TRIGGER update_srs_items_updated_at
  BEFORE UPDATE ON srs_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_srs_items_user_id ON srs_items(user_id);
CREATE INDEX idx_srs_items_next_review ON srs_items(next_review);

-- ============================================
-- SRS Reviews
-- ============================================

CREATE TABLE srs_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES srs_items(id) ON DELETE CASCADE,
  rating SRS_RATING NOT NULL,
  reviewed_at TIMESTAMPTZ DEFAULT NOW(),
  time_taken_seconds INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_srs_reviews_item_id ON srs_reviews(item_id);

-- ============================================
-- Tutor Configurations
-- ============================================

CREATE TABLE tutor_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  provider TUTOR_PROVIDER NOT NULL DEFAULT 'openai',
  model TEXT NOT NULL,
  api_key_encrypted TEXT,
  endpoint TEXT,
  system_prompt TEXT,
  temperature NUMERIC(3,2) DEFAULT 0.7,
  max_tokens INT DEFAULT 2000,
  capabilities TUTOR_CAPABILITY[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_tutor_configs_updated_at
  BEFORE UPDATE ON tutor_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Tutor Sessions
-- ============================================

CREATE TABLE tutor_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  capability TUTOR_CAPABILITY NOT NULL,
  config JSONB,
  metadata JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_tutor_sessions_updated_at
  BEFORE UPDATE ON tutor_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_tutor_sessions_user_id ON tutor_sessions(user_id);

-- ============================================
-- Tutor Messages
-- ============================================

CREATE TABLE tutor_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES tutor_sessions(id) ON DELETE CASCADE,
  role MESSAGE_ROLE NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tutor_messages_session_id ON tutor_messages(session_id);

-- ============================================
-- Placement Results
-- ============================================

CREATE TABLE placement_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessed_level CEFR_LEVEL NOT NULL,
  confidence NUMERIC(3,2) NOT NULL,
  skill_breakdown JSONB,
  responses JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  version TEXT NOT NULL DEFAULT '1.0',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_placement_results_user_id ON placement_results(user_id);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE srs_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE srs_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_results ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Learner profiles policies
CREATE POLICY "Users can view own learner profile" ON learner_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learner profile" ON learner_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learner profile" ON learner_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Units policies (public read for published)
CREATE POLICY "Anyone can view published units" ON units
  FOR SELECT USING (published = TRUE);

-- Lessons policies
CREATE POLICY "Anyone can view lessons of published units" ON lessons
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM units WHERE units.id = lessons.unit_id AND units.published = TRUE)
  );

-- Vocabulary policies
CREATE POLICY "Anyone can view vocabulary of published units" ON vocabulary
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM units WHERE units.id = vocabulary.unit_id AND units.published = TRUE)
  );

-- User progress policies
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Skill profiles policies
CREATE POLICY "Users can view own skill profile" ON skill_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own skill profile" ON skill_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skill profile" ON skill_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- SRS items policies
CREATE POLICY "Users can view own SRS items" ON srs_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own SRS items" ON srs_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own SRS items" ON srs_items
  FOR UPDATE USING (auth.uid() = user_id);

-- SRS reviews policies
CREATE POLICY "Users can view own SRS reviews" ON srs_reviews
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM srs_items WHERE srs_items.id = srs_reviews.item_id AND srs_items.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own SRS reviews" ON srs_reviews
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM srs_items WHERE srs_items.id = srs_reviews.item_id AND srs_items.user_id = auth.uid())
  );

-- Tutor configs policies
CREATE POLICY "Users can view own tutor config" ON tutor_configs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own tutor config" ON tutor_configs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tutor config" ON tutor_configs
  FOR UPDATE USING (auth.uid() = user_id);

-- Tutor sessions policies
CREATE POLICY "Users can view own tutor sessions" ON tutor_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tutor sessions" ON tutor_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tutor sessions" ON tutor_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Tutor messages policies
CREATE POLICY "Users can view own tutor messages" ON tutor_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM tutor_sessions WHERE tutor_sessions.id = tutor_messages.session_id AND tutor_sessions.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own tutor messages" ON tutor_messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM tutor_sessions WHERE tutor_sessions.id = tutor_messages.session_id AND tutor_sessions.user_id = auth.uid())
  );

-- Placement results policies
CREATE POLICY "Users can view own placement results" ON placement_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own placement results" ON placement_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Realtime Publications
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE user_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE tutor_messages;

-- ============================================
-- Helper Functions
-- ============================================

-- Function to create learner profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  
  INSERT INTO public.learner_profiles (user_id, current_level, target_level, primary_goal)
  VALUES (NEW.id, 'B2', 'C1', 'personal_growth');
  
  INSERT INTO public.skill_profiles (user_id, overall)
  VALUES (NEW.id, 'B2');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get user's due SRS items
CREATE OR REPLACE FUNCTION get_due_srs_items(p_user_id UUID, p_unit_id UUID DEFAULT NULL)
RETURNS SETOF srs_items AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM srs_items
  WHERE user_id = p_user_id
    AND next_review <= NOW()
    AND (p_unit_id IS NULL OR unit_id = p_unit_id)
  ORDER BY next_review ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update SRS item after review (FSRS-inspired)
CREATE OR REPLACE FUNCTION update_srs_after_review(
  p_item_id UUID,
  p_rating SRS_RATING,
  p_time_taken INT
) RETURNS VOID AS $$
DECLARE
  v_item srs_items%ROWTYPE;
  v_new_stability NUMERIC;
  v_new_difficulty NUMERIC;
  v_new_interval INT;
  v_new_state SRS_STATE;
BEGIN
  SELECT * INTO v_item FROM srs_items WHERE id = p_item_id;
  
  -- Simplified FSRS-like update
  CASE p_rating
    WHEN 'again' THEN
      v_new_stability := GREATEST(0.1, v_item.stability * 0.5);
      v_new_difficulty := LEAST(10, v_item.difficulty + 1);
      v_new_interval := 1;
      v_new_state := CASE WHEN v_item.lapses > 0 THEN 'relearning' ELSE 'learning' END;
    WHEN 'hard' THEN
      v_new_stability := v_item.stability * 1.2;
      v_new_difficulty := LEAST(10, v_item.difficulty + 0.5);
      v_new_interval := GREATEST(1, ROUND(v_new_stability * LN(0.9) / LN(0.9)));
      v_new_state := CASE WHEN v_item.repetitions = 0 THEN 'learning' ELSE 'review' END;
    WHEN 'good' THEN
      v_new_stability := v_item.stability * CASE WHEN v_item.repetitions = 0 THEN 2.5 ELSE 1.5 END;
      v_new_difficulty := GREATEST(0, v_item.difficulty - 0.2);
      v_new_interval := GREATEST(1, ROUND(v_new_stability * LN(0.9) / LN(0.9)));
      v_new_state := CASE WHEN v_item.repetitions = 0 THEN 'learning' ELSE 'review' END;
    WHEN 'easy' THEN
      v_new_stability := v_item.stability * CASE WHEN v_item.repetitions = 0 THEN 4 ELSE 2 END;
      v_new_difficulty := GREATEST(0, v_item.difficulty - 0.5);
      v_new_interval := GREATEST(1, ROUND(v_new_stability * LN(0.9) / LN(0.9)));
      v_new_state := 'review';
  END CASE;
  
  IF v_new_stability >= 365 THEN
    v_new_state := 'mastered';
  END IF;
  
  UPDATE srs_items
  SET
    state = v_new_state,
    interval = v_new_interval,
    ease_factor = v_new_difficulty,
    repetitions = v_item.repetitions + 1,
    lapses = CASE WHEN p_rating = 'again' THEN v_item.lapses + 1 ELSE v_item.lapses END,
    last_reviewed = NOW(),
    next_review = NOW() + (v_new_interval || ' days')::INTERVAL,
    stability = v_new_stability,
    difficulty = v_new_difficulty,
    updated_at = NOW()
  WHERE id = p_item_id;
  
  INSERT INTO srs_reviews (item_id, rating, reviewed_at, time_taken_seconds)
  VALUES (p_item_id, p_rating, NOW(), p_time_taken);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
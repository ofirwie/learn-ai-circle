-- ISAI AI Knowledge Hub Database Schema
-- Complete schema for English-only version with authentication

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Entities (Organizations)
CREATE TABLE entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code_prefix TEXT UNIQUE NOT NULL,
    default_language TEXT DEFAULT 'en',
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Groups
CREATE TABLE user_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    can_see_groups UUID[] DEFAULT '{}',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    entity_id UUID REFERENCES entities(id),
    user_group_id UUID REFERENCES user_groups(id),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    preferred_language TEXT DEFAULT 'en',
    avatar_url TEXT,
    personal_permissions JSONB DEFAULT '{}',
    registration_code TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registration Codes
CREATE TABLE registration_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    entity_id UUID REFERENCES entities(id),
    user_group_id UUID REFERENCES user_groups(id),
    is_active BOOLEAN DEFAULT true,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content (7 types: guide, prompt, prefix, tool, news, video, article)
CREATE TABLE content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content_json JSONB NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('guide', 'prompt', 'prefix', 'tool', 'news', 'video', 'article')),
    target_entities UUID[] DEFAULT '{}',
    target_groups UUID[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{en}',
    tags TEXT[] DEFAULT '{}',
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    view_count INTEGER DEFAULT 0,
    engagement_score FLOAT DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum Categories
CREATE TABLE forum_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID REFERENCES entities(id),
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum Posts
CREATE TABLE forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES forum_categories(id),
    author_id UUID REFERENCES users(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    vote_score INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum Comments
CREATE TABLE forum_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES forum_comments(id),
    is_approved BOOLEAN DEFAULT true,
    vote_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Events
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    event_type TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    metadata JSONB DEFAULT '{}',
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Progress
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    content_id UUID REFERENCES content(id),
    progress_type TEXT NOT NULL,
    progress_value FLOAT DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_id, progress_type)
);

-- Create indexes for better performance
CREATE INDEX idx_users_entity ON users(entity_id);
CREATE INDEX idx_users_group ON users(user_group_id);
CREATE INDEX idx_content_type ON content(content_type);
CREATE INDEX idx_content_published ON content(is_published);
CREATE INDEX idx_content_created_at ON content(created_at);
CREATE INDEX idx_forum_posts_category ON forum_posts(category_id);
CREATE INDEX idx_forum_comments_post ON forum_comments(post_id);
CREATE INDEX idx_analytics_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Registration codes policy (public read for validation)
CREATE POLICY "Registration codes are publicly readable" ON registration_codes
    FOR SELECT USING (is_active = true);

-- Content policies
CREATE POLICY "Users can view content for their entity/groups" ON content
    FOR SELECT USING (
        auth.uid() IN (
            SELECT u.id FROM users u
            WHERE u.entity_id = ANY(content.target_entities)
            AND u.user_group_id = ANY(content.target_groups)
        ) OR is_published = true
    );

-- Insert sample data
INSERT INTO entities (name, code_prefix) VALUES 
    ('Demo Organization', 'DEMO');

INSERT INTO user_groups (entity_id, name, description) VALUES 
    ((SELECT id FROM entities WHERE code_prefix = 'DEMO'), 'Users', 'General users');

INSERT INTO registration_codes (code, entity_id, user_group_id, max_uses) VALUES 
    ('DEMO2024', 
     (SELECT id FROM entities WHERE code_prefix = 'DEMO'), 
     (SELECT id FROM user_groups WHERE name = 'Users'), 
     100);

-- Create a function to automatically create user profiles after Supabase auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
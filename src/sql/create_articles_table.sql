-- Create articles table for rich content with YouTube embeds
CREATE TABLE IF NOT EXISTS articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL, -- Rich HTML content
    excerpt TEXT, -- Summary for preview cards
    featured_image TEXT, -- URL to featured image
    youtube_video_id TEXT, -- Main YouTube video ID if article features video
    author TEXT NOT NULL,
    category TEXT,
    tags TEXT[],
    status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
    featured BOOLEAN DEFAULT FALSE, -- Show on home page
    view_count INTEGER DEFAULT 0,
    read_time INTEGER, -- Estimated read time in minutes
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_view_count ON articles(view_count DESC);

-- Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow public read access to published articles
CREATE POLICY "Public can read published articles" ON articles 
    FOR SELECT 
    USING (status = 'published');

-- Allow authenticated users to create/update/delete articles
CREATE POLICY "Authenticated users can create articles" ON articles 
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update articles" ON articles 
    FOR UPDATE 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete articles" ON articles 
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- Allow authenticated users to view all articles (including drafts)
CREATE POLICY "Authenticated users can view all articles" ON articles 
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Function to auto-generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT) 
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                regexp_replace(
                    trim(title),
                    '[^a-zA-Z0-9\s-]', '', 'g'  -- Remove special characters
                ),
                '\s+', '-', 'g'  -- Replace spaces with hyphens
            ),
            '-+', '-', 'g'  -- Replace multiple hyphens with single hyphen
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Function to calculate read time based on content length
CREATE OR REPLACE FUNCTION calculate_read_time(content TEXT) 
RETURNS INTEGER AS $$
DECLARE
    word_count INTEGER;
    words_per_minute INTEGER := 200; -- Average reading speed
BEGIN
    -- Simple word count estimation
    word_count := array_length(string_to_array(content, ' '), 1);
    RETURN GREATEST(1, CEIL(word_count::DECIMAL / words_per_minute));
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION update_article_slug() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_slug(NEW.title);
        -- Add timestamp if slug already exists
        IF EXISTS (SELECT 1 FROM articles WHERE slug = NEW.slug AND id != NEW.id) THEN
            NEW.slug := NEW.slug || '-' || extract(epoch from now())::integer;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_article_slug_trigger
    BEFORE INSERT OR UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_article_slug();

-- Trigger to calculate read time
CREATE OR REPLACE FUNCTION update_article_read_time() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.read_time := calculate_read_time(NEW.content);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_article_read_time_trigger
    BEFORE INSERT OR UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_article_read_time();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
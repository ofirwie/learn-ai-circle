-- Create brand_logos table for storing company/brand logos
CREATE TABLE IF NOT EXISTS brand_logos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  logo_url TEXT NOT NULL,
  category VARCHAR(100),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_brand_logos_name ON brand_logos(name);
CREATE INDEX IF NOT EXISTS idx_brand_logos_category ON brand_logos(category);

-- Enable RLS
ALTER TABLE brand_logos ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can view brand logos" ON brand_logos
  FOR SELECT USING (true);

-- Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can manage brand logos" ON brand_logos
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert default brand logos
INSERT INTO brand_logos (name, display_name, logo_url, category, tags) VALUES
  ('openai', 'OpenAI', 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg', 'AI', ARRAY['ai', 'chatgpt', 'gpt']),
  ('google', 'Google', 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', 'Tech', ARRAY['search', 'tech', 'ai']),
  ('microsoft', 'Microsoft', 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg', 'Tech', ARRAY['tech', 'software', 'ai']),
  ('meta', 'Meta', 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg', 'Tech', ARRAY['social', 'tech', 'ai']),
  ('anthropic', 'Anthropic', 'https://upload.wikimedia.org/wikipedia/commons/7/78/Anthropic_logo.svg', 'AI', ARRAY['ai', 'claude']),
  ('tesla', 'Tesla', 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg', 'Tech', ARRAY['automotive', 'tech', 'ai']),
  ('nvidia', 'NVIDIA', 'https://upload.wikimedia.org/wikipedia/en/a/a4/NVIDIA_logo.svg', 'Tech', ARRAY['gpu', 'ai', 'tech']),
  ('apple', 'Apple', 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', 'Tech', ARRAY['tech', 'mobile', 'software'])
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  logo_url = EXCLUDED.logo_url,
  category = EXCLUDED.category,
  tags = EXCLUDED.tags,
  updated_at = NOW();
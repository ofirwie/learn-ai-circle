-- Create the tips table for AI tips and tricks content
CREATE TABLE IF NOT EXISTS tips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    tags TEXT[],
    practical_applications TEXT[],
    pricing_info TEXT,
    external_links JSONB DEFAULT '[]'::jsonb,
    youtube_videos JSONB DEFAULT '[]'::jsonb,
    author TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tips_status ON tips(status);
CREATE INDEX IF NOT EXISTS idx_tips_category ON tips(category);
CREATE INDEX IF NOT EXISTS idx_tips_featured ON tips(featured);
CREATE INDEX IF NOT EXISTS idx_tips_created_at ON tips(created_at);

-- Enable Row Level Security
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON tips 
    FOR SELECT USING (status = 'published' OR auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert" ON tips 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update" ON tips 
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete" ON tips 
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_tips_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER tips_updated_at
    BEFORE UPDATE ON tips
    FOR EACH ROW
    EXECUTE FUNCTION update_tips_updated_at();

-- Insert sample data
INSERT INTO tips (title, content, category, tags, practical_applications, pricing_info, external_links, youtube_videos, author, status, featured)
VALUES 
(
    '3 Innovative AI Tools to Make Your Life Easier',
    E'Artificial intelligence (AI) is changing the way we work, learn, and create. Here are three easy-to-use AI tools that simplify daily tasks and help you get more done, even if you''re new to the field.\n\n<h2>1. Excelmatic – Effortless Data Analysis</h2>\n<p>Excelmatic takes the headache out of large spreadsheets. Upload your Excel or Google Sheets file, ask your question in plain English, and get actionable charts, summaries, and insights within seconds. This tool recognizes patterns, suggests formulas, and even summarizes your data—no need for advanced spreadsheet skills.</p>\n\n<h3>Practical Applications:</h3>\n<ul>\n<li>Identifying trends in sales or marketing data</li>\n<li>Quickly creating graphs for reports or presentations</li>\n<li>Getting ready-made suggestions for formulas and summaries</li>\n</ul>\n\n<h3>Who Should Use It?</h3>\n<p>Anyone who works with data—project managers, analysts, students, or small business owners.</p>\n\n<h3>Pricing:</h3>\n<ul>\n<li>Free version available with core features</li>\n<li>Paid plans from $10/month with advanced options</li>\n</ul>\n\n<h3>Practical Use Case:</h3>\n<p>Imagine you''re a small business owner tracking monthly sales. Instead of spending hours building formulas or pivot tables, you just upload your sales sheet to Excelmatic and ask, "What were my best-selling products last quarter?" Within moments, you get a clear summary and easy-to-understand charts highlighting your top performers. This not only saves time but provides the clarity you need to make smarter inventory decisions.</p>',
    'AI Tools',
    ARRAY['AI Tools', 'Productivity', 'Data Analysis', 'Spreadsheets'],
    ARRAY['Sales data analysis', 'Report generation', 'Business intelligence', 'Academic research'],
    'Free tier available, Paid plans from $10/month',
    '[
        {"title": "Excelmatic Official Website", "url": "https://excelmatic.com"},
        {"title": "Step-by-step tutorial", "url": "https://www.youtube.com/watch?v=1YtB1yrKvXM"},
        {"title": "Excelmatic Review", "url": "https://www.youtube.com/watch?v=gmJeo_1lI6g"}
    ]'::jsonb,
    '[
        {"id": "1YtB1yrKvXM", "title": "Step-by-step tutorial"},
        {"id": "gmJeo_1lI6g", "title": "Excelmatic Review"},
        {"id": "V9TGgD03nQI", "title": "Analyze Excel & Google Sheets with AI"}
    ]'::jsonb,
    'ISAI Team',
    'published',
    true
);

-- Grant permissions (adjust based on your needs)
GRANT SELECT ON tips TO anon;
GRANT ALL ON tips TO authenticated;
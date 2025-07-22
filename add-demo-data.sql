-- Add demo data to existing ISAI database
-- Run this in your Supabase SQL editor

-- Insert demo entity
INSERT INTO entities (name, code_prefix, default_language) 
VALUES ('Demo Organization', 'DEMO', 'en')
ON CONFLICT (code_prefix) DO NOTHING;

-- Insert demo user group
INSERT INTO user_groups (entity_id, name, description) 
VALUES (
    (SELECT id FROM entities WHERE code_prefix = 'DEMO' LIMIT 1),
    'Users', 
    'General users'
)
ON CONFLICT DO NOTHING;

-- Insert demo registration code
INSERT INTO registration_codes (code, entity_id, user_group_id, max_uses, is_active) 
VALUES (
    'DEMO2024',
    (SELECT id FROM entities WHERE code_prefix = 'DEMO' LIMIT 1),
    (SELECT id FROM user_groups WHERE name = 'Users' LIMIT 1),
    100,
    true
)
ON CONFLICT (code) DO UPDATE SET
    is_active = true,
    max_uses = 100;

-- Verify the data was inserted
SELECT 'Entities:' as table_name, name, code_prefix FROM entities WHERE code_prefix = 'DEMO'
UNION ALL
SELECT 'User Groups:', name, '' FROM user_groups WHERE entity_id = (SELECT id FROM entities WHERE code_prefix = 'DEMO')
UNION ALL  
SELECT 'Registration Codes:', code, CAST(max_uses as text) FROM registration_codes WHERE code = 'DEMO2024';
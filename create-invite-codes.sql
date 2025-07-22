-- Create the requested invite codes for ISAI Knowledge Hub
-- Run this SQL script in your Supabase SQL editor

-- First, ensure we have entities and user groups set up
INSERT INTO entities (name, description, type, is_active) VALUES
  ('ISAI Fitness Community', 'Health and fitness focused AI learning', 'community', true),
  ('ISAI Parents Network', 'Educational AI tools for parents and educators', 'educational', true),
  ('Churro Family', 'Family-oriented AI knowledge sharing', 'family', true),
  ('Sayret Group', 'Personal AI development and learning', 'individual', true),
  ('Albaad Community', 'Custom AI implementation group', 'enterprise', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO user_groups (name, description, permissions) VALUES
  ('Fitness Members', 'Access to fitness and health AI content', ARRAY['read_articles', 'create_comments']),
  ('Parent Educators', 'Full access to educational AI resources', ARRAY['read_articles', 'create_comments', 'create_content']),
  ('Family Users', 'Family-friendly AI content access', ARRAY['read_articles', 'create_comments']),
  ('Individual Learners', 'Personal AI learning and development', ARRAY['read_articles', 'create_comments', 'create_content']),
  ('Enterprise Users', 'Advanced AI implementation access', ARRAY['read_articles', 'create_comments', 'create_content', 'admin_access'])
ON CONFLICT (name) DO NOTHING;

-- Create the specific invite codes requested
INSERT INTO registration_codes (
  code, 
  entity_id, 
  user_group_id, 
  created_by,
  max_uses,
  expires_at,
  is_active,
  description
) VALUES
  -- ISAFITTNES - Fitness/Health content focus
  (
    'ISAFITTNES',
    (SELECT id FROM entities WHERE name = 'ISAI Fitness Community' LIMIT 1),
    (SELECT id FROM user_groups WHERE name = 'Fitness Members' LIMIT 1),
    NULL, -- Set to admin user ID if you have one
    100, -- Max 100 uses
    '2025-12-31 23:59:59'::timestamp,
    true,
    'Fitness and health AI content access'
  ),
  
  -- ISAPARENTS - Parenting/Education content focus  
  (
    'ISAPARENTS',
    (SELECT id FROM entities WHERE name = 'ISAI Parents Network' LIMIT 1),
    (SELECT id FROM user_groups WHERE name = 'Parent Educators' LIMIT 1),
    NULL,
    150, -- Max 150 uses
    '2025-12-31 23:59:59'::timestamp,
    true,
    'Educational AI tools for parents and educators'
  ),
  
  -- ChurroFamily - Family-oriented access
  (
    'ChurroFamily',
    (SELECT id FROM entities WHERE name = 'Churro Family' LIMIT 1),
    (SELECT id FROM user_groups WHERE name = 'Family Users' LIMIT 1),
    NULL,
    50, -- Max 50 uses (smaller family group)
    '2025-12-31 23:59:59'::timestamp,
    true,
    'Family-oriented AI knowledge sharing'
  ),
  
  -- Sayret - Personal/Individual access
  (
    'Sayret',
    (SELECT id FROM entities WHERE name = 'Sayret Group' LIMIT 1),
    (SELECT id FROM user_groups WHERE name = 'Individual Learners' LIMIT 1),
    NULL,
    25, -- More exclusive access
    '2025-12-31 23:59:59'::timestamp,
    true,
    'Personal AI development and learning'
  ),
  
  -- Albaad - Custom group access
  (
    'Albaad',
    (SELECT id FROM entities WHERE name = 'Albaad Community' LIMIT 1),
    (SELECT id FROM user_groups WHERE name = 'Enterprise Users' LIMIT 1),
    NULL,
    75, -- Enterprise level access
    '2025-12-31 23:59:59'::timestamp,
    true,
    'Custom AI implementation group with advanced access'
  )
ON CONFLICT (code) DO UPDATE SET
  max_uses = EXCLUDED.max_uses,
  expires_at = EXCLUDED.expires_at,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- Verify the codes were created
SELECT 
  rc.code,
  rc.description,
  rc.max_uses,
  rc.current_uses,
  rc.expires_at,
  rc.is_active,
  e.name as entity_name,
  ug.name as user_group_name
FROM registration_codes rc
LEFT JOIN entities e ON rc.entity_id = e.id
LEFT JOIN user_groups ug ON rc.user_group_id = ug.id
WHERE rc.code IN ('ISAFITTNES', 'ISAPARENTS', 'ChurroFamily', 'Sayret', 'Albaad')
ORDER BY rc.code;
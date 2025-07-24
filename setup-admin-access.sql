-- Setup Admin Access for ofir.wienerman@gmail.com
-- This script creates admin infrastructure and promotes the user

-- Step 1: Create Admin Entity (if it doesn't exist)
INSERT INTO entities (name, code_prefix, default_language, description) 
VALUES (
    'ISAI Administration', 
    'ADMIN', 
    'en',
    'System administrators with full access permissions'
)
ON CONFLICT (code_prefix) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- Step 2: Create Admin User Group (if it doesn't exist)
INSERT INTO user_groups (entity_id, name, description, permissions) 
VALUES (
    (SELECT id FROM entities WHERE code_prefix = 'ADMIN' LIMIT 1),
    'Administrators', 
    'System administrators with full access to all features',
    jsonb_build_object(
        'content.view', true,
        'content.create', true,
        'content.edit', true,
        'content.delete', true,
        'content.publish', true,
        'articles.view', true,
        'articles.create', true,
        'articles.edit', true,
        'articles.delete', true,
        'articles.publish', true,
        'users.view', true,
        'users.create', true,
        'users.edit', true,
        'users.delete', true,
        'users.manage_roles', true,
        'analytics.view', true,
        'analytics.export', true,
        'analytics.manage', true,
        'codes.view', true,
        'codes.create', true,
        'codes.edit', true,
        'codes.delete', true,
        'codes.analytics', true,
        'admin.access', true,
        'admin.manage_entities', true,
        'admin.manage_groups', true,
        'admin.system_settings', true,
        'forum.view', true,
        'forum.post', true,
        'forum.moderate', true,
        'comments.view', true,
        'comments.create', true,
        'comments.edit', true,
        'comments.delete', true,
        'comments.moderate', true
    )
)
ON CONFLICT (entity_id, name) DO UPDATE SET
    permissions = EXCLUDED.permissions,
    description = EXCLUDED.description;

-- Step 3: Create Admin Registration Code
INSERT INTO registration_codes (
    code, 
    entity_id, 
    user_group_id, 
    max_uses, 
    is_active,
    description,
    expires_at
) 
VALUES (
    'ADMIN_2025',
    (SELECT id FROM entities WHERE code_prefix = 'ADMIN' LIMIT 1),
    (SELECT id FROM user_groups WHERE name = 'Administrators' AND entity_id = (SELECT id FROM entities WHERE code_prefix = 'ADMIN') LIMIT 1),
    100,
    true,
    'Administrator registration code for 2025',
    '2026-12-31 23:59:59+00'
)
ON CONFLICT (code) DO UPDATE SET
    is_active = true,
    max_uses = 100,
    expires_at = '2026-12-31 23:59:59+00';

-- Step 4: Promote ofir.wienerman@gmail.com to Admin
-- First, check if user exists and get their ID
DO $$
DECLARE 
    user_uuid UUID;
    admin_entity_id UUID;
    admin_group_id UUID;
BEGIN
    -- Get admin entity and group IDs
    SELECT id INTO admin_entity_id FROM entities WHERE code_prefix = 'ADMIN' LIMIT 1;
    SELECT id INTO admin_group_id FROM user_groups WHERE name = 'Administrators' AND entity_id = admin_entity_id LIMIT 1;
    
    -- Check if user exists in auth.users (Supabase auth table)
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'ofir.wienerman@gmail.com' LIMIT 1;
    
    IF user_uuid IS NOT NULL THEN
        -- User exists in auth, now check/create their profile
        INSERT INTO users (
            id, 
            email, 
            full_name, 
            entity_id, 
            user_group_id,
            registration_code,
            is_active,
            preferred_language
        ) 
        VALUES (
            user_uuid,
            'ofir.wienerman@gmail.com',
            'Ofir Wienerman',
            admin_entity_id,
            admin_group_id,
            'ADMIN_2025',
            true,
            'en'
        )
        ON CONFLICT (id) DO UPDATE SET
            entity_id = admin_entity_id,
            user_group_id = admin_group_id,
            is_active = true,
            updated_at = NOW();
            
        RAISE NOTICE 'Successfully promoted ofir.wienerman@gmail.com to admin';
    ELSE
        RAISE NOTICE 'User ofir.wienerman@gmail.com not found in auth.users. They need to sign up first.';
    END IF;
END $$;

-- Step 5: Verification Query
SELECT 
    'Admin Setup Verification' as status,
    e.name as entity_name,
    e.code_prefix,
    ug.name as user_group_name,
    rc.code as registration_code,
    rc.max_uses,
    rc.is_active as code_active
FROM entities e
JOIN user_groups ug ON e.id = ug.entity_id
JOIN registration_codes rc ON ug.id = rc.user_group_id
WHERE e.code_prefix = 'ADMIN';

-- Check if ofir.wienerman@gmail.com has admin access
SELECT 
    'User Admin Status' as status,
    u.email,
    u.full_name,
    e.name as entity_name,
    e.code_prefix,
    ug.name as user_group_name,
    u.is_active
FROM users u
LEFT JOIN entities e ON u.entity_id = e.id
LEFT JOIN user_groups ug ON u.user_group_id = ug.id
WHERE u.email = 'ofir.wienerman@gmail.com';
-- Check Admin Status for ofir.wienerman@gmail.com
-- Run this in Supabase SQL editor to see current user status

-- Check if user exists in auth.users
SELECT 
    'Auth Users Check' as table_name,
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at
FROM auth.users 
WHERE email = 'ofir.wienerman@gmail.com';

-- Check if user has profile in users table
SELECT 
    'User Profile Check' as table_name,
    u.id,
    u.email,
    u.full_name,
    u.is_active,
    e.name as entity_name,
    e.code_prefix,
    ug.name as user_group_name,
    u.created_at
FROM users u
LEFT JOIN entities e ON u.entity_id = e.id
LEFT JOIN user_groups ug ON u.user_group_id = ug.id
WHERE u.email = 'ofir.wienerman@gmail.com';

-- Check current admin infrastructure
SELECT 
    'Admin Infrastructure' as table_name,
    e.name as entity_name,
    e.code_prefix,
    ug.name as user_group_name,
    rc.code as registration_code,
    rc.is_active as code_active,
    rc.max_uses,
    rc.current_uses
FROM entities e
LEFT JOIN user_groups ug ON e.id = ug.entity_id
LEFT JOIN registration_codes rc ON ug.id = rc.user_group_id
WHERE e.code_prefix LIKE 'ADMIN%' OR ug.name ILIKE '%admin%'
ORDER BY e.created_at DESC;

-- Check all entities and groups (for debugging)
SELECT 
    'All Entities' as table_name,
    name,
    code_prefix,
    created_at
FROM entities
ORDER BY created_at DESC
LIMIT 10;
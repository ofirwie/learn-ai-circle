-- Debug Registration Code Creation Issues
-- Run this in Supabase SQL Editor to check the current state

-- 1. Check if admin entity exists
SELECT 
    'Admin Entity Check' as check_type,
    id,
    name,
    code_prefix,
    created_at
FROM entities 
WHERE code_prefix = 'ADMIN';

-- 2. Check if admin user group exists
SELECT 
    'Admin User Group Check' as check_type,
    ug.id,
    ug.name,
    ug.entity_id,
    e.name as entity_name,
    ug.created_at
FROM user_groups ug
LEFT JOIN entities e ON ug.entity_id = e.id
WHERE e.code_prefix = 'ADMIN' AND ug.name = 'Administrators';

-- 3. Check existing registration codes
SELECT 
    'Existing Registration Codes' as check_type,
    rc.id,
    rc.code,
    rc.description,
    rc.entity_id,
    rc.user_group_id,
    rc.is_active,
    rc.max_uses,
    rc.current_uses,
    e.name as entity_name,
    ug.name as user_group_name,
    rc.created_at
FROM registration_codes rc
LEFT JOIN entities e ON rc.entity_id = e.id
LEFT JOIN user_groups ug ON rc.user_group_id = ug.id
ORDER BY rc.created_at DESC
LIMIT 10;

-- 4. Check registration_codes table structure
SELECT 
    'Table Structure' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'registration_codes' 
ORDER BY ordinal_position;

-- 5. Check if ofir.wienerman@gmail.com has admin access
SELECT 
    'User Admin Status' as check_type,
    u.id,
    u.email,
    u.full_name,
    u.entity_id,
    u.user_group_id,
    e.name as entity_name,
    e.code_prefix,
    ug.name as user_group_name,
    u.is_active,
    u.created_at
FROM users u
LEFT JOIN entities e ON u.entity_id = e.id
LEFT JOIN user_groups ug ON u.user_group_id = ug.id
WHERE u.email = 'ofir.wienerman@gmail.com';

-- 6. Test a simple registration code insert (this will help identify the exact error)
-- Uncomment the lines below ONLY if the admin entity and group exist from checks above
-- 
-- INSERT INTO registration_codes (
--     code, 
--     description, 
--     max_uses, 
--     current_uses, 
--     is_active, 
--     expires_at,
--     entity_id,
--     user_group_id
-- ) 
-- SELECT 
--     'TEST_DEBUG_' || EXTRACT(EPOCH FROM NOW())::TEXT,
--     'Debug test code',
--     1,
--     0,
--     true,
--     NOW() + INTERVAL '1 day',
--     e.id,
--     ug.id
-- FROM entities e
-- JOIN user_groups ug ON e.id = ug.entity_id
-- WHERE e.code_prefix = 'ADMIN' AND ug.name = 'Administrators';
-- Debug RLS and Authentication Issues
-- Run this while logged in as ofir.wienerman@gmail.com

-- 1. Check current auth user
SELECT 
    'Current Auth User' as check_type,
    auth.uid() as auth_uid,
    auth.email() as auth_email,
    auth.role() as auth_role;

-- 2. Check if auth.uid() matches any user in users table
SELECT 
    'User Profile Check' as check_type,
    u.id,
    u.email,
    u.entity_id,
    u.user_group_id,
    e.name as entity_name,
    ug.name as group_name,
    (u.id = auth.uid()) as is_current_user
FROM users u
LEFT JOIN entities e ON u.entity_id = e.id
LEFT JOIN user_groups ug ON u.user_group_id = ug.id
WHERE u.email = 'ofir.wienerman@gmail.com' OR u.id = auth.uid();

-- 3. Check permissions for current authenticated user
SELECT 
    'Current User Permissions' as check_type,
    u.email,
    ug.permissions->>'codes.create' as can_create_codes,
    ug.permissions->>'codes.view' as can_view_codes,
    ug.permissions->>'admin.access' as has_admin_access,
    ug.permissions
FROM users u
JOIN user_groups ug ON u.user_group_id = ug.id
WHERE u.id = auth.uid();

-- 4. Test the exact RLS check for INSERT
SELECT 
    'RLS Insert Check' as check_type,
    EXISTS (
        SELECT 1 FROM users u
        JOIN user_groups ug ON u.user_group_id = ug.id
        WHERE u.id = auth.uid()
        AND ug.permissions->>'codes.create' = 'true'
    ) as has_codes_create_permission,
    EXISTS (
        SELECT 1 FROM users u
        JOIN user_groups ug ON u.user_group_id = ug.id
        WHERE u.id = auth.uid()
        AND ug.permissions->>'admin.access' = 'true'
    ) as has_admin_access,
    (SELECT entity_id FROM users WHERE id = auth.uid()) as user_entity_id;

-- 5. Simplified RLS policy - temporarily replace the complex policy
-- This creates a simpler policy that should work
DROP POLICY IF EXISTS "registration_codes_insert" ON registration_codes;

CREATE POLICY "registration_codes_insert" ON registration_codes
FOR INSERT
TO authenticated
WITH CHECK (
    -- Simplified: Allow any authenticated user who is in the users table with admin group
    auth.uid() IN (
        SELECT u.id 
        FROM users u
        JOIN user_groups ug ON u.user_group_id = ug.id
        WHERE ug.name = 'Administrators'
    )
);

-- 6. Alternative: Even simpler policy for testing
-- Uncomment these lines if the above still doesn't work
-- DROP POLICY IF EXISTS "registration_codes_insert" ON registration_codes;
-- 
-- CREATE POLICY "registration_codes_insert" ON registration_codes
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (
--     auth.uid() IN (
--         SELECT id FROM users WHERE email = 'ofir.wienerman@gmail.com'
--     )
-- );

-- 7. Check all existing policies on registration_codes
SELECT 
    'Existing Policies' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'registration_codes';

-- 8. Final verification - check if RLS is even enabled
SELECT 
    'RLS Status' as check_type,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'registration_codes';

-- If RLS is not enabled, enable it:
-- ALTER TABLE registration_codes ENABLE ROW LEVEL SECURITY;
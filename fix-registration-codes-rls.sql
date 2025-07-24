-- Fix Row Level Security for registration_codes table
-- This allows admin users to create, view, and manage registration codes

-- First, check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'registration_codes';

-- Drop existing policies (if any) to start fresh
DROP POLICY IF EXISTS "registration_codes_select" ON registration_codes;
DROP POLICY IF EXISTS "registration_codes_insert" ON registration_codes;
DROP POLICY IF EXISTS "registration_codes_update" ON registration_codes;
DROP POLICY IF EXISTS "registration_codes_delete" ON registration_codes;

-- Create new RLS policies for registration_codes

-- Policy 1: Allow authenticated users to view registration codes from their entity
CREATE POLICY "registration_codes_select" ON registration_codes
FOR SELECT
TO authenticated
USING (
    -- Users can see registration codes from their entity
    entity_id IN (
        SELECT entity_id FROM users WHERE id = auth.uid()
    )
    OR
    -- Admin users can see all registration codes
    EXISTS (
        SELECT 1 FROM users u
        JOIN user_groups ug ON u.user_group_id = ug.id
        WHERE u.id = auth.uid()
        AND ug.permissions->>'codes.view' = 'true'
    )
);

-- Policy 2: Allow admin users to insert registration codes
CREATE POLICY "registration_codes_insert" ON registration_codes
FOR INSERT
TO authenticated
WITH CHECK (
    -- Must be an admin with codes.create permission
    EXISTS (
        SELECT 1 FROM users u
        JOIN user_groups ug ON u.user_group_id = ug.id
        WHERE u.id = auth.uid()
        AND ug.permissions->>'codes.create' = 'true'
    )
    AND
    -- Must insert for their own entity or be a super admin
    (
        entity_id IN (
            SELECT entity_id FROM users WHERE id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM users u
            JOIN user_groups ug ON u.user_group_id = ug.id
            WHERE u.id = auth.uid()
            AND ug.permissions->>'admin.access' = 'true'
        )
    )
);

-- Policy 3: Allow admin users to update registration codes
CREATE POLICY "registration_codes_update" ON registration_codes
FOR UPDATE
TO authenticated
USING (
    -- Must be an admin with codes.edit permission
    EXISTS (
        SELECT 1 FROM users u
        JOIN user_groups ug ON u.user_group_id = ug.id
        WHERE u.id = auth.uid()
        AND ug.permissions->>'codes.edit' = 'true'
    )
    AND
    -- Must be from their entity or be a super admin
    (
        entity_id IN (
            SELECT entity_id FROM users WHERE id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM users u
            JOIN user_groups ug ON u.user_group_id = ug.id
            WHERE u.id = auth.uid()
            AND ug.permissions->>'admin.access' = 'true'
        )
    )
);

-- Policy 4: Allow admin users to delete registration codes
CREATE POLICY "registration_codes_delete" ON registration_codes
FOR DELETE
TO authenticated
USING (
    -- Must be an admin with codes.delete permission
    EXISTS (
        SELECT 1 FROM users u
        JOIN user_groups ug ON u.user_group_id = ug.id
        WHERE u.id = auth.uid()
        AND ug.permissions->>'codes.delete' = 'true'
    )
    AND
    -- Must be from their entity or be a super admin
    (
        entity_id IN (
            SELECT entity_id FROM users WHERE id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM users u
            JOIN user_groups ug ON u.user_group_id = ug.id
            WHERE u.id = auth.uid()
            AND ug.permissions->>'admin.access' = 'true'
        )
    )
);

-- Verify the current user's permissions
SELECT 
    'Current User Permissions' as check,
    u.id,
    u.email,
    u.entity_id,
    u.user_group_id,
    ug.name as group_name,
    ug.permissions->>'codes.create' as can_create_codes,
    ug.permissions->>'codes.view' as can_view_codes,
    ug.permissions->>'admin.access' as is_admin
FROM users u
JOIN user_groups ug ON u.user_group_id = ug.id
WHERE u.email = 'ofir.wienerman@gmail.com';

-- Test: Try to insert a test registration code
-- This will help verify if the policies work
INSERT INTO registration_codes (
    code, 
    entity_id, 
    user_group_id, 
    max_uses, 
    is_active,
    expires_at
) 
SELECT 
    'RLS_TEST_' || EXTRACT(EPOCH FROM NOW())::TEXT,
    e.id,
    ug.id,
    1,
    true,
    NOW() + INTERVAL '1 day'
FROM entities e
JOIN user_groups ug ON e.id = ug.entity_id
WHERE e.code_prefix = 'ADMIN' 
AND ug.name = 'Administrators';

-- Check if the test code was created
SELECT 
    'Test Code Result' as check,
    code,
    entity_id,
    user_group_id,
    max_uses,
    is_active
FROM registration_codes
WHERE code LIKE 'RLS_TEST_%'
ORDER BY created_at DESC
LIMIT 1;

-- Clean up test code
DELETE FROM registration_codes WHERE code LIKE 'RLS_TEST_%';
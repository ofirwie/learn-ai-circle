-- Complete Fix for Registration Codes RLS Issues
-- This script fixes both INSERT and SELECT permissions

-- 1. First, disable RLS temporarily to fix everything
ALTER TABLE registration_codes DISABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "registration_codes_select" ON registration_codes;
DROP POLICY IF EXISTS "registration_codes_insert" ON registration_codes;
DROP POLICY IF EXISTS "registration_codes_update" ON registration_codes;
DROP POLICY IF EXISTS "registration_codes_delete" ON registration_codes;

-- 3. Re-enable RLS
ALTER TABLE registration_codes ENABLE ROW LEVEL SECURITY;

-- 4. Create new, simpler policies

-- Policy for SELECT: Allow authenticated users to view codes
CREATE POLICY "Allow authenticated users to view registration codes" ON registration_codes
FOR SELECT
TO authenticated
USING (true);  -- Allow all authenticated users to view codes

-- Policy for INSERT: Allow authenticated admin users to create codes
CREATE POLICY "Allow admin users to create registration codes" ON registration_codes
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() IN (
        SELECT u.id 
        FROM users u
        JOIN user_groups ug ON u.user_group_id = ug.id
        JOIN entities e ON u.entity_id = e.id
        WHERE e.code_prefix = 'ADMIN'
    )
);

-- Policy for UPDATE: Allow admin users to update codes
CREATE POLICY "Allow admin users to update registration codes" ON registration_codes
FOR UPDATE
TO authenticated
USING (
    auth.uid() IN (
        SELECT u.id 
        FROM users u
        JOIN user_groups ug ON u.user_group_id = ug.id
        JOIN entities e ON u.entity_id = e.id
        WHERE e.code_prefix = 'ADMIN'
    )
);

-- Policy for DELETE: Allow admin users to delete codes
CREATE POLICY "Allow admin users to delete registration codes" ON registration_codes
FOR DELETE
TO authenticated
USING (
    auth.uid() IN (
        SELECT u.id 
        FROM users u
        JOIN user_groups ug ON u.user_group_id = ug.id
        JOIN entities e ON u.entity_id = e.id
        WHERE e.code_prefix = 'ADMIN'
    )
);

-- 5. Verify the policies were created
SELECT 
    'Policy Check' as status,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'registration_codes'
ORDER BY policyname;

-- 6. Test if current user can now see registration codes
SELECT 
    'Registration Codes Visible' as status,
    COUNT(*) as total_codes
FROM registration_codes;

-- 7. List all registration codes (should work now)
SELECT 
    'All Registration Codes' as status,
    code,
    entity_id,
    user_group_id,
    max_uses,
    current_uses,
    is_active,
    expires_at
FROM registration_codes
ORDER BY created_at DESC;
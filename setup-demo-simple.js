import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ilotcwtcnlihoprxcdzp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlsb3Rjd3RjbmxpaG9wcnhjZHpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2OTQzNzIsImV4cCI6MjA1MDI3MDM3Mn0.-qJpKQJy6T-BZ1q6PVUy9FzZIsIn1lZo4DQyb8HY6sE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAndSetupDemo() {
  console.log('🔍 Checking current database state...\n')

  try {
    // Check what exists
    const { data: entities, error: e1 } = await supabase.from('entities').select('*')
    const { data: codes, error: e2 } = await supabase.from('registration_codes').select('*')
    const { data: groups, error: e3 } = await supabase.from('user_groups').select('*')

    console.log('Current database contents:')
    console.log('Entities:', entities?.length || 0, entities || e1?.message)
    console.log('Registration codes:', codes?.length || 0, codes || e2?.message)  
    console.log('User groups:', groups?.length || 0, groups || e3?.message)

    if (!entities?.length || !codes?.length || !groups?.length) {
      console.log('\n⚠️  Missing demo data!')
      console.log('\n📋 Please run this SQL in your Supabase dashboard:\n')
      console.log(`
-- Step 1: Create demo entity
INSERT INTO entities (name, code_prefix, default_language, is_active) 
VALUES ('Demo Organization', 'DEMO', 'en', true)
ON CONFLICT (code_prefix) DO UPDATE SET is_active = true;

-- Step 2: Create user group
INSERT INTO user_groups (entity_id, name, description, is_active) 
SELECT 
  (SELECT id FROM entities WHERE code_prefix = 'DEMO' LIMIT 1),
  'Users',
  'General users',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM user_groups 
  WHERE entity_id = (SELECT id FROM entities WHERE code_prefix = 'DEMO' LIMIT 1)
  AND name = 'Users'
);

-- Step 3: Create or update registration code
INSERT INTO registration_codes (code, entity_id, user_group_id, max_uses, current_uses, is_active) 
SELECT
  'DEMO2024',
  (SELECT id FROM entities WHERE code_prefix = 'DEMO' LIMIT 1),
  (SELECT id FROM user_groups WHERE entity_id = (SELECT id FROM entities WHERE code_prefix = 'DEMO' LIMIT 1) AND name = 'Users' LIMIT 1),
  100,
  0,
  true
ON CONFLICT (code) DO UPDATE SET 
  is_active = true,
  max_uses = 100,
  entity_id = EXCLUDED.entity_id,
  user_group_id = EXCLUDED.user_group_id;

-- Verify the setup
SELECT 
  'Setup Complete!' as status,
  (SELECT COUNT(*) FROM entities WHERE code_prefix = 'DEMO') as entities_count,
  (SELECT COUNT(*) FROM user_groups WHERE entity_id = (SELECT id FROM entities WHERE code_prefix = 'DEMO')) as groups_count,
  (SELECT COUNT(*) FROM registration_codes WHERE code = 'DEMO2024' AND is_active = true) as active_codes_count;
      `)
    } else {
      console.log('\n✅ Demo data exists!')
      
      // Check if DEMO2024 code is active
      const demoCode = codes?.find(c => c.code === 'DEMO2024')
      if (demoCode) {
        console.log(`\n🔑 Registration code "DEMO2024":`)
        console.log(`  - Active: ${demoCode.is_active}`)
        console.log(`  - Uses: ${demoCode.current_uses}/${demoCode.max_uses}`)
        
        if (!demoCode.is_active) {
          console.log('\n⚠️  Code is inactive! Run this SQL to activate:')
          console.log(`UPDATE registration_codes SET is_active = true WHERE code = 'DEMO2024';`)
        }
      } else {
        console.log('\n⚠️  DEMO2024 code not found! Use the SQL above to create it.')
      }
    }

  } catch (error) {
    console.error('Error:', error.message)
  }
}

checkAndSetupDemo()
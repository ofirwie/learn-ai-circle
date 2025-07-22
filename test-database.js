// Simple database connection test
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ilotcwtcnlihoprxcdzp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlsb3Rjd3RjbmxpaG9wcnhjZHpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NjEyODEsImV4cCI6MjA2ODUzNzI4MX0.aCNESZNvoz_vL_lHT68NyExTjYmaw9Z5YJ_6rtcKaZk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔗 Testing Supabase connection...')
  
  try {
    // Test 1: Check entities table
    console.log('📋 Checking entities...')
    const { data: entities, error: entitiesError } = await supabase
      .from('entities')
      .select('*')
      .limit(5)
    
    if (entitiesError) {
      console.error('❌ Entities error:', entitiesError.message)
    } else {
      console.log('✅ Entities found:', entities?.length || 0)
      entities?.forEach(entity => console.log(`  - ${entity.name} (${entity.code_prefix})`))
    }
    
    // Test 2: Check registration codes
    console.log('🔑 Checking registration codes...')
    const { data: codes, error: codesError } = await supabase
      .from('registration_codes')
      .select('*')
      .eq('is_active', true)
      .limit(5)
    
    if (codesError) {
      console.error('❌ Registration codes error:', codesError.message)
    } else {
      console.log('✅ Active registration codes found:', codes?.length || 0)
      codes?.forEach(code => console.log(`  - ${code.code} (${code.current_uses}/${code.max_uses})`))
    }
    
    // Test 3: Check user groups
    console.log('👥 Checking user groups...')
    const { data: groups, error: groupsError } = await supabase
      .from('user_groups')
      .select('*')
      .limit(5)
    
    if (groupsError) {
      console.error('❌ User groups error:', groupsError.message)
    } else {
      console.log('✅ User groups found:', groups?.length || 0)
      groups?.forEach(group => console.log(`  - ${group.name}`))
    }
    
  } catch (error) {
    console.error('💥 Connection test failed:', error.message)
  }
}

testConnection()
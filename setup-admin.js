// Setup admin user and data
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ilotcwtcnlihoprxcdzp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlsb3Rjd3RjbmxpaG9wcnhjZHpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjk2MTI4MSwiZXhwIjoyMDY4NTM3MjgxfQ.N01dhXaot3xNHgONGcWzoXzYmnqMOvenh1YLgoOjLg4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupAdmin() {
  console.log('🏗️ Setting up admin data...')
  
  try {
    // 1. Create admin entity
    console.log('📍 Creating admin entity...')
    const { data: entity, error: entityError } = await supabase
      .from('entities')
      .upsert({
        name: 'ISAI Admin',
        code_prefix: 'ADMIN',
        default_language: 'en',
        settings: {},
        is_active: true
      }, { onConflict: 'code_prefix' })
      .select()
      .single()
    
    if (entityError) {
      console.error('❌ Entity creation failed:', entityError)
      return
    }
    console.log('✅ Entity created:', entity.name)
    
    // 2. Create admin user group
    console.log('👥 Creating admin user group...')
    const { data: userGroup, error: groupError } = await supabase
      .from('user_groups')
      .insert({
        entity_id: entity.id,
        name: 'Administrators',
        description: 'System administrators with full access',
        permissions: { admin: true, read: true, write: true, delete: true },
        can_see_groups: [],
        display_order: 0,
        is_active: true
      })
      .select()
      .single()
    
    if (groupError) {
      console.error('❌ User group creation failed:', groupError)
      return
    }
    console.log('✅ User group created:', userGroup.name)
    
    // 3. Create admin registration code
    console.log('🔑 Creating admin registration code...')
    const { data: regCode, error: codeError } = await supabase
      .from('registration_codes')
      .insert({
        code: 'ADMIN_2025',
        entity_id: entity.id,
        user_group_id: userGroup.id,
        max_uses: 10,
        current_uses: 0,
        is_active: true,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
      })
      .select()
      .single()
    
    if (codeError) {
      console.error('❌ Registration code creation failed:', codeError)
      return
    }
    console.log('✅ Registration code created:', regCode.code)
    
    console.log('🎉 Admin setup complete!')
    console.log('📝 Use registration code: ADMIN_2025')
    console.log('👤 You can now create admin users with this code')
    
  } catch (error) {
    console.error('💥 Setup failed:', error.message)
  }
}

setupAdmin()
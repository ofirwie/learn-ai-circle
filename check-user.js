// Check if user was created successfully
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ilotcwtcnlihoprxcdzp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlsb3Rjd3RjbmxpaG9wcnhjZHpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjk2MTI4MSwiZXhwIjoyMDY4NTM3MjgxfQ.N01dhXaot3xNHgONGcWzoXzYmnqMOvenh1YLgoOjLg4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUser() {
  console.log('🔍 Checking user status...')
  
  try {
    // Check if user exists in auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Auth error:', authError)
      return
    }
    
    const ofirUser = users.find(u => u.email === 'ofir.wienerman@gmail.com')
    
    if (ofirUser) {
      console.log('✅ User found in auth!')
      console.log('   ID:', ofirUser.id)
      console.log('   Email:', ofirUser.email)
      console.log('   Confirmed:', ofirUser.email_confirmed_at ? 'Yes' : 'No')
      console.log('   Created:', ofirUser.created_at)
      
      // Check user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*, entity:entities(*), user_group:user_groups(*)')
        .eq('id', ofirUser.id)
        .single()
      
      if (profileError) {
        console.error('❌ Profile not found:', profileError.message)
        console.log('🔧 Creating user profile...')
        
        // Get admin entity and group
        const { data: entity } = await supabase
          .from('entities')
          .select('*')
          .eq('code_prefix', 'ADMIN')
          .single()
          
        const { data: userGroup } = await supabase
          .from('user_groups')
          .select('*')
          .eq('name', 'Administrators')
          .single()
        
        // Create profile
        const { error: createError } = await supabase
          .from('users')
          .insert({
            id: ofirUser.id,
            email: ofirUser.email,
            full_name: 'Ofir Wienerman',
            registration_code: 'Churro393$',
            entity_id: entity?.id,
            user_group_id: userGroup?.id,
            preferred_language: 'en'
          })
        
        if (createError) {
          console.error('❌ Failed to create profile:', createError)
        } else {
          console.log('✅ Profile created successfully!')
        }
      } else {
        console.log('✅ Profile found!')
        console.log('   Name:', profile.full_name)
        console.log('   Entity:', profile.entity?.name)
        console.log('   Group:', profile.user_group?.name)
      }
    } else {
      console.log('❌ User not found in auth')
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message)
  }
}

checkUser()
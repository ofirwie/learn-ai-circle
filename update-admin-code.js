// Update admin registration code
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ilotcwtcnlihoprxcdzp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlsb3Rjd3RjbmxpaG9wcnhjZHpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjk2MTI4MSwiZXhwIjoyMDY4NTM3MjgxfQ.N01dhXaot3xNHgONGcWzoXzYmnqMOvenh1YLgoOjLg4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateAdminCode() {
  console.log('🔐 Updating admin registration code...')
  
  try {
    // Update the existing ADMIN_2025 code to Churro393$
    const { data, error } = await supabase
      .from('registration_codes')
      .update({ 
        code: 'Churro393$',
        current_uses: 0,  // Reset usage count
        is_active: true
      })
      .eq('code', 'ADMIN_2025')
      .select()
      .single()
    
    if (error) {
      console.error('❌ Update failed:', error)
      return
    }
    
    console.log('✅ Registration code updated successfully!')
    console.log('📝 New admin code: Churro393$')
    console.log('🏢 Entity: ISAI Admin')
    console.log('👥 Group: Administrators')
    
  } catch (error) {
    console.error('💥 Error:', error.message)
  }
}

updateAdminCode()
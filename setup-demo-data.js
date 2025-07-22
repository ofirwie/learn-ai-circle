import { createClient } from '@supabase/supabase-js'

// Using the service key for admin access to insert data
const supabaseUrl = 'https://ilotcwtcnlihoprxcdzp.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlsb3Rjd3RjbmxpaG9wcnhjZHpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY5NDM3MiwiZXhwIjoyMDUwMjcwMzcyfQ.xbWnNATiYX5Uq3PvsYtXbkSZgPG-zPWWwWmIg8JMN-U' // Replace with your actual service key

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupDemoData() {
  console.log('🚀 Setting up ISAI demo data...\n')

  try {
    // Step 1: Create demo entity
    console.log('📋 Creating demo entity...')
    const { data: existingEntity } = await supabase
      .from('entities')
      .select('*')
      .eq('code_prefix', 'DEMO')
      .single()

    let entityId
    if (existingEntity) {
      console.log('✅ Demo entity already exists')
      entityId = existingEntity.id
    } else {
      const { data: newEntity, error: entityError } = await supabase
        .from('entities')
        .insert({
          name: 'Demo Organization',
          code_prefix: 'DEMO',
          default_language: 'en',
          is_active: true
        })
        .select()
        .single()

      if (entityError) {
        console.error('❌ Failed to create entity:', entityError)
        return
      }
      console.log('✅ Created demo entity')
      entityId = newEntity.id
    }

    // Step 2: Create user group
    console.log('\n👥 Creating user group...')
    const { data: existingGroup } = await supabase
      .from('user_groups')
      .select('*')
      .eq('entity_id', entityId)
      .eq('name', 'Users')
      .single()

    let groupId
    if (existingGroup) {
      console.log('✅ User group already exists')
      groupId = existingGroup.id
    } else {
      const { data: newGroup, error: groupError } = await supabase
        .from('user_groups')
        .insert({
          entity_id: entityId,
          name: 'Users',
          description: 'General users',
          is_active: true
        })
        .select()
        .single()

      if (groupError) {
        console.error('❌ Failed to create user group:', groupError)
        return
      }
      console.log('✅ Created user group')
      groupId = newGroup.id
    }

    // Step 3: Create registration code
    console.log('\n🔑 Creating registration code...')
    const { data: existingCode } = await supabase
      .from('registration_codes')
      .select('*')
      .eq('code', 'DEMO2024')
      .single()

    if (existingCode) {
      // Update existing code to ensure it's active
      const { error: updateError } = await supabase
        .from('registration_codes')
        .update({
          is_active: true,
          max_uses: 100,
          entity_id: entityId,
          user_group_id: groupId
        })
        .eq('code', 'DEMO2024')

      if (updateError) {
        console.error('❌ Failed to update registration code:', updateError)
      } else {
        console.log('✅ Updated existing registration code')
      }
    } else {
      const { error: codeError } = await supabase
        .from('registration_codes')
        .insert({
          code: 'DEMO2024',
          entity_id: entityId,
          user_group_id: groupId,
          max_uses: 100,
          current_uses: 0,
          is_active: true
        })

      if (codeError) {
        console.error('❌ Failed to create registration code:', codeError)
        return
      }
      console.log('✅ Created registration code')
    }

    // Step 4: Verify everything
    console.log('\n🔍 Verifying setup...')
    
    const { data: finalCheck } = await supabase
      .from('registration_codes')
      .select(`
        *,
        entity:entities(*),
        user_group:user_groups(*)
      `)
      .eq('code', 'DEMO2024')
      .single()

    if (finalCheck) {
      console.log('\n✅ ✅ ✅ DEMO DATA SETUP COMPLETE! ✅ ✅ ✅')
      console.log('\n📋 Summary:')
      console.log(`  Entity: ${finalCheck.entity.name} (${finalCheck.entity.code_prefix})`)
      console.log(`  User Group: ${finalCheck.user_group.name}`)
      console.log(`  Registration Code: ${finalCheck.code}`)
      console.log(`  Max Uses: ${finalCheck.max_uses}`)
      console.log(`  Active: ${finalCheck.is_active}`)
      console.log('\n🎉 You can now use registration code "DEMO2024" to create accounts!')
    } else {
      console.error('❌ Setup verification failed')
    }

  } catch (error) {
    console.error('💥 Setup error:', error)
  }
}

// Run the setup
setupDemoData()
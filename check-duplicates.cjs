const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ilotcwtcnlihoprxcdzp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlsb3Rjd3RjbmxpaG9wcnhjZHpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjk2MTI4MSwiZXhwIjoyMDY4NTM3MjgxfQ.N01dhXaot3xNHgONGcWzoXzYmnqMOvenh1YLgoOjLg4'
);

async function checkDuplicates() {
  console.log('Checking for duplicate prompts...');
  
  const { data: prompts, error } = await supabase
    .from('content')
    .select('id, title, content_json, created_at')
    .eq('content_type', 'prompt');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Total prompts found:', prompts.length);
  
  // Group by title to find duplicates
  const titleGroups = {};
  prompts.forEach(prompt => {
    if (!prompt.title || typeof prompt.title !== 'string') {
      console.log('Skipping prompt with invalid title:', prompt.id);
      return;
    }
    const title = prompt.title.toLowerCase().trim();
    if (!titleGroups[title]) {
      titleGroups[title] = [];
    }
    titleGroups[title].push(prompt);
  });
  
  // Find duplicates
  const duplicates = [];
  Object.entries(titleGroups).forEach(([title, group]) => {
    if (group.length > 1) {
      duplicates.push({ title, count: group.length, prompts: group });
    }
  });
  
  console.log('Duplicate titles found:', duplicates.length);
  
  if (duplicates.length > 0) {
    console.log('\nDuplicates:');
    duplicates.forEach((dup, index) => {
      console.log(`${index + 1}. Title: "${dup.title}"`);
      console.log(`   Count: ${dup.count}`);
      console.log(`   IDs: ${dup.prompts.map(p => p.id).join(', ')}`);
      console.log('');
    });
    
    // Remove duplicates (keep the oldest one of each)
    console.log('Removing duplicates (keeping oldest)...');
    let removed = 0;
    
    for (const dup of duplicates) {
      // Sort by created_at to keep the oldest
      dup.prompts.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      
      // Keep first (oldest), remove the rest
      const idsToRemove = dup.prompts.slice(1).map(p => p.id);
      
      for (const id of idsToRemove) {
        const { error: deleteError } = await supabase
          .from('content')
          .delete()
          .eq('id', id);
        
        if (!deleteError) {
          removed++;
          console.log(`Removed duplicate: ${id}`);
        } else {
          console.error(`Failed to remove: ${id}`, deleteError);
        }
      }
    }
    
    console.log(`\n✅ Removed ${removed} duplicate prompts`);
    
    // Final count
    const { data: finalPrompts } = await supabase
      .from('content')
      .select('id')
      .eq('content_type', 'prompt');
    
    console.log(`📊 Final prompt count: ${finalPrompts?.length || 0}`);
  } else {
    console.log('✅ No duplicates found! All prompts are unique.');
  }
}

checkDuplicates();
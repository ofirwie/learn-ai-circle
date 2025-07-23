const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Initialize Supabase client with service role key (for admin operations)
const supabase = createClient(
  'https://ilotcwtcnlihoprxcdzp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlsb3Rjd3RjbmxpaG9wcnhjZHpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjk2MTI4MSwiZXhwIjoyMDY4NTM3MjgxfQ.N01dhXaot3xNHgONGcWzoXzYmnqMOvenh1YLgoOjLg4'
);

// Read and parse the CSV file
const csvContent = fs.readFileSync('C:/Users/fires/Downloads/prompts.csv', 'utf-8');
const lines = csvContent.split('\n');
const headers = lines[0].split(',');

const prompts = [];

// Skip header row, process data rows
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  // Parse CSV line (handle quoted fields)
  const fields = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(currentField.replace(/^"|"$/g, ''));
      currentField = '';
    } else {
      currentField += char;
    }
  }
  fields.push(currentField.replace(/^"|"$/g, ''));
  
  if (fields.length >= 3) {
    const [act, prompt, for_devs] = fields;
    
    // Create prompt object
    const promptData = {
      title: act,
      content_json: {
        prompt: prompt,
        category: for_devs === 'TRUE' ? 'Development Tools' : 'AI & Prompting',
        for_developers: for_devs === 'TRUE',
        source: '@awesome-chatgpt-prompts (prompts.csv)',
        difficulty: 'intermediate',
        use_case: for_devs === 'TRUE' ? 'Development assistance' : 'General AI interaction'
      },
      tags: for_devs === 'TRUE' ? ['development', 'programming', 'tools'] : ['ai', 'prompting', 'assistant'],
      priority: 'normal',
      view_count: 0,
      content_type: 'prompt',
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    prompts.push(promptData);
  }
}

async function addPrompts() {
  try {
    console.log(`Preparing to add ${prompts.length} prompts...`);
    
    // Insert prompts in batches to avoid rate limits
    const batchSize = 50;
    let addedCount = 0;
    
    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('content')
        .insert(batch);
      
      if (error) {
        console.error(`Error adding batch ${Math.floor(i/batchSize) + 1}:`, error);
        continue;
      }
      
      addedCount += batch.length;
      console.log(`Added batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(prompts.length/batchSize)} (${addedCount}/${prompts.length} prompts)`);
    }
    
    console.log(`✅ Successfully added ${addedCount} prompts to the database!`);
    
    // Verify the count
    const { data: allPrompts, error: countError } = await supabase
      .from('content')
      .select('id')
      .eq('content_type', 'prompt')
      .eq('is_published', true);
      
    if (!countError) {
      console.log(`📊 Total prompts in database: ${allPrompts.length}`);
    }
    
  } catch (error) {
    console.error('Failed to add prompts:', error);
  }
}

addPrompts();
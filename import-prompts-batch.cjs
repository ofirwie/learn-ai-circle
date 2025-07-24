const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Supabase configuration
const supabaseUrl = 'https://ilotcwtcnlihoprxcdzp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlsb3Rjd3RjbmxpaG9wcnhjZHpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjk2MTI4MSwiZXhwIjoyMDY4NTM3MjgxfQ.N01dhXaot3xNHgONGcWzoXzYmnqMOvenh1YLgoOjLg4'

const supabase = createClient(supabaseUrl, supabaseKey)

// Map CSV categories to our system categories
const categoryMapping = {
  'Development': 'Development',
  'SEO': 'Marketing',
  'Language': 'Language & Writing', 
  'HR': 'Business & HR',
  'Writing': 'Language & Writing',
  'Entertainment': 'Entertainment',
  'Marketing': 'Marketing',
  'Lifestyle': 'Lifestyle',
  'Music': 'Entertainment',
  'Education': 'Education',
  'Security': 'Security',
  'Art': 'Art & Design',
  'Science': 'Science',
  'Business': 'Business & HR',
  'Finance': 'Business & HR',
  'Health': 'Health & Wellness',
  'Sports': 'Sports',
  'Food': 'Food & Cooking',
  'Travel': 'Travel',
  'Technology': 'Development',
  'Gaming': 'Gaming',
  'Productivity': 'Productivity',
  'Social': 'Social Media'
}

// Determine difficulty based on prompt complexity
function getDifficulty(prompt) {
  const wordCount = prompt.split(' ').length
  if (wordCount < 50) return 'beginner'
  if (wordCount < 100) return 'intermediate'
  return 'advanced'
}

// Extract tags from prompt content
function extractTags(act, category, prompt) {
  const tags = []
  
  // Add category as tag
  if (category) {
    tags.push(category.toLowerCase().replace(/[^a-z0-9]/g, '-'))
  }
  
  // Add role/act as tag  
  if (act) {
    tags.push(act.toLowerCase().replace(/[^a-z0-9]/g, '-'))
  }
  
  // Extract common keywords
  const keywords = prompt.toLowerCase().match(/\b(creative|technical|professional|expert|advanced|beginner|tutorial|guide|analysis|strategy|problem|solution|help|assist|develop|create|write|design|review|teach|coach|manage)\b/g)
  if (keywords) {
    tags.push(...[...new Set(keywords)])
  }
  
  return [...new Set(tags)].slice(0, 8) // Limit to 8 tags
}

// Parse CSV content from markdown files
function parseCSV(content) {
  const lines = content.split('\n').filter(line => line.trim())
  const header = lines[0].split(',')
  const prompts = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    // Split by comma but handle quoted content
    const values = []
    let current = ''
    let inQuotes = false
    let quoteChar = null
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j]
      
      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true
        quoteChar = char
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false
        quoteChar = null
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^["']|["']$/g, ''))
        current = ''
        continue
      }
      
      current += char
    }
    
    // Add the last value
    if (current) {
      values.push(current.trim().replace(/^["']|["']$/g, ''))
    }
    
    if (values.length >= 4) {
      const [index, act, prompt, category] = values
      if (prompt && prompt.length > 10) { // Only valid prompts
        prompts.push({
          index: parseInt(index) || 0,
          act: act || 'Assistant',
          prompt: prompt,
          category: category || 'General'
        })
      }
    }
  }
  
  return prompts
}

// Main import function
async function importPromptsFromFiles() {
  const promptFiles = [
    'C:\\Users\\fires\\Downloads\\prompts_1_40.md',
    'C:\\Users\\fires\\Downloads\\prompts_41_80.md', 
    'C:\\Users\\fires\\Downloads\\prompts_81_120.md',
    'C:\\Users\\fires\\Downloads\\prompts_121_160.md',
    'C:\\Users\\fires\\Downloads\\prompts_161_200.md',
    'C:\\Users\\fires\\Downloads\\prompts_201_240.md',
    'C:\\Users\\fires\\Downloads\\prompts_241_280.md',
    'C:\\Users\\fires\\Downloads\\prompts_281_320.md',
    'C:\\Users\\fires\\Downloads\\prompts_321_360.md',
    'C:\\Users\\fires\\Downloads\\prompts_361_400.md'
  ]
  
  let totalImported = 0
  let allPrompts = []
  
  console.log('🚀 Starting prompt import process...\n')
  
  // Read and parse all files
  for (const filePath of promptFiles) {
    try {
      console.log(`📖 Reading file: ${path.basename(filePath)}`)
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${filePath}`)
        continue
      }
      
      const content = fs.readFileSync(filePath, 'utf8')
      const prompts = parseCSV(content)
      
      console.log(`   Found ${prompts.length} prompts`)
      allPrompts.push(...prompts)
      
    } catch (error) {
      console.error(`❌ Error reading ${filePath}:`, error.message)
    }
  }
  
  console.log(`\n📊 Total prompts found: ${allPrompts.length}`)
  console.log('🔄 Processing and importing to database...\n')
  
  // Process prompts in batches
  const batchSize = 10
  const batches = []
  
  for (let i = 0; i < allPrompts.length; i += batchSize) {
    batches.push(allPrompts.slice(i, i + batchSize))
  }
  
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex]
    const contentData = []
    
    for (const prompt of batch) {
      const mappedCategory = categoryMapping[prompt.category] || prompt.category
      const difficulty = getDifficulty(prompt.prompt)
      const tags = extractTags(prompt.act, mappedCategory, prompt.prompt)
      
      const contentItem = {
        title: `${prompt.act} Prompt`,
        content_type: 'prompt',
        content_json: {
          prompt: prompt.prompt,
          category: mappedCategory,
          difficulty: difficulty,
          source: 'Awesome ChatGPT Prompts Collection',
          use_case: `Act as a ${prompt.act}`,
          target_tools: ['ChatGPT', 'Claude', 'Gemini', 'GPT-4'],
          role: prompt.act
        },
        tags: tags,
        priority: 'normal',
        view_count: 0,
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      contentData.push(contentItem)
    }
    
    try {
      const { data, error } = await supabase
        .from('content')
        .insert(contentData)
        .select()
      
      if (error) {
        console.error(`❌ Batch ${batchIndex + 1} failed:`, error.message)
      } else {
        totalImported += data.length
        console.log(`✅ Batch ${batchIndex + 1}/${batches.length} imported: ${data.length} prompts`)
      }
      
      // Add small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (error) {
      console.error(`❌ Error importing batch ${batchIndex + 1}:`, error.message)
    }
  }
  
  console.log(`\n🎉 Import completed!`)
  console.log(`📈 Total prompts imported: ${totalImported}`)
  console.log(`📂 Categories added: ${Object.keys(categoryMapping).length}`)
  console.log('\n✨ Your prompts are now available in the ISAI Knowledge Hub!')
  
  // Display summary by category
  const categoryCounts = {}
  allPrompts.forEach(prompt => {
    const category = categoryMapping[prompt.category] || prompt.category
    categoryCounts[category] = (categoryCounts[category] || 0) + 1
  })
  
  console.log('\n📊 Prompts by category:')
  Object.entries(categoryCounts)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count]) => {
      console.log(`   ${category}: ${count} prompts`)
    })
}

// Run the import
if (require.main === module) {
  importPromptsFromFiles().catch(console.error)
}

module.exports = { importPromptsFromFiles }
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key
const supabase = createClient(
  'https://ilotcwtcnlihoprxcdzp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlsb3Rjd3RjbmxpaG9wcnhjZHpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjk2MTI4MSwiZXhwIjoyMDY4NTM3MjgxfQ.N01dhXaot3xNHgONGcWzoXzYmnqMOvenh1YLgoOjLg4'
);

async function setupStorageBuckets() {
  console.log('🗂️ Setting up Supabase Storage buckets...\n');

  const buckets = [
    {
      name: 'images',
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880, // 5MB
      description: 'Article images and featured images'
    },
    {
      name: 'documents',
      public: true,
      allowedMimeTypes: ['application/pdf'],
      fileSizeLimit: 10485760, // 10MB
      description: 'PDF documents for articles'
    },
    {
      name: 'brand-logos',
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'],
      fileSizeLimit: 2097152, // 2MB
      description: 'Brand and company logos'
    }
  ];

  for (const bucket of buckets) {
    try {
      // Check if bucket exists
      const { data: existingBucket, error: checkError } = await supabase.storage.getBucket(bucket.name);
      
      if (existingBucket) {
        console.log(`✅ Bucket '${bucket.name}' already exists`);
        
        // Update bucket settings if needed
        const { data: updateData, error: updateError } = await supabase.storage.updateBucket(bucket.name, {
          public: bucket.public,
          allowedMimeTypes: bucket.allowedMimeTypes,
          fileSizeLimit: bucket.fileSizeLimit
        });
        
        if (updateError) {
          console.error(`❌ Failed to update bucket '${bucket.name}':`, updateError.message);
        } else {
          console.log(`   Updated settings for '${bucket.name}'`);
        }
      } else {
        // Create new bucket
        const { data, error } = await supabase.storage.createBucket(bucket.name, {
          public: bucket.public,
          allowedMimeTypes: bucket.allowedMimeTypes,
          fileSizeLimit: bucket.fileSizeLimit
        });

        if (error) {
          console.error(`❌ Failed to create bucket '${bucket.name}':`, error.message);
        } else {
          console.log(`✅ Created bucket '${bucket.name}' - ${bucket.description}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error with bucket '${bucket.name}':`, error);
    }
  }

  // Create brand_logos table if it doesn't exist
  console.log('\n🏢 Setting up brand_logos table...');
  
  const { error: tableError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS brand_logos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        display_name VARCHAR(255) NOT NULL,
        logo_url TEXT NOT NULL,
        category VARCHAR(100),
        tags TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Create index for faster searches
      CREATE INDEX IF NOT EXISTS idx_brand_logos_name ON brand_logos(name);
      CREATE INDEX IF NOT EXISTS idx_brand_logos_category ON brand_logos(category);
    `
  }).catch(err => {
    // If exec_sql doesn't exist, try direct query
    return supabase.from('brand_logos').select('id').limit(1);
  });

  if (tableError) {
    console.log('Note: Could not create brand_logos table via RPC. You may need to create it manually in Supabase.');
  } else {
    console.log('✅ Brand logos table ready');
  }

  // Add some default brand logos
  console.log('\n🏢 Adding default brand logos...');
  
  const defaultBrands = [
    { name: 'openai', display_name: 'OpenAI', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg', category: 'AI', tags: ['ai', 'chatgpt', 'gpt'] },
    { name: 'google', display_name: 'Google', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', category: 'Tech', tags: ['search', 'tech', 'ai'] },
    { name: 'microsoft', display_name: 'Microsoft', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg', category: 'Tech', tags: ['tech', 'software', 'ai'] },
    { name: 'meta', display_name: 'Meta', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg', category: 'Tech', tags: ['social', 'tech', 'ai'] },
    { name: 'anthropic', display_name: 'Anthropic', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Anthropic_logo.svg', category: 'AI', tags: ['ai', 'claude'] },
    { name: 'tesla', display_name: 'Tesla', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg', category: 'Tech', tags: ['automotive', 'tech', 'ai'] },
    { name: 'nvidia', display_name: 'NVIDIA', logo_url: 'https://upload.wikimedia.org/wikipedia/en/a/a4/NVIDIA_logo.svg', category: 'Tech', tags: ['gpu', 'ai', 'tech'] },
    { name: 'apple', display_name: 'Apple', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', category: 'Tech', tags: ['tech', 'mobile', 'software'] }
  ];

  for (const brand of defaultBrands) {
    const { error } = await supabase
      .from('brand_logos')
      .upsert(brand, { onConflict: 'name' });
    
    if (!error) {
      console.log(`✅ Added/Updated brand: ${brand.display_name}`);
    }
  }

  console.log('\n✅ Storage setup complete!');
}

setupStorageBuckets();
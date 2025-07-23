import { supabase } from './supabase'
import { Article, ArticleFilters } from '../types/content'

export class ArticleService {
  // Enhanced timeout wrapper with longer default and better error messages
  private static async withTimeout<T>(promise: Promise<T>, timeoutMs: number = 45000): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Operation timed out after 45 seconds. This may indicate a slow connection or server issue. Please try again.'))
      }, timeoutMs)
    })

    return Promise.race([promise, timeoutPromise])
  }

  // Create a new article with retry logic and detailed logging
  static async createArticle(article: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'view_count'>, retryCount: number = 0): Promise<Article> {
    const startTime = Date.now()
    console.log('🚀 ArticleService: Creating article...', { 
      title: article.title, 
      status: article.status,
      contentLength: article.content?.length || 0,
      retryAttempt: retryCount,
      timestamp: new Date().toISOString()
    })
    
    try {
      // Step 1: Connection health check
      console.log('🔍 ArticleService: Testing connection...')
      const connectionStart = Date.now()
      
      try {
        const healthCheck = await supabase.from('articles').select('id').limit(1)
        console.log('✅ ArticleService: Connection test completed', {
          duration: Date.now() - connectionStart,
          success: !!healthCheck.data
        })
      } catch (connErr) {
        console.error('❌ ArticleService: Connection test failed:', connErr)
        throw new Error(`Connection test failed: ${connErr}`)
      }

      // Step 2: Prepare article data with logging
      console.log('📝 ArticleService: Preparing article data...')
      const prepStart = Date.now()
      
      const articleData = {
        ...article,
        view_count: 0,
        published_at: article.status === 'published' ? new Date().toISOString() : null
      }
      
      console.log('📊 ArticleService: Article data prepared', {
        duration: Date.now() - prepStart,
        dataSize: JSON.stringify(articleData).length,
        hasImages: !!article.featured_image,
        hasYouTube: !!article.youtube_video_id,
        tagCount: Array.isArray(article.tags) ? article.tags.length : 0,
        category: article.category,
        actualContentPreview: article.content?.substring(0, 100) + '...'
      })

      // Step 3: Execute Supabase operation with detailed timing
      console.log('🗄️ ArticleService: Executing Supabase insert...')
      const dbStart = Date.now()
      
      // Create the query first and log it
      const insertQuery = supabase.from('articles').insert(articleData).select().single()
      console.log('📋 ArticleService: Query built, starting execution...')
      
      // Execute with timeout and more granular timing
      let dbResult
      try {
        console.log('⏰ ArticleService: Starting database operation...')
        dbResult = await this.withTimeout(insertQuery, 60000) // Increased to 60 seconds
        console.log('⏰ ArticleService: Database operation returned')
      } catch (dbErr) {
        console.error('💥 ArticleService: Database operation failed:', {
          error: dbErr,
          message: dbErr instanceof Error ? dbErr.message : 'Unknown error',
          duration: Date.now() - dbStart,
          totalDuration: Date.now() - startTime
        })
        throw dbErr
      }
      
      const { data, error } = dbResult
      
      console.log('📈 ArticleService: Supabase operation completed', {
        duration: Date.now() - dbStart,
        totalDuration: Date.now() - startTime,
        success: !error,
        dataReturned: !!data,
        errorPresent: !!error
      })

      if (error) {
        console.error('❌ ArticleService: Supabase error details:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          totalDuration: Date.now() - startTime
        })
        throw new Error(`Error creating article: ${error.message}`)
      }

      console.log('✅ ArticleService: Article created successfully', {
        id: data.id,
        category: data.category,
        totalDuration: Date.now() - startTime,
        retryAttempt: retryCount
      })
      return data
    } catch (err) {
      console.error('💥 ArticleService: Exception during create:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        totalDuration: Date.now() - startTime,
        retryAttempt: retryCount
      })
      
      // Retry logic for timeout/network errors
      if (retryCount < 2 && err instanceof Error && 
          (err.message.includes('timeout') || err.message.includes('network') || err.message.includes('fetch'))) {
        console.log(`🔄 ArticleService: Retrying... (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return this.createArticle(article, retryCount + 1);
      }
      
      if (err instanceof Error) {
        if (err.message.includes('timeout') || err.message.includes('timed out')) {
          throw new Error('Request timed out after multiple attempts. Please check your internet connection and try again.')
        }
        if (err.message.includes('network') || err.message.includes('fetch')) {
          throw new Error('Network error persists. Please check your internet connection and try again.')
        }
        throw err
      }
      
      throw new Error('An unexpected error occurred while saving the article.')
    }
  }

  // Get all articles with filters
  static async getArticles(
    page: number = 1,
    limit: number = 10,
    filters: ArticleFilters = {}
  ): Promise<{ data: Article[], count: number }> {
    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .order('published_at', { ascending: false })

    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`)
    }

    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    if (filters.featured !== undefined) {
      query = query.eq('featured', filters.featured)
    }

    if (filters.author) {
      query = query.eq('author', filters.author)
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }

    if (filters.date_range) {
      query = query
        .gte('published_at', filters.date_range.start.toISOString())
        .lte('published_at', filters.date_range.end.toISOString())
    }

    // Apply pagination
    const startRange = (page - 1) * limit
    const endRange = page * limit - 1
    query = query.range(startRange, endRange)

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Error fetching articles: ${error.message}`)
    }

    return { data: data || [], count: count || 0 }
  }

  // Get featured articles for home page
  static async getFeaturedArticles(limit: number = 6): Promise<Article[]> {
    console.log('🔍 ArticleService: Fetching featured articles...');
    
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .eq('featured', true)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('❌ ArticleService: Error fetching featured articles:', error);
      throw new Error(`Error fetching featured articles: ${error.message}`)
    }

    console.log('✅ ArticleService: Featured articles query result:', { count: data?.length, data });
    return data || []
  }

  // Get single article by slug
  static async getArticleBySlug(slug: string): Promise<Article | null> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Article not found
      }
      throw new Error(`Error fetching article: ${error.message}`)
    }

    // Increment view count
    if (data && data.status === 'published') {
      await supabase
        .from('articles')
        .update({ view_count: data.view_count + 1 })
        .eq('id', data.id)
    }

    return data
  }

  // Get single article by ID
  static async getArticleById(id: string): Promise<Article | null> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Error fetching article: ${error.message}`)
    }

    return data
  }

  // Update article
  static async updateArticle(id: string, updates: Partial<Article>): Promise<Article> {
    // If publishing, set published_at
    if (updates.status === 'published' && !updates.published_at) {
      updates.published_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error updating article: ${error.message}`)
    }

    return data
  }

  // Delete article
  static async deleteArticle(id: string): Promise<void> {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Error deleting article: ${error.message}`)
    }
  }

  // Toggle featured status
  static async toggleFeatured(id: string, featured: boolean): Promise<Article> {
    return this.updateArticle(id, { featured })
  }

  // Publish article
  static async publishArticle(id: string): Promise<Article> {
    return this.updateArticle(id, { 
      status: 'published',
      published_at: new Date().toISOString()
    })
  }

  // Unpublish article
  static async unpublishArticle(id: string): Promise<Article> {
    return this.updateArticle(id, { status: 'draft' })
  }

  // Get popular articles
  static async getPopularArticles(limit: number = 5): Promise<Article[]> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('view_count', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Error fetching popular articles: ${error.message}`)
    }

    return data || []
  }

  // Get related articles (by category and tags)
  static async getRelatedArticles(article: Article, limit: number = 4): Promise<Article[]> {
    let query = supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .neq('id', article.id)
      .limit(limit)

    // Prioritize same category
    if (article.category) {
      query = query.eq('category', article.category)
    }

    // Or articles with overlapping tags
    if (article.tags && article.tags.length > 0) {
      query = query.or(`tags.ov.{${article.tags.join(',')}}`)
    }

    const { data, error } = await query
      .order('published_at', { ascending: false })

    if (error) {
      throw new Error(`Error fetching related articles: ${error.message}`)
    }

    return data || []
  }

  // Extract YouTube video ID from various YouTube URL formats
  static extractYouTubeId(url: string): string | null {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^?]+)/
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }

    return null
  }

  // Generate excerpt from content with SAFE regex
  static generateExcerpt(content: string, maxLength: number = 200): string {
    try {
      // FIXED: Use safer, more specific HTML tag removal
      let textContent = content
        .replace(/<a\s+[^>]*>/gi, '') // Remove opening anchor tags
        .replace(/<\/a>/gi, '') // Remove closing anchor tags
        .replace(/<[^>]{1,100}>/g, '') // Limit tag length to prevent catastrophic backtracking
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
      
      // Truncate to max length
      if (textContent.length <= maxLength) {
        return textContent
      }

      // Find the last complete word within maxLength
      const truncated = textContent.substring(0, maxLength)
      const lastSpace = truncated.lastIndexOf(' ')
      
      return truncated.substring(0, lastSpace > 0 ? lastSpace : maxLength) + '...'
    } catch (err) {
      console.error('Error generating excerpt:', err)
      // Fallback: just truncate without HTML processing
      return content.substring(0, maxLength) + '...'
    }
  }

  // Debug functions: Create different test articles to isolate timeout cause
  static async createTestArticle1(): Promise<Article> {
    console.log('🧪1 ArticleService: Creating MINIMAL test article...')
    
    const testArticle = {
      title: `Test 1 - Minimal ${new Date().getTime()}`,
      slug: '',
      content: 'Short content.',
      excerpt: 'Short excerpt',
      author: 'Debug System',
      category: 'article',
      status: 'draft' as const,
      featured: false
    }
    
    return this.createArticle(testArticle)
  }

  static async createTestArticle2(): Promise<Article> {
    console.log('🧪2 ArticleService: Creating MEDIUM LENGTH test article...')
    
    const mediumContent = 'This is a longer test article. '.repeat(50) + 'It has much more content to test if content length causes timeouts. '.repeat(25) + 'This should be a few paragraphs worth of text to see where the threshold is.'
    
    const testArticle = {
      title: `Test 2 - Medium Length ${new Date().getTime()}`,
      slug: '',
      content: mediumContent,
      excerpt: 'Medium length test excerpt',
      author: 'Debug System',
      category: 'article',
      status: 'draft' as const,
      featured: false
    }
    
    return this.createArticle(testArticle)
  }

  static async createTestArticle3(): Promise<Article> {
    console.log('🧪3 ArticleService: Creating test article WITH IMAGE...')
    
    const testArticle = {
      title: `Test 3 - With Image ${new Date().getTime()}`,
      slug: '',
      content: 'This test article includes a featured image to test if images cause timeouts.',
      excerpt: 'Test with image',
      author: 'Debug System',
      category: 'article',
      status: 'draft' as const,
      featured: false,
      featured_image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80'
    }
    
    return this.createArticle(testArticle)
  }

  static async createTestArticle4(): Promise<Article> {
    console.log('🧪4 ArticleService: Creating test article WITH YOUTUBE...')
    
    const testArticle = {
      title: `Test 4 - With YouTube ${new Date().getTime()}`,
      slug: '',
      content: 'This test article includes a YouTube video to test if video embeds cause timeouts.',
      excerpt: 'Test with YouTube',
      author: 'Debug System',
      category: 'article',
      status: 'draft' as const,
      featured: false,
      youtube_video_id: '1YtB1yrKvXM'
    }
    
    return this.createArticle(testArticle)
  }

  static async createTestArticle5(): Promise<Article> {
    console.log('🧪5 ArticleService: Creating LARGE test article...')
    
    const largeContent = `
# Large Test Article

This is a very large test article to simulate importing markdown files.

${'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. '.repeat(100)}

## Section 2
${'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. '.repeat(75)}

## Section 3
${'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium. '.repeat(50)}
    `.trim()
    
    const testArticle = {
      title: `Test 5 - Large Content ${new Date().getTime()}`,
      slug: '',
      content: largeContent,
      excerpt: 'Very large test article',
      author: 'Debug System',
      category: 'article',
      status: 'draft' as const,
      featured: false
    }
    
    return this.createArticle(testArticle)
  }

  static async createTestArticle6(): Promise<Article> {
    console.log('🧪6 ArticleService: Creating test with MULTIPLE YOUTUBE VIDEOS...')
    
    const contentWithMultipleVideos = `
# 3 Innovative AI Tools Test

<a href="https://www.youtube.com/watch?v=1YtB1yrKvXM" target="_blank">Video 1</a>
<a href="https://www.youtube.com/watch?v=gmJeo_1lI6g" target="_blank">Video 2</a>
<a href="https://www.youtube.com/watch?v=V9TGgD03nQI" target="_blank">Video 3</a>
<a href="https://www.youtube.com/watch?v=CB_2FWwSU0Y" target="_blank">Video 4</a>
<a href="https://www.youtube.com/watch?v=YhTgj7_cuJM" target="_blank">Video 5</a>
<a href="https://www.youtube.com/watch?v=0vmp4N2Tce0" target="_blank">Video 6</a>

This mimics your markdown with multiple YouTube links and HTML.
    `
    
    const testArticle = {
      title: `Test 6 - Multiple Videos ${new Date().getTime()}`,
      slug: '',
      content: contentWithMultipleVideos,
      excerpt: 'Test with multiple YouTube videos like your markdown',
      author: 'Ofir Wienerman',
      category: 'tool-review',
      status: 'draft' as const,
      featured: false,
      tags: ['AI', 'Tools', 'Review', 'YouTube', 'Multiple']
    }
    
    return this.createArticle(testArticle)
  }

  // Test markdown parser output scenarios
  static async createTestArticle7(): Promise<Article> {
    console.log('🧪7 ArticleService: Testing with MARKDOWN PARSER SIMULATION...')
    
    // Simulate what markdown parser might generate
    const testArticle = {
      title: `Test 7 - Markdown Parser Sim ${new Date().getTime()}`,
      slug: '', 
      content: 'test', // Minimal content like user tried
      excerpt: 'Artificial intelligence (AI) is changing the way we work, learn, and create. Here are three easy-to-use AI tools that simplify daily tasks and help you get more done, even if you\'re new to the field.', // Long excerpt from markdown
      author: 'Ofir Wienerman',
      category: 'tool-review',
      status: 'draft' as const,
      featured: false,
      tags: ['AI', 'Tools', 'Excelmatic', 'Higgsfield', 'Creatie', 'productivity', 'automation']
    }
    
    return this.createArticle(testArticle)
  }

  static async createTestArticle8(): Promise<Article> {
    console.log('🧪8 ArticleService: Testing with VERY LONG EXCERPT...')
    
    const veryLongExcerpt = 'Artificial intelligence (AI) is changing the way we work, learn, and create. Here are three easy-to-use AI tools that simplify daily tasks and help you get more done, even if you\'re new to the field. '.repeat(20)
    
    const testArticle = {
      title: `Test 8 - Long Excerpt ${new Date().getTime()}`,
      slug: '',
      content: 'test',
      excerpt: veryLongExcerpt,
      author: 'Ofir Wienerman', 
      category: 'tool-review',
      status: 'draft' as const,
      featured: false
    }
    
    return this.createArticle(testArticle)
  }

  static async createTestArticle9(): Promise<Article> {
    console.log('🧪9 ArticleService: Testing with MANY TAGS...')
    
    const testArticle = {
      title: `Test 9 - Many Tags ${new Date().getTime()}`,
      slug: '',
      content: 'test',
      excerpt: 'Short excerpt',
      author: 'Ofir Wienerman',
      category: 'tool-review', 
      status: 'draft' as const,
      featured: false,
      tags: ['AI', 'Tools', 'Excelmatic', 'Higgsfield.ai', 'Creatie.ai', 'productivity', 'automation', 'spreadsheet', 'video', 'design', 'machine learning', 'business', 'data analysis', 'creative tools', 'workflows']
    }
    
    return this.createArticle(testArticle)
  }

  static async createTestArticle10(): Promise<Article> {
    console.log('🧪10 ArticleService: Testing EXACT MARKDOWN CONTENT...')
    
    // Use the exact content from the markdown file
    const exactMarkdownContent = `# 3 Innovative AI Tools to Make Your Life Easier

Artificial intelligence (AI) is changing the way we work, learn, and create. Here are three easy-to-use AI tools that simplify daily tasks and help you get more done, even if you're new to the field.

---

## 1. Excelmatic – Effortless Data Analysis

Excelmatic takes the headache out of large spreadsheets. Upload your Excel or Google Sheets file, ask your question in plain English, and get actionable charts, summaries, and insights within seconds. This tool recognizes patterns, suggests formulas, and even summarizes your data—no need for advanced spreadsheet skills.

**Practical Applications:**

- Identifying trends in sales or marketing data
- Quickly creating graphs for reports or presentations
- Getting ready-made suggestions for formulas and summaries

**Who Should Use It?**

Anyone who works with data—project managers, analysts, students, or small business owners.

**Pricing:**

- Free version available with core features
- Paid plans from $10/month with advanced options

**Practical Use Case:**  

Imagine you're a small business owner tracking monthly sales. Instead of spending hours building formulas or pivot tables, you just upload your sales sheet to Excelmatic and ask, "What were my best-selling products last quarter?" Within moments, you get a clear summary and easy-to-understand charts highlighting your top performers. This not only saves time but provides the clarity you need to make smarter inventory decisions.

**See Excelmatic in Action:**  

<a href="https://www.youtube.com/watch?v=1YtB1yrKvXM" target="_blank">Step-by-step tutorial</a>  

<a href="https://www.youtube.com/watch?v=gmJeo_1lI6g" target="_blank">Excelmatic Review</a>  

<a href="https://www.youtube.com/watch?v=V9TGgD03nQI" target="_blank">Analyze Excel & Google Sheets with AI</a>

---

## 2. Higgsfield.ai – Movie-Style Videos from a Single Photo

Higgsfield.ai lets you create cinematic videos from just one image. Upload a photo, pick the camera movement (like dramatic zoom or animated lips), and the AI turns it into a compelling video. There's no need for editing skills or expensive tools—everything is done online with a few clicks.

**Key Features:**

- Instantly animate headshots or photos for social media, presentations, or marketing
- Offers a range of animation effects, camera styles, and lip-sync options
- Supports quick downloads in formats suitable for TikTok, Instagram, or business use
- Accessible interface built for all experience levels

**Who Should Use It?**

Content creators, marketers, small business owners, and anyone interested in eye-catching video content.

**Practical Use Case:**

A small business owner wants to promote a new product launch on Instagram. Using Higgsfield.ai, they turn a static product photo into a dynamic, animated video that highlights key features with engaging camera movements. In minutes, the result looks professional and draws more attention than a regular image post—no design background required.

**Pricing:**

- Free starter plan with basic outputs
- Premium plans between $9–$149/month for more advanced features

**Watch How It Works:**

<a href="https://www.youtube.com/watch?v=CB_2FWwSU0Y" target="_blank">Create Cinematic Videos – Demo</a>  

<a href="https://www.youtube.com/watch?v=YhTgj7_cuJM" target="_blank">Full Walkthrough</a>

---

## 3. Creatie.ai – Fast, Smart Design for Web & Apps

Creatie.ai is an intelligent design tool that streamlines the creative process. Start with a sketch or a few words, and the AI generates wireframes, graphic styles, and even functional code—all based on your input. It's like having a design partner on demand.

**Real-World Benefits:**

- Go from idea to wireframe in minutes—great for websites, apps, and presentations
- Generate custom icons (2D/3D), branding, and ready-to-use components
- Instantly export assets or code for development
- Cuts weeks off prototypes and revisions

**Who Should Use It?**

Entrepreneurs, UX/UI designers, developers, agencies—anyone looking for rapid concept development with creative flexibility.

**Practical Use Case:**

Let's say you're launching a new app and need to visualize user flows fast. With Creatie.ai, you can sketch your main screens—such as login, dashboard, and profile—and the tool will instantly generate wireframes and suggest layouts. You can quickly modify elements, create unique icons, and even produce simple animations for presentations. When the concept is ready, export everything directly for your development team. This approach helps save days—or even weeks—compared to building designs from scratch, and ensures your team aligns early on the vision.

**Pricing:**

- Free basic version to try
- Pro plan at $8/month for more storage and advanced tools

**Get a Closer Look:**  

<a href="https://www.youtube.com/watch?v=0vmp4N2Tce0" target="_blank">Creatie AI Tool – First Look</a>  

<a href="https://www.youtube.com/watch?v=4EU9r9x5AoA" target="_blank">Next Level AI-Powered Design Review</a>

---

Ready to take your first step? Each of these tools comes with a free plan, so you can explore their benefits and see real results—no steep learning curve required. If you have questions or need more recommendations, just reach out.`
    
    const testArticle = {
      title: `Test 10 - Exact Markdown ${new Date().getTime()}`,
      slug: '',
      content: exactMarkdownContent,
      excerpt: 'Artificial intelligence (AI) is changing the way we work, learn, and create. Here are three easy-to-use AI tools that simplify daily tasks and help you get more done, even if you\'re new to the field.',
      author: 'Ofir Wienerman',
      category: 'tool-review',
      status: 'draft' as const,
      featured: false,
      tags: ['AI', 'Tools', 'Excelmatic', 'Higgsfield.ai', 'Creatie.ai']
    }
    
    return this.createArticle(testArticle)
  }

  static async createTestArticle11(): Promise<Article> {
    console.log('🧪11 ArticleService: Testing EXCERPT GENERATION problem...')
    
    const contentWithProblematicHTML = `<a href="https://www.youtube.com/watch?v=1YtB1yrKvXM" target="_blank">Step-by-step tutorial</a>  

<a href="https://www.youtube.com/watch?v=gmJeo_1lI6g" target="_blank">Excelmatic Review</a>  

<a href="https://www.youtube.com/watch?v=V9TGgD03nQI" target="_blank">Analyze Excel & Google Sheets with AI</a>`
    
    console.log('🔍 Testing excerpt generation with problematic content...')
    try {
      const testExcerpt = ArticleService.generateExcerpt(contentWithProblematicHTML, 200)
      console.log('✅ Excerpt generation completed:', testExcerpt.length, 'chars')
    } catch (err) {
      console.error('❌ Excerpt generation failed:', err)
      throw err
    }
    
    const testArticle = {
      title: `Test 11 - Excerpt Gen ${new Date().getTime()}`,
      slug: '',
      content: contentWithProblematicHTML,
      excerpt: '', // Force excerpt generation
      author: 'Debug System',
      category: 'article',
      status: 'draft' as const,
      featured: false
    }
    
    return this.createArticle(testArticle)
  }

  // Get categories with article counts
  static async getCategories(): Promise<Array<{ category: string; count: number }>> {
    const { data, error } = await supabase
      .from('articles')
      .select('category')
      .eq('status', 'published')
      .not('category', 'is', null)

    if (error) {
      throw new Error(`Error fetching categories: ${error.message}`)
    }

    // Count articles per category
    const categoryCounts = (data || []).reduce((acc, item) => {
      if (item.category) {
        acc[item.category] = (acc[item.category] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
  }
}
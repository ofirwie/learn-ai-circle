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
        tagCount: Array.isArray(article.tags) ? article.tags.length : 0
      })

      // Step 3: Execute Supabase operation with detailed timing
      console.log('🗄️ ArticleService: Executing Supabase insert...')
      const dbStart = Date.now()
      
      const supabaseOperation = supabase
        .from('articles')
        .insert(articleData)
        .select()
        .single()

      const { data, error } = await this.withTimeout(supabaseOperation, 45000)
      
      console.log('📈 ArticleService: Supabase operation completed', {
        duration: Date.now() - dbStart,
        totalDuration: Date.now() - startTime,
        success: !error,
        dataReturned: !!data
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

  // Generate excerpt from content
  static generateExcerpt(content: string, maxLength: number = 200): string {
    // Remove HTML tags
    const textContent = content.replace(/<[^>]*>/g, '')
    
    // Truncate to max length
    if (textContent.length <= maxLength) {
      return textContent
    }

    // Find the last complete word within maxLength
    const truncated = textContent.substring(0, maxLength)
    const lastSpace = truncated.lastIndexOf(' ')
    
    return truncated.substring(0, lastSpace) + '...'
  }

  // Debug function: Create minimal test article to isolate timeout issues
  static async createTestArticle(): Promise<Article> {
    console.log('🧪 ArticleService: Creating test article for debugging...')
    
    const testArticle = {
      title: `Debug Test ${new Date().getTime()}`,
      slug: '', // Will be auto-generated
      content: 'This is a minimal test article to debug timeout issues.',
      excerpt: 'Test excerpt',
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
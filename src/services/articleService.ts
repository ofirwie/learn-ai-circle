import { supabase } from './supabase'
import { Article, ArticleFilters } from '../types/content'

export class ArticleService {
  // Create a new article
  static async createArticle(article: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'view_count'>): Promise<Article> {
    const { data, error } = await supabase
      .from('articles')
      .insert({
        ...article,
        view_count: 0,
        published_at: article.status === 'published' ? new Date().toISOString() : null
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Error creating article: ${error.message}`)
    }

    return data
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
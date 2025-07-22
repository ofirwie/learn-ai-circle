import { supabase } from './supabase'

export interface Tip {
  id: string
  title: string
  content: string
  category?: string
  tags?: string[]
  practical_applications?: string[]
  pricing_info?: string
  external_links?: Array<{ title: string; url: string }>
  youtube_videos?: Array<{ id: string; title: string }>
  author: string
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  view_count: number
  created_at: string
  updated_at: string
}

export interface TipFilters {
  search?: string
  category?: string
  status?: 'all' | 'draft' | 'published' | 'archived'
  featured?: boolean
  author?: string
  tags?: string[]
  date_range?: {
    start: Date
    end: Date
  }
}

export class TipsService {
  // Create a new tip
  static async createTip(tip: Omit<Tip, 'id' | 'created_at' | 'updated_at' | 'view_count'>): Promise<Tip> {
    const { data, error } = await supabase
      .from('tips')
      .insert({
        ...tip,
        view_count: 0
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Error creating tip: ${error.message}`)
    }

    return data
  }

  // Get all tips with filters
  static async getTips(
    page: number = 1,
    limit: number = 10,
    filters: TipFilters = {}
  ): Promise<{ data: Tip[], count: number }> {
    let query = supabase
      .from('tips')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
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
        .gte('created_at', filters.date_range.start.toISOString())
        .lte('created_at', filters.date_range.end.toISOString())
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = page * limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Error fetching tips: ${error.message}`)
    }

    return { data: data || [], count: count || 0 }
  }

  // Get a single tip by ID
  static async getTip(id: string): Promise<Tip | null> {
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error(`Error fetching tip: ${error.message}`)
    }

    return data
  }

  // Update a tip
  static async updateTip(id: string, updates: Partial<Tip>): Promise<Tip> {
    const { data, error } = await supabase
      .from('tips')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error updating tip: ${error.message}`)
    }

    return data
  }

  // Delete a tip
  static async deleteTip(id: string): Promise<void> {
    const { error } = await supabase
      .from('tips')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Error deleting tip: ${error.message}`)
    }
  }

  // Increment view count
  static async incrementViewCount(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_tip_views', { tip_id: id })

    if (error) {
      console.error('Error incrementing view count:', error)
    }
  }

  // Get featured tips
  static async getFeaturedTips(limit: number = 5): Promise<Tip[]> {
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .eq('status', 'published')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Error fetching featured tips: ${error.message}`)
    }

    return data || []
  }

  // Get related tips based on tags
  static async getRelatedTips(tip: Tip, limit: number = 5): Promise<Tip[]> {
    if (!tip.tags || tip.tags.length === 0) {
      return []
    }

    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .neq('id', tip.id)
      .eq('status', 'published')
      .overlaps('tags', tip.tags)
      .order('view_count', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Error fetching related tips: ${error.message}`)
    }

    return data || []
  }

  // Get popular tips
  static async getPopularTips(limit: number = 10): Promise<Tip[]> {
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .eq('status', 'published')
      .order('view_count', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Error fetching popular tips: ${error.message}`)
    }

    return data || []
  }

  // Get tips by category
  static async getTipsByCategory(category: string, limit: number = 10): Promise<Tip[]> {
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .eq('status', 'published')
      .eq('category', category)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Error fetching tips by category: ${error.message}`)
    }

    return data || []
  }
}
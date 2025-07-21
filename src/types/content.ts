export interface AIContentItem {
  id: string
  title: string
  url: string
  summary: string
  source_domain: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  innovation_score: number
  publish_score: number
  content_snippet: string
  scraped_at: string
  processed_at?: string
  published: boolean
}

export interface ContentFilters {
  search?: string
  category?: string
  source_domain?: string
  date_range?: {
    start: Date
    end: Date
  }
  status?: 'all' | 'published' | 'pending'
  min_innovation_score?: number
  tags?: string[]
}

export interface AnalyticsData {
  totalItems: number
  pendingItems: number
  publishedItems: number
  topSources: Array<{ domain: string; count: number }>
  categoryCounts: Array<{ category: string; count: number }>
  avgInnovationScore: number
  weeklyTrend: Array<{ date: string; count: number }>
}

export interface BulkAction {
  type: 'approve' | 'reject' | 'delete' | 'export'
  selectedIds: string[]
}

export interface Article {
  id: string
  title: string
  slug: string
  content: string // Rich HTML content
  excerpt?: string
  featured_image?: string
  youtube_video_id?: string
  author: string
  category?: string
  tags?: string[]
  status: 'draft' | 'published'
  featured: boolean
  view_count: number
  read_time?: number
  published_at?: string
  created_at: string
  updated_at: string
}

export interface ArticleFilters {
  search?: string
  category?: string
  status?: 'all' | 'draft' | 'published'
  featured?: boolean
  author?: string
  tags?: string[]
  date_range?: {
    start: Date
    end: Date
  }
}
export interface AIContentItem {
  id: string
  title: string
  description: string
  type: ContentType
  category: string
  tags: string[]
  content: string
  created_at: string
  updated_at: string
  author: string
  featured: boolean
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  use_cases: string[]
  status: 'draft' | 'published' | 'archived'
  view_count: number
  rating: number
  rating_count: number
}

// Content Types
export type ContentType = 'guide' | 'prompt' | 'prefix' | 'tool' | 'news' | 'video' | 'article'

export interface ContentFilters {
  search?: string
  category?: string
  type?: ContentType
  date_range?: {
    start: Date
    end: Date
  }
  status?: 'all' | 'published' | 'draft' | 'archived'
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
  tags?: string[]
  featured?: boolean
}

export interface AnalyticsData {
  totalItems: number
  publishedItems: number
  draftItems: number
  archivedItems: number
  topCategories: Array<{ category: string; count: number }>
  contentTypeCounts: Array<{ type: ContentType; count: number }>
  avgRating: number
  totalViews: number
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
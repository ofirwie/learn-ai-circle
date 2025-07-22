import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

export interface Article {
  id: string
  title: string
  slug: string
  content: string
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

export interface Content {
  id: string
  title: string
  content_json: Record<string, any>
  content_type: 'guide' | 'prompt' | 'prefix' | 'tool' | 'news' | 'video' | 'article'
  target_entities: string[]
  target_groups: string[]
  languages: string[]
  tags: string[]
  priority: 'low' | 'normal' | 'high'
  is_published: boolean
  published_at?: string
  view_count: number
  engagement_score: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface UseContentOptions {
  contentType?: Content['content_type']
  limit?: number
  featured?: boolean
  published?: boolean
}

export const useArticles = (options: UseContentOptions = {}) => {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchArticles()
  }, [options.limit, options.featured])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })

      if (options.featured) {
        query = query.eq('featured', true)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setArticles(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching articles:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch articles')
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  return { articles, loading, error, refetch: fetchArticles }
}

export const useContent = (options: UseContentOptions = {}) => {
  const [content, setContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchContent()
  }, [options.contentType, options.limit])

  const fetchContent = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('content')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })

      if (options.contentType) {
        query = query.eq('content_type', options.contentType)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setContent(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching content:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch content')
      setContent([])
    } finally {
      setLoading(false)
    }
  }

  return { content, loading, error, refetch: fetchContent }
}

// Combined hook for mixed content display
export const useMixedContent = (options: UseContentOptions = {}) => {
  const { articles, loading: articlesLoading } = useArticles(options)
  const { content, loading: contentLoading } = useContent(options)

  // Convert both to a unified format
  const mixedContent = [
    ...articles.map(article => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      featuredImage: article.featured_image,
      youtubeVideoId: article.youtube_video_id,
      author: article.author,
      category: article.category,
      contentType: (article.youtube_video_id ? 'video' : 'article') as const,
      tags: article.tags || [],
      viewCount: article.view_count,
      readTime: article.read_time,
      publishedAt: article.published_at || article.created_at,
      featured: article.featured,
      sourceType: 'article' as const
    })),
    ...content.map(item => ({
      id: item.id,
      title: item.title,
      excerpt: item.content_json.excerpt || '',
      content: item.content_json.content || '',
      featuredImage: item.content_json.featured_image,
      youtubeVideoId: item.content_json.youtube_video_id,
      author: item.content_json.author || 'ISAI Team',
      category: item.content_json.category,
      contentType: item.content_type,
      tags: item.tags,
      viewCount: item.view_count,
      readTime: item.content_json.read_time,
      publishedAt: item.published_at || item.created_at,
      featured: item.priority === 'high',
      sourceType: 'content' as const
    }))
  ].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  return {
    mixedContent,
    loading: articlesLoading || contentLoading
  }
}
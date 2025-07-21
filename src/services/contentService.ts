import { supabase } from './supabase'
import { AIContentItem, ContentFilters } from '../types/content'

// For debugging - this should be moved to environment variables
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlsb3Rjd3RjbmxpaG9wcnhjZHpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2OTQzNzIsImV4cCI6MjA1MDI3MDM3Mn0.-qJpKQJy6T-BZ1q6PVUy9FzZIsIn1lZo4DQyb8HY6sE'

export class ContentService {
  // Test database connection and table access
  static async testConnection(): Promise<{ success: boolean, message: string, data?: any }> {
    try {
      console.log('🔌 ContentService: Testing database connection...');
      console.log('📍 Supabase URL:', 'https://ilotcwtcnlihoprxcdzp.supabase.co');
      console.log('🔑 API Key length:', supabaseAnonKey.length);
      
      // First test: Check if we can connect to Supabase at all
      const { data: healthCheck, error: healthError } = await supabase
        .from('_supabase_realtime')
        .select('*')
        .limit(1);
      
      if (healthError && healthError.code === '42P01') {
        // This is expected - the realtime table might not exist but connection works
        console.log('✅ ContentService: Basic Supabase connection works');
      } else if (healthError) {
        console.error('❌ ContentService: Basic connection failed:', healthError);
        return {
          success: false,
          message: `Connection failed: ${healthError.message}. Check your Supabase URL and API key.`,
          data: { error: healthError }
        };
      }
      
      // Second test: Check if our table exists
      const { data, error, count } = await supabase
        .from('ai_content_items')
        .select('id, title', { count: 'exact' })
        .limit(1);
      
      if (error) {
        console.error('❌ ContentService: Table access failed:', error);
        
        if (error.code === '42P01') {
          return {
            success: false,
            message: `Table 'ai_content_items' does not exist. Please create the table in your Supabase database.`,
            data: { error, suggestion: 'Create table in Supabase SQL editor' }
          };
        }
        
        return {
          success: false,
          message: `Database error: ${error.message}`,
          data: { error }
        };
      }
      
      console.log('✅ ContentService: Connection test successful', { count, hasData: !!data?.length });
      
      return {
        success: true,
        message: `Connected successfully. Found ${count || 0} items in database.`,
        data: { count, sampleItem: data?.[0] }
      };
      
    } catch (error) {
      console.error('💥 ContentService: Connection test exception:', error);
      return {
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: { error }
      };
    }
  }

  static getTableCreationSQL(): string {
    return `
-- Create the ai_content_items table
CREATE TABLE IF NOT EXISTS ai_content_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    summary TEXT,
    source_domain TEXT,
    category TEXT,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    tags TEXT[],
    innovation_score INTEGER CHECK (innovation_score >= 0 AND innovation_score <= 10),
    publish_score INTEGER CHECK (publish_score >= 0 AND publish_score <= 10),
    content_snippet TEXT,
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_content_items_published ON ai_content_items(published);
CREATE INDEX IF NOT EXISTS idx_ai_content_items_category ON ai_content_items(category);
CREATE INDEX IF NOT EXISTS idx_ai_content_items_source_domain ON ai_content_items(source_domain);
CREATE INDEX IF NOT EXISTS idx_ai_content_items_scraped_at ON ai_content_items(scraped_at);
CREATE INDEX IF NOT EXISTS idx_ai_content_items_innovation_score ON ai_content_items(innovation_score);

-- Enable Row Level Security (optional - for admin access)
ALTER TABLE ai_content_items ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow read access (you can modify this later for admin-only access)
CREATE POLICY "Allow public read access" ON ai_content_items FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert" ON ai_content_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update" ON ai_content_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete" ON ai_content_items FOR DELETE USING (auth.role() = 'authenticated');
`;
  }

  static async insertSampleData(): Promise<void> {
    const sampleData = [
      {
        title: "Sample AI Article 1",
        url: "https://example.com/ai-article-1",
        summary: "This is a sample AI article for testing the content management system.",
        source_domain: "example.com",
        category: "artificial-intelligence",
        difficulty: "beginner" as const,
        tags: ["AI", "Machine Learning", "Tutorial"],
        innovation_score: 8,
        publish_score: 7,
        content_snippet: "This is a sample content snippet for testing purposes. It contains information about artificial intelligence and machine learning concepts.",
        scraped_at: new Date().toISOString(),
        published: false
      },
      {
        title: "Advanced Machine Learning Techniques",
        url: "https://example.com/ml-techniques",
        summary: "Exploring advanced machine learning techniques and their applications in modern AI systems.",
        source_domain: "example.com",
        category: "machine-learning",
        difficulty: "advanced" as const,
        tags: ["Machine Learning", "Deep Learning", "Neural Networks"],
        innovation_score: 9,
        publish_score: 8,
        content_snippet: "Advanced machine learning techniques have revolutionized the field of artificial intelligence. This article explores cutting-edge methods and their practical applications.",
        scraped_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        published: true
      }
    ];

    const { error } = await supabase
      .from('ai_content_items')
      .insert(sampleData);

    if (error) {
      throw new Error(`Failed to insert sample data: ${error.message}`);
    }

    console.log('✅ ContentService: Sample data inserted successfully');
  }
  static async getContentItems(
    page: number = 1,
    limit: number = 50,
    filters: ContentFilters = {}
  ): Promise<{ data: AIContentItem[], count: number }> {
    try {
      console.log('🔍 ContentService: Getting content items', { page, limit, filters });
      
      let query = supabase
        .from('ai_content_items')
        .select('*', { count: 'exact' })
        .order('scraped_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      console.log('📊 ContentService: Base query created');

    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,content_snippet.ilike.%${filters.search}%`)
    }

    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.source_domain) {
      query = query.eq('source_domain', filters.source_domain)
    }

    if (filters.status === 'published') {
      query = query.eq('published', true)
    } else if (filters.status === 'pending') {
      query = query.eq('published', false)
    }

    if (filters.min_innovation_score) {
      query = query.gte('innovation_score', filters.min_innovation_score)
    }

    if (filters.date_range) {
      query = query
        .gte('scraped_at', filters.date_range.start.toISOString())
        .lte('scraped_at', filters.date_range.end.toISOString())
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }

    console.log('🚀 ContentService: Executing query...');
    const { data, error, count } = await query

    if (error) {
      console.error('❌ ContentService: Database error:', error);
      throw new Error(`Error fetching content: ${error.message}`)
    }

    console.log('✅ ContentService: Query successful', { 
      dataLength: data?.length || 0, 
      count,
      firstItem: data?.[0] ? { id: data[0].id, title: data[0].title } : null
    });

    return { data: data || [], count: count || 0 }
    } catch (error) {
      console.error('💥 ContentService: Unexpected error:', error);
      throw error;
    }
  }

  static async getContentItem(id: string): Promise<AIContentItem | null> {
    const { data, error } = await supabase
      .from('ai_content_items')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Error fetching content item: ${error.message}`)
    }

    return data
  }

  static async updateContentItem(id: string, updates: Partial<AIContentItem>): Promise<AIContentItem> {
    const { data, error } = await supabase
      .from('ai_content_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error updating content item: ${error.message}`)
    }

    return data
  }

  static async approveContent(id: string): Promise<AIContentItem> {
    return this.updateContentItem(id, { 
      published: true, 
      processed_at: new Date().toISOString() 
    })
  }

  static async rejectContent(id: string): Promise<AIContentItem> {
    return this.updateContentItem(id, { 
      published: false, 
      processed_at: new Date().toISOString() 
    })
  }

  static async bulkApprove(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('ai_content_items')
      .update({ 
        published: true, 
        processed_at: new Date().toISOString() 
      })
      .in('id', ids)

    if (error) {
      throw new Error(`Error bulk approving content: ${error.message}`)
    }
  }

  static async bulkReject(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('ai_content_items')
      .update({ 
        published: false, 
        processed_at: new Date().toISOString() 
      })
      .in('id', ids)

    if (error) {
      throw new Error(`Error bulk rejecting content: ${error.message}`)
    }
  }

  static async deleteContent(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('ai_content_items')
      .delete()
      .in('id', ids)

    if (error) {
      throw new Error(`Error deleting content: ${error.message}`)
    }
  }

  static async getAnalytics(): Promise<{
    totalItems: number
    pendingItems: number
    publishedItems: number
    topSources: Array<{ domain: string; count: number }>
    categoryCounts: Array<{ category: string; count: number }>
    avgInnovationScore: number
    weeklyTrend: Array<{ date: string; count: number }>
  }> {
    // Get total counts
    const { count: totalItems } = await supabase
      .from('ai_content_items')
      .select('*', { count: 'exact', head: true })

    const { count: pendingItems } = await supabase
      .from('ai_content_items')
      .select('*', { count: 'exact', head: true })
      .eq('published', false)

    const { count: publishedItems } = await supabase
      .from('ai_content_items')
      .select('*', { count: 'exact', head: true })
      .eq('published', true)

    // Get top sources
    const { data: sourcesData } = await supabase
      .from('ai_content_items')
      .select('source_domain')

    const sourceCounts = sourcesData?.reduce((acc, item) => {
      acc[item.source_domain] = (acc[item.source_domain] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const topSources = Object.entries(sourceCounts)
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Get category distribution
    const { data: categoryData } = await supabase
      .from('ai_content_items')
      .select('category')

    const categoryCounts = categoryData?.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const categoryDistribution = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))

    // Get average innovation score
    const { data: scoresData } = await supabase
      .from('ai_content_items')
      .select('innovation_score')

    const avgInnovationScore = scoresData?.reduce((sum, item) => sum + item.innovation_score, 0) / (scoresData?.length || 1) || 0

    // Get weekly trend (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const { data: weeklyData } = await supabase
      .from('ai_content_items')
      .select('scraped_at')
      .gte('scraped_at', weekAgo.toISOString())

    const weeklyTrend = weeklyData?.reduce((acc, item) => {
      const date = new Date(item.scraped_at).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const trendArray = Object.entries(weeklyTrend)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      totalItems: totalItems || 0,
      pendingItems: pendingItems || 0,
      publishedItems: publishedItems || 0,
      topSources,
      categoryCounts: categoryDistribution,
      avgInnovationScore: Math.round(avgInnovationScore * 10) / 10,
      weeklyTrend: trendArray
    }
  }

  static async exportContent(filters: ContentFilters = {}): Promise<AIContentItem[]> {
    let query = supabase
      .from('ai_content_items')
      .select('*')
      .order('scraped_at', { ascending: false })

    // Apply same filters as getContentItems but without pagination
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,content_snippet.ilike.%${filters.search}%`)
    }

    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.source_domain) {
      query = query.eq('source_domain', filters.source_domain)
    }

    if (filters.status === 'published') {
      query = query.eq('published', true)
    } else if (filters.status === 'pending') {
      query = query.eq('published', false)
    }

    if (filters.min_innovation_score) {
      query = query.gte('innovation_score', filters.min_innovation_score)
    }

    if (filters.date_range) {
      query = query
        .gte('scraped_at', filters.date_range.start.toISOString())
        .lte('scraped_at', filters.date_range.end.toISOString())
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error exporting content: ${error.message}`)
    }

    return data || []
  }
}
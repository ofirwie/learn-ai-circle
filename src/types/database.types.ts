// Database types for ISAI AI Knowledge Hub
export interface Database {
  public: {
    Tables: {
      entities: {
        Row: {
          id: string
          name: string
          code_prefix: string
          default_language: string
          settings: Record<string, any>
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code_prefix: string
          default_language?: string
          settings?: Record<string, any>
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          code_prefix?: string
          default_language?: string
          settings?: Record<string, any>
          is_active?: boolean
          created_at?: string
        }
      }
      user_groups: {
        Row: {
          id: string
          entity_id: string
          name: string
          description: string | null
          permissions: Record<string, any>
          can_see_groups: string[]
          display_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          entity_id: string
          name: string
          description?: string | null
          permissions?: Record<string, any>
          can_see_groups?: string[]
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          entity_id?: string
          name?: string
          description?: string | null
          permissions?: Record<string, any>
          can_see_groups?: string[]
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          entity_id: string | null
          user_group_id: string | null
          email: string
          full_name: string
          preferred_language: string
          avatar_url: string | null
          personal_permissions: Record<string, any>
          registration_code: string | null
          is_active: boolean
          last_login: string | null
          created_at: string
        }
        Insert: {
          id?: string
          entity_id?: string | null
          user_group_id?: string | null
          email: string
          full_name: string
          preferred_language?: string
          avatar_url?: string | null
          personal_permissions?: Record<string, any>
          registration_code?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          entity_id?: string | null
          user_group_id?: string | null
          email?: string
          full_name?: string
          preferred_language?: string
          avatar_url?: string | null
          personal_permissions?: Record<string, any>
          registration_code?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
        }
      }
      registration_codes: {
        Row: {
          id: string
          code: string
          entity_id: string
          user_group_id: string
          is_active: boolean
          max_uses: number | null
          current_uses: number
          expires_at: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          entity_id: string
          user_group_id: string
          is_active?: boolean
          max_uses?: number | null
          current_uses?: number
          expires_at?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          entity_id?: string
          user_group_id?: string
          is_active?: boolean
          max_uses?: number | null
          current_uses?: number
          expires_at?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      content: {
        Row: {
          id: string
          title: string
          content_json: Record<string, any>
          content_type: ContentType
          target_entities: string[]
          target_groups: string[]
          languages: string[]
          tags: string[]
          priority: 'low' | 'normal' | 'high'
          is_published: boolean
          published_at: string | null
          view_count: number
          engagement_score: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content_json: Record<string, any>
          content_type: ContentType
          target_entities?: string[]
          target_groups?: string[]
          languages?: string[]
          tags?: string[]
          priority?: 'low' | 'normal' | 'high'
          is_published?: boolean
          published_at?: string | null
          view_count?: number
          engagement_score?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: Record<string, string>
          content_json?: Record<string, any>
          content_type?: ContentType
          target_entities?: string[]
          target_groups?: string[]
          languages?: string[]
          tags?: string[]
          priority?: 'low' | 'normal' | 'high'
          is_published?: boolean
          published_at?: string | null
          view_count?: number
          engagement_score?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      forum_categories: {
        Row: {
          id: string
          entity_id: string
          name: string
          description: string | null
          display_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          entity_id: string
          name: Record<string, string>
          description?: Record<string, string> | null
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          entity_id?: string
          name?: Record<string, string>
          description?: Record<string, string> | null
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
      }
      forum_posts: {
        Row: {
          id: string
          category_id: string
          author_id: string
          title: string
          content: string
          language: string
          is_pinned: boolean
          is_locked: boolean
          view_count: number
          vote_score: number
          reply_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          author_id: string
          title: string
          content: string
          language?: string
          is_pinned?: boolean
          is_locked?: boolean
          view_count?: number
          vote_score?: number
          reply_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          author_id?: string
          title?: string
          content?: string
          language?: string
          is_pinned?: boolean
          is_locked?: boolean
          view_count?: number
          vote_score?: number
          reply_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      forum_comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          content: string
          parent_comment_id: string | null
          is_approved: boolean
          vote_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          content: string
          parent_comment_id?: string | null
          is_approved?: boolean
          vote_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          content?: string
          parent_comment_id?: string | null
          is_approved?: boolean
          vote_score?: number
          created_at?: string
          updated_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          user_id: string | null
          event_type: string
          target_type: string
          target_id: string
          metadata: Record<string, any>
          session_id: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: string
          target_type: string
          target_id: string
          metadata?: Record<string, any>
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: string
          target_type?: string
          target_id?: string
          metadata?: Record<string, any>
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          content_id: string
          progress_type: string
          progress_value: number
          metadata: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content_id: string
          progress_type: string
          progress_value?: number
          metadata?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content_id?: string
          progress_type?: string
          progress_value?: number
          metadata?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Content Types
export type ContentType = 'guide' | 'prompt' | 'prefix' | 'tool' | 'news' | 'video' | 'article'

// Language Types
export type Language = 'en'

// User and Permission Types
export interface Entity {
  id: string
  name: string
  code_prefix: string
  default_language: Language
  settings: Record<string, any>
  is_active: boolean
  created_at: string
}

export interface UserGroup {
  id: string
  entity_id: string
  name: string
  description?: string
  permissions: Record<string, any>
  can_see_groups: string[]
  display_order: number
  is_active: boolean
  created_at: string
}

export interface User {
  id: string
  entity_id?: string
  user_group_id?: string
  email: string
  full_name: string
  preferred_language: Language
  avatar_url?: string
  personal_permissions: Record<string, any>
  registration_code?: string
  is_active: boolean
  last_login?: string
  created_at: string
}

export interface RegistrationCode {
  id: string
  code: string
  entity_id: string
  user_group_id: string
  is_active: boolean
  max_uses?: number
  current_uses: number
  expires_at?: string
  created_by?: string
  created_at: string
}
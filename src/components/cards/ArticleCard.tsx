import React from 'react'
import { Calendar, Eye, Clock, Play, BookOpen, Wrench, Newspaper, Zap } from 'lucide-react'

interface ArticleCardProps {
  id: string
  title: string
  excerpt?: string
  content?: string
  featuredImage?: string
  youtubeVideoId?: string
  author?: string
  category?: string
  contentType?: 'article' | 'video' | 'guide' | 'tool' | 'news' | 'prompt'
  tags?: string[]
  viewCount?: number
  readTime?: number
  publishedAt: string
  featured?: boolean
  onClick?: () => void
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  title,
  excerpt,
  content,
  featuredImage,
  youtubeVideoId,
  author,
  category,
  contentType = 'article',
  tags,
  viewCount = 0,
  readTime,
  publishedAt,
  featured = false,
  onClick
}) => {
  // Generate YouTube thumbnail URL
  const getYoutubeThumbnail = (videoId: string) => 
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

  // Get content type icon
  const getContentIcon = () => {
    switch (contentType) {
      case 'video': return <Play size={14} />
      case 'guide': return <BookOpen size={14} />
      case 'tool': return <Wrench size={14} />
      case 'news': return <Newspaper size={14} />
      case 'prompt': return <Zap size={14} />
      default: return <BookOpen size={14} />
    }
  }

  // Get display image
  const displayImage = youtubeVideoId 
    ? getYoutubeThumbnail(youtubeVideoId)
    : featuredImage || '/api/placeholder/400/240'

  // Extract text from HTML content for excerpt fallback
  const getTextExcerpt = (htmlContent: string, maxLength = 120) => {
    const text = htmlContent.replace(/<[^>]*>/g, '').trim()
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  const displayExcerpt = excerpt || (content ? getTextExcerpt(content) : '')

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div
      onClick={onClick}
      className={`article-card ${featured ? 'featured' : ''}`}
      style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        position: 'relative',
        border: '1px solid #e5e7eb',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...(featured && {
          border: '2px solid #667eea',
          boxShadow: '0 20px 25px -5px rgb(102 126 234 / 0.15), 0 8px 10px -6px rgb(102 126 234 / 0.1)'
        })
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.15), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
        e.currentTarget.style.borderColor = '#d1d5db'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = featured 
          ? '0 8px 10px -4px rgb(102 126 234 / 0.15)'
          : '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
        e.currentTarget.style.borderColor = featured ? '#667eea' : '#e5e7eb'
      }}
    >
      {/* Featured Badge */}
      {featured && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '1rem',
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          zIndex: 2,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          backdropFilter: 'blur(8px)'
        }}>
          ✨ Featured
        </div>
      )}

      {/* Video Play Button Overlay */}
      {youtubeVideoId && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '50%',
          padding: '12px',
          zIndex: 2,
          color: 'white'
        }}>
          <Play size={24} fill="white" />
        </div>
      )}

      {/* Image */}
      <div style={{
        height: '180px',
        backgroundImage: `url(${displayImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#f3f4f6',
        position: 'relative',
        borderRadius: '12px 12px 0 0'
      }}>
        {/* Content Type Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          {getContentIcon()}
          {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {/* Category */}
        {category && (
          <div style={{
            color: '#3b82f6',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '8px'
          }}>
            {category}
          </div>
        )}

        {/* Title */}
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#1f2937',
          lineHeight: '1.4',
          marginBottom: '10px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {title}
        </h3>

        {/* Excerpt */}
        {displayExcerpt && (
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            lineHeight: '1.5',
            marginBottom: '16px',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {displayExcerpt}
          </p>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            marginBottom: '16px'
          }}>
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                style={{
                  background: '#e5e7eb',
                  color: '#374151',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span style={{
                color: '#9ca3af',
                fontSize: '12px'
              }}>
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Meta Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb',
          fontSize: '12px',
          color: '#6b7280',
          marginTop: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} />
              {formatDate(publishedAt)}
            </div>

            {/* Read Time */}
            {readTime && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} />
                {readTime} min read
              </div>
            )}
          </div>

          {/* View Count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Eye size={12} />
            {viewCount.toLocaleString()}
          </div>
        </div>

        {/* Author */}
        {author && (
          <div style={{
            marginTop: '12px',
            fontSize: '12px',
            color: '#9ca3af'
          }}>
            By {author}
          </div>
        )}
      </div>
    </div>
  )
}
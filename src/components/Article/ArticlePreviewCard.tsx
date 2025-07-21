import React from 'react'
import { Article } from '../../types/content'
import { format } from 'date-fns'

interface ArticlePreviewCardProps {
  article: Article
  onClick: () => void
}

export const ArticlePreviewCard: React.FC<ArticlePreviewCardProps> = ({ article, onClick }) => {
  // Get thumbnail - either featured image or YouTube thumbnail
  const getThumbnail = () => {
    if (article.featured_image) {
      return article.featured_image
    }
    if (article.youtube_video_id) {
      return `https://img.youtube.com/vi/${article.youtube_video_id}/maxresdefault.jpg`
    }
    // Default placeholder image
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjIwMCIgeT0iMTEyLjUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk0YTNiOCI+Tm8gSW1hZ2UgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg=='
  }

  // Strip HTML tags from excerpt for clean preview
  const cleanExcerpt = (html: string) => {
    const temp = document.createElement('div')
    temp.innerHTML = html
    return temp.textContent || temp.innerText || ''
  }

  const displayExcerpt = article.excerpt || cleanExcerpt(article.content).substring(0, 150) + '...'

  return (
    <div 
      onClick={onClick}
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
      }}
    >
      {/* Thumbnail */}
      <div style={{
        position: 'relative',
        height: '200px', // Fixed height instead of responsive padding
        overflow: 'hidden',
        backgroundColor: '#f3f4f6'
      }}>
        <img 
          src={getThumbnail()} 
          alt={article.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjIwMCIgeT0iMTEyLjUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk0YTNiOCI+Tm8gSW1hZ2UgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg=='
          }}
        />
        
        {/* Small video indicator only */}
        {article.youtube_video_id && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '500'
          }}>
            📹 Video
          </div>
        )}

        {/* Category badge */}
        {article.category && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: 'rgba(59, 130, 246, 0.9)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {article.category}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{
        padding: '20px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '8px',
          lineHeight: '1.4',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {article.title}
        </h3>

        <p style={{
          fontSize: '14px',
          color: '#64748b',
          marginBottom: '16px',
          lineHeight: '1.6',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          flex: 1
        }}>
          {displayExcerpt}
        </p>

        {/* Meta info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#94a3b8'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>{article.author}</span>
            <span>•</span>
            <span>{format(new Date(article.published_at || article.created_at), 'MMM d, yyyy')}</span>
          </div>
          {article.read_time && (
            <span>{article.read_time} min read</span>
          )}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div style={{
            marginTop: '12px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px'
          }}>
            {article.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#64748b',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px'
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
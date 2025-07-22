import React from 'react'
import { Play, Eye, Clock, Calendar } from 'lucide-react'

interface FeaturedVideoCardProps {
  id: string
  title: string
  youtubeVideoId: string
  viewCount: number
  duration?: string
  publishedAt: string
  category?: string
  author?: string
  onClick?: () => void
}

export const FeaturedVideoCard: React.FC<FeaturedVideoCardProps> = ({
  title,
  youtubeVideoId,
  viewCount = 0,
  duration = '12:34',
  publishedAt,
  category,
  author,
  onClick
}) => {
  const thumbnailUrl = `https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`
  
  const formatViewCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K views`
    return `${count} views`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        backgroundColor: '#000',
        height: '400px',
        gridColumn: 'span 2',
        gridRow: 'span 2'
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${thumbnailUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative'
        }}
      >
        {/* Gradient Overlay */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '200px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)'
        }} />

        {/* Play Button Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80px',
            height: '80px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)'
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
          }}
        >
          <Play size={36} fill="#000" style={{ marginLeft: '4px' }} />
        </div>

        {/* Duration Badge */}
        <div style={{
          position: 'absolute',
          bottom: '100px',
          right: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Clock size={12} />
          {duration}
        </div>

        {/* Content Info */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '24px',
          color: 'white'
        }}>
          {category && (
            <span style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              display: 'inline-block',
              marginBottom: '12px'
            }}>
              {category}
            </span>
          )}
          
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '12px',
            lineHeight: '1.3',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>
            {title}
          </h3>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            fontSize: '14px',
            opacity: 0.9
          }}>
            {author && (
              <span>{author}</span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Eye size={14} />
              {formatViewCount(viewCount)}
            </div>
            <span>{formatDate(publishedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
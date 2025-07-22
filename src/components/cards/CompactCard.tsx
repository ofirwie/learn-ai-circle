import React from 'react'
import { Play, Eye, FileText, Wrench, Zap } from 'lucide-react'

interface CompactCardProps {
  id: string
  title: string
  contentType: 'video' | 'article' | 'tool' | 'prompt'
  thumbnail?: string
  youtubeVideoId?: string
  viewCount: number
  duration?: string
  onClick?: () => void
}

export const CompactCard: React.FC<CompactCardProps> = ({
  title,
  contentType,
  thumbnail,
  youtubeVideoId,
  viewCount = 0,
  duration,
  onClick
}) => {
  const displayImage = youtubeVideoId 
    ? `https://img.youtube.com/vi/${youtubeVideoId}/mqdefault.jpg`
    : thumbnail || '/api/placeholder/120/90'

  const getIcon = () => {
    switch (contentType) {
      case 'video': return <Play size={12} />
      case 'article': return <FileText size={12} />
      case 'tool': return <Wrench size={12} />
      case 'prompt': return <Zap size={12} />
    }
  }

  const getTypeColor = () => {
    switch (contentType) {
      case 'video': return '#ef4444'
      case 'article': return '#3b82f6'
      case 'tool': return '#10b981'
      case 'prompt': return '#f59e0b'
    }
  }

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        gap: '12px',
        padding: '12px',
        borderRadius: '12px',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        height: '100%'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#f9fafb'
        e.currentTarget.style.borderColor = '#d1d5db'
        e.currentTarget.style.transform = 'translateX(4px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'white'
        e.currentTarget.style.borderColor = '#e5e7eb'
        e.currentTarget.style.transform = 'translateX(0)'
      }}
    >
      {/* Thumbnail */}
      <div style={{
        width: '120px',
        height: '90px',
        flexShrink: 0,
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#f3f4f6'
      }}>
        <img
          src={displayImage}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        {contentType === 'video' && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '32px',
            height: '32px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Play size={16} fill="white" color="white" />
          </div>
        )}
        {duration && (
          <div style={{
            position: 'absolute',
            bottom: '4px',
            right: '4px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '500'
          }}>
            {duration}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{
            color: getTypeColor(),
            fontSize: '11px',
            fontWeight: '600',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {getIcon()}
            {contentType}
          </span>
        </div>

        <h4 style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#1f2937',
          lineHeight: '1.4',
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {title}
        </h4>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '12px',
          color: '#6b7280',
          marginTop: 'auto'
        }}>
          <Eye size={12} />
          {viewCount.toLocaleString()} views
        </div>
      </div>
    </div>
  )
}
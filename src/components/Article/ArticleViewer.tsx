import React, { useEffect, useState } from 'react'
import { Article } from '../../types/content'
import { ArticleService } from '../../services/articleService'
import { format } from 'date-fns'

interface ArticleViewerProps {
  article: Article
  onBack: () => void
  onRelatedClick?: (article: Article) => void
}

export const ArticleViewer: React.FC<ArticleViewerProps> = ({ 
  article, 
  onBack, 
  onRelatedClick 
}) => {
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const [loadingRelated, setLoadingRelated] = useState(false)

  useEffect(() => {
    loadRelatedArticles()
  }, [article.id])

  const loadRelatedArticles = async () => {
    try {
      setLoadingRelated(true)
      const related = await ArticleService.getRelatedArticles(article, 4)
      setRelatedArticles(related)
    } catch (error) {
      console.error('Error loading related articles:', error)
    } finally {
      setLoadingRelated(false)
    }
  }

  // Render the article content with proper styling for embeds
  const renderContent = (content: string) => {
    return (
      <>
        <style>
          {`
            .article-content iframe {
              max-width: 600px !important;
              width: 100% !important;
              height: 337px !important;
              margin: 20px auto !important;
              display: block !important;
              border-radius: 12px !important;
            }
            .article-content div[style*="position: relative"][style*="padding-bottom"] {
              max-width: 600px !important;
              margin: 20px auto !important;
              padding-bottom: 33.75% !important;
            }
            .article-content p {
              margin-bottom: 1em;
            }
            .article-content h2 {
              font-size: 24px;
              font-weight: 700;
              margin-top: 32px;
              margin-bottom: 16px;
              color: #1e293b;
            }
            .article-content h3 {
              font-size: 20px;
              font-weight: 600;
              margin-top: 24px;
              margin-bottom: 12px;
              color: #334155;
            }
            .article-content ul, .article-content ol {
              margin-bottom: 16px;
              padding-left: 24px;
            }
            .article-content li {
              margin-bottom: 8px;
            }
          `}
        </style>
        <div 
          className="article-content"
          dangerouslySetInnerHTML={{ __html: content }}
          style={{
            fontSize: '16px',
            lineHeight: '1.7',
            color: '#374151',
            maxWidth: 'none'
          }}
        />
      </>
    )
  }

  return (
    <div style={{ 
      maxWidth: '750px', 
      margin: '0 auto', 
      padding: '0 20px' 
    }}>
      {/* Back Navigation */}
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'transparent',
          border: 'none',
          color: '#3b82f6',
          cursor: 'pointer',
          fontSize: '14px',
          marginBottom: '24px',
          padding: '8px 0'
        }}
      >
        ← Back to Home
      </button>

      {/* Article Header */}
      <header style={{ marginBottom: '32px' }}>
        {/* Category */}
        {article.category && (
          <div style={{
            display: 'inline-block',
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '16px'
          }}>
            {article.category}
          </div>
        )}

        {/* Title */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          lineHeight: '1.3',
          color: '#1e293b',
          marginBottom: '12px'
        }}>
          {article.title}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p style={{
            fontSize: '18px',
            color: '#64748b',
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            {article.excerpt}
          </p>
        )}

        {/* Meta Information */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid #e2e8f0',
          fontSize: '14px',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: '500' }}>By {article.author}</span>
          </div>
          <span>•</span>
          <span>{format(new Date(article.published_at || article.created_at), 'MMMM d, yyyy')}</span>
          {article.read_time && (
            <>
              <span>•</span>
              <span>{article.read_time} min read</span>
            </>
          )}
          <span>•</span>
          <span>{article.view_count} views</span>
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '16px'
          }}>
            {article.tags.map((tag, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Featured Image only - no videos at top */}
      {article.featured_image && !article.youtube_video_id && (
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
          <img
            src={article.featured_image}
            alt={article.title}
            style={{
              maxWidth: '600px',
              width: '100%',
              height: 'auto',
              borderRadius: '12px',
              objectFit: 'cover'
            }}
          />
        </div>
      )}

      {/* Article Content */}
      <article style={{
        marginBottom: '48px',
        fontSize: '18px',
        lineHeight: '1.8'
      }}>
        {renderContent(article.content)}
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: '48px',
          marginBottom: '48px'
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '24px',
            color: '#1e293b'
          }}>
            Related Articles
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {relatedArticles.map((relatedArticle) => (
              <div
                key={relatedArticle.id}
                onClick={() => onRelatedClick?.(relatedArticle)}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Thumbnail */}
                {(relatedArticle.featured_image || relatedArticle.youtube_video_id) && (
                  <div style={{
                    height: '140px',
                    backgroundColor: '#f3f4f6',
                    backgroundImage: relatedArticle.featured_image ? 
                      `url(${relatedArticle.featured_image})` : 
                      relatedArticle.youtube_video_id ? 
                      `url(https://img.youtube.com/vi/${relatedArticle.youtube_video_id}/maxresdefault.jpg)` : 
                      'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }} />
                )}

                <div style={{ padding: '16px' }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    lineHeight: '1.4',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {relatedArticle.title}
                  </h4>

                  <div style={{
                    fontSize: '12px',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>{relatedArticle.author}</span>
                    <span>•</span>
                    <span>{format(new Date(relatedArticle.published_at || relatedArticle.created_at), 'MMM d')}</span>
                    {relatedArticle.read_time && (
                      <>
                        <span>•</span>
                        <span>{relatedArticle.read_time} min</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
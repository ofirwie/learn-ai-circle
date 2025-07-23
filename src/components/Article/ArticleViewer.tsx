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

  // Enhanced content renderer that properly parses markdown and handles complex formatting
  const renderContent = (content: string) => {
    // Content processing debug (remove after testing)
    // console.log('🔴 ARTICLE DEBUG:', { title: article.title, contentLength: content?.length || 0 })
    
    if (!content || content.trim() === '') {
      return <div>No content available.</div>
    }

    // Step 1: Convert YouTube links to proper embeds first
    let processedContent = content
    
    // Handle iframe elements that are already in the content
    processedContent = processedContent.replace(
      /<iframe[^>]*src="https:\/\/www\.youtube\.com\/embed\/([^"]+)"[^>]*>[^<]*<\/iframe>/gi,
      (match, videoId) => {
        return `
          <div class="youtube-embed" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 600px; margin: 20px auto; border-radius: 12px;">
            <iframe 
              src="https://www.youtube.com/embed/${videoId}" 
              style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 12px;"
              frameborder="0" 
              allowfullscreen>
            </iframe>
          </div>
        `
      }
    )
    
    // Convert YouTube anchor links to embeds
    const youtubeAnchorRegex = /<a[^>]*href="https:\/\/www\.youtube\.com\/watch\?v=([^"&]+)"[^>]*>([^<]+)<\/a>/gi
    processedContent = processedContent.replace(youtubeAnchorRegex, (match, videoId, linkText) => {
      return `
        <div class="youtube-embed" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 600px; margin: 20px auto; border-radius: 12px;">
          <iframe 
            src="https://www.youtube.com/embed/${videoId}" 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 12px;"
            frameborder="0" 
            allowfullscreen
            title="${linkText}">
          </iframe>
        </div>
        <p style="text-align: center; margin: 10px 0; font-size: 14px; color: #64748b;">
          <strong>${linkText}</strong>
        </p>
      `
    })
    
    // Convert bare YouTube URLs to embeds
    const youtubeUrlRegex = /https:\/\/www\.youtube\.com\/watch\?v=([^?\s&]+)/gi
    processedContent = processedContent.replace(youtubeUrlRegex, (match, videoId) => {
      return `
        <div class="youtube-embed" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 600px; margin: 20px auto; border-radius: 12px;">
          <iframe 
            src="https://www.youtube.com/embed/${videoId}" 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 12px;"
            frameborder="0" 
            allowfullscreen>
          </iframe>
        </div>
      `
    })
    
    // Step 2: Clean up common markdown artifacts and separators
    processedContent = processedContent
      .replace(/^---+\s*/gm, '') // Remove leading dashes
      .replace(/\s*---+\s*$/gm, '') // Remove trailing dashes
      .replace(/^\s*---+\s*$/gm, '<hr>') // Convert standalone dashes to HR
    
    // Step 3: Handle headers that might be inside HTML tags (like <p>### Header</p>)
    // First, convert ### patterns anywhere in the content, not just at line start
    processedContent = processedContent
      .replace(/(#{6})\s*([^#\n]*?)(?=\s*#{1,6}|\s*##?\s|\s*$)/g, '<h6>$2</h6>')
      .replace(/(#{5})\s*([^#\n]*?)(?=\s*#{1,6}|\s*##?\s|\s*$)/g, '<h5>$2</h5>')
      .replace(/(#{4})\s*([^#\n]*?)(?=\s*#{1,6}|\s*##?\s|\s*$)/g, '<h4>$2</h4>')
      .replace(/(#{3})\s*([^#\n]*?)(?=\s*#{1,6}|\s*##?\s|\s*$)/g, '<h3>$2</h3>')
      .replace(/(#{2})\s*([^#\n]*?)(?=\s*#{1,6}|\s*##?\s|\s*$)/g, '<h2>$2</h2>')
      .replace(/(#{1})\s+([^#\n]*?)(?=\s*#{1,6}|\s*##?\s|\s*$)/g, '<h1>$2</h1>')
    
    // Step 4: Clean up any remaining bold/italic inside headers  
    processedContent = processedContent.replace(/<(h[1-6])>([^<]*)<\/\1>/g, (match, tag, text) => {
      const cleanText = text
        .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove **bold**
        .replace(/__([^_]+)__/g, '$1')     // Remove __bold__
        .replace(/\*([^*]+)\*/g, '$1')     // Remove *italic*
        .replace(/_([^_]+)_/g, '$1')       // Remove _italic_
        .replace(/`([^`]+)`/g, '$1')       // Remove `code`
        .trim()
      return `<${tag}>${cleanText}</${tag}>`
    })
    
    // Header processing debug (remove after testing)
    // console.log('🟢 AFTER HEADER PROCESSING:', { h3TagsFound: processedContent.match(/<h3>.*?<\/h3>/g)?.length || 0 })
    
    // Step 5: Convert text formatting (order matters!)
    processedContent = processedContent
      // Strikethrough first
      .replace(/~~([^~]+)~~/g, '<del>$1</del>') // ~~strikethrough~~
      // Bold (handle both ** and __ formats)
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>') // **bold**
      .replace(/__([^_\n]+)__/g, '<strong>$1</strong>') // __bold__
      // Italic (handle both * and _ formats, but not if already in bold)
      .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>') // *italic*
      .replace(/(?<!_)_([^_\n]+)_(?!_)/g, '<em>$1</em>') // _italic_
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>') // `code`
    
    // Step 5b: Handle code blocks (before other processing)
    processedContent = processedContent.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, language, code) => {
      return `<pre><code class="language-${language || 'text'}">${code.trim()}</code></pre>`
    })
    
    // Step 5c: Handle blockquotes
    processedContent = processedContent.replace(/^>\s(.+)$/gm, '<blockquote>$1</blockquote>')
    
    // Step 5d: Handle links [text](url)
    processedContent = processedContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Step 6: Convert bullet lists
    const lines = processedContent.split('\n')
    const processedLines: string[] = []
    let inList = false
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmedLine = line.trim()
      
      // Check if this is a bullet list item
      if (trimmedLine.match(/^[-*+]\s+/)) {
        if (!inList) {
          processedLines.push('<ul>')
          inList = true
        }
        const listContent = trimmedLine.replace(/^[-*+]\s+/, '')
        processedLines.push(`<li>${listContent}</li>`)
      } else {
        // Not a list item
        if (inList) {
          processedLines.push('</ul>')
          inList = false
        }
        processedLines.push(line)
      }
    }
    
    // Close any remaining list
    if (inList) {
      processedLines.push('</ul>')
    }
    
    processedContent = processedLines.join('\n')
    
    // Step 7: Convert numbered lists (similar to bullet lists)
    const numberedLines = processedContent.split('\n')
    const processedNumberedLines: string[] = []
    let inNumberedList = false
    
    for (let i = 0; i < numberedLines.length; i++) {
      const line = numberedLines[i]
      const trimmedLine = line.trim()
      
      // Check if this is a numbered list item
      if (trimmedLine.match(/^\d+\.\s+/)) {
        if (!inNumberedList) {
          processedNumberedLines.push('<ol>')
          inNumberedList = true
        }
        const listContent = trimmedLine.replace(/^\d+\.\s+/, '')
        processedNumberedLines.push(`<li>${listContent}</li>`)
      } else {
        // Not a numbered list item
        if (inNumberedList) {
          processedNumberedLines.push('</ol>')
          inNumberedList = false
        }
        processedNumberedLines.push(line)
      }
    }
    
    // Close any remaining numbered list
    if (inNumberedList) {
      processedNumberedLines.push('</ol>')
    }
    
    processedContent = processedNumberedLines.join('\n')
    
    // Step 8: Convert paragraphs (split by double newlines)
    const paragraphs = processedContent.split(/\n\s*\n/)
    const htmlParagraphs = paragraphs.map(para => {
      const trimmed = para.trim()
      if (!trimmed) return ''
      
      // Skip if already wrapped in HTML tags or starts with <iframe
      if (trimmed.match(/^<(h[1-6]|ul|ol|li|div|hr|iframe)/i) || trimmed.includes('<iframe')) {
        return trimmed
      }
      
      // Wrap in paragraph tags
      return `<p>${trimmed}</p>`
    }).filter(p => p !== '')
    
    processedContent = htmlParagraphs.join('\n')
    
    // Step 9: Clean up formatting issues
    processedContent = processedContent
      .replace(/<p>(<h[1-6][^>]*>.*?<\/h[1-6]>)<\/p>/gi, '$1') // Remove p tags around headers
      .replace(/<p>(<ul>.*?<\/ul>)<\/p>/gs, '$1') // Remove p tags around lists
      .replace(/<p>(<ol>.*?<\/ol>)<\/p>/gs, '$1') // Remove p tags around ordered lists
      .replace(/<p>(<hr>)<\/p>/gi, '$1') // Remove p tags around hr
      .replace(/<p>(<div.*?<\/div>)<\/p>/gs, '$1') // Remove p tags around divs
      .replace(/\n{3,}/g, '\n\n') // Reduce excessive newlines
      .replace(/<\/li>\n*<li>/g, '</li><li>') // Clean up list items
      .trim()
    
    // Step 10: Return the processed content with enhanced styling
    return (
      <>
        <style>
          {`
            .article-content {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              font-size: 18px;
              line-height: 1.8;
              color: #374151;
              max-width: none;
            }
            
            .article-content iframe {
              max-width: 600px !important;
              width: 100% !important;
              height: 337px !important;
              margin: 20px auto !important;
              display: block !important;
              border-radius: 12px !important;
            }
            
            .article-content .youtube-embed {
              max-width: 600px !important;
              margin: 20px auto !important;
              border-radius: 12px !important;
            }
            
            .article-content p {
              margin-bottom: 1.5em;
              line-height: 1.8;
              text-align: left;
              overflow-wrap: break-word;
              word-wrap: break-word;
            }
            
            .article-content h1 {
              font-size: 32px;
              font-weight: 700;
              margin-top: 48px;
              margin-bottom: 24px;
              color: #1e293b;
              line-height: 1.3;
            }
            
            .article-content h2 {
              font-size: 28px;
              font-weight: 700;
              margin-top: 40px;
              margin-bottom: 20px;
              color: #1e293b;
              line-height: 1.3;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 8px;
            }
            
            .article-content h3 {
              font-size: 24px;
              font-weight: 600;
              margin-top: 32px;
              margin-bottom: 16px;
              color: #334155;
              line-height: 1.4;
            }
            
            .article-content h4 {
              font-size: 20px;
              font-weight: 600;
              margin-top: 24px;
              margin-bottom: 12px;
              color: #475569;
              line-height: 1.4;
            }
            
            .article-content h5 {
              font-size: 18px;
              font-weight: 600;
              margin-top: 20px;
              margin-bottom: 10px;
              color: #64748b;
              line-height: 1.4;
            }
            
            .article-content h6 {
              font-size: 16px;
              font-weight: 600;
              margin-top: 16px;
              margin-bottom: 8px;
              color: #64748b;
              line-height: 1.4;
            }
            
            .article-content ul {
              margin-bottom: 20px;
              padding-left: 28px;
              list-style-type: disc;
            }
            
            .article-content ol {
              margin-bottom: 20px;
              padding-left: 28px;
              list-style-type: decimal;
            }
            
            .article-content li {
              margin-bottom: 8px;
              line-height: 1.7;
              padding-left: 4px;
            }
            
            .article-content li p {
              margin-bottom: 0.5em;
            }
            
            .article-content hr {
              border: none;
              border-top: 2px solid #e2e8f0;
              margin: 40px 0;
              opacity: 0.6;
            }
            
            .article-content strong {
              font-weight: 700;
              color: #1e293b;
            }
            
            .article-content em {
              font-style: italic;
              color: #475569;
            }
            
            .article-content blockquote {
              border-left: 4px solid #3b82f6;
              padding-left: 20px;
              margin: 24px 0;
              background: #f8fafc;
              padding: 16px 20px;
              border-radius: 8px;
              font-style: italic;
              color: #475569;
            }
            
            .article-content code {
              background: #f1f5f9;
              padding: 2px 6px;
              border-radius: 4px;
              font-family: 'Fira Code', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
              font-size: 14px;
              color: #e11d48;
            }
            
            .article-content pre {
              background: #1e293b;
              color: #e2e8f0;
              padding: 20px;
              border-radius: 8px;
              overflow-x: auto;
              margin: 20px 0;
              font-family: 'Fira Code', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
              font-size: 14px;
              line-height: 1.5;
            }
            
            .article-content pre code {
              background: none;
              padding: 0;
              color: inherit;
              font-size: inherit;
            }
            
            .article-content blockquote {
              border-left: 4px solid #3b82f6;
              padding-left: 20px;
              margin: 24px 0;
              background: #f8fafc;
              padding: 16px 20px;
              border-radius: 8px;
              font-style: italic;
              color: #475569;
            }
            
            .article-content del {
              text-decoration: line-through;
              color: #9ca3af;
            }
            
            .article-content ol {
              margin-bottom: 20px;
              padding-left: 28px;
              list-style-type: decimal;
            }
            
            .article-content a {
              color: #3b82f6;
              text-decoration: underline;
              text-decoration-thickness: 1px;
              text-underline-offset: 2px;
            }
            
            .article-content a:hover {
              color: #1d4ed8;
              text-decoration-thickness: 2px;
            }
            
            .article-content img {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
              margin: 20px 0;
              display: block;
              margin-left: auto;
              margin-right: auto;
            }
            
            /* First paragraph special styling */
            .article-content > p:first-of-type {
              font-size: 20px;
              font-weight: 400;
              color: #475569;
              margin-bottom: 2em;
              line-height: 1.7;
            }
          `}
        </style>
        <div 
          className="article-content"
          dangerouslySetInnerHTML={{ __html: processedContent }}
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
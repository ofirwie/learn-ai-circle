import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ArticleService } from './services/articleService'
import { Article } from './types/content'
import { ArticleViewer } from './components/Article/ArticleViewer'
import SimplePromptsViewer from './components/prompts/SimplePromptsViewer'
import { AdminApp } from './components/AdminApp'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/*" element={<PublicISAIApp />} />
      </Routes>
    </Router>
  )
}

// Public ISAI Website (no login required)
const PublicISAIApp: React.FC = () => {
  const [currentView, setCurrentView] = useState('home')
  const [articles, setArticles] = useState<Article[]>([])
  const [guides, setGuides] = useState<Article[]>([])
  const [toolReviews, setToolReviews] = useState<Article[]>([])
  const [loadingContent, setLoadingContent] = useState(true)
  const [loadingGuides, setLoadingGuides] = useState(false)
  const [loadingTools, setLoadingTools] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  
  // Fetch articles on load (no authentication required)
  useEffect(() => {
    fetchArticles()
  }, [])

  // Fetch content by type when view changes
  useEffect(() => {
    if (currentView === 'guides' && guides.length === 0) {
      fetchContentByType('guide', setGuides, setLoadingGuides)
    }
    if (currentView === 'tools' && toolReviews.length === 0) {
      fetchContentByType('tool-review', setToolReviews, setLoadingTools)
    }
  }, [currentView, guides.length, toolReviews.length])

  const fetchArticles = async () => {
    try {
      setLoadingContent(true)
      const result = await ArticleService.getArticles(1, 20, { status: 'published' })
      setArticles(result.data)
    } catch (error) {
      console.error('Failed to fetch articles:', error)
    } finally {
      setLoadingContent(false)
    }
  }

  const fetchContentByType = async (contentType: string, setData: (data: Article[]) => void, setLoading: (loading: boolean) => void) => {
    try {
      setLoading(true)
      const result = await ArticleService.getArticles(1, 50, { 
        status: 'published',
        category: contentType
      })
      setData(result.data)
    } catch (error) {
      console.error(`Failed to fetch ${contentType}:`, error)
    } finally {
      setLoading(false)
    }
  }

  // Show main app (public access)
  return (
    <div className="app">
      {/* LetsAI Professional Header */}
      <header className="letsai-header">
        <div className="header-container">
          {/* Logo */}
          <a href="#" className="logo" onClick={() => {
            setCurrentView('home')
            setSelectedArticle(null)
          }}>
            IS-AI Beta
          </a>
          
          {/* Main Navigation */}
          <nav className="main-nav">
            <a href="#" onClick={() => {
              setCurrentView('home')
              setSelectedArticle(null)
            }} className={currentView === 'home' ? 'active' : ''}>
              Home
            </a>
            <a href="#" onClick={() => {
              setCurrentView('news')
              setSelectedArticle(null)
            }} className={currentView === 'news' ? 'active' : ''}>
              News
            </a>
            <a href="#" onClick={() => {
              setCurrentView('articles')
              setSelectedArticle(null)
            }} className={currentView === 'articles' ? 'active' : ''}>
              Articles
            </a>
            <a href="#" onClick={() => {
              setCurrentView('forum')
              setSelectedArticle(null)
            }} className={currentView === 'forum' ? 'active' : ''}>
              Forum
            </a>
            <a href="#" onClick={() => {
              setCurrentView('guides')
              setSelectedArticle(null)
            }} className={currentView === 'guides' ? 'active' : ''}>
              Guides
            </a>
            <a href="#" onClick={() => {
              setCurrentView('tools')
              setSelectedArticle(null)
            }} className={currentView === 'tools' ? 'active' : ''}>
              Tools Review
            </a>
            <a href="#" onClick={() => {
              setCurrentView('prompts')
              setSelectedArticle(null)
            }} className={currentView === 'prompts' ? 'active' : ''}>
              Prompts
            </a>
          </nav>
          
          {/* Right Side Elements - Admin access hidden */}
          <div className="header-right">
            <div className="user-menu">
              {/* Admin panel accessible only via direct URL: /admin */}
            </div>
          </div>
        </div>
      </header>

      {/* Hero & Main Content */}
      <main className="main-content">
        {selectedArticle ? (
          <ArticleViewer
            article={selectedArticle}
            onBack={() => setSelectedArticle(null)}
            onRelatedClick={(article) => setSelectedArticle(article)}
          />
        ) : currentView === 'home' ? (
          <div className="techcrunch-container">
            <div className="techcrunch-layout">
              {/* Main Content Area */}
              <div className="techcrunch-main">
                {loadingContent ? (
                  <div className="content-loading">
                    <div className="spinner" />
                    <p>Loading latest articles...</p>
                  </div>
                ) : (
                  <>
                    {/* Featured Article */}
                    {articles.length > 0 && (
                      <article className="techcrunch-featured" onClick={() => setSelectedArticle(articles[0])}>
                        <img 
                          src={
                            articles[0].featured_image || 
                            (articles[0].youtube_video_id ? `https://img.youtube.com/vi/${articles[0].youtube_video_id}/maxresdefault.jpg` : 
                            // Use category-specific placeholder for featured article
                            `data:image/svg+xml;base64,${btoa(`<svg width="800" height="400" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="800" height="400" fill="#F3F4F6"/>
                              <circle cx="400" cy="200" r="60" fill="#9CA3AF"/>
                              <text x="400" y="260" text-anchor="middle" fill="#4B5563" font-size="16" font-family="Arial">${articles[0].category?.toUpperCase() || 'FEATURED ARTICLE'}</text>
                              <path d="M362 160L438 200L362 240V160Z" fill="#F9FAFB"/>
                            </svg>`)}`)
                          } 
                          alt={articles[0].title}
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = `data:image/svg+xml;base64,${btoa(`<svg width="800" height="400" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="800" height="400" fill="#F3F4F6"/>
                              <circle cx="400" cy="200" r="60" fill="#9CA3AF"/>
                              <text x="400" y="260" text-anchor="middle" fill="#4B5563" font-size="16" font-family="Arial">NO IMAGE</text>
                              <path d="M362 160L438 200L362 240V160Z" fill="#F9FAFB"/>
                            </svg>`)}`
                          }}
                        />
                        {articles[0].youtube_video_id && (
                          <div className="techcrunch-play-button">▶</div>
                        )}
                        <div className="techcrunch-featured-overlay">
                          <span className="techcrunch-category">
                            {articles[0].category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Article'}
                          </span>
                          <h1>{articles[0].title}</h1>
                          <p>{articles[0].excerpt || articles[0].title}</p>
                        </div>
                      </article>
                    )}

                    {/* Secondary Articles Grid */}
                    <div className="techcrunch-grid">
                      {articles.slice(1, 9).map((article) => (
                        <article 
                          key={article.id} 
                          className="techcrunch-card" 
                          onClick={() => setSelectedArticle(article)}
                        >
                          <div className="techcrunch-card-image">
                            <img 
                              src={
                                article.featured_image || 
                                (article.youtube_video_id ? `https://img.youtube.com/vi/${article.youtube_video_id}/mqdefault.jpg` : 
                                // Use category-specific placeholder images instead of random ones
                                `data:image/svg+xml;base64,${btoa(`<svg width="320" height="180" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect width="320" height="180" fill="#F3F4F6"/>
                                  <circle cx="160" cy="90" r="30" fill="#9CA3AF"/>
                                  <text x="160" y="120" text-anchor="middle" fill="#4B5563" font-size="12" font-family="Arial">${article.category?.toUpperCase() || 'ARTICLE'}</text>
                                  <path d="M145 75L175 90L145 105V75Z" fill="#F9FAFB"/>
                                </svg>`)}`)
                              } 
                              alt={article.title}
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = `data:image/svg+xml;base64,${btoa(`<svg width="320" height="180" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect width="320" height="180" fill="#F3F4F6"/>
                                  <circle cx="160" cy="90" r="30" fill="#9CA3AF"/>
                                  <text x="160" y="120" text-anchor="middle" fill="#4B5563" font-size="12" font-family="Arial">NO IMAGE</text>
                                  <path d="M145 75L175 90L145 105V75Z" fill="#F9FAFB"/>
                                </svg>`)}`
                              }}
                            />
                            {article.youtube_video_id && (
                              <div className="techcrunch-play-button">▶</div>
                            )}
                          </div>
                          <div className="techcrunch-card-content">
                            <span className="techcrunch-card-category">
                              {article.category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Article'}
                            </span>
                            <h3>{article.title}</h3>
                            <div className="techcrunch-card-meta">
                              {new Date(article.created_at).toLocaleDateString()} • {article.author}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Sidebar */}
              <aside className="techcrunch-sidebar">
                <h2>Latest Headlines</h2>
                <ul className="techcrunch-headlines">
                  {/* Show up to 10 headlines, starting from article 2 (skip the featured article) */}
                  {articles.slice(1, Math.min(articles.length, 11)).map((article, index) => (
                    <li 
                      key={article.id} 
                      className="techcrunch-headline-item"
                      onClick={() => setSelectedArticle(article)}
                    >
                      <span className="techcrunch-headline-bullet"></span>
                      <span className="techcrunch-headline-text">
                        {article.title}
                      </span>
                    </li>
                  ))}
                  {articles.length <= 1 && (
                    <li className="techcrunch-headline-item" style={{ opacity: 0.6, cursor: 'default' }}>
                      <span className="techcrunch-headline-text">
                        No additional headlines available
                      </span>
                    </li>
                  )}
                </ul>
              </aside>
            </div>
          </div>
        ) : currentView === 'guides' ? (
          <div className="page-transition">
            <section className="page-header">
              <div className="page-icon">📖</div>
              <h1 className="page-title">Guides</h1>
              <p className="page-subtitle">
                Master AI with our comprehensive, expert-crafted guides and tutorials
              </p>
            </section>
            
            <section className="content-section">
              {loadingGuides ? (
                <div className="loading-skeleton-grid">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="article-card-skeleton">
                      <div className="skeleton-image"></div>
                      <div className="skeleton-content">
                        <div className="skeleton-title"></div>
                        <div className="skeleton-text"></div>
                        <div className="skeleton-text short"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : guides.length > 0 ? (
                <div className="techcrunch-grid">
                  {guides.map((guide) => (
                    <article 
                      key={guide.id} 
                      className="techcrunch-card" 
                      onClick={() => setSelectedArticle(guide)}
                    >
                      <div className="techcrunch-card-image">
                        <img 
                          src={
                            guide.featured_image || 
                            (guide.youtube_video_id ? `https://img.youtube.com/vi/${guide.youtube_video_id}/mqdefault.jpg` : 
                            `data:image/svg+xml;base64,${btoa(`<svg width="320" height="180" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="320" height="180" fill="#10B981"/>
                              <circle cx="160" cy="90" r="40" fill="#FFFFFF" opacity="0.2"/>
                              <text x="160" y="95" text-anchor="middle" fill="#FFFFFF" font-size="16" font-family="Arial, sans-serif" font-weight="bold">GUIDE</text>
                              <path d="M145 75L175 90L145 105V75Z" fill="#FFFFFF" opacity="0.4"/>
                            </svg>`)}`)
                          }
                        />
                        {guide.youtube_video_id && (
                          <div className="techcrunch-play-button">▶</div>
                        )}
                      </div>
                      <div className="techcrunch-card-content">
                        <span className="techcrunch-card-category">
                          📖 {guide.category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Guide'}
                        </span>
                        <h3>{guide.title}</h3>
                        {guide.excerpt && (
                          <p className="techcrunch-card-excerpt">
                            {guide.excerpt.length > 120 ? `${guide.excerpt.substring(0, 120)}...` : guide.excerpt}
                          </p>
                        )}
                        <div className="techcrunch-card-meta">
                          {new Date(guide.published_at || guide.created_at).toLocaleDateString()} • {guide.author}
                          {guide.view_count && guide.view_count > 0 && (
                            <span> • {guide.view_count} views</span>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">📖</div>
                  <h3>No Guides Available</h3>
                  <p>Check back soon for expert-crafted AI guides and tutorials.</p>
                </div>
              )}
            </section>
          </div>
        ) : currentView === 'tools' ? (
          <div className="page-transition">
            <section className="page-header">
              <div className="page-icon">🔧</div>
              <h1 className="page-title">Tools Review</h1>
              <p className="page-subtitle">
                Reviews and guides for AI tools and software
              </p>
            </section>
            
            <section className="content-section">
              {loadingTools ? (
                <div className="loading-skeleton-grid">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="article-card-skeleton">
                      <div className="skeleton-image"></div>
                      <div className="skeleton-content">
                        <div className="skeleton-title"></div>
                        <div className="skeleton-text"></div>
                        <div className="skeleton-text short"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : toolReviews.length > 0 ? (
                <div className="techcrunch-grid">
                  {toolReviews.map((tool) => (
                    <article 
                      key={tool.id} 
                      className="techcrunch-card" 
                      onClick={() => setSelectedArticle(tool)}
                    >
                      <div className="techcrunch-card-image">
                        <img 
                          src={
                            tool.featured_image || 
                            (tool.youtube_video_id ? `https://img.youtube.com/vi/${tool.youtube_video_id}/mqdefault.jpg` : 
                            `data:image/svg+xml;base64,${btoa(`<svg width="320" height="180" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="320" height="180" fill="#3B82F6"/>
                              <circle cx="160" cy="90" r="40" fill="#FFFFFF" opacity="0.2"/>
                              <text x="160" y="95" text-anchor="middle" fill="#FFFFFF" font-size="16" font-family="Arial, sans-serif" font-weight="bold">TOOL REVIEW</text>
                              <path d="M145 75L175 90L145 105V75Z" fill="#FFFFFF" opacity="0.4"/>
                            </svg>`)}`)
                          }
                        />
                        {tool.youtube_video_id && (
                          <div className="techcrunch-play-button">▶</div>
                        )}
                      </div>
                      <div className="techcrunch-card-content">
                        <span className="techcrunch-card-category">
                          🔧 {tool.category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Tool Review'}
                        </span>
                        <h3>{tool.title}</h3>
                        {tool.excerpt && (
                          <p className="techcrunch-card-excerpt">
                            {tool.excerpt.length > 120 ? `${tool.excerpt.substring(0, 120)}...` : tool.excerpt}
                          </p>
                        )}
                        <div className="techcrunch-card-meta">
                          {new Date(tool.published_at || tool.created_at).toLocaleDateString()} • {tool.author}
                          {tool.view_count && tool.view_count > 0 && (
                            <span> • {tool.view_count} views</span>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">🔧</div>
                  <h3>No Tool Reviews Available</h3>
                  <p>Check back soon for in-depth AI tool reviews and comparisons.</p>
                </div>
              )}
            </section>
          </div>
        ) : currentView === 'prompts' ? (
          <div className="page-transition">
            <SimplePromptsViewer />
          </div>
        ) : currentView === 'articles' ? (
          <div className="page-transition">
            <section className="page-header">
              <div className="page-icon">📄</div>
              <h1 className="page-title">Articles</h1>
              <p className="page-subtitle">
                In-depth articles covering AI topics, tools, and techniques
              </p>
            </section>
            
            <section className="content-section">
              {loadingContent ? (
                <div className="content-loading">
                  <div className="spinner" />
                  <p>Loading articles...</p>
                </div>
              ) : articles.length > 0 ? (
                <div className="techcrunch-grid">
                  {articles.map((article) => (
                    <article 
                      key={article.id} 
                      className="techcrunch-card" 
                      onClick={() => setSelectedArticle(article)}
                    >
                      <div className="techcrunch-card-image">
                        <img 
                          src={
                            article.featured_image || 
                            (article.youtube_video_id ? `https://img.youtube.com/vi/${article.youtube_video_id}/mqdefault.jpg` : 
                            `data:image/svg+xml;base64,${btoa(`<svg width="320" height="180" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="320" height="180" fill="#F3F4F6"/>
                              <circle cx="160" cy="90" r="30" fill="#9CA3AF"/>
                              <text x="160" y="120" text-anchor="middle" fill="#4B5563" font-size="12" font-family="Arial">${article.category?.toUpperCase() || 'ARTICLE'}</text>
                              <path d="M145 75L175 90L145 105V75Z" fill="#F9FAFB"/>
                            </svg>`)}`)
                          } 
                          alt={article.title}
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = `data:image/svg+xml;base64,${btoa(`<svg width="320" height="180" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="320" height="180" fill="#F3F4F6"/>
                              <circle cx="160" cy="90" r="30" fill="#9CA3AF"/>
                              <text x="160" y="120" text-anchor="middle" fill="#4B5563" font-size="12" font-family="Arial">NO IMAGE</text>
                              <path d="M145 75L175 90L145 105V75Z" fill="#F9FAFB"/>
                            </svg>`)}`
                          }}
                        />
                        {article.youtube_video_id && (
                          <div className="techcrunch-play-button">▶</div>
                        )}
                      </div>
                      <div className="techcrunch-card-content">
                        <span className="techcrunch-card-category">
                          {article.category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Article'}
                        </span>
                        <h3>{article.title}</h3>
                        {article.excerpt && (
                          <p className="techcrunch-card-excerpt">
                            {article.excerpt.length > 120 ? `${article.excerpt.substring(0, 120)}...` : article.excerpt}
                          </p>
                        )}
                        <div className="techcrunch-card-meta">
                          {new Date(article.created_at).toLocaleDateString()} • {article.author}
                          {article.view_count && article.view_count > 0 && (
                            <span> • {article.view_count} views</span>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">📄</div>
                  <h3>No Articles Available</h3>
                  <p>Check back soon for in-depth AI articles and insights.</p>
                </div>
              )}
            </section>
          </div>
        ) : currentView === 'videos' ? (
          <div className="page-transition">
            <section className="page-header">
              <div className="page-icon">🎥</div>
              <h1 className="page-title">Video Content</h1>
              <p className="page-subtitle">
                Educational videos, tutorials, and demonstrations
              </p>
            </section>
            
            <section className="content-section">
              <div className="coming-soon-card">
                <div className="coming-soon-icon">🎥</div>
                <h3>Coming Soon</h3>
                <p>Video content is being prepared for your library.</p>
              </div>
            </section>
          </div>
        ) : currentView === 'news' ? (
          <div className="page-transition">
            <section className="page-header">
              <div className="page-icon">📰</div>
              <h1 className="page-title">News</h1>
              <p className="page-subtitle">
                Latest developments and updates in artificial intelligence
              </p>
            </section>
            
            <section className="content-section">
              <div className="coming-soon-card">
                <div className="coming-soon-icon">📰</div>
                <h3>Coming Soon</h3>
                <p>AI news updates are being curated for you.</p>
              </div>
            </section>
          </div>
        ) : currentView === 'forum' ? (
          <div className="page-transition">
            <section className="page-header">
              <div className="page-icon">💬</div>
              <h1 className="page-title">Community Forum</h1>
              <p className="page-subtitle">
                Connect with your peers and share knowledge
              </p>
            </section>
            
            <section className="content-section">
              <div className="coming-soon-card">
                <div className="coming-soon-icon">💬</div>
                <h3>Coming Soon</h3>
                <p>Forum features are being developed for your community.</p>
              </div>
            </section>
          </div>
        ) : null}
      </main>

      {/* LetsAI Professional Footer */}
      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-grid">
            {/* About Me */}
            <div className="footer-column company-info">
              <h5>About Ofir Wienerman</h5>
              <p>I'm Ofir Wienerman, an AI specialist and consultant with over 20 years of experience in data analytics, business intelligence, and automation. I help organizations and professionals harness practical AI tools to work smarter, not harder.</p>
              <p style={{ marginTop: '12px', fontSize: '14px', color: '#94a3b8' }}>This site is dedicated to sharing clear, hands-on guides and tips for using AI—no hype, just real-world solutions anyone can implement.</p>
              <div className="contact-links" style={{ marginTop: '20px' }}>
                <a href="https://www.linkedin.com/in/ofir-wienerman-8383ba5/" target="_blank" rel="noopener noreferrer" className="contact-link" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginRight: '20px',
                  color: '#0077b5',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn Profile
                </a>
                <a href="mailto:ofir.wienerman@gmail.com" className="contact-link" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#dc2626',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  ofir.wienerman@gmail.com
                </a>
              </div>
            </div>

            {/* Simple Site Navigation */}
            <div className="footer-column">
              <h6>Site Navigation</h6>
              <ul className="footer-links">
                <li><a href="#" onClick={() => {
                  setCurrentView('home')
                  setSelectedArticle(null)
                }}>Home</a></li>
                <li><a href="#" onClick={() => {
                  setCurrentView('articles')
                  setSelectedArticle(null)
                }}>Articles</a></li>
                <li><a href="#" onClick={() => {
                  setCurrentView('guides')
                  setSelectedArticle(null)
                }}>Guides</a></li>
                <li><a href="#" onClick={() => {
                  setCurrentView('tools')
                  setSelectedArticle(null)
                }}>Tool Reviews</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-bottom-left">
              <p>&copy; 2025 IS-AI Beta. All rights reserved.</p>
              <div className="footer-legal">
                <a href="/privacy">Privacy Policy</a>
                <a href="/terms">Terms of Service</a>
                <a href="/cookies">Cookie Policy</a>
              </div>
            </div>
            <div className="footer-bottom-right">
              <div className="footer-badges">
                <div className="security-badge">
                  <span>🔒 SSL Secured</span>
                </div>
                <div className="certification-badge">
                  <span>✓ AI Ethics Certified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default App
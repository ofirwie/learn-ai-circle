import React, { useState, useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { SignupForm } from './components/auth/SignupForm'
import { LoginForm } from './components/auth/LoginForm'
import { ArticleService } from './services/articleService'
import { Article } from './types/content'
import { ArticleCreator } from './components/Article/ArticleCreator'
import { ArticleViewer } from './components/Article/ArticleViewer'
import { InviteCodeManager } from './components/Admin/InviteCodeManager'

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [authView, setAuthView] = useState('login')
  const [articles, setArticles] = useState<Article[]>([])
  const [guides, setGuides] = useState<Article[]>([])
  const [toolReviews, setToolReviews] = useState<Article[]>([])
  const [loadingContent, setLoadingContent] = useState(true)
  const [loadingGuides, setLoadingGuides] = useState(false)
  const [loadingTools, setLoadingTools] = useState(false)
  const [showArticleCreator, setShowArticleCreator] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [showInviteCodeManager, setShowInviteCodeManager] = useState(false)
  const [openWithImport, setOpenWithImport] = useState(false)
  const { user, loading, initialized, initialize, signOut } = useAuthStore()
  
  useEffect(() => {
    initialize()
  }, [])

  // Fetch articles when user is authenticated
  useEffect(() => {
    if (user && initialized) {
      fetchArticles()
    }
  }, [user, initialized])

  // Fetch content by type when view changes
  useEffect(() => {
    if (user && initialized) {
      if (currentView === 'guides' && guides.length === 0) {
        fetchContentByType('guide', setGuides, setLoadingGuides)
      }
      if (currentView === 'tools' && toolReviews.length === 0) {
        fetchContentByType('tool-review', setToolReviews, setLoadingTools)
      }
    }
  }, [currentView, user, initialized, guides.length, toolReviews.length])

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
  
  if (!initialized) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading ISAI...</p>
      </div>
    )
  }

  // If user is not logged in, show login page
  if (!user) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-header">
            <h1>ISAI Knowledge Hub</h1>
            <p>Private Access Required</p>
          </div>
          {authView === 'login' ? (
            <LoginForm onSuccess={() => {}} />
          ) : (
            <SignupForm onSuccess={() => {}} />
          )}
          <div className="auth-switch">
            <button
              onClick={() => setAuthView(authView === 'login' ? 'signup' : 'login')}
              className="auth-switch-btn"
            >
              {authView === 'login' ? "Need to register? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // User is logged in - show main app
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
            ISAI Knowledge Hub
          </a>
          
          {/* Main Navigation */}
          <nav className="main-nav">
            <a href="#" onClick={() => {
              setCurrentView('home')
              setSelectedArticle(null)
            }} className={currentView === 'home' ? 'active' : ''}>
              Home
            </a>
            <a href="#" onClick={() => setCurrentView('news')} className={currentView === 'news' ? 'active' : ''}>
              News
            </a>
            <a href="#" onClick={() => setCurrentView('articles')} className={currentView === 'articles' ? 'active' : ''}>
              Articles
            </a>
            <a href="#" onClick={() => setCurrentView('forum')} className={currentView === 'forum' ? 'active' : ''}>
              Forum
            </a>
            <a href="#" onClick={() => setCurrentView('guides')} className={currentView === 'guides' ? 'active' : ''}>
              Guides
            </a>
            <a href="#" onClick={() => setCurrentView('tools')} className={currentView === 'tools' ? 'active' : ''}>
              Tools Review
            </a>
          </nav>
          
          {/* Right Side Elements */}
          <div className="header-right">
            <div className="user-menu">
              <span>Welcome back, {user.email?.split('@')[0]}</span>
              <button className="admin-button" onClick={() => setCurrentView('admin')}>
                Admin Panel
              </button>
              <button className="logout-button" onClick={signOut}>
                Logout
              </button>
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
          <div className="letsai-layout">
            {/* LetsAI Hero Section */}
            <section className="letsai-hero-section">
              <div className="letsai-hero-content">
{loadingContent ? (
                  <div className="content-loading">
                    <div className="spinner" />
                    <p>Loading latest articles...</p>
                  </div>
                ) : (
                  <div className="featured-articles">
                    {articles.length > 0 ? (
                      <>
                        {/* Main featured article */}
                        <article className="featured-main" onClick={() => setSelectedArticle(articles[0])} style={{ cursor: 'pointer' }}>
                          <img 
                            src={
                              articles[0].featured_image || 
                              (articles[0].youtube_video_id ? `https://img.youtube.com/vi/${articles[0].youtube_video_id}/maxresdefault.jpg` : 
                              "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop&crop=center")
                            } 
                            alt={articles[0].title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          {articles[0].youtube_video_id && (
                            <div className="video-play-icon-large" style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              backgroundColor: 'rgba(0,0,0,0.8)',
                              borderRadius: '50%',
                              width: '80px',
                              height: '80px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '32px',
                              zIndex: 2
                            }}>
                              ▶
                            </div>
                          )}
                          <div className="article-overlay">
                            <div className="article-category">{articles[0].category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Article'}</div>
                            <h2>{articles[0].title}</h2>
                            <p>{articles[0].excerpt || articles[0].title}</p>
                            <div className="article-meta">
                              <span className="date">{new Date(articles[0].created_at).toLocaleDateString()}</span>
                              <span className="author">by {articles[0].author}</span>
                              <span className="read-time">{articles[0].read_time || 5} min read</span>
                            </div>
                          </div>
                        </article>
                        
                        {articles[1] && (
                          <article className="featured-secondary" onClick={() => setSelectedArticle(articles[1])} style={{ cursor: 'pointer' }}>
                            <img 
                              src={
                                articles[1].featured_image || 
                                (articles[1].youtube_video_id ? `https://img.youtube.com/vi/${articles[1].youtube_video_id}/mqdefault.jpg` : 
                                "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop&crop=center")
                              } 
                              alt={articles[1].title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                            {articles[1].youtube_video_id && (
                              <div className="video-play-icon" style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                borderRadius: '50%',
                                width: '60px',
                                height: '60px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '24px',
                                zIndex: 2
                              }}>
                                ▶
                              </div>
                            )}
                            <div className="article-overlay">
                              <div className="article-category">{articles[1].category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Article'}</div>
                              <h3>{articles[1].title}</h3>
                              <div className="article-meta">
                                <span className="date">{new Date(articles[1].created_at).toLocaleDateString()}</span>
                                <span className="author">by {articles[1].author}</span>
                              </div>
                            </div>
                          </article>
                        )}
                      </>
                    ) : (
                      <div className="no-content">
                        <h3>No articles available</h3>
                        <p>Check back soon for the latest AI content.</p>
                      </div>
                    )}
                  </div>
                )}
                
              </div>
            </section>

            {/* Content Grid with Sidebar */}
            <section className="letsai-content-grid">
              <div className="letsai-container">
                <header className="letsai-section-header">
                  <h2>Latest AI Insights & Tutorials</h2>
                  <p>Stay ahead with cutting-edge artificial intelligence knowledge and practical applications</p>
                </header>
                
                <div className="letsai-main-content">
                  <div className="letsai-articles-section">
                    <div className="letsai-grid-layout">
                      {loadingContent ? (
                        // Loading skeleton for articles
                        Array.from({length: 6}).map((_, index) => (
                          <article key={index} className="letsai-content-card loading">
                            <div className="letsai-card-image">
                              <div className="skeleton-image"></div>
                            </div>
                            <div className="letsai-card-content">
                              <div className="skeleton-line skeleton-title"></div>
                              <div className="skeleton-line skeleton-text"></div>
                              <div className="skeleton-line skeleton-text short"></div>
                              <div className="letsai-card-meta">
                                <div className="skeleton-line skeleton-meta"></div>
                              </div>
                            </div>
                          </article>
                        ))
                      ) : (
                        // Render real articles from Supabase, starting from index 2 (skip the first 2 used in hero)
                        articles.slice(2, 14).map((article, index) => (
                          <article 
                            key={article.id} 
                            className="letsai-content-card" 
                            onClick={() => setSelectedArticle(article)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="letsai-card-image">
                              <img 
                                src={
                                  article.featured_image || 
                                  (article.youtube_video_id ? `https://img.youtube.com/vi/${article.youtube_video_id}/mqdefault.jpg` : 
                                  `https://images.unsplash.com/photo-${index % 2 === 0 ? '1573164713714-d95e436ab8d6' : '1556761175-b413da4baf72'}?w=320&h=180&fit=crop&crop=center`)
                                } 
                                alt={article.title}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  // Fallback to a default image if loading fails
                                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNDQgOTBMMTY4IDEwNkg5NkwxMTIgODRMMTQ0IDkwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'
                                }}
                              />
                              <div className="letsai-card-overlay">
                                <span className="letsai-card-category">{article.category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Article'}</span>
                                {article.youtube_video_id && (
                                  <div className="video-play-icon" style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    borderRadius: '50%',
                                    width: '48px',
                                    height: '48px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '20px'
                                  }}>
                                    ▶
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="letsai-card-content">
                              <h3>{article.title}</h3>
                              <p>{article.excerpt || article.title}</p>
                              <div className="letsai-card-meta">
                                <div className="meta-left">
                                  <span className={`category ${article.category || 'general'}`}>
                                    {article.category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General'}
                                  </span>
                                  <span className="read-time">{article.read_time || 5} min read</span>
                                </div>
                                <div className="meta-right">
                                  <span className="date">{new Date(article.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                    
                    <div className="letsai-load-more-section">
                      <button className="letsai-load-more-btn">Load More Articles</button>
                    </div>
                  </div>
                  
                  {/* LetsAI Sidebar */}
                  <aside className="letsai-sidebar">
                    {/* Latest Articles Widget */}
                    <div className="letsai-widget letsai-latest-widget">
                      <div className="letsai-widget-header">
                        <span className="letsai-new-indicator">NEW</span>
                        <h4>Latest Articles</h4>
                      </div>
                      <div className="letsai-widget-content">
                        {loadingContent ? (
                          <div className="loading-latest">
                            <div className="skeleton-line"></div>
                            <div className="skeleton-line short"></div>
                          </div>
                        ) : articles.length > 0 ? (
                          <div className="latest-articles-list">
                            {articles.slice(0, 3).map((article) => (
                              <div key={article.id} className="latest-article-item" onClick={() => setSelectedArticle(article)} style={{ cursor: 'pointer' }}>
                                <h5>{article.title}</h5>
                                <div className="article-meta-small">
                                  <span className="category-badge">{article.category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Article'}</span>
                                  <span className="date-small">{new Date(article.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="no-articles">No articles available yet. Check back soon!</p>
                        )}
                        <button className="letsai-view-all-btn">View All Articles</button>
                      </div>
                    </div>

                    {/* Popular Articles Widget */}
                    <div className="letsai-widget letsai-popular-widget">
                      <h4>Most Popular This Week</h4>
                      <div className="letsai-popular-list">
                        {loadingContent ? (
                          // Loading skeleton for popular articles
                          Array.from({length: 5}).map((_, index) => (
                            <article key={index} className="letsai-popular-item loading">
                              <div className="letsai-popular-number">{index + 1}</div>
                              <div className="letsai-popular-content">
                                <div className="skeleton-line skeleton-title"></div>
                                <div className="skeleton-line skeleton-meta short"></div>
                              </div>
                              <div className="letsai-popular-trend skeleton-trend"></div>
                            </article>
                          ))
                        ) : (
                          // Show top 5 articles by view count
                          articles
                            .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
                            .slice(0, 5)
                            .map((article, index) => (
                              <article key={article.id} className="letsai-popular-item" onClick={() => setSelectedArticle(article)} style={{ cursor: 'pointer' }}>
                                <div className="letsai-popular-number">{index + 1}</div>
                                <div className="letsai-popular-content">
                                  <h5>{article.title.length > 35 ? article.title.substring(0, 35) + '...' : article.title}</h5>
                                  <span className="letsai-popular-views">{article.view_count || 0} views</span>
                                </div>
                                <div className={`letsai-popular-trend ${article.view_count >= 100 ? 'letsai-trending-up' : article.view_count >= 50 ? 'letsai-trending-steady' : 'letsai-trending-down'}`}></div>
                              </article>
                            ))
                        )}
                      </div>
                    </div>


                    {/* Tools Widget */}
                    <div className="letsai-widget letsai-tools-widget">
                      <h4>Featured AI Tools</h4>
                      <div className="letsai-tools-list">
                        <div className="letsai-tool-item">
                          <div className="letsai-tool-icon letsai-tool-chatgpt"></div>
                          <div className="letsai-tool-info">
                            <h6>ChatGPT Plus</h6>
                            <span>Advanced conversational AI</span>
                          </div>
                          <div className="letsai-tool-rating">4.8</div>
                        </div>
                        
                        <div className="letsai-tool-item">
                          <div className="letsai-tool-icon letsai-tool-midjourney"></div>
                          <div className="letsai-tool-info">
                            <h6>Midjourney</h6>
                            <span>AI image generation</span>
                          </div>
                          <div className="letsai-tool-rating">4.7</div>
                        </div>
                        
                        <div className="letsai-tool-item">
                          <div className="letsai-tool-icon letsai-tool-github"></div>
                          <div className="letsai-tool-info">
                            <h6>GitHub Copilot</h6>
                            <span>AI code assistance</span>
                          </div>
                          <div className="letsai-tool-rating">4.6</div>
                        </div>
                      </div>
                      <button className="letsai-view-all-tools">View All Tools</button>
                    </div>
                  </aside>
                </div>
              </div>
            </section>
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
                <div className="letsai-grid-layout">
                  {guides.map((guide) => (
                    <article key={guide.id} className="modern-article-card" onClick={() => setSelectedArticle(guide)}>
                      <div className="article-image-container">
                        {guide.featured_image ? (
                          <img src={guide.featured_image} alt={guide.title} className="article-image" />
                        ) : (
                          <div className="article-image-placeholder guide-placeholder">
                            <span className="placeholder-icon">📖</span>
                          </div>
                        )}
                        <div className="content-type-badge guide-badge">
                          <span className="badge-icon">📖</span>
                          Guide
                        </div>
                      </div>
                      <div className="article-content">
                        <h2 className="article-title">{guide.title}</h2>
                        <p className="article-excerpt">{guide.excerpt}</p>
                        <div className="article-meta">
                          <span className="article-author">{guide.author}</span>
                          <span className="article-date">
                            {new Date(guide.published_at || guide.created_at).toLocaleDateString()}
                          </span>
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
        ) : currentView === 'prompts' ? (
          <div className="page-transition">
            <section className="page-header">
              <div className="page-icon">⚡</div>
              <h1 className="page-title">AI Prompts & Prefixes</h1>
              <p className="page-subtitle">
                Ready-to-use prompts and shortcuts to boost your productivity
              </p>
            </section>
            
            <section className="content-section">
              <div className="coming-soon-card">
                <div className="coming-soon-icon">⚡</div>
                <h3>Coming Soon</h3>
                <p>AI prompts library is being curated for you.</p>
              </div>
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
                <div className="letsai-grid-layout">
                  {toolReviews.map((tool) => (
                    <article key={tool.id} className="modern-article-card" onClick={() => setSelectedArticle(tool)}>
                      <div className="article-image-container">
                        {tool.featured_image ? (
                          <img src={tool.featured_image} alt={tool.title} className="article-image" />
                        ) : (
                          <div className="article-image-placeholder tool-placeholder">
                            <span className="placeholder-icon">🔧</span>
                          </div>
                        )}
                        <div className="content-type-badge tool-badge">
                          <span className="badge-icon">🔧</span>
                          Tool Review
                        </div>
                      </div>
                      <div className="article-content">
                        <h2 className="article-title">{tool.title}</h2>
                        <p className="article-excerpt">{tool.excerpt}</p>
                        <div className="article-meta">
                          <span className="article-author">{tool.author}</span>
                          <span className="article-date">
                            {new Date(tool.published_at || tool.created_at).toLocaleDateString()}
                          </span>
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
              ) : articles.filter(article => article.category === 'article').length > 0 ? (
                <div className="letsai-grid-layout">
                  {articles.filter(article => article.category === 'article').map((article) => (
                    <article key={article.id} className="modern-article-card" onClick={() => setSelectedArticle(article)}>
                      <div className="article-image-container">
                        {article.featured_image ? (
                          <img src={article.featured_image} alt={article.title} className="article-image" />
                        ) : (
                          <div className="article-image-placeholder article-placeholder">
                            <span className="placeholder-icon">📄</span>
                          </div>
                        )}
                        <div className="content-type-badge article-badge">
                          <span className="badge-icon">📄</span>
                          Article
                        </div>
                      </div>
                      <div className="article-content">
                        <h2 className="article-title">{article.title}</h2>
                        <p className="article-excerpt">{article.excerpt}</p>
                        <div className="article-meta">
                          <span className="article-author">{article.author}</span>
                          <span className="article-date">
                            {new Date(article.published_at || article.created_at).toLocaleDateString()}
                          </span>
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
        ) : currentView === 'admin' ? (
          <div className="page-transition">
            <section className="page-header">
              <div className="page-icon">⚙️</div>
              <h1 className="page-title">Admin Panel</h1>
              <p className="page-subtitle">
                Manage content, create articles, and monitor your knowledge hub
              </p>
            </section>
            
            <section className="content-section">
              <div className="admin-actions">
                <button className="create-button" onClick={() => setShowArticleCreator(true)}>
                  <span className="icon">✍️</span>
                  Create New Article
                </button>
                <button className="create-button" onClick={() => {
                  setOpenWithImport(true)
                  setShowArticleCreator(true)
                }}>
                  <span className="icon">📄</span>
                  Import from Markdown
                </button>
                <button className="create-button" onClick={() => alert('Tips feature coming soon!')}>
                  <span className="icon">💡</span>
                  Create New Tip
                </button>
                <button className="create-button" onClick={() => setShowInviteCodeManager(true)}>
                  <span className="icon">🎟️</span>
                  Manage Invite Codes
                </button>
                <button className="create-button" onClick={() => alert('Manage content coming soon!')}>
                  <span className="icon">📊</span>
                  Manage Content
                </button>
              </div>
              
              <div className="admin-stats">
                <div className="stat-card">
                  <h3>Total Articles</h3>
                  <p className="stat-number">{articles.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Published</h3>
                  <p className="stat-number">{articles.filter(a => a.published).length}</p>
                </div>
                <div className="stat-card">
                  <h3>Categories</h3>
                  <p className="stat-number">{new Set(articles.map(a => a.category)).size}</p>
                </div>
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
                <li><a href="#" onClick={() => setCurrentView('articles')}>Articles</a></li>
                <li><a href="#" onClick={() => setCurrentView('guides')}>Guides</a></li>
                <li><a href="#" onClick={() => setCurrentView('tools')}>Tool Reviews</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-bottom-left">
              <p>&copy; 2025 ISAI Knowledge Hub. All rights reserved.</p>
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

      {/* Article Creator Modal */}
      {showArticleCreator && (
        <ArticleCreator
          isOpen={showArticleCreator}
          onClose={() => {
            setShowArticleCreator(false)
            setOpenWithImport(false)
          }}
          onSuccess={(article) => {
            setShowArticleCreator(false)
            setOpenWithImport(false)
            // Refresh articles list
            fetchArticles()
            alert('Article created successfully!')
          }}
          highlightImport={openWithImport}
        />
      )}

      {/* Invite Code Manager Modal */}
      {showInviteCodeManager && (
        <InviteCodeManager
          onClose={() => setShowInviteCodeManager(false)}
        />
      )}

    </div>
  )
}

export default App
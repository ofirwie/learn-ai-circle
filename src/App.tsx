import React, { useState, useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { SignupForm } from './components/auth/SignupForm'
import { LoginForm } from './components/auth/LoginForm'
import { ArticleService } from './services/articleService'
import { Article } from './types/content'
import { ArticleCreator } from './components/Article/ArticleCreator'
import { ArticleViewer } from './components/Article/ArticleViewer'

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [authView, setAuthView] = useState('login')
  const [articles, setArticles] = useState<Article[]>([])
  const [loadingContent, setLoadingContent] = useState(true)
  const [showArticleCreator, setShowArticleCreator] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
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
          <a href="#" className="logo" onClick={() => setCurrentView('home')}>
            ISAI Knowledge Hub
          </a>
          
          {/* Main Navigation */}
          <nav className="main-nav">
            <a href="#" onClick={() => setCurrentView('home')} className={currentView === 'home' ? 'active' : ''}>
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
                          <img src={articles[0].featured_image || "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop&crop=center"} alt={articles[0].title} />
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
                            <img src={articles[1].featured_image || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop&crop=center"} alt={articles[1].title} />
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
                                src={article.featured_image || `https://images.unsplash.com/photo-${index % 2 === 0 ? '1573164713714-d95e436ab8d6' : '1556761175-b413da4baf72'}?w=400&h=220&fit=crop&crop=center`} 
                                alt={article.title} 
                              />
                              <div className="letsai-card-overlay">
                                <span className="letsai-card-category">{article.category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Article'}</span>
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

                    {/* Newsletter Widget */}
                    <div className="letsai-widget letsai-newsletter-widget">
                      <div className="letsai-newsletter-header">
                        <h4>Weekly AI Insights</h4>
                        <p>Get the latest AI news and expert insights delivered to your inbox</p>
                      </div>
                      <form className="letsai-newsletter-form">
                        <input type="email" placeholder="Enter your email address" required />
                        <button type="submit">Subscribe Now</button>
                      </form>
                      <div className="letsai-newsletter-features">
                        <div className="letsai-feature-item">
                          <span className="letsai-feature-check">✓</span>
                          <span>Weekly curated content</span>
                        </div>
                        <div className="letsai-feature-item">
                          <span className="letsai-feature-check">✓</span>
                          <span>Expert insights & tutorials</span>
                        </div>
                        <div className="letsai-feature-item">
                          <span className="letsai-feature-check">✓</span>
                          <span>No spam, unsubscribe anytime</span>
                        </div>
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
              <div className="professional-grid">
                {[
                  {
                    title: 'Getting Started with AI',
                    description: 'Complete beginner\'s guide to artificial intelligence and machine learning fundamentals.',
                    category: 'Beginner',
                    readTime: '10 min read',
                    thumbnail: '🎯',
                    color: 'blue'
                  },
                  {
                    title: 'Advanced Prompt Engineering',
                    description: 'Master the art of crafting effective prompts for ChatGPT, Claude, and other AI models.',
                    category: 'Advanced',
                    readTime: '15 min read',
                    thumbnail: '⚡',
                    color: 'purple'
                  },
                  {
                    title: 'AI Tools Comparison 2024',
                    description: 'Comprehensive comparison of the best AI tools, their features, and pricing.',
                    category: 'Tools',
                    readTime: '12 min read',
                    thumbnail: '🔧',
                    color: 'green'
                  },
                  {
                    title: 'Building AI Workflows',
                    description: 'Learn to automate tasks and create efficient AI-powered workflows.',
                    category: 'Intermediate',
                    readTime: '18 min read',
                    thumbnail: '🔄',
                    color: 'orange'
                  },
                  {
                    title: 'AI Ethics & Best Practices',
                    description: 'Understanding responsible AI use and ethical considerations.',
                    category: 'Essential',
                    readTime: '8 min read',
                    thumbnail: '⚖️',
                    color: 'red'
                  },
                  {
                    title: 'Custom GPT Development',
                    description: 'Create your own custom GPTs and AI assistants from scratch.',
                    category: 'Advanced',
                    readTime: '25 min read',
                    thumbnail: '🤖',
                    color: 'indigo'
                  }
                ].map((guide, index) => (
                  <div key={index} className={`content-card guide-card guide-${guide.color}`}>
                    <div className="card-thumbnail">
                      <div className="thumbnail-icon">{guide.thumbnail}</div>
                    </div>
                    <div className="card-content">
                      <div className={`card-badge badge-${guide.color}`}>
                        {guide.category}
                      </div>
                      <h3 className="card-title">{guide.title}</h3>
                      <p className="card-description">{guide.description}</p>
                      <div className="card-footer">
                        <span className="read-time">{guide.readTime}</span>
                        <button className="card-button">
                          Read Guide →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="coming-soon-card">
                <div className="coming-soon-icon">🔧</div>
                <h3>Coming Soon</h3>
                <p>AI tools reviews are being prepared.</p>
              </div>
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
              <div className="coming-soon-card">
                <div className="coming-soon-icon">📄</div>
                <h3>Coming Soon</h3>
                <p>Articles are being created for your knowledge base.</p>
              </div>
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
                <button className="create-button" onClick={() => alert('Tips feature coming soon!')}>
                  <span className="icon">💡</span>
                  Create New Tip
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
            {/* Company Info */}
            <div className="footer-column company-info">
              <h5>ISAI Knowledge Hub</h5>
              <p>The leading destination for learning and implementing artificial intelligence technologies in the workplace. Empowering businesses with cutting-edge AI knowledge and practical solutions.</p>
              <div className="social-links">
                <a href="#" className="social-link facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="social-link youtube">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="#" className="social-link instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="social-link twitter">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="social-link linkedin">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-column">
              <h6>Quick Links</h6>
              <ul className="footer-links">
                <li><a href="/courses">AI Courses</a></li>
                <li><a href="/tools">AI Tools</a></li>
                <li><a href="/guides">Business Guides</a></li>
                <li><a href="/news">Latest News</a></li>
                <li><a href="/tutorials">Tutorials</a></li>
                <li><a href="/webinars">Live Webinars</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="footer-column">
              <h6>Resources</h6>
              <ul className="footer-links">
                <li><a href="/blog">Expert Blog</a></li>
                <li><a href="/case-studies">Case Studies</a></li>
                <li><a href="/whitepapers">Whitepapers</a></li>
                <li><a href="/downloads">Free Downloads</a></li>
                <li><a href="/support">Help Center</a></li>
                <li><a href="/community">Community</a></li>
              </ul>
            </div>

            {/* Company */}
            <div className="footer-column">
              <h6>Company</h6>
              <ul className="footer-links">
                <li><a href="/about">About Us</a></li>
                <li><a href="/careers">Careers</a></li>
                <li><a href="/press">Press</a></li>
                <li><a href="/partners">Partners</a></li>
                <li><a href="/contact">Contact</a></li>
                <li><a href="/enterprise">Enterprise</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="footer-column contact-info">
              <h6>Get in Touch</h6>
              <div className="contact-details">
                <div className="contact-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  <span>info@isai-hub.com</span>
                </div>
                <div className="contact-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="contact-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span>San Francisco, CA</span>
                </div>
              </div>
              
              <div className="newsletter-signup">
                <h6>Newsletter</h6>
                <form className="footer-newsletter">
                  <input type="email" placeholder="Your email address" />
                  <button type="submit">Subscribe</button>
                </form>
              </div>
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
          onClose={() => setShowArticleCreator(false)}
          onSuccess={(article) => {
            setShowArticleCreator(false)
            // Refresh articles list
            fetchArticles()
            alert('Article created successfully!')
          }}
        />
      )}

    </div>
  )
}

export default App
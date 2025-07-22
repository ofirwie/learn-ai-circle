import React, { useState, useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { SignupForm } from './components/auth/SignupForm'
import { LoginForm } from './components/auth/LoginForm'

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [showAuth, setShowAuth] = useState(false)
  const [authView, setAuthView] = useState('login')
  const { user, loading, initialized, initialize, signOut } = useAuthStore()
  
  useEffect(() => {
    initialize()
  }, [])
  
  if (!initialized) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading ISAI...</p>
      </div>
    )
  }

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
            {user ? (
              <div className="user-menu">
                <span>Welcome back</span>
                <div className="user-avatar" onClick={signOut}></div>
              </div>
            ) : (
              <button className="cta-button" onClick={() => setShowAuth(true)}>
                Free Registration
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero & Main Content */}
      <main className="main-content">
        {currentView === 'home' && (
          <div className="letsai-layout">
            {/* LetsAI Hero Section */}
            <section className="letsai-hero-section">
              <div className="letsai-hero-content">
                <div className="featured-articles">
                  {/* Main featured article */}
                  <article className="featured-main">
                    <img src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop&crop=center" alt="HD Video Tutorial" />
                    <div className="article-overlay">
                      <div className="article-category">Tutorial</div>
                      <h2>Creating HD Videos with Advanced AI Tools like Veo3</h2>
                      <p>Learn how to produce professional-quality videos using cutting-edge AI technology</p>
                      <div className="article-meta">
                        <span className="date">July 22, 2025</span>
                        <span className="author">by Expert Team</span>
                        <span className="read-time">8 min read</span>
                      </div>
                    </div>
                  </article>
                  
                  {/* Secondary article */}
                  <article className="featured-secondary">
                    <img src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop&crop=center" alt="Vanyard Tutorial" />
                    <div className="article-overlay">
                      <div className="article-category">Guide</div>
                      <h3>How to Use Vanyard for Rapid Video Creation with Multiple Perspectives</h3>
                      <div className="article-meta">
                        <span className="date">July 21, 2025</span>
                        <span className="author">by Sarah Chen</span>
                      </div>
                    </div>
                  </article>
                </div>
                
                <div className="shopify-promo">
                  <div className="promo-badge">SPONSORED</div>
                  <div className="promo-content">
                    <div className="shopify-logo">
                      <div style={{ color: '#95bf47', fontSize: '24px', fontWeight: '700' }}>Shopify</div>
                    </div>
                    <h2>From Memo to Store: How Shopify Integrates AI for Enhanced Productivity</h2>
                    <p>Discover how leading e-commerce platform leverages artificial intelligence to streamline business operations</p>
                    <div className="promo-stats">
                      <span className="views">1,514 views</span>
                      <span className="date">July 22, 2025</span>
                      <span className="duration">15 min</span>
                    </div>
                    <button className="promo-cta">Watch Now</button>
                  </div>
                  <div className="promo-gradient"></div>
                </div>
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
                  {/* Article 1 */}
                  <article className="letsai-content-card">
                    <div className="letsai-card-image">
                      <img src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=220&fit=crop&crop=center" alt="Google Drive AI Integration" />
                      <div className="letsai-card-overlay">
                        <span className="letsai-card-category">Integration</span>
                      </div>
                    </div>
                    <div className="letsai-card-content">
                      <h3>How to Integrate Google Drive with AI Tools</h3>
                      <p>A comprehensive guide to efficiently combining Google Drive with artificial intelligence tools for enhanced content management and workflow automation.</p>
                      <div className="letsai-card-meta">
                        <div className="meta-left">
                          <span className="category tools">Tools</span>
                          <span className="read-time">5 min read</span>
                        </div>
                        <div className="meta-right">
                          <span className="date">Jul 22, 2025</span>
                        </div>
                      </div>
                    </div>
                  </article>

                  {/* Article 2 */}
                  <article className="letsai-content-card">
                    <div className="letsai-card-image">
                      <img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=220&fit=crop&crop=center" alt="AI Business Strategy" />
                      <div className="letsai-card-overlay">
                        <span className="letsai-card-category">Strategy</span>
                      </div>
                    </div>
                    <div className="letsai-card-content">
                      <h3>AI Strategy for Small Business Success</h3>
                      <p>Implementing artificial intelligence technologies in small and medium businesses - a practical and actionable guide for sustainable growth.</p>
                      <div className="letsai-card-meta">
                        <div className="meta-left">
                          <span className="category strategy">Strategy</span>
                          <span className="read-time">8 min read</span>
                        </div>
                        <div className="meta-right">
                          <span className="date">Jul 21, 2025</span>
                        </div>
                      </div>
                    </div>
                  </article>

                  {/* Article 3 */}
                  <article className="letsai-content-card">
                    <div className="letsai-card-image">
                      <img src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=220&fit=crop&crop=center" alt="Advanced ChatGPT Techniques" />
                      <div className="letsai-card-overlay">
                        <span className="letsai-card-category">Tutorial</span>
                      </div>
                    </div>
                    <div className="letsai-card-content">
                      <h3>Advanced ChatGPT Prompt Engineering</h3>
                      <p>Master the art of prompt engineering to unlock ChatGPT's full potential for complex problem-solving and creative content generation.</p>
                      <div className="letsai-card-meta">
                        <div className="meta-left">
                          <span className="category tutorial">Tutorial</span>
                          <span className="read-time">12 min read</span>
                        </div>
                        <div className="meta-right">
                          <span className="date">Jul 20, 2025</span>
                        </div>
                      </div>
                    </div>
                  </article>

                  {/* Article 4 */}
                  <article className="letsai-content-card">
                    <div className="letsai-card-image">
                      <img src="https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=220&fit=crop&crop=center" alt="AI Automation Workflow" />
                      <div className="letsai-card-overlay">
                        <span className="letsai-card-category">Automation</span>
                      </div>
                    </div>
                    <div className="letsai-card-content">
                      <h3>Building AI-Powered Automation Workflows</h3>
                      <p>Step-by-step guide to creating intelligent automation systems that adapt and learn from your business processes.</p>
                      <div className="letsai-card-meta">
                        <div className="meta-left">
                          <span className="category automation">Automation</span>
                          <span className="read-time">15 min read</span>
                        </div>
                        <div className="meta-right">
                          <span className="date">Jul 19, 2025</span>
                        </div>
                      </div>
                    </div>
                  </article>

                  {/* Article 5 */}
                  <article className="letsai-content-card">
                    <div className="letsai-card-image">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=220&fit=crop&crop=center" alt="AI Ethics in Business" />
                      <div className="letsai-card-overlay">
                        <span className="letsai-card-category">Ethics</span>
                      </div>
                    </div>
                    <div className="letsai-card-content">
                      <h3>Ethical AI Implementation in Business</h3>
                      <p>Navigate the complex landscape of AI ethics, ensuring responsible implementation while maximizing business value and customer trust.</p>
                      <div className="letsai-card-meta">
                        <div className="meta-left">
                          <span className="category ethics">Ethics</span>
                          <span className="read-time">10 min read</span>
                        </div>
                        <div className="meta-right">
                          <span className="date">Jul 18, 2025</span>
                        </div>
                      </div>
                    </div>
                  </article>

                  {/* Article 6 */}
                  <article className="letsai-content-card">
                    <div className="letsai-card-image">
                      <img src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=220&fit=crop&crop=center" alt="Machine Learning Basics" />
                      <div className="letsai-card-overlay">
                        <span className="letsai-card-category">Education</span>
                      </div>
                    </div>
                    <div className="letsai-card-content">
                      <h3>Machine Learning Fundamentals for Business</h3>
                      <p>Demystify machine learning concepts and discover practical applications that can transform your business operations and decision-making.</p>
                      <div className="letsai-card-meta">
                        <div className="meta-left">
                          <span className="category education">Education</span>
                          <span className="read-time">20 min read</span>
                        </div>
                        <div className="meta-right">
                          <span className="date">Jul 17, 2025</span>
                        </div>
                      </div>
                    </div>
                  </article>
                    </div>
                    
                    <div className="letsai-load-more-section">
                      <button className="letsai-load-more-btn">Load More Articles</button>
                    </div>
                  </div>
                  
                  {/* LetsAI Sidebar */}
                  <aside className="letsai-sidebar">
                    {/* Live Webinar Widget */}
                    <div className="letsai-widget letsai-webinar-widget">
                      <div className="letsai-widget-header">
                        <span className="letsai-live-indicator">LIVE</span>
                        <h4>Live Webinar</h4>
                      </div>
                      <div className="letsai-widget-content">
                        <h3>AI in Business Transformation</h3>
                        <p>Join our expert panel discussion on implementing AI strategies</p>
                        <div className="letsai-webinar-time">
                          <span>Starting in: 2h 15m</span>
                        </div>
                        <button className="letsai-join-btn">Join Now</button>
                      </div>
                      <div className="letsai-webinar-gradient"></div>
                    </div>

                    {/* Popular Articles Widget */}
                    <div className="letsai-widget letsai-popular-widget">
                      <h4>Most Popular This Week</h4>
                      <div className="letsai-popular-list">
                        <article className="letsai-popular-item">
                          <div className="letsai-popular-number">1</div>
                          <div className="letsai-popular-content">
                            <h5>ChatGPT Beginner's Complete Guide</h5>
                            <span className="letsai-popular-views">2.5K views</span>
                          </div>
                          <div className="letsai-popular-trend letsai-trending-up"></div>
                        </article>
                        
                        <article className="letsai-popular-item">
                          <div className="letsai-popular-number">2</div>
                          <div className="letsai-popular-content">
                            <h5>AI Tools for Content Creation</h5>
                            <span className="letsai-popular-views">1.8K views</span>
                          </div>
                          <div className="letsai-popular-trend letsai-trending-up"></div>
                        </article>
                        
                        <article className="letsai-popular-item">
                          <div className="letsai-popular-number">3</div>
                          <div className="letsai-popular-content">
                            <h5>Machine Learning for Startups</h5>
                            <span className="letsai-popular-views">1.2K views</span>
                          </div>
                          <div className="letsai-popular-trend letsai-trending-down"></div>
                        </article>
                        
                        <article className="letsai-popular-item">
                          <div className="letsai-popular-number">4</div>
                          <div className="letsai-popular-content">
                            <h5>Ethical AI Implementation</h5>
                            <span className="letsai-popular-views">980 views</span>
                          </div>
                          <div className="letsai-popular-trend letsai-trending-up"></div>
                        </article>
                        
                        <article className="letsai-popular-item">
                          <div className="letsai-popular-number">5</div>
                          <div className="letsai-popular-content">
                            <h5>AI Automation Workflows</h5>
                            <span className="letsai-popular-views">756 views</span>
                          </div>
                          <div className="letsai-popular-trend letsai-trending-steady"></div>
                        </article>
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
        )}
        
        {currentView === 'guides' && (
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
        )}
        
        {currentView === 'prompts' && (
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
        )}
        
        {currentView === 'tools' && (
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
        )}
        
        {currentView === 'articles' && (
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
        )}
        
        {currentView === 'videos' && (
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
        )}
        
        {currentView === 'news' && (
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
        )}
        
        {currentView === 'forum' && (
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
        )}
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

      {/* Simple Login Modal */}
      {showAuth && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowAuth(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              ×
            </button>
            
            {authView === 'login' ? (
              <LoginForm onSuccess={() => setShowAuth(false)} />
            ) : (
              <SignupForm onSuccess={() => setShowAuth(false)} />
            )}
            
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={() => setAuthView(authView === 'login' ? 'signup' : 'login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '14px'
                }}
              >
                {authView === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
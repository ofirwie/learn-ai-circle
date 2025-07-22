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
      {/* Modern Navigation */}
      <nav className="modern-nav">
        <div className="nav-container">
          <div className="brand-logo">
            <div className="logo-icon">🧠</div>
            <h1 className="brand-text">ISAI</h1>
            <span className="brand-tagline">AI Knowledge Hub</span>
          </div>
          
          <div className="nav-links">
            {[
              { key: 'home', label: 'Home', icon: '🏠' },
              { key: 'guides', label: 'Guides', icon: '📖' },
              { key: 'prompts', label: 'Prompts', icon: '⚡' },
              { key: 'tools', label: 'Tools', icon: '🔧' },
              { key: 'articles', label: 'Articles', icon: '📄' },
              { key: 'videos', label: 'Videos', icon: '🎥' },
              { key: 'news', label: 'AI News', icon: '📰' },
              { key: 'forum', label: 'Forum', icon: '💬' }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setCurrentView(key)}
                className={`nav-link ${currentView === key ? 'nav-link-active' : ''}`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
          
          <div className="auth-section">
            {user ? (
              <div className="user-menu">
                <span className="welcome-text">Welcome back!</span>
                <button onClick={signOut} className="btn btn-logout">
                  Sign Out
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAuth(true)} className="btn btn-primary">
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero & Main Content */}
      <main className="main-content">
        {currentView === 'home' && (
          <div className="page-transition">
            {/* Hero Section */}
            <section className="hero-section">
              <div className="hero-content">
                <div className="hero-badge">
                  <span className="badge-icon">🚀</span>
                  <span>LetsAI Knowledge Hub</span>
                </div>
                <h1 className="hero-title">
                  Master AI with 
                  <span className="gradient-text">Professional Guidance</span>
                </h1>
                <p className="hero-subtitle">
                  Comprehensive resources, expert tutorials, and cutting-edge tools 
                  to accelerate your AI journey
                </p>
                <div className="hero-buttons">
                  <button onClick={() => setCurrentView('guides')} className="btn btn-primary btn-hero">
                    Explore Guides
                  </button>
                  <button onClick={() => setCurrentView('tools')} className="btn btn-secondary btn-hero">
                    Browse Tools
                  </button>
                </div>
              </div>
              <div className="hero-visual">
                <div className="floating-cards">
                  <div className="floating-card card-1">
                    <div className="card-icon">🧠</div>
                    <div className="card-text">AI Learning</div>
                  </div>
                  <div className="floating-card card-2">
                    <div className="card-icon">⚡</div>
                    <div className="card-text">Fast Results</div>
                  </div>
                  <div className="floating-card card-3">
                    <div className="card-icon">🎯</div>
                    <div className="card-text">Expert Tips</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Features Grid */}
            <section className="features-section">
              <h2 className="section-title">Everything You Need</h2>
              <div className="features-grid">
                <div className="feature-card" onClick={() => setCurrentView('guides')}>
                  <div className="feature-icon">📚</div>
                  <h3>Comprehensive Guides</h3>
                  <p>Step-by-step tutorials from beginner to advanced levels</p>
                  <div className="feature-arrow">→</div>
                </div>
                <div className="feature-card" onClick={() => setCurrentView('prompts')}>
                  <div className="feature-icon">⚡</div>
                  <h3>Ready-to-Use Prompts</h3>
                  <p>Proven prompts for ChatGPT, Claude, and other AI tools</p>
                  <div className="feature-arrow">→</div>
                </div>
                <div className="feature-card" onClick={() => setCurrentView('tools')}>
                  <div className="feature-icon">🔧</div>
                  <h3>Tool Reviews</h3>
                  <p>Honest reviews and comparisons of AI tools and platforms</p>
                  <div className="feature-arrow">→</div>
                </div>
                <div className="feature-card" onClick={() => setCurrentView('videos')}>
                  <div className="feature-icon">🎥</div>
                  <h3>Video Tutorials</h3>
                  <p>Visual learning with hands-on demonstrations</p>
                  <div className="feature-arrow">→</div>
                </div>
              </div>
            </section>
          </div>
        )}
        
        {currentView === 'guides' && (
          <div className="page-transition">
            <section className="page-header">
              <div className="page-icon">📖</div>
              <h1 className="page-title">Professional Guides</h1>
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
              <h1 className="page-title">AI Tools</h1>
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
              <h1 className="page-title">AI News</h1>
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
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
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '36px', color: '#1f2937', marginBottom: '20px', fontWeight: '700' }}>
              🚀 ISAI AI Knowledge Hub - STEP 3 COMPLETE! 🚀
            </h1>
            <div style={{ 
              backgroundColor: '#10b981', 
              color: 'white', 
              padding: '24px', 
              borderRadius: '12px',
              marginBottom: '20px',
              fontSize: '20px',
              fontWeight: '600'
            }}>
              ✅ Full Navigation + Login + Professional Content Sections!
            </div>
            <div style={{ 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              padding: '15px', 
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'monospace',
              marginBottom: '20px'
            }}>
              🕒 Deployment: {new Date().toISOString()}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginTop: '20px'
            }}>
              <div style={{
                backgroundColor: '#f0f9ff',
                border: '1px solid #0ea5e9',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔐</div>
                <div style={{ fontWeight: '600', color: '#0ea5e9' }}>Login System</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Working Modal</div>
              </div>
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #22c55e',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📖</div>
                <div style={{ fontWeight: '600', color: '#22c55e' }}>Guides Section</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>With Demo Cards</div>
              </div>
              <div style={{
                backgroundColor: '#fef7ff',
                border: '1px solid #a855f7',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🧭</div>
                <div style={{ fontWeight: '600', color: '#a855f7' }}>Full Navigation</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>8 Sections</div>
              </div>
            </div>
            <p style={{ marginTop: '24px', color: '#6b7280', fontSize: '16px', textAlign: 'center' }}>
              🎯 Try all navigation sections! The Guides section has demo content cards.
            </p>
          </div>
        )}
        
        {currentView === 'guides' && (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>
              📖 Professional Guides
            </h2>
            <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '40px' }}>
              Comprehensive guides and tutorials to help you master AI tools and techniques.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {[
                {
                  title: 'Getting Started with AI',
                  description: 'Complete beginner\'s guide to artificial intelligence and machine learning.',
                  category: 'Beginner',
                  readTime: '10 min read'
                },
                {
                  title: 'Advanced Prompt Engineering',
                  description: 'Master the art of crafting effective prompts for AI models.',
                  category: 'Advanced',
                  readTime: '15 min read'
                },
                {
                  title: 'AI Tools Comparison',
                  description: 'Compare the best AI tools available in 2024.',
                  category: 'Tools',
                  readTime: '12 min read'
                }
              ].map((guide, index) => (
                <div key={index} style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
                >
                  <div style={{
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    fontSize: '12px',
                    fontWeight: '600',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    marginBottom: '12px'
                  }}>
                    {guide.category}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                    {guide.title}
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '12px', lineHeight: '1.5' }}>
                    {guide.description}
                  </p>
                  <div style={{ color: '#9ca3af', fontSize: '14px' }}>
                    {guide.readTime}
                  </div>
                </div>
              ))}
            </div>
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
import React, { useState } from 'react'

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [showAuth, setShowAuth] = useState(false)
  const [authView, setAuthView] = useState('login')
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Simple Navigation */}
      <nav style={{
        backgroundColor: '#1e293b',
        padding: '0 20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '70px'
        }}>
          <h1 style={{
            color: '#3b82f6',
            fontSize: '28px',
            fontWeight: '700',
            margin: '0',
            cursor: 'pointer'
          }}>
            🧠 ISAI
          </h1>
          
          <div style={{ display: 'flex', gap: '30px' }}>
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
                style={{
                  background: 'none',
                  border: 'none',
                  color: currentView === key ? '#3b82f6' : '#94a3b8',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '6px'
                }}
              >
                {icon} {label}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setShowAuth(true)}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ padding: '40px 20px' }}>
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
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>
              ⚡ AI Prompts & Prefixes
            </h2>
            <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '40px' }}>
              Ready-to-use prompts and shortcuts to boost your productivity.
            </p>
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚡</div>
              <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#1f2937' }}>Coming Soon</h3>
              <p style={{ color: '#6b7280' }}>AI prompts library is being curated for you.</p>
            </div>
          </div>
        )}
        
        {currentView === 'tools' && (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>
              🔧 AI Tools
            </h2>
            <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '40px' }}>
              Reviews and guides for AI tools and software.
            </p>
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔧</div>
              <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#1f2937' }}>Coming Soon</h3>
              <p style={{ color: '#6b7280' }}>AI tools reviews are being prepared.</p>
            </div>
          </div>
        )}
        
        {currentView === 'articles' && (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>
              📄 Articles
            </h2>
            <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '40px' }}>
              In-depth articles covering AI topics, tools, and techniques.
            </p>
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📄</div>
              <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#1f2937' }}>Coming Soon</h3>
              <p style={{ color: '#6b7280' }}>Articles are being created for your knowledge base.</p>
            </div>
          </div>
        )}
        
        {currentView === 'videos' && (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>
              🎥 Video Content
            </h2>
            <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '40px' }}>
              Educational videos, tutorials, and demonstrations.
            </p>
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎥</div>
              <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#1f2937' }}>Coming Soon</h3>
              <p style={{ color: '#6b7280' }}>Video content is being prepared for your library.</p>
            </div>
          </div>
        )}
        
        {currentView === 'news' && (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>
              📰 AI News
            </h2>
            <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '40px' }}>
              Latest developments and updates in artificial intelligence.
            </p>
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📰</div>
              <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#1f2937' }}>Coming Soon</h3>
              <p style={{ color: '#6b7280' }}>AI news updates are being curated for you.</p>
            </div>
          </div>
        )}
        
        {currentView === 'forum' && (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>
              💬 Community Forum
            </h2>
            <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '40px' }}>
              Connect with your peers and share knowledge.
            </p>
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>💬</div>
              <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#1f2937' }}>Coming Soon</h3>
              <p style={{ color: '#6b7280' }}>Forum features are being developed for your community.</p>
            </div>
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
            
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {authView === 'login' ? 'Sign In' : 'Sign Up'}
            </h2>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="email"
                placeholder="Email"
                style={{
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <input
                type="password"
                placeholder="Password"
                style={{
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {authView === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
              
              <p style={{
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '14px'
              }}>
                {authView === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setAuthView(authView === 'login' ? 'signup' : 'login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3b82f6',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {authView === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
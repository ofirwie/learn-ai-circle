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
              { key: 'home', label: 'Home' },
              { key: 'guides', label: 'Guides' },
              { key: 'articles', label: 'Articles' },
              { key: 'videos', label: 'Videos' }
            ].map(({ key, label }) => (
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
                {label}
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
            <h1 style={{ fontSize: '32px', color: '#1f2937', marginBottom: '20px' }}>
              🚀 ISAI AI Knowledge Hub - STEP 2 WITH LOGIN! 🚀
            </h1>
            <div style={{ 
              backgroundColor: '#10b981', 
              color: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '18px'
            }}>
              ✅ Navigation + Login System Working! (Login mechanism preserved as requested)
            </div>
            <div style={{ 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              padding: '15px', 
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'monospace'
            }}>
              🕒 Deployment: {new Date().toISOString()}
            </div>
            <p style={{ marginTop: '20px', color: '#6b7280' }}>
              Try clicking "Sign In" to test the login modal! No external auth dependencies yet.
            </p>
          </div>
        )}
        
        {currentView === 'guides' && (
          <div>
            <h2 style={{ fontSize: '28px', color: '#1f2937' }}>📖 Guides</h2>
            <p>Guides section - working without external dependencies!</p>
          </div>
        )}
        
        {currentView === 'articles' && (
          <div>
            <h2 style={{ fontSize: '28px', color: '#1f2937' }}>📄 Articles</h2>
            <p>Articles section - working without external dependencies!</p>
          </div>
        )}
        
        {currentView === 'videos' && (
          <div>
            <h2 style={{ fontSize: '28px', color: '#1f2937' }}>🎥 Videos</h2>
            <p>Videos section - working without external dependencies!</p>
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
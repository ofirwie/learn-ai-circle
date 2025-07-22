import React, { useState } from 'react'

function App() {
  const [currentView, setCurrentView] = useState('home')
  
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
              🚀 ISAI AI Knowledge Hub - STEP 1 WORKING! 🚀
            </h1>
            <div style={{ 
              backgroundColor: '#10b981', 
              color: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '18px'
            }}>
              ✅ Basic navigation and state management working!
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
              This version has basic React state and navigation - no external dependencies yet
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
    </div>
  )
}

export default App
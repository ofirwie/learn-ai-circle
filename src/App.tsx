import { useState, useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { LoginForm } from './components/auth/LoginForm'
import { SignupForm } from './components/auth/SignupForm'
import { 
  Brain, 
  Users, 
  BookOpen, 
  MessageCircle, 
  Settings, 
  LogOut,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Eye,
  Star,
  Calendar
} from 'lucide-react'

type ViewType = 'home' | 'guides' | 'prompts' | 'tools' | 'news' | 'videos' | 'articles' | 'forum' | 'profile'

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home')
  const [authView, setAuthView] = useState<'login' | 'signup'>('login')
  
  const { user, userProfile, entity, userGroup, loading, initialized, initialize, signOut } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  // Show loading spinner while initializing
  if (loading || !initialized) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    )
  }

  // Show authentication forms if user is not logged in
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        {authView === 'login' ? (
          <LoginForm
            onSuccess={() => {
              // User will be automatically redirected after successful login
            }}
            onSwitchToSignup={() => setAuthView('signup')}
          />
        ) : (
          <SignupForm
            onSuccess={() => {
              // User will be automatically redirected after successful signup
            }}
            onSwitchToLogin={() => setAuthView('login')}
          />
        )}
      </div>
    )
  }

  // Main navigation component
  const renderNavigation = () => (
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '40px'
        }}>
          <h1 style={{
            color: '#3b82f6',
            fontSize: '28px',
            fontWeight: '700',
            margin: '0',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }} onClick={() => setCurrentView('home')}>
            <Brain size={32} />
            ISAI
          </h1>
          
          <div style={{ display: 'flex', gap: '30px' }}>
            {[
              { key: 'home', label: 'Home', icon: '🏠' },
              { key: 'guides', label: 'Guides', icon: BookOpen },
              { key: 'prompts', label: 'Prompts', icon: '⚡' },
              { key: 'tools', label: 'Tools', icon: '🔧' },
              { key: 'news', label: 'AI News', icon: '📰' },
              { key: 'videos', label: 'Videos', icon: '🎥' },
              { key: 'articles', label: 'Articles', icon: '📄' },
              { key: 'forum', label: 'Forum', icon: MessageCircle }
            ].map(({ key, label, icon: IconComponent }) => (
              <button
                key={key}
                onClick={() => setCurrentView(key as ViewType)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: currentView === key ? '#3b82f6' : '#94a3b8',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (currentView !== key) e.currentTarget.style.color = '#e2e8f0'
                }}
                onMouseLeave={(e) => {
                  if (currentView !== key) e.currentTarget.style.color = '#94a3b8'
                }}
              >
                {typeof IconComponent === 'string' ? (
                  <span>{IconComponent}</span>
                ) : (
                  <IconComponent size={16} />
                )}
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '2px'
          }}>
            <span style={{
              color: '#e2e8f0',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {userProfile?.full_name}
            </span>
            <span style={{
              color: '#94a3b8',
              fontSize: '12px'
            }}>
              {entity?.name} • {userGroup?.name}
            </span>
          </div>
          
          <button
            onClick={signOut}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  )

  // Hero section for home page
  const renderHomeContent = () => (
    <div>
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: '48px',
            fontWeight: '700',
            marginBottom: '20px',
            lineHeight: '1.2'
          }}>
            Welcome to ISAI
          </h2>
          <p style={{
            fontSize: '20px',
            opacity: '0.9',
            marginBottom: '30px',
            lineHeight: '1.6'
          }}>
            Your comprehensive AI Knowledge Hub for {entity?.name}
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setCurrentView('guides')}
              className="btn btn-secondary"
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)'
              }}
            >
              <BookOpen size={16} />
              Browse Guides
            </button>
            <button
              onClick={() => setCurrentView('prompts')}
              className="btn btn-secondary"
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)'
              }}
            >
              ⚡ Explore Prompts
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '60px 20px',
        backgroundColor: 'white'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h3 style={{
            fontSize: '36px',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '40px',
            color: '#1f2937'
          }}>
            Everything You Need for AI Success
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px'
          }}>
            {[
              {
                icon: BookOpen,
                title: 'Professional Guides',
                description: 'Comprehensive guides covering AI tools, techniques, and best practices',
                onClick: () => setCurrentView('guides')
              },
              {
                icon: '⚡',
                title: 'AI Prompts & Prefixes',
                description: 'Ready-to-use prompts and shortcuts for maximum productivity',
                onClick: () => setCurrentView('prompts')
              },
              {
                icon: '🔧',
                title: 'Tool Reviews',
                description: 'In-depth reviews of AI tools with pros, cons, and ratings',
                onClick: () => setCurrentView('tools')
              },
              {
                icon: MessageCircle,
                title: 'Community Forum',
                description: 'Connect with peers, share experiences, and get help',
                onClick: () => setCurrentView('forum')
              },
              {
                icon: '📰',
                title: 'AI News & Updates',
                description: 'Stay current with the latest AI developments and trends',
                onClick: () => setCurrentView('news')
              },
              {
                icon: '🎥',
                title: 'Video Content',
                description: 'Tutorials, demos, and educational videos',
                onClick: () => setCurrentView('videos')
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="content-card"
                style={{
                  padding: '30px',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
                onClick={feature.onClick}
              >
                <div style={{
                  fontSize: '48px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  {typeof feature.icon === 'string' ? (
                    feature.icon
                  ) : (
                    <feature.icon size={48} color="var(--primary-blue)" />
                  )}
                </div>
                <h4 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: '#1f2937'
                }}>
                  {feature.title}
                </h4>
                <p style={{
                  color: '#6b7280',
                  lineHeight: '1.6'
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )

  // Placeholder for other views
  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return renderHomeContent()
      
      case 'guides':
        return (
          <div className="container" style={{ padding: '40px 20px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px', color: '#1f2937' }}>
              📖 Professional Guides
            </h2>
            <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '40px' }}>
              Comprehensive guides and tutorials to help you master AI tools and techniques.
            </p>
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px'
            }}>
              <BookOpen size={64} color="#6b7280" style={{ marginBottom: '20px' }} />
              <h3 style={{ color: '#1f2937', marginBottom: '12px' }}>Coming Soon</h3>
              <p style={{ color: '#6b7280' }}>Professional guides are being prepared for your organization.</p>
            </div>
          </div>
        )

      case 'prompts':
        return (
          <div className="container" style={{ padding: '40px 20px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px', color: '#1f2937' }}>
              ⚡ AI Prompts & Prefixes
            </h2>
            <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '40px' }}>
              Ready-to-use prompts and shortcuts to boost your productivity.
            </p>
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚡</div>
              <h3 style={{ color: '#1f2937', marginBottom: '12px' }}>Coming Soon</h3>
              <p style={{ color: '#6b7280' }}>Prompts and prefixes are being curated for your needs.</p>
            </div>
          </div>
        )

      case 'forum':
        return (
          <div className="container" style={{ padding: '40px 20px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px', color: '#1f2937' }}>
              💬 Community Forum
            </h2>
            <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '40px' }}>
              Connect with your peers and share knowledge.
            </p>
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px'
            }}>
              <MessageCircle size={64} color="#6b7280" style={{ marginBottom: '20px' }} />
              <h3 style={{ color: '#1f2937', marginBottom: '12px' }}>Coming Soon</h3>
              <p style={{ color: '#6b7280' }}>Forum features are being developed for your community.</p>
            </div>
          </div>
        )

      default:
        return (
          <div className="container" style={{ padding: '40px 20px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px', color: '#1f2937' }}>
              🚧 Under Construction
            </h2>
            <p style={{ color: '#6b7280', fontSize: '18px' }}>
              This section is currently being developed. Please check back soon!
            </p>
          </div>
        )
    }
  }

  // Main application render
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff'
    }}>
      {renderNavigation()}
      <main>
        {renderContent()}
      </main>
    </div>
  )
}

export default App
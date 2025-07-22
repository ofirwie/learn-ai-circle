import { useState, useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { LoginForm } from './components/auth/LoginForm'
import { SignupForm } from './components/auth/SignupForm'
import { ArticleCard } from './components/cards/ArticleCard'
import { useArticles, useContent, useMixedContent } from './hooks/useContent'
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
  const [isHandlingCallback, setIsHandlingCallback] = useState(false)
  
  const { user, userProfile, entity, userGroup, loading, initialized, initialize, signOut } = useAuthStore()

  useEffect(() => {
    // Check if this is an auth callback
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      setIsHandlingCallback(true)
      handleAuthCallback()
    } else {
      initialize()
    }
  }, [])

  const handleAuthCallback = async () => {
    try {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      
      if (accessToken && refreshToken) {
        const { supabase } = await import('./services/supabase')
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })
        
        // Clear the hash
        window.history.replaceState(null, '', window.location.pathname)
        
        // Initialize auth store
        await initialize()
        setIsHandlingCallback(false)
      }
    } catch (error) {
      console.error('Auth callback error:', error)
      setIsHandlingCallback(false)
      initialize()
    }
  }

  // Show loading spinner while initializing or handling auth callback
  if (loading || !initialized || isHandlingCallback) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          textAlign: 'center'
        }}>
          <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 16px' }} />
          {isHandlingCallback && (
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Confirming your email...
            </p>
          )}
        </div>
      </div>
    )
  }

  // Don't force login - show content to everyone
  // Authentication will be handled separately if needed

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
          {user ? (
            <>
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
            </>
          ) : (
            <button
              onClick={() => setAuthView('login')}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  )

  // Hero section for home page
  const HomeContent = () => {
    const { mixedContent, loading } = useMixedContent({ limit: 6, featured: true })
    const { articles } = useArticles({ limit: 8 })

    return (
      <div>
        {/* Compact Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '60px 20px 40px 20px',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '16px',
              lineHeight: '1.1'
            }}>
              ISAI AI Knowledge Hub
            </h2>
            <p style={{
              fontSize: '1.125rem',
              opacity: '0.9',
              marginBottom: '0'
            }}>
              Your comprehensive AI Knowledge Hub for {entity?.name}
            </p>
          </div>
        </section>

        {/* Main Content Grid - LetsAI Style */}
        <section style={{
          padding: '40px 20px',
          backgroundColor: 'white'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {/* Content-Rich Grid Layout */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '40px'
            }}>
              {/* Show all content types mixed together for immediate discovery */}
              {!loading && mixedContent.length > 0 ? (
                mixedContent.slice(0, 12).map((item) => (
                  <ArticleCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    excerpt={item.excerpt}
                    content={item.content}
                    featuredImage={item.featuredImage}
                    youtubeVideoId={item.youtubeVideoId}
                    author={item.author}
                    category={item.category}
                    contentType={item.contentType}
                    tags={item.tags}
                    viewCount={item.viewCount}
                    readTime={item.readTime}
                    publishedAt={item.publishedAt}
                    featured={item.featured}
                    onClick={() => console.log('Open content:', item.id)}
                  />
                ))
              ) : articles.length > 0 ? (
                articles.slice(0, 12).map((article) => (
                  <ArticleCard
                    key={article.id}
                    id={article.id}
                    title={article.title}
                    excerpt={article.excerpt}
                    content={article.content}
                    featuredImage={article.featured_image}
                    youtubeVideoId={article.youtube_video_id}
                    author={article.author}
                    category={article.category}
                    contentType={article.youtube_video_id ? 'video' : 'article'}
                    tags={article.tags}
                    viewCount={article.view_count}
                    readTime={article.read_time}
                    publishedAt={article.published_at || article.created_at}
                    featured={article.featured}
                    onClick={() => console.log('Open article:', article.id)}
                  />
                ))
              ) : (
                // Show placeholder content if no real content exists
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#6b7280'
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '20px' }}>📚</div>
                  <h3 style={{ color: '#1f2937', marginBottom: '12px', fontSize: '24px' }}>
                    Content is Loading...
                  </h3>
                  <p style={{ fontSize: '16px' }}>
                    Your AI knowledge base is being prepared with guides, articles, and tools.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Navigation Categories */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginTop: '40px'
            }}>
              {[
                { key: 'guides', label: 'AI Guides', icon: '📖', color: '#3b82f6', description: 'Step-by-step tutorials' },
                { key: 'prompts', label: 'Prompts', icon: '⚡', color: '#8b5cf6', description: 'Ready-to-use prompts' },
                { key: 'tools', label: 'AI Tools', icon: '🔧', color: '#06b6d4', description: 'Tool reviews & guides' },
                { key: 'news', label: 'AI News', icon: '📰', color: '#10b981', description: 'Latest developments' }
              ].map(({ key, label, icon, color, description }) => (
                <button
                  key={key}
                  onClick={() => setCurrentView(key as ViewType)}
                  style={{
                    background: 'white',
                    border: `2px solid ${color}`,
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'
                    e.currentTarget.style.backgroundColor = color
                    e.currentTarget.style.color = 'white'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'
                    e.currentTarget.style.backgroundColor = 'white'
                    e.currentTarget.style.color = 'inherit'
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{icon}</div>
                  <h4 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    marginBottom: '8px',
                    color: 'inherit'
                  }}>
                    {label}
                  </h4>
                  <p style={{ 
                    fontSize: '14px', 
                    margin: '0',
                    opacity: 0.8,
                    color: 'inherit'
                  }}>
                    {description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Loading State */}
        {loading && (
          <section style={{
            padding: '60px 20px',
            textAlign: 'center'
          }}>
            <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 16px' }} />
            <p style={{ color: '#6b7280' }}>Loading content...</p>
          </section>
        )}

      </div>
    )
  }

  // Individual content section components
  const GuidesContent = () => {
    const { content, loading } = useContent({ contentType: 'guide' })
    
    return (
      <div className="container" style={{ padding: '40px 20px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px', color: '#1f2937' }}>
          📖 Professional Guides
        </h2>
        <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '40px' }}>
          Comprehensive guides and tutorials to help you master AI tools and techniques.
        </p>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 16px' }} />
            <p style={{ color: '#6b7280' }}>Loading guides...</p>
          </div>
        ) : content.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {content.map((item) => (
              <ArticleCard
                key={item.id}
                id={item.id}
                title={item.title}
                excerpt={item.content_json.excerpt || ''}
                content={item.content_json.content || ''}
                featuredImage={item.content_json.featured_image}
                youtubeVideoId={item.content_json.youtube_video_id}
                author={item.content_json.author || 'ISAI Team'}
                category={item.content_json.category}
                contentType="guide"
                tags={item.tags}
                viewCount={item.view_count}
                readTime={item.content_json.read_time}
                publishedAt={item.published_at || item.created_at}
                featured={item.priority === 'high'}
                onClick={() => console.log('Open guide:', item.id)}
              />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px'
          }}>
            <BookOpen size={64} color="#6b7280" style={{ marginBottom: '20px' }} />
            <h3 style={{ color: '#1f2937', marginBottom: '12px' }}>No Guides Yet</h3>
            <p style={{ color: '#6b7280' }}>Professional guides are being prepared for your organization.</p>
          </div>
        )}
      </div>
    )
  }

  const VideosContent = () => {
    const { articles } = useArticles()
    const videos = articles.filter(article => article.youtube_video_id)
    
    return (
      <div className="container" style={{ padding: '40px 20px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px', color: '#1f2937' }}>
          🎥 Video Content
        </h2>
        <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '40px' }}>
          Educational videos, tutorials, and demonstrations.
        </p>
        
        {videos.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {videos.map((video) => (
              <ArticleCard
                key={video.id}
                id={video.id}
                title={video.title}
                excerpt={video.excerpt}
                content={video.content}
                featuredImage={video.featured_image}
                youtubeVideoId={video.youtube_video_id}
                author={video.author}
                category={video.category}
                contentType="video"
                tags={video.tags}
                viewCount={video.view_count}
                readTime={video.read_time}
                publishedAt={video.published_at || video.created_at}
                featured={video.featured}
                onClick={() => console.log('Open video:', video.id)}
              />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎥</div>
            <h3 style={{ color: '#1f2937', marginBottom: '12px' }}>No Videos Yet</h3>
            <p style={{ color: '#6b7280' }}>Video content is being prepared for your library.</p>
          </div>
        )}
      </div>
    )
  }

  const ArticlesContent = () => {
    const { articles, loading } = useArticles()
    
    return (
      <div className="container" style={{ padding: '40px 20px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px', color: '#1f2937' }}>
          📄 Articles
        </h2>
        <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '40px' }}>
          In-depth articles covering AI topics, tools, and techniques.
        </p>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 16px' }} />
            <p style={{ color: '#6b7280' }}>Loading articles...</p>
          </div>
        ) : articles.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                id={article.id}
                title={article.title}
                excerpt={article.excerpt}
                content={article.content}
                featuredImage={article.featured_image}
                youtubeVideoId={article.youtube_video_id}
                author={article.author}
                category={article.category}
                contentType={article.youtube_video_id ? 'video' : 'article'}
                tags={article.tags}
                viewCount={article.view_count}
                readTime={article.read_time}
                publishedAt={article.published_at || article.created_at}
                featured={article.featured}
                onClick={() => console.log('Open article:', article.id)}
              />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📄</div>
            <h3 style={{ color: '#1f2937', marginBottom: '12px' }}>No Articles Yet</h3>
            <p style={{ color: '#6b7280' }}>Articles are being created for your knowledge base.</p>
          </div>
        )}
      </div>
    )
  }

  const PromptsContent = () => {
    const { content, loading } = useContent({ contentType: 'prompt' })
    
    return (
      <div className="container" style={{ padding: '40px 20px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px', color: '#1f2937' }}>
          ⚡ AI Prompts & Prefixes
        </h2>
        <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '40px' }}>
          Ready-to-use prompts and shortcuts to boost your productivity.
        </p>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 16px' }} />
            <p style={{ color: '#6b7280' }}>Loading prompts...</p>
          </div>
        ) : content.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {content.map((item) => (
              <ArticleCard
                key={item.id}
                id={item.id}
                title={item.title}
                excerpt={item.content_json.excerpt || ''}
                content={item.content_json.content || ''}
                featuredImage={item.content_json.featured_image}
                youtubeVideoId={item.content_json.youtube_video_id}
                author={item.content_json.author || 'ISAI Team'}
                category={item.content_json.category}
                contentType="prompt"
                tags={item.tags}
                viewCount={item.view_count}
                readTime={item.content_json.read_time}
                publishedAt={item.published_at || item.created_at}
                featured={item.priority === 'high'}
                onClick={() => console.log('Open prompt:', item.id)}
              />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚡</div>
            <h3 style={{ color: '#1f2937', marginBottom: '12px' }}>No Prompts Yet</h3>
            <p style={{ color: '#6b7280' }}>Prompts and prefixes are being curated for your needs.</p>
          </div>
        )}
      </div>
    )
  }

  const ToolsContent = () => {
    const { content, loading } = useContent({ contentType: 'tool' })
    
    return (
      <div className="container" style={{ padding: '40px 20px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px', color: '#1f2937' }}>
          🔧 AI Tools
        </h2>
        <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '40px' }}>
          Reviews and guides for AI tools and software.
        </p>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 16px' }} />
            <p style={{ color: '#6b7280' }}>Loading tools...</p>
          </div>
        ) : content.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {content.map((item) => (
              <ArticleCard
                key={item.id}
                id={item.id}
                title={item.title}
                excerpt={item.content_json.excerpt || ''}
                content={item.content_json.content || ''}
                featuredImage={item.content_json.featured_image}
                youtubeVideoId={item.content_json.youtube_video_id}
                author={item.content_json.author || 'ISAI Team'}
                category={item.content_json.category}
                contentType="tool"
                tags={item.tags}
                viewCount={item.view_count}
                readTime={item.content_json.read_time}
                publishedAt={item.published_at || item.created_at}
                featured={item.priority === 'high'}
                onClick={() => console.log('Open tool:', item.id)}
              />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔧</div>
            <h3 style={{ color: '#1f2937', marginBottom: '12px' }}>No Tools Yet</h3>
            <p style={{ color: '#6b7280' }}>Tool reviews are being prepared for your reference.</p>
          </div>
        )}
      </div>
    )
  }

  const NewsContent = () => {
    const { content, loading } = useContent({ contentType: 'news' })
    
    return (
      <div className="container" style={{ padding: '40px 20px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px', color: '#1f2937' }}>
          📰 AI News
        </h2>
        <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '40px' }}>
          Latest developments and updates in artificial intelligence.
        </p>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 16px' }} />
            <p style={{ color: '#6b7280' }}>Loading news...</p>
          </div>
        ) : content.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {content.map((item) => (
              <ArticleCard
                key={item.id}
                id={item.id}
                title={item.title}
                excerpt={item.content_json.excerpt || ''}
                content={item.content_json.content || ''}
                featuredImage={item.content_json.featured_image}
                youtubeVideoId={item.content_json.youtube_video_id}
                author={item.content_json.author || 'ISAI Team'}
                category={item.content_json.category}
                contentType="news"
                tags={item.tags}
                viewCount={item.view_count}
                readTime={item.content_json.read_time}
                publishedAt={item.published_at || item.created_at}
                featured={item.priority === 'high'}
                onClick={() => console.log('Open news:', item.id)}
              />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📰</div>
            <h3 style={{ color: '#1f2937', marginBottom: '12px' }}>No News Yet</h3>
            <p style={{ color: '#6b7280' }}>AI news updates are being curated for you.</p>
          </div>
        )}
      </div>
    )
  }

  const renderHomeContent = () => <HomeContent />

  // Placeholder for other views
  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return renderHomeContent()
      
      case 'guides':
        return <GuidesContent />

      case 'videos':
        return <VideosContent />

      case 'articles':
        return <ArticlesContent />

      case 'prompts':
        return <PromptsContent />

      case 'tools':
        return <ToolsContent />

      case 'news':
        return <NewsContent />

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
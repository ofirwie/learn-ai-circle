import { useState, useEffect } from 'react';
import { ContentTable } from './components/Dashboard/ContentTable';
import { ContentFiltersComponent } from './components/Dashboard/ContentFilters';
import { ContentDetailModal } from './components/Dashboard/ContentDetailModal';
import { AnalyticsCards } from './components/Dashboard/AnalyticsCards';
import { ContentService } from './services/contentService';
import { ArticleService } from './services/articleService';
import { AIContentItem, ContentFilters, Article } from './types/content';
import { ExportUtils } from './utils/exportUtils';
import { ArticlePreviewCard } from './components/Article/ArticlePreviewCard';
import { ArticleViewer } from './components/Article/ArticleViewer';
import { ArticleCreator } from './components/Article/ArticleCreator';
import { 
  Search, 
  Plus, 
  MessageCircle, 
  BookOpen, 
  Database,
  Users,
  Zap,
  Brain,
  Target,
  Lightbulb,
  Star,
  Calendar,
  Eye,
  Clock,
  ArrowRight,
  Filter,
  Download,
  Settings,
  TrendingUp,
  Globe,
  Sparkles,
  Rocket,
  Award
} from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'forums' | 'prompts' | 'prompt-library' | 'articles' | 'content-management' | 'ai-marketing'>('home');
  const [content, setContent] = useState<AIContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<AIContentItem[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [filters, setFilters] = useState<ContentFilters>({
    type: '',
    category: '',
    difficulty: '',
    searchTerm: ''
  });
  const [selectedContent, setSelectedContent] = useState<AIContentItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showArticleCreator, setShowArticleCreator] = useState(false);

  useEffect(() => {
    if (currentView === 'content-management') {
      loadContent();
    }
  }, [currentView]);

  useEffect(() => {
    if (currentView === 'articles') {
      loadPublishedArticles();
    }
  }, [currentView]);

  useEffect(() => {
    loadFeaturedArticles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [content, filters]);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Loading content from Supabase...');
      const data = await ContentService.getAllContent();
      console.log('✅ Content loaded:', data.length, 'items');
      setContent(data);
    } catch (err) {
      setError('Failed to load content');
      console.error('❌ Error loading content:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFeaturedArticles = async () => {
    try {
      setLoadingArticles(true);
      console.log('🔍 Loading featured articles...');
      const articles = await ArticleService.getFeaturedArticles(6);
      console.log('✅ Featured articles loaded:', articles.length, articles);
      setFeaturedArticles(articles);
    } catch (error) {
      console.error('❌ Error loading featured articles:', error);
    } finally {
      setLoadingArticles(false);
    }
  };

  const loadPublishedArticles = async () => {
    try {
      console.log('🔍 Loading published articles...');
      const publishedArticles = await ArticleService.getPublishedArticles();
      console.log('✅ Published articles loaded:', publishedArticles.length);
      setArticles(publishedArticles);
    } catch (error) {
      console.error('❌ Error loading published articles:', error);
    }
  };

  const applyFilters = () => {
    let filtered = content;
    
    if (filters.type) {
      filtered = filtered.filter(item => item.type === filters.type);
    }
    
    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }
    
    if (filters.difficulty) {
      filtered = filtered.filter(item => item.difficulty_level === filters.difficulty);
    }
    
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    setFilteredContent(filtered);
  };

  const handleContentClick = (content: AIContentItem) => {
    setSelectedContent(content);
    setShowDetailModal(true);
  };

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    // Increment view count
    ArticleService.incrementViewCount(article.id);
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      await ExportUtils.exportContent(filteredContent, format);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleArticleCreated = () => {
    // Refresh featured articles and published articles
    loadFeaturedArticles();
    if (currentView === 'articles') {
      loadPublishedArticles();
    }
  };

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
            fontSize: '24px',
            fontWeight: '700',
            margin: '0',
            cursor: 'pointer'
          }} onClick={() => setCurrentView('home')}>
            ISAI
          </h1>
          
          <div style={{ display: 'flex', gap: '30px' }}>
            {[
              { key: 'home', label: 'Home', icon: '🏠' },
              { key: 'forums', label: 'Forums', icon: '💬' },
              { key: 'prompts', label: 'AI Prompts', icon: '🤖' },
              { key: 'prompt-library', label: 'Prompt Library', icon: '📚' },
              { key: 'articles', label: 'Articles', icon: '📄' },
              { key: 'content-management', label: 'Content', icon: '📊' },
              { key: 'ai-marketing', label: 'AI Marketing', icon: '🚀' }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setCurrentView(key as any)}
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
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowArticleCreator(true)}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
        >
          <Plus size={16} />
          Add Content
        </button>
      </div>
    </nav>
  );

  if (selectedArticle) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {renderNavigation()}
        <ArticleViewer
          article={selectedArticle}
          onBack={() => setSelectedArticle(null)}
          onRelatedClick={handleArticleClick}
        />
      </div>
    );
  }

  const renderHomeContent = () => (
    <div>
      {/* Hero Section */}
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
            Your AI Knowledge Hub
          </h2>
          <p style={{
            fontSize: '20px',
            opacity: '0.9',
            marginBottom: '30px',
            lineHeight: '1.6'
          }}>
            Discover, create, and share AI prompts, templates, and insights with the community
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setCurrentView('prompts')}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              Explore Prompts
            </button>
            <button
              onClick={() => setShowArticleCreator(true)}
              style={{
                backgroundColor: 'white',
                color: '#667eea',
                border: '2px solid white',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              Share Knowledge
            </button>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '50px'
          }}>
            <h3 style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '12px'
            }}>
              Featured Articles
            </h3>
            <p style={{
              fontSize: '18px',
              color: '#64748b',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Discover the latest insights, tutorials, and guides from our community
            </p>
          </div>

          {loadingArticles ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
              color: '#64748b'
            }}>
              Loading featured articles...
            </div>
          ) : featuredArticles.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '30px'
            }}>
              {featuredArticles.map((article) => (
                <ArticlePreviewCard
                  key={article.id}
                  article={article}
                  onClick={() => handleArticleClick(article)}
                />
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '2px dashed #cbd5e1'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '8px',
                color: '#475569'
              }}>
                No Featured Articles Yet
              </h3>
              <p style={{ 
                color: '#64748b', 
                marginBottom: '24px' 
              }}>
                Create your first article with rich content and YouTube embeds
              </p>
              <button
                onClick={() => setShowArticleCreator(true)}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Create First Article
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: 'white'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '50px'
          }}>
            <h3 style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '12px'
            }}>
              Platform Features
            </h3>
            <p style={{
              fontSize: '18px',
              color: '#64748b',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Everything you need to enhance your AI workflow
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px'
          }}>
            {[
              {
                icon: <Brain size={40} />,
                title: 'AI Prompts Database',
                description: 'Searchable collection of tested and optimized AI prompts for various use cases'
              },
              {
                icon: <BookOpen size={40} />,
                title: 'Knowledge Articles',
                description: 'In-depth guides, tutorials, and insights about AI tools and techniques'
              },
              {
                icon: <MessageCircle size={40} />,
                title: 'Community Forums',
                description: 'Connect with other AI enthusiasts, share experiences, and get help'
              },
              {
                icon: <Database size={40} />,
                title: 'Template Library',
                description: 'Ready-to-use templates for common AI workflows and applications'
              }
            ].map((feature, index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '30px',
                textAlign: 'center',
                border: '1px solid #e2e8f0',
                transition: 'all 0.3s'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  color: '#3b82f6'
                }}>
                  {feature.icon}
                </div>
                <h4 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: '#1e293b'
                }}>
                  {feature.title}
                </h4>
                <p style={{
                  color: '#64748b',
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
  );

  const renderForumsContent = () => (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>
          Community Forums
        </h2>
        <p style={{ fontSize: '18px', color: '#64748b' }}>
          Connect with other AI enthusiasts and share knowledge
        </p>
      </div>
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h3 style={{ fontSize: '24px', marginBottom: '16px', color: '#1e293b' }}>Forums Coming Soon</h3>
        <p style={{ color: '#64748b' }}>We're building an amazing community space for AI discussions.</p>
      </div>
    </div>
  );

  const renderPromptsContent = () => (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>
          AI Prompts Library
        </h2>
        <p style={{ fontSize: '18px', color: '#64748b' }}>
          Discover and share effective AI prompts for various tasks
        </p>
      </div>
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h3 style={{ fontSize: '24px', marginBottom: '16px', color: '#1e293b' }}>Prompts Coming Soon</h3>
        <p style={{ color: '#64748b' }}>We're building a comprehensive prompt library.</p>
      </div>
    </div>
  );

  const renderArticlesContent = () => (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '40px' 
      }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>
            Articles
          </h2>
          <p style={{ fontSize: '18px', color: '#64748b' }}>
            In-depth guides, tutorials, and insights about AI
          </p>
        </div>
        <button
          onClick={() => setShowArticleCreator(true)}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={16} />
          New Article
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '30px'
      }}>
        {articles.map((article) => (
          <ArticlePreviewCard
            key={article.id}
            article={article}
            onClick={() => handleArticleClick(article)}
          />
        ))}
      </div>
    </div>
  );

  const renderContentManagement = () => (
    <div style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '8px'
          }}>
            Content Management
          </h2>
          <p style={{ color: '#64748b' }}>
            Manage your AI content library
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => handleExport('csv')}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <Download size={16} />
            Export JSON
          </button>
        </div>
      </div>

      <AnalyticsCards content={content} />

      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '20px'
      }}>
        <ContentFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#64748b'
        }}>
          Loading content...
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <ContentTable
        content={filteredContent}
        onContentClick={handleContentClick}
      />

      {showDetailModal && selectedContent && (
        <ContentDetailModal
          content={selectedContent}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return renderHomeContent();
      case 'forums':
        return renderForumsContent();
      case 'prompts':
        return renderPromptsContent();
      case 'prompt-library':
        return renderPromptsContent(); // Same as prompts for now
      case 'articles':
        return renderArticlesContent();
      case 'content-management':
        return renderContentManagement();
      case 'ai-marketing':
        return (
          <div style={{
            padding: '40px 20px',
            maxWidth: '1200px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '20px'
            }}>
              AI Marketing Tools
            </h2>
            <div style={{
              fontSize: '60px',
              marginBottom: '20px'
            }}>
              🚀
            </div>
            <p style={{
              fontSize: '18px',
              color: '#64748b',
              marginBottom: '30px'
            }}>
              Advanced AI marketing features coming soon!
            </p>
          </div>
        );
      default:
        return renderHomeContent();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {renderNavigation()}
      {renderContent()}
      
      {showArticleCreator && (
        <ArticleCreator
          onClose={() => setShowArticleCreator(false)}
          onArticleCreated={handleArticleCreated}
        />
      )}
    </div>
  );
}

export default App;
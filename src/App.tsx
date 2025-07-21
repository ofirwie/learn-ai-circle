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

// Sample data
const samplePrompts = [
  {
    id: '1',
    title: 'Creative Writing Assistant',
    description: 'Generate engaging story ideas and character development prompts',
    type: 'prompt' as const,
    category: 'Creative Writing',
    tags: ['storytelling', 'characters', 'plots'],
    content: 'You are a creative writing assistant. Help the user develop compelling story ideas by asking about their preferred genre, themes, and character types. Provide detailed character backgrounds and plot suggestions.',
    created_at: '2024-01-15',
    updated_at: '2024-01-15',
    author: 'Sarah Chen',
    featured: true,
    difficulty_level: 'intermediate' as const,
    use_cases: ['Novel writing', 'Short stories', 'Character development'],
    status: 'published' as const,
    view_count: 1247,
    rating: 4.8,
    rating_count: 156
  },
  {
    id: '2',
    title: 'Code Review Assistant',
    description: 'Analyze code quality and suggest improvements',
    type: 'prompt' as const,
    category: 'Programming',
    tags: ['code-review', 'best-practices', 'debugging'],
    content: 'You are an expert code reviewer. Analyze the provided code for bugs, performance issues, security vulnerabilities, and adherence to best practices. Provide specific suggestions for improvement.',
    created_at: '2024-01-14',
    updated_at: '2024-01-14',
    author: 'Alex Rodriguez',
    featured: true,
    difficulty_level: 'advanced' as const,
    use_cases: ['Code optimization', 'Bug detection', 'Security analysis'],
    status: 'published' as const,
    view_count: 892,
    rating: 4.6,
    rating_count: 98
  }
];

const sampleArticles: Article[] = [
  {
    id: '1',
    title: 'Introducing ChatGPT Agents: Revolutionary AI Assistants',
    content: `<h2>The Future of AI Assistance</h2>
    <p>OpenAI has unveiled ChatGPT Agents, a groundbreaking advancement that transforms how we interact with AI. These intelligent agents can perform complex tasks, access real-time information, and provide personalized assistance across various domains.</p>
    
    <div class="youtube-embed" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 20px 0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
      <iframe 
        src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 12px;"
        allowfullscreen>
      </iframe>
    </div>
    
    <h3>Key Features</h3>
    <ul>
      <li><strong>Real-time Data Access:</strong> Agents can fetch current information from the web</li>
      <li><strong>Task Automation:</strong> Complex workflows can be automated end-to-end</li>
      <li><strong>Contextual Memory:</strong> Maintains conversation context across sessions</li>
      <li><strong>Multi-modal Capabilities:</strong> Works with text, images, and documents</li>
    </ul>
    
    <h3>Use Cases</h3>
    <p>ChatGPT Agents excel in various scenarios including research assistance, content creation, data analysis, and customer support. The possibilities are virtually endless.</p>`,
    excerpt: 'Discover OpenAI\'s latest ChatGPT Agents - revolutionary AI assistants that can perform complex tasks and access real-time information.',
    author: 'Sarah Chen',
    category: 'AI News',
    tags: ['ChatGPT', 'AI Agents', 'OpenAI', 'Technology'],
    status: 'published',
    featured: true,
    youtube_video_id: 'dQw4w9WgXcQ',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    published_at: '2024-01-15T10:00:00Z',
    view_count: 4582,
    read_time: 6,
    slug: 'introducing-chatgpt-agents'
  },
  {
    id: '2',
    title: 'Master AI Video Creation with Runway ML',
    content: `<h2>Revolutionary Video Generation</h2>
    <p>Runway ML has transformed video creation with its AI-powered tools. Learn how to create stunning videos from simple text prompts and images.</p>
    
    <div class="youtube-embed" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 20px 0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
      <iframe 
        src="https://www.youtube.com/embed/kJQP7kiw5Fk" 
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 12px;"
        allowfullscreen>
      </iframe>
    </div>
    
    <h3>Getting Started</h3>
    <p>Follow this step-by-step guide to create your first AI-generated video using Runway ML's powerful Gen-2 model.</p>
    
    <h3>Pro Tips</h3>
    <ul>
      <li>Use detailed descriptions for better results</li>
      <li>Experiment with different aspect ratios</li>
      <li>Combine multiple clips for storytelling</li>
    </ul>`,
    excerpt: 'Learn how to create professional videos using Runway ML\'s AI-powered video generation tools.',
    author: 'Alex Rivera',
    category: 'Video Creation',
    tags: ['Runway ML', 'AI Video', 'Content Creation', 'Tutorial'],
    status: 'published',
    featured: true,
    youtube_video_id: 'kJQP7kiw5Fk',
    created_at: '2024-01-12T14:00:00Z',
    updated_at: '2024-01-12T14:00:00Z',
    published_at: '2024-01-12T14:00:00Z',
    view_count: 3247,
    read_time: 8,
    slug: 'master-ai-video-creation-runway-ml'
  },
  {
    id: '3',
    title: 'Building Better AI Prompts: A Complete Guide',
    content: `<h2>The Art of Prompt Engineering</h2>
    <p>Effective prompting is both an art and a science. Master these techniques to get better results from any AI model.</p>
    
    <div class="youtube-embed" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 20px 0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
      <iframe 
        src="https://www.youtube.com/embed/ZCLVIm5jlfs" 
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 12px;"
        allowfullscreen>
      </iframe>
    </div>
    
    <h3>Essential Techniques</h3>
    <ul>
      <li><strong>Be Specific:</strong> Clear, detailed instructions yield better results</li>
      <li><strong>Provide Context:</strong> Give the AI background information</li>
      <li><strong>Use Examples:</strong> Show the AI what you want with examples</li>
      <li><strong>Iterate and Refine:</strong> Improve prompts based on results</li>
    </ul>
    
    <p>These strategies will dramatically improve your AI interactions and help you achieve professional-quality results.</p>`,
    excerpt: 'Master the art of prompt engineering with proven techniques and real-world examples.',
    author: 'Dr. Marcus Johnson',
    category: 'Tutorials',
    tags: ['Prompting', 'AI Tools', 'Best Practices', 'Guide'],
    status: 'published',
    featured: true,
    youtube_video_id: 'ZCLVIm5jlfs',
    created_at: '2024-01-08T14:30:00Z',
    updated_at: '2024-01-08T14:30:00Z',
    published_at: '2024-01-08T14:30:00Z',
    view_count: 1876,
    read_time: 12,
    slug: 'building-better-ai-prompts-guide'
  }
];

const sampleForumPosts = [
  {
    id: '1',
    title: 'Best practices for ChatGPT prompting?',
    author: 'TechEnthusiast42',
    replies: 23,
    lastActivity: '2 hours ago',
    category: 'General Discussion',
    likes: 45
  },
  {
    id: '2',
    title: 'How to structure complex multi-step prompts',
    author: 'AIResearcher',
    replies: 15,
    lastActivity: '4 hours ago',
    category: 'Advanced Techniques',
    likes: 67
  },
  {
    id: '3',
    title: 'Share your most effective coding prompts',
    author: 'DevMaster',
    replies: 31,
    lastActivity: '6 hours ago',
    category: 'Programming',
    likes: 89
  }
];

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'forums' | 'prompts' | 'prompt-library' | 'articles' | 'content-management' | 'ai-marketing'>('home');
  const [content, setContent] = useState<AIContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<AIContentItem[]>([]);
  const [articles, setArticles] = useState<Article[]>(sampleArticles);
  const [filters, setFilters] = useState<ContentFilters>({
    type: '',
    category: '',
    difficulty: '',
    searchTerm: ''
  });
  const [selectedContent, setSelectedContent] = useState<AIContentItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showArticleCreator, setShowArticleCreator] = useState(false);

  useEffect(() => {
    if (currentView === 'content-management') {
      loadContent();
    }
  }, [currentView]);

  useEffect(() => {
    applyFilters();
  }, [content, filters]);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ContentService.getAllContent();
      setContent(data);
    } catch (err) {
      setError('Failed to load content');
      console.error('Error loading content:', err);
    } finally {
      setLoading(false);
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

  // Rest of component continues...
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

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px'
          }}>
            {articles.filter(article => article.featured).map((article) => (
              <ArticlePreviewCard
                key={article.id}
                article={article}
                onClick={() => handleArticleClick(article)}
              />
            ))}
          </div>
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

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '20px'
      }}>
        {sampleForumPosts.map((post) => (
          <div key={post.id} style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '24px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <span style={{
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {post.category}
              </span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                {post.lastActivity}
              </span>
            </div>
            
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '8px',
              lineHeight: '1.4'
            }}>
              {post.title}
            </h3>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '14px',
              color: '#64748b'
            }}>
              <span>by {post.author}</span>
              <span>•</span>
              <span>{post.replies} replies</span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>👍</span>
                {post.likes}
              </span>
            </div>
          </div>
        ))}
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

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '24px'
      }}>
        {samplePrompts.map((prompt) => (
          <div key={prompt.id} style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '24px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onClick={() => handleContentClick(prompt)}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <span style={{
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {prompt.category}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={14} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {prompt.rating}
                </span>
              </div>
            </div>

            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '8px'
            }}>
              {prompt.title}
            </h3>

            <p style={{
              color: '#64748b',
              fontSize: '14px',
              lineHeight: '1.5',
              marginBottom: '16px'
            }}>
              {prompt.description}
            </p>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginBottom: '12px'
            }}>
              {prompt.tags.map((tag, index) => (
                <span key={index} style={{
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  #{tag}
                </span>
              ))}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#64748b'
            }}>
              <span>by {prompt.author}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={12} />
                <span>{prompt.view_count}</span>
              </div>
            </div>
          </div>
        ))}
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
          onArticleCreated={() => {
            // Refresh articles if needed
            console.log('Article created');
          }}
        />
      )}
    </div>
  );
}

export default App;
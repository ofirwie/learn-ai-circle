import { useState } from 'react';

function App() {
  const [activeSection, setActiveSection] = useState('Home');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  // AI Prompts Database
  const aiPrompts = [
    {
      id: 1,
      category: "Content Creation",
      title: "Blog Post Writer",
      prompt: "Write a comprehensive blog post about [TOPIC] that is approximately 1000 words. Include an engaging introduction, 3-5 main points with examples, and a conclusion with actionable takeaways. Use a conversational yet professional tone.",
      tags: ["writing", "blog", "content"]
    },
    {
      id: 2,
      category: "Code Generation",
      title: "React Component Generator",
      prompt: "Create a React functional component for [COMPONENT_NAME] that includes: TypeScript types, proper props interface, error handling, and responsive design. Include comments explaining the code.",
      tags: ["react", "coding", "typescript"]
    },
    {
      id: 3,
      category: "Data Analysis",
      title: "Data Insights Analyzer",
      prompt: "Analyze this dataset and provide: 1) Key statistics and trends, 2) Potential correlations, 3) Actionable insights, 4) Visualization recommendations. Format the response with clear headers and bullet points.",
      tags: ["analysis", "data", "insights"]
    },
    {
      id: 4,
      category: "Marketing",
      title: "Social Media Campaign",
      prompt: "Create a social media campaign for [PRODUCT/SERVICE] including: 5 post ideas with captions, relevant hashtags, optimal posting times, and engagement strategies. Target audience: [AUDIENCE].",
      tags: ["marketing", "social", "campaign"]
    },
    {
      id: 5,
      category: "Education",
      title: "Lesson Plan Creator",
      prompt: "Design a detailed lesson plan for teaching [SUBJECT] to [AGE_GROUP]. Include: learning objectives, materials needed, 45-minute activity breakdown, assessment methods, and homework assignments.",
      tags: ["education", "teaching", "planning"]
    }
  ];

  // Forum Posts
  const forumPosts = [
    {
      id: 1,
      title: "Best practices for prompt engineering?",
      author: "Sarah Chen",
      replies: 23,
      views: 456,
      lastActivity: "2 hours ago",
      category: "Prompt Engineering",
      preview: "I've been experimenting with different prompt structures and wondering what strategies others have found most effective..."
    },
    {
      id: 2,
      title: "ChatGPT vs Claude for code generation",
      author: "Mike Johnson",
      replies: 45,
      views: 892,
      lastActivity: "5 hours ago",
      category: "AI Comparison",
      preview: "After extensive testing with both models, here's my detailed comparison for code generation tasks..."
    },
    {
      id: 3,
      title: "Share your favorite AI tools for content creation",
      author: "Lisa Park",
      replies: 67,
      views: 1203,
      lastActivity: "1 day ago",
      category: "Tools & Resources",
      preview: "Let's create a comprehensive list of AI tools that have transformed our content creation workflow..."
    }
  ];

  // Articles
  const articles = [
    {
      id: 1,
      title: "Understanding Large Language Models: A Beginner's Guide",
      author: "Dr. James Wilson",
      readTime: "8 min",
      date: "July 18, 2024",
      excerpt: "Explore the fundamentals of LLMs, how they work, and their impact on modern AI applications.",
      category: "AI Basics"
    },
    {
      id: 2,
      title: "The Future of AI in Healthcare",
      author: "Emily Rodriguez",
      readTime: "12 min",
      date: "July 17, 2024",
      excerpt: "Discover how artificial intelligence is revolutionizing medical diagnosis, treatment planning, and patient care.",
      category: "Industry Applications"
    },
    {
      id: 3,
      title: "Ethical Considerations in AI Development",
      author: "Prof. Alan Kumar",
      readTime: "10 min",
      date: "July 16, 2024",
      excerpt: "A deep dive into the ethical challenges and responsibilities in developing AI systems.",
      category: "AI Ethics"
    }
  ];

  // Prompt Templates
  const promptTemplates = [
    {
      id: 1,
      name: "Business Email Template",
      category: "Business",
      template: "Subject: [SUBJECT]\n\nDear [RECIPIENT],\n\nI hope this email finds you well. I'm writing to [PURPOSE].\n\n[MAIN_CONTENT]\n\n[CALL_TO_ACTION]\n\nBest regards,\n[YOUR_NAME]",
      description: "Professional email template for business communication"
    },
    {
      id: 2,
      name: "Product Description Generator",
      category: "E-commerce",
      template: "Generate a compelling product description for:\nProduct: [PRODUCT_NAME]\nKey Features: [FEATURES]\nTarget Audience: [AUDIENCE]\nTone: [TONE]\nLength: [WORD_COUNT] words",
      description: "Create engaging product descriptions for online stores"
    },
    {
      id: 3,
      name: "Code Documentation",
      category: "Development",
      template: "Document this code:\n[CODE_SNIPPET]\n\nInclude:\n- Purpose and functionality\n- Parameters and return values\n- Usage examples\n- Edge cases and error handling",
      description: "Generate comprehensive code documentation"
    }
  ];

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  const contentCards = [
    {
      id: 1,
      title: "Creating Interactive Data Visualizations with AI",
      description: "Learn how to build stunning interactive charts and graphs using AI-powered tools and modern frameworks.",
      readTime: "7 min",
      date: "19/07/2025",
      tags: ["Data Viz", "AI", "Interactive"],
      category: "Tutorials",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
      type: "article"
    },
    {
      id: 2,
      title: "OpenAI Releases Enhanced ChatGPT",
      description: "Latest updates to ChatGPT include improved reasoning, faster responses, and new creative capabilities.",
      readTime: "7 min",
      date: "18/07/2025",
      tags: ["OpenAI", "ChatGPT", "Updates"],
      category: "News",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop",
      type: "video"
    },
    {
      id: 3,
      title: "ISAI Platform - Complete Guide",
      description: "Comprehensive walkthrough of ISAI platform for AI knowledge sharing and collaboration.",
      readTime: "10:24",
      date: "2025.20.07",
      tags: ["Lovable", "No-Code", "Tutorial"],
      category: "Guides",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop",
      type: "video",
      featured: true
    },
    {
      id: 4,
      title: "AI Audio Processing Tools",
      description: "Explore cutting-edge AI tools for audio editing, enhancement, and generation.",
      readTime: "5 min",
      date: "17/07/2025",
      tags: ["Audio", "AI Tools", "Processing"],
      category: "Tools",
      image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=250&fit=crop",
      type: "article"
    },
    {
      id: 5,
      title: "OMNI Video Editing with AI",
      description: "Revolutionary AI-powered video editing suite for content creators and professionals.",
      readTime: "8 min",
      date: "16/07/2025",
      tags: ["Video", "Editing", "OMNI"],
      category: "Tools",
      image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=250&fit=crop",
      type: "article"
    },
    {
      id: 6,
      title: "Multi-Language AI Assistant",
      description: "Building conversational AI that supports multiple languages and cultural contexts.",
      readTime: "6 min",
      date: "15/07/2025",
      tags: ["Multilingual", "Assistant", "AI"],
      category: "Development",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=250&fit=crop",
      type: "article"
    }
  ];

  const categories = ["All", "Guides", "Prompts", "Forum", "Tools"];
  const popularTags = ["ChatGPT", "Prompts", "AI Tools", "Tutorial", "Development", "Machine Learning"];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#3b82f6', color: 'white' }}>
        {/* Top Header */}
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '60px' }}>
            {/* Right Side - User Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '14px', opacity: 0.9 }}>My Area</span>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}>🛒</div>
              <div style={{ position: 'relative' }}>
                <span style={{ 
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>2</span>
                <div style={{ fontSize: '14px', cursor: 'pointer' }}>📋</div>
              </div>
            </div>

            {/* Center - Search Bar */}
            <div style={{ position: 'relative', maxWidth: '400px', minWidth: '300px', flex: 1, margin: '0 24px' }}>
              <input 
                type="text"
                placeholder="Search..."
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '8px 40px 8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              />
              <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', cursor: 'pointer' }}>
                🔍
              </div>
            </div>

            {/* Left Side - Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '2px' }}>ISAI</div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
            <nav style={{ display: 'flex', height: '48px', justifyContent: 'center' }}>
              {["Home", "Forums", "AI Prompts", "Prompt Library", "Articles", "AI Marketing"].map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveSection(item)}
                  style={{
                    padding: '12px 16px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'white',
                    fontSize: '14px',
                    cursor: 'pointer',
                    opacity: activeSection === item ? 1 : 0.8,
                    fontWeight: activeSection === item ? '600' : '400',
                    borderBottom: activeSection === item ? '2px solid white' : 'none'
                  }}
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Section Title */}
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px', color: '#1e293b' }}>
          {activeSection}
        </h1>

        {/* AI Prompts Section */}
        {activeSection === 'AI Prompts' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  padding: '12px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              {aiPrompts
                .filter(prompt => 
                  prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  prompt.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  prompt.category.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(prompt => (
                  <div key={prompt.id} style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{prompt.title}</h3>
                        <span style={{
                          backgroundColor: '#eff6ff',
                          color: '#2563eb',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}>{prompt.category}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(prompt.prompt, prompt.id)}
                        style={{
                          backgroundColor: copiedId === prompt.id ? '#10b981' : '#3b82f6',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'all 0.2s'
                        }}
                      >
                        {copiedId === prompt.id ? '✓ Copied!' : 'Copy Prompt'}
                      </button>
                    </div>
                    
                    <div style={{
                      backgroundColor: '#f8fafc',
                      padding: '16px',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      marginBottom: '12px'
                    }}>
                      {prompt.prompt}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {prompt.tags.map(tag => (
                        <span key={tag} style={{
                          backgroundColor: '#f1f5f9',
                          color: '#64748b',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>#{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Forums Section */}
        {activeSection === 'Forums' && (
          <div>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600' }}>Community Discussions</h2>
              <button style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                + New Topic
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {forumPosts.map(post => (
                <div key={post.id} style={{
                  backgroundColor: 'white',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>
                        {post.title}
                      </h3>
                      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '12px' }}>
                        {post.preview}
                      </p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
                        <span>by {post.author}</span>
                        <span>•</span>
                        <span>{post.replies} replies</span>
                        <span>•</span>
                        <span>{post.views} views</span>
                        <span>•</span>
                        <span>{post.lastActivity}</span>
                      </div>
                    </div>
                    <span style={{
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      whiteSpace: 'nowrap'
                    }}>{post.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Articles Section */}
        {activeSection === 'Articles' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>Latest Articles</h2>
              <p style={{ color: '#64748b' }}>Deep dives into AI technology, tutorials, and industry insights</p>
            </div>
            
            <div style={{ display: 'grid', gap: '24px' }}>
              {articles.map(article => (
                <div key={article.id} style={{
                  backgroundColor: 'white',
                  padding: '32px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>{article.category}</span>
                  </div>
                  
                  <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px', color: '#1e293b' }}>
                    {article.title}
                  </h3>
                  
                  <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6', marginBottom: '16px' }}>
                    {article.excerpt}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#64748b' }}>
                      <span>By {article.author}</span>
                      <span>•</span>
                      <span>{article.date}</span>
                      <span>•</span>
                      <span>{article.readTime} read</span>
                    </div>
                    <span style={{ color: '#3b82f6', fontWeight: '500' }}>Read more →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prompt Library Section */}
        {activeSection === 'Prompt Library' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>Prompt Templates</h2>
              <p style={{ color: '#64748b' }}>Ready-to-use templates for common AI tasks</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
              {promptTemplates.map(template => (
                <div key={template.id} style={{
                  backgroundColor: 'white',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  height: 'fit-content'
                }}>
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{template.name}</h3>
                    <span style={{
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}>{template.category}</span>
                  </div>
                  
                  <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
                    {template.description}
                  </p>
                  
                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    maxHeight: '200px',
                    overflow: 'auto'
                  }}>
                    <pre style={{
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      whiteSpace: 'pre-wrap',
                      margin: 0,
                      color: '#475569'
                    }}>
                      {template.template}
                    </pre>
                  </div>
                  
                  <button
                    onClick={() => copyToClipboard(template.template, template.id)}
                    style={{
                      width: '100%',
                      backgroundColor: copiedId === template.id ? '#10b981' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                  >
                    {copiedId === template.id ? '✓ Copied Template!' : 'Use This Template'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'AI Marketing' && (
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>AI Marketing Solutions</h2>
            <p style={{ color: '#64748b' }}>Learn how to leverage AI for your marketing campaigns.</p>
          </div>
        )}

        {/* Home Content - show the existing grid */}
        {activeSection === 'Home' && (
          <>
            {/* Content Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '24px',
              marginBottom: '32px'
            }}>
              {/* Featured Video Card */}
              <div style={{ gridColumn: 'span 2' }}>
                <div
                  style={{
                    position: 'relative',
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    height: '320px',
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('${contentCards.find(c => c.featured)?.image}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ 
                    position: 'absolute',
                    bottom: '24px',
                    left: '24px',
                    right: '24px',
                    color: 'white'
                  }}>
                    <h2 style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold', 
                      marginBottom: '8px',
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                    }}>
                      ISAI Platform - Complete Guide
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', opacity: 0.9 }}>
                      <span>10:24</span>
                      <span>•</span>
                      <span>2025.20.07</span>
                      <span>•</span>
                      <span>Latest Tutorial</span>
                    </div>
                  </div>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    color: '#3b82f6'
                  }}>▶</div>
                </div>
              </div>

              {/* Regular Content Cards */}
              {contentCards.filter(card => !card.featured).map(card => (
                <div
                  key={card.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    height: '320px'
                  }}
                  onClick={() => alert(`Opening: ${card.title}\n\nThis would normally navigate to the full article.`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                >
                  {/* Card Image */}
                  <div style={{
                    height: '180px',
                    backgroundImage: `url('${card.image}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}>
                    {card.type === 'video' && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '50px',
                        height: '50px',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '20px'
                      }}>▶</div>
                    )}
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {card.readTime}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#1e293b', 
                      marginBottom: '8px',
                      lineHeight: '1.4',
                      height: '40px',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {card.title}
                    </h3>
                    
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#64748b',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>📅 {card.date}</span>
                      <span>👁 {Math.floor(Math.random() * 5000) + 1000}</span>
                    </div>

                    {/* Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {card.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '500'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Tools Section */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px'
            }}>
              {[
                { title: "AI Video Generator", color: "#3b82f6", icon: "🎥" },
                { title: "Image Enhancement", color: "#10b981", icon: "🖼️" },
                { title: "OMNI AI Editing", color: "#8b5cf6", icon: "✂️" },
                { title: "Language Learning", color: "#f59e0b", icon: "🗣️" },
                { title: "Code Assistant", color: "#ef4444", icon: "💻" },
                { title: "Design Tools", color: "#06b6d4", icon: "🎨" }
              ].map((tool, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: tool.color,
                    color: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>{tool.icon}</div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{tool.title}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App
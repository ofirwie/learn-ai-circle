import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

interface Prompt {
  id: string;
  title: string;
  content_json: {
    prompt: string;
    category: string;
    tech_stack?: string[];
    difficulty?: string;
    source: string;
    contributor?: string;
    for_developers?: boolean;
    use_case?: string;
  };
  tags: string[];
  priority: string;
  view_count: number;
  created_at: string;
}

const SimplePromptsViewer: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('content_type', 'prompt')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrompts(data || []);
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Prompt copied to clipboard!');
  };

  const incrementViewCount = async (promptId: string) => {
    try {
      await supabase
        .from('content')
        .update({ view_count: supabase.sql`view_count + 1` })
        .eq('id', promptId);
      
      setPrompts(prompts.map(p => 
        p.id === promptId ? { ...p, view_count: p.view_count + 1 } : p
      ));
    } catch (error) {
      console.error('Failed to update view count:', error);
    }
  };

  // Filter prompts based on search and filters
  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.content_json.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
                           prompt.content_json.category.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filters
  const categories = [...new Set(prompts.map(p => p.content_json.category))];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ marginBottom: '20px' }}>Loading prompts...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '10px' }}>
          🚀 AI Prompts Collection
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
          Curated prompts for various AI applications and use cases
        </p>
        <div style={{ 
          display: 'inline-block', 
          background: '#e5e7eb', 
          padding: '8px 16px', 
          borderRadius: '20px',
          marginTop: '10px'
        }}>
          {filteredPrompts.length} prompts available
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        marginBottom: '30px', 
        flexWrap: 'wrap',
        background: '#f9fafb',
        padding: '20px',
        borderRadius: '8px'
      }}>
        <input
          type="text"
          placeholder="🔍 Search prompts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '250px',
            padding: '12px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '16px'
          }}
        />
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '16px',
            minWidth: '180px'
          }}
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Prompts Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
        gap: '25px' 
      }}>
        {filteredPrompts.map((prompt) => (
          <div 
            key={prompt.id} 
            style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              transition: 'box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#1f2937',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {prompt.content_json.category === 'Game Development' && '🎮'}
                {prompt.content_json.category === 'Web Development' && '💻'}
                {prompt.content_json.category === 'Development Tools' && '🔧'}
                {prompt.content_json.category === 'Design & UX' && '🎨'}
                {prompt.content_json.category === 'Security' && '🔒'}
                {prompt.content_json.category === 'AI & Prompting' && '🧠'}
                {!['Game Development', 'Web Development', 'Development Tools', 'Design & UX', 'Security', 'AI & Prompting'].includes(prompt.content_json.category) && '📝'}
                {prompt.title}
              </h3>
              
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{
                  background: '#dbeafe',
                  color: '#1e40af',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {prompt.content_json.category}
                </span>
                
                {prompt.content_json.difficulty && (
                  <span style={{
                    background: getDifficultyColor(prompt.content_json.difficulty) + '20',
                    color: getDifficultyColor(prompt.content_json.difficulty),
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {prompt.content_json.difficulty}
                  </span>
                )}
                
                {prompt.content_json.for_developers && (
                  <span style={{
                    background: '#f3e8ff',
                    color: '#7c3aed',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    👨‍💻 Dev
                  </span>
                )}
                
                <span style={{ 
                  fontSize: '12px', 
                  color: '#6b7280',
                  marginLeft: 'auto'
                }}>
                  👀 {prompt.view_count} views
                </span>
              </div>
            </div>

            {/* Tech Stack */}
            {prompt.content_json.tech_stack && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {prompt.content_json.tech_stack.map((tech, index) => (
                    <span
                      key={index}
                      style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '11px',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Prompt Preview */}
            <div style={{
              background: '#f8fafc',
              padding: '16px',
              borderRadius: '6px',
              marginBottom: '16px',
              border: '1px solid #e2e8f0'
            }}>
              <p style={{ 
                color: '#374151', 
                lineHeight: '1.5',
                margin: 0,
                fontSize: '14px'
              }}>
                {expandedPrompt === prompt.id 
                  ? prompt.content_json.prompt
                  : `${prompt.content_json.prompt.substring(0, 200)}${prompt.content_json.prompt.length > 200 ? '...' : ''}`
                }
              </p>
              
              {prompt.content_json.prompt.length > 200 && (
                <button
                  onClick={() => {
                    setExpandedPrompt(expandedPrompt === prompt.id ? null : prompt.id);
                    if (expandedPrompt !== prompt.id) {
                      incrementViewCount(prompt.id);
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    cursor: 'pointer',
                    fontSize: '12px',
                    marginTop: '8px',
                    textDecoration: 'underline'
                  }}
                >
                  {expandedPrompt === prompt.id ? 'Show Less' : 'Read More'}
                </button>
              )}
            </div>

            {/* Tags */}
            {prompt.tags.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {prompt.tags.slice(0, 4).map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        background: '#ecfdf5',
                        color: '#059669',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '11px'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                  {prompt.tags.length > 4 && (
                    <span style={{
                      background: '#ecfdf5',
                      color: '#059669',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontSize: '11px'
                    }}>
                      +{prompt.tags.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingTop: '12px',
              borderTop: '1px solid #f3f4f6'
            }}>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Source: {prompt.content_json.source}
              </div>
              
              <button
                onClick={() => {
                  copyToClipboard(prompt.content_json.prompt);
                  incrementViewCount(prompt.id);
                }}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                📋 Copy Prompt
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPrompts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '8px' }}>
            No prompts found
          </h3>
          <p style={{ color: '#6b7280' }}>
            {searchTerm || selectedCategory !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No prompts available at the moment'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default SimplePromptsViewer;
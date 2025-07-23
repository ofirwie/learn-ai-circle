import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Copy, 
  ExternalLink, 
  Search, 
  Filter, 
  Tag,
  Star,
  Code,
  Zap,
  Users,
  Briefcase
} from 'lucide-react';

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

const PromptsViewer: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
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
    // Could add a toast notification here
    alert('Prompt copied to clipboard!');
  };

  const incrementViewCount = async (promptId: string) => {
    try {
      await supabase
        .from('content')
        .update({ view_count: supabase.sql`view_count + 1` })
        .eq('id', promptId);
      
      // Update local state
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
    
    const matchesDifficulty = selectedDifficulty === 'all' || 
                             prompt.content_json.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Get unique categories and difficulties for filters
  const categories = [...new Set(prompts.map(p => p.content_json.category))];
  const difficulties = [...new Set(prompts.map(p => p.content_json.difficulty).filter(Boolean))];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'development tools': return <Code className="w-4 h-4" />;
      case 'game development': return <Zap className="w-4 h-4" />;
      case 'web development': return <ExternalLink className="w-4 h-4" />;
      case 'design & ux': return <Star className="w-4 h-4" />;
      case 'security': return <Briefcase className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading prompts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Prompts Collection</h2>
          <p className="text-gray-600 mt-1">Curated prompts for various AI applications and use cases</p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {filteredPrompts.length} prompts
        </Badge>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search prompts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Difficulties</option>
          {difficulties.map(difficulty => (
            <option key={difficulty} value={difficulty}>{difficulty}</option>
          ))}
        </select>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPrompts.map((prompt) => (
          <Card key={prompt.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {getCategoryIcon(prompt.content_json.category)}
                    {prompt.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {prompt.content_json.category}
                    </Badge>
                    {prompt.content_json.difficulty && (
                      <Badge className={`text-xs ${getDifficultyColor(prompt.content_json.difficulty)}`}>
                        {prompt.content_json.difficulty}
                      </Badge>
                    )}
                    {prompt.content_json.for_developers && (
                      <Badge variant="secondary" className="text-xs">
                        <Code className="w-3 h-3 mr-1" />
                        Dev
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  {prompt.view_count}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Tech Stack */}
                {prompt.content_json.tech_stack && (
                  <div className="flex flex-wrap gap-1">
                    {prompt.content_json.tech_stack.map((tech, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Prompt Preview */}
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {expandedPrompt === prompt.id 
                      ? prompt.content_json.prompt
                      : `${prompt.content_json.prompt.substring(0, 200)}${prompt.content_json.prompt.length > 200 ? '...' : ''}`
                    }
                  </p>
                  
                  {prompt.content_json.prompt.length > 200 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setExpandedPrompt(expandedPrompt === prompt.id ? null : prompt.id);
                        if (expandedPrompt !== prompt.id) {
                          incrementViewCount(prompt.id);
                        }
                      }}
                      className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-800"
                    >
                      {expandedPrompt === prompt.id ? 'Show Less' : 'Read More'}
                    </Button>
                  )}
                </div>

                {/* Tags */}
                {prompt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {prompt.tags.slice(0, 4).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                    {prompt.tags.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{prompt.tags.length - 4} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-2">
                  <div className="text-xs text-gray-500">
                    Source: {prompt.content_json.source}
                  </div>
                  
                  <Button
                    onClick={() => {
                      copyToClipboard(prompt.content_json.prompt);
                      incrementViewCount(prompt.id);
                    }}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Prompt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPrompts.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No prompts found</h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No prompts available at the moment'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default PromptsViewer;
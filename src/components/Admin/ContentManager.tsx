import React, { useState, useEffect } from 'react'
import { ArticleService } from '../../services/articleService'
import { Article } from '../../types/content'
import { format } from 'date-fns'

interface ContentManagerProps {
  isOpen: boolean
  onClose: () => void
  onArticleSelect?: (article: Article) => void
}

export const ContentManager: React.FC<ContentManagerProps> = ({
  isOpen,
  onClose,
  onArticleSelect
}) => {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedArticles, setSelectedArticles] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    search: ''
  })

  useEffect(() => {
    if (isOpen) {
      loadArticles()
    }
  }, [isOpen])

  // Separate effect for filters with debounce
  useEffect(() => {
    if (!isOpen) return
    
    const timeoutId = setTimeout(() => {
      loadArticles()
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [filters.status, filters.category, filters.search, isOpen])

  const loadArticles = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 ContentManager: Starting to load articles...', {
        filters: filters,
        isOpen: isOpen,
        timestamp: new Date().toISOString()
      })
      
      const filterParams = {
        status: filters.status === 'all' ? undefined : filters.status as any,
        category: filters.category === 'all' ? undefined : filters.category,
        search: filters.search || undefined
      }
      
      console.log('📋 ContentManager: Using filter params:', filterParams)
      
      const result = await ArticleService.getArticles(1, 50, filterParams)
      
      console.log('✅ ContentManager: Articles loaded successfully', {
        count: result.data?.length || 0,
        totalCount: result.count || 0,
        firstArticle: result.data?.[0]?.title || 'none'
      })
      
      setArticles(result.data || [])
    } catch (err) {
      console.error('❌ ContentManager: Error loading articles:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        filters: filters
      })
      
      setError(`Failed to load articles: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setArticles([]) // Set empty array on error
    } finally {
      console.log('🏁 ContentManager: Load articles completed')
      setLoading(false)
    }
  }

  const handleDelete = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article?')) {
      return
    }

    try {
      await ArticleService.deleteArticle(articleId)
      setArticles(articles.filter(a => a.id !== articleId))
      setSelectedArticles(selectedArticles.filter(id => id !== articleId))
    } catch (err) {
      setError('Failed to delete article')
      console.error('Error deleting article:', err)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedArticles.length === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedArticles.length} articles?`)) {
      return
    }

    try {
      await Promise.all(selectedArticles.map(id => ArticleService.deleteArticle(id)))
      setArticles(articles.filter(a => !selectedArticles.includes(a.id)))
      setSelectedArticles([])
    } catch (err) {
      setError('Failed to delete some articles')
      console.error('Error bulk deleting:', err)
    }
  }

  const toggleArticleSelection = (articleId: string) => {
    setSelectedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    )
  }

  const toggleAllSelection = () => {
    setSelectedArticles(
      selectedArticles.length === articles.length 
        ? [] 
        : articles.map(a => a.id)
    )
  }

  const handleStatusToggle = async (article: Article) => {
    try {
      const newStatus = article.status === 'published' ? 'draft' : 'published'
      const updatedArticle = await ArticleService.updateArticle(article.id, { 
        status: newStatus 
      })
      setArticles(articles.map(a => 
        a.id === article.id ? updatedArticle : a
      ))
    } catch (err) {
      setError('Failed to update article status')
      console.error('Error updating status:', err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="content-manager-overlay">
      <div className="content-manager-modal">
        <div className="content-manager-header">
          <h2>Content Management</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        {/* Filters */}
        <div className="content-filters">
          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search articles..."
            />
          </div>
          
          <div className="filter-group">
            <label>Status:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Category:</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="all">All Categories</option>
              <option value="article">Article</option>
              <option value="guide">Guide</option>
              <option value="tool-review">Tool Review</option>
            </select>
          </div>

          {selectedArticles.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="bulk-delete-button"
            >
              Delete Selected ({selectedArticles.length})
            </button>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Content Table */}
        <div className="content-table-container">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading articles...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="empty-state">
              <p>No articles found</p>
            </div>
          ) : (
            <table className="content-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedArticles.length === articles.length}
                      onChange={toggleAllSelection}
                    />
                  </th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Author</th>
                  <th>Created</th>
                  <th>Views</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedArticles.includes(article.id)}
                        onChange={() => toggleArticleSelection(article.id)}
                      />
                    </td>
                    <td className="article-title">
                      <div>
                        <strong>{article.title}</strong>
                        {article.excerpt && (
                          <p className="article-excerpt">{article.excerpt.substring(0, 80)}...</p>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`category-badge ${article.category}`}>
                        {article.category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Uncategorized'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleStatusToggle(article)}
                        className={`status-badge ${article.status}`}
                      >
                        {article.status === 'published' ? '🟢 Published' : '🟡 Draft'}
                      </button>
                    </td>
                    <td>{article.author || 'Unknown'}</td>
                    <td>{format(new Date(article.created_at), 'MMM d, yyyy')}</td>
                    <td>{article.view_count || 0}</td>
                    <td className="actions-cell">
                      <button
                        onClick={() => onArticleSelect?.(article)}
                        className="action-button edit"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="action-button delete"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style jsx>{`
        .content-manager-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .content-manager-modal {
          background: white;
          border-radius: 12px;
          width: 95%;
          max-width: 1200px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .content-manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .content-manager-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: #1e293b;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #64748b;
          padding: 4px;
        }

        .close-button:hover {
          color: #1e293b;
        }

        .content-filters {
          display: flex;
          gap: 16px;
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
          flex-wrap: wrap;
          align-items: center;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .filter-group label {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
        }

        .filter-group input,
        .filter-group select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }

        .bulk-delete-button {
          background: #dc2626;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          margin-left: auto;
        }

        .bulk-delete-button:hover {
          background: #b91c1c;
        }

        .error-message {
          background: #fef2f2;
          color: #dc2626;
          padding: 12px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-left: 4px solid #dc2626;
        }

        .content-table-container {
          flex: 1;
          overflow: auto;
          padding: 0 24px;
        }

        .loading-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: #64748b;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e2e8f0;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 12px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .content-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }

        .content-table th,
        .content-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        .content-table th {
          background: #f8fafc;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .content-table td {
          font-size: 14px;
        }

        .article-title strong {
          color: #1e293b;
          font-weight: 600;
        }

        .article-excerpt {
          color: #64748b;
          font-size: 12px;
          margin: 4px 0 0 0;
          line-height: 1.4;
        }

        .category-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .category-badge.article {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .category-badge.guide {
          background: #dcfce7;
          color: #16a34a;
        }

        .category-badge.tool-review {
          background: #fef3c7;
          color: #d97706;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 6px;
          border: none;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
        }

        .status-badge.published {
          background: #dcfce7;
          color: #16a34a;
        }

        .status-badge.draft {
          background: #fef3c7;
          color: #d97706;
        }

        .actions-cell {
          display: flex;
          gap: 8px;
        }

        .action-button {
          background: none;
          border: 1px solid #d1d5db;
          padding: 6px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .action-button:hover {
          background: #f3f4f6;
        }

        .action-button.delete:hover {
          background: #fef2f2;
          border-color: #dc2626;
        }
      `}</style>
    </div>
  )
}
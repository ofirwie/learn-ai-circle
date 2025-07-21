import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ContentService } from '../../services/contentService'
import { AIContentItem, ContentFilters } from '../../types/content'

interface ContentTableProps {
  filters: ContentFilters
  onItemSelect: (item: AIContentItem) => void
  onBulkAction: (action: 'approve' | 'reject' | 'delete', ids: string[]) => void
}

export const ContentTable: React.FC<ContentTableProps> = ({ filters, onItemSelect, onBulkAction }) => {
  const [content, setContent] = useState<AIContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const itemsPerPage = 50

  useEffect(() => {
    loadContent()
  }, [filters, currentPage])

  const loadContent = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, count } = await ContentService.getContentItems(currentPage, itemsPerPage, filters)
      setContent(data)
      setTotalCount(count)
    } catch (error) {
      console.error('Error loading content:', error)
      setError(error instanceof Error ? error.message : 'Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    try {
      setLoading(true)
      const result = await ContentService.testConnection()
      setDebugInfo(result)
      if (!result.success) {
        setError(result.message)
      }
    } catch (error) {
      console.error('Connection test failed:', error)
      setError(error instanceof Error ? error.message : 'Connection test failed')
    } finally {
      setLoading(false)
    }
  }

  const insertSampleData = async () => {
    try {
      setLoading(true)
      await ContentService.insertSampleData()
      setError(null)
      // Reload content after inserting sample data
      await loadContent()
    } catch (error) {
      console.error('Failed to insert sample data:', error)
      setError(error instanceof Error ? error.message : 'Failed to insert sample data')
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(content.map(item => item.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  const getStatusColor = (published: boolean) => {
    return published ? '#10b981' : '#f59e0b'
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#10b981'
    if (score >= 6) return '#f59e0b'
    return '#ef4444'
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '16px',
        color: '#64748b'
      }}>
        Loading content...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#ef4444', marginBottom: '16px' }}>
            ⚠️ Connection Error
          </div>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
            {error}
          </div>
          
          {debugInfo && (
            <div style={{ 
              backgroundColor: '#f8fafc', 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px', 
              padding: '16px', 
              marginBottom: '24px',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Debug Information:</div>
              <pre style={{ fontSize: '12px', color: '#64748b', margin: 0, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
              {debugInfo.suggestion === 'Create table in Supabase SQL editor' && (
                <div style={{ marginTop: '16px' }}>
                  <button
                    onClick={() => {
                      const sql = ContentService.getTableCreationSQL();
                      navigator.clipboard.writeText(sql);
                      alert('SQL copied to clipboard! Paste it in your Supabase SQL editor.');
                    }}
                    style={{
                      backgroundColor: '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    📋 Copy Table Creation SQL
                  </button>
                </div>
              )}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={testConnection}
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
              Test Connection
            </button>
            <button
              onClick={insertSampleData}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Insert Sample Data
            </button>
            <button
              onClick={loadContent}
              style={{
                backgroundColor: '#64748b',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (content.length === 0) {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#64748b', marginBottom: '16px' }}>
            📋 No Content Found
          </div>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
            No content items found. The database might be empty or your filters are too restrictive.
          </div>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={testConnection}
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
              Test Connection
            </button>
            <button
              onClick={insertSampleData}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Add Sample Data
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div style={{
          padding: '16px 24px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '14px', color: '#64748b' }}>
            {selectedIds.size} items selected
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onBulkAction('approve', Array.from(selectedIds))}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Approve Selected
            </button>
            <button
              onClick={() => onBulkAction('reject', Array.from(selectedIds))}
              style={{
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Reject Selected
            </button>
            <button
              onClick={() => onBulkAction('delete', Array.from(selectedIds))}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Table Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '40px 1fr 150px 100px 80px 120px 100px 120px',
        padding: '16px 24px',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        fontSize: '12px',
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase'
      }}>
        <input
          type="checkbox"
          checked={selectedIds.size === content.length && content.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked)}
          style={{ margin: 'auto' }}
        />
        <div>Title</div>
        <div>Source</div>
        <div>Category</div>
        <div>Score</div>
        <div>Date</div>
        <div>Status</div>
        <div>Actions</div>
      </div>

      {/* Table Body */}
      {content.map((item) => (
        <div
          key={item.id}
          style={{
            display: 'grid',
            gridTemplateColumns: '40px 1fr 150px 100px 80px 120px 100px 120px',
            padding: '16px 24px',
            borderBottom: '1px solid #e2e8f0',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f8fafc'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white'
          }}
        >
          <input
            type="checkbox"
            checked={selectedIds.has(item.id)}
            onChange={(e) => {
              e.stopPropagation()
              handleSelectItem(item.id, e.target.checked)
            }}
            style={{ margin: 'auto' }}
          />
          
          <div 
            onClick={() => onItemSelect(item)}
            style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#1e293b',
              cursor: 'pointer',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#3b82f6'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#1e293b'
            }}
          >
            {item.title.length > 60 ? item.title.substring(0, 60) + '...' : item.title}
          </div>
          
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            {item.source_domain}
          </div>
          
          <div style={{ fontSize: '12px' }}>
            <span style={{
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              padding: '4px 8px',
              borderRadius: '4px'
            }}>
              {item.category}
            </span>
          </div>
          
          <div style={{ fontSize: '14px', fontWeight: '600', color: getScoreColor(item.innovation_score) }}>
            {item.innovation_score}/10
          </div>
          
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            {format(new Date(item.scraped_at), 'MMM dd')}
          </div>
          
          <div>
            <span style={{
              backgroundColor: item.published ? '#dcfce7' : '#fef3c7',
              color: item.published ? '#166534' : '#92400e',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {item.published ? 'Published' : 'Pending'}
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onItemSelect(item)
              }}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              View
            </button>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#64748b',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                textDecoration: 'none'
              }}
            >
              Source
            </a>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #e2e8f0'
        }}>
          <span style={{ fontSize: '14px', color: '#64748b' }}>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} results
          </span>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{
                backgroundColor: currentPage === 1 ? '#f1f5f9' : '#3b82f6',
                color: currentPage === 1 ? '#64748b' : 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              Previous
            </button>
            
            <span style={{ 
              padding: '8px 12px', 
              fontSize: '14px', 
              color: '#64748b',
              display: 'flex',
              alignItems: 'center'
            }}>
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{
                backgroundColor: currentPage === totalPages ? '#f1f5f9' : '#3b82f6',
                color: currentPage === totalPages ? '#64748b' : 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
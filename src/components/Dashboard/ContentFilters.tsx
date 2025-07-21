import React, { useState } from 'react'
import { ContentFilters } from '../../types/content'

interface ContentFiltersProps {
  filters: ContentFilters
  onFiltersChange: (filters: ContentFilters) => void
  availableCategories: string[]
  availableSources: string[]
}

export const ContentFiltersComponent: React.FC<ContentFiltersProps> = ({
  filters,
  onFiltersChange,
  availableCategories,
  availableSources
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = (key: keyof ContentFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder="Search content..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 40px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#64748b'
          }}>
            🔍
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '12px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#64748b'
          }}
        >
          {isExpanded ? 'Hide Filters' : 'Show Filters'}
        </button>
        
        <button
          onClick={clearFilters}
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '12px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Clear All
        </button>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {/* Category Filter */}
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => updateFilter('category', e.target.value || undefined)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">All Categories</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Source Filter */}
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
                Source
              </label>
              <select
                value={filters.source_domain || ''}
                onChange={(e) => updateFilter('source_domain', e.target.value || undefined)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">All Sources</option>
                {availableSources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
                Status
              </label>
              <select
                value={filters.status || 'all'}
                onChange={(e) => updateFilter('status', e.target.value as 'all' | 'published' | 'pending')}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Innovation Score Filter */}
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
                Min Innovation Score: {filters.min_innovation_score || 0}
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={filters.min_innovation_score || 0}
                onChange={(e) => updateFilter('min_innovation_score', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '3px',
                  outline: 'none'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          </div>

          {/* Date Range Filter */}
          <div style={{ marginTop: '16px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
              Date Range
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="date"
                value={filters.date_range?.start ? filters.date_range.start.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const start = e.target.value ? new Date(e.target.value) : undefined
                  updateFilter('date_range', start ? { 
                    start, 
                    end: filters.date_range?.end || new Date() 
                  } : undefined)
                }}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              <span style={{ color: '#64748b' }}>to</span>
              <input
                type="date"
                value={filters.date_range?.end ? filters.date_range.end.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const end = e.target.value ? new Date(e.target.value) : undefined
                  updateFilter('date_range', end ? { 
                    start: filters.date_range?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
                    end 
                  } : undefined)
                }}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
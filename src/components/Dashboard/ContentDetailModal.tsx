import React, { useState } from 'react'
import { format } from 'date-fns'
import { AIContentItem } from '../../types/content'
import { ContentService } from '../../services/contentService'

interface ContentDetailModalProps {
  item: AIContentItem | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedItem: AIContentItem) => void
}

export const ContentDetailModal: React.FC<ContentDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedItem, setEditedItem] = useState<Partial<AIContentItem>>({})
  const [loading, setLoading] = useState(false)

  if (!isOpen || !item) return null

  const handleEdit = () => {
    setIsEditing(true)
    setEditedItem({
      category: item.category,
      tags: [...item.tags],
      innovation_score: item.innovation_score,
      publish_score: item.publish_score
    })
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const updatedItem = await ContentService.updateContentItem(item.id, editedItem)
      onUpdate(updatedItem)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating item:', error)
      alert('Failed to update item')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    try {
      setLoading(true)
      const updatedItem = await ContentService.approveContent(item.id)
      onUpdate(updatedItem)
    } catch (error) {
      console.error('Error approving item:', error)
      alert('Failed to approve item')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    try {
      setLoading(true)
      const updatedItem = await ContentService.rejectContent(item.id)
      onUpdate(updatedItem)
    } catch (error) {
      console.error('Error rejecting item:', error)
      alert('Failed to reject item')
    } finally {
      setLoading(false)
    }
  }

  const updateEditedField = (field: keyof AIContentItem, value: any) => {
    setEditedItem(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
            Content Details
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#64748b',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflow: 'auto', flex: 1 }}>
          {/* Title and URL */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>
              {item.title}
            </h3>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#3b82f6',
                textDecoration: 'none',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Open Original Source →
            </a>
          </div>

          {/* Metadata Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {/* Source */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', textTransform: 'uppercase' }}>
                Source Domain
              </label>
              <div style={{ fontSize: '14px', fontWeight: '500', marginTop: '4px' }}>
                {item.source_domain}
              </div>
            </div>

            {/* Category */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', textTransform: 'uppercase' }}>
                Category
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedItem.category || ''}
                  onChange={(e) => updateEditedField('category', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginTop: '4px'
                  }}
                />
              ) : (
                <div style={{ fontSize: '14px', fontWeight: '500', marginTop: '4px' }}>
                  <span style={{
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
                    {item.category}
                  </span>
                </div>
              )}
            </div>

            {/* Difficulty */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', textTransform: 'uppercase' }}>
                Difficulty
              </label>
              <div style={{ fontSize: '14px', fontWeight: '500', marginTop: '4px' }}>
                <span style={{
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  textTransform: 'capitalize'
                }}>
                  {item.difficulty}
                </span>
              </div>
            </div>

            {/* Innovation Score */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', textTransform: 'uppercase' }}>
                Innovation Score
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editedItem.innovation_score || ''}
                  onChange={(e) => updateEditedField('innovation_score', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginTop: '4px'
                  }}
                />
              ) : (
                <div style={{ fontSize: '16px', fontWeight: '600', marginTop: '4px', color: '#10b981' }}>
                  {item.innovation_score}/10
                </div>
              )}
            </div>

            {/* Publish Score */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', textTransform: 'uppercase' }}>
                Publish Score
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editedItem.publish_score || ''}
                  onChange={(e) => updateEditedField('publish_score', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginTop: '4px'
                  }}
                />
              ) : (
                <div style={{ fontSize: '16px', fontWeight: '600', marginTop: '4px', color: '#3b82f6' }}>
                  {item.publish_score}/10
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', textTransform: 'uppercase' }}>
                Status
              </label>
              <div style={{ fontSize: '14px', fontWeight: '500', marginTop: '4px' }}>
                <span style={{
                  backgroundColor: item.published ? '#dcfce7' : '#fef3c7',
                  color: item.published ? '#166534' : '#92400e',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}>
                  {item.published ? 'Published' : 'Pending'}
                </span>
              </div>
            </div>

            {/* Dates */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', textTransform: 'uppercase' }}>
                Scraped At
              </label>
              <div style={{ fontSize: '14px', marginTop: '4px' }}>
                {format(new Date(item.scraped_at), 'MMM dd, yyyy HH:mm')}
              </div>
            </div>

            {item.processed_at && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', textTransform: 'uppercase' }}>
                  Processed At
                </label>
                <div style={{ fontSize: '14px', marginTop: '4px' }}>
                  {format(new Date(item.processed_at), 'MMM dd, yyyy HH:mm')}
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
              Tags
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedItem.tags?.join(', ') || ''}
                onChange={(e) => updateEditedField('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                placeholder="tag1, tag2, tag3"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {item.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      backgroundColor: '#f1f5f9',
                      color: '#64748b',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
              Summary
            </label>
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#374151'
            }}>
              {item.summary}
            </div>
          </div>

          {/* Content Snippet */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
              Content Preview
            </label>
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#374151',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              {item.content_snippet}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '24px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                disabled={loading}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Edit
              </button>
            )}
          </div>

          {!isEditing && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {!item.published ? (
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  {loading ? 'Processing...' : 'Approve'}
                </button>
              ) : (
                <button
                  onClick={handleReject}
                  disabled={loading}
                  style={{
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  {loading ? 'Processing...' : 'Unpublish'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
import React, { useState } from 'react'
import { ArticleEditor } from './ArticleEditor'
import { ArticleService } from '../../services/articleService'
import { Article } from '../../types/content'
import { MarkdownParser } from '../../utils/MarkdownParser'

interface ArticleCreatorProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (article: Article) => void
  highlightImport?: boolean
}

export const ArticleCreator: React.FC<ArticleCreatorProps> = ({
  isOpen,
  onClose,
  onSuccess,
  highlightImport = false
}) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [author, setAuthor] = useState('Ofir Wienerman')
  const [contentType, setContentType] = useState<'article' | 'guide' | 'tool-review'>('article')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [youtubeVideoId, setYoutubeVideoId] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [featured, setFeatured] = useState(false)
  const [saving, setSaving] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showMarkdownImport, setShowMarkdownImport] = useState(false)
  const [markdownFile, setMarkdownFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<any>(null)

  const handleYouTubeUrl = (url: string) => {
    const videoId = ArticleService.extractYouTubeId(url)
    setYoutubeVideoId(videoId || '')
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB')
        return
      }

      setImageFile(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      // Clear URL field when file is selected
      setFeaturedImage('')
    }
  }

  const handleImageUrlChange = (url: string) => {
    setFeaturedImage(url)
    if (url) {
      // Clear file upload when URL is entered
      setImageFile(null)
      setImagePreview('')
    }
  }

  const handleMarkdownUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.md')) {
        setError('Please select a valid markdown file (.md)')
        return
      }
      setMarkdownFile(file)
      parseMarkdownFile(file)
    }
  }

  const parseMarkdownFile = async (file: File) => {
    try {
      const content = await file.text()
      const validation = MarkdownParser.validateMarkdown(content)
      
      if (!validation.valid) {
        setError('Invalid markdown file: ' + validation.errors.join(', '))
        return
      }
      
      const parsed = MarkdownParser.parseMarkdown(content)
      setParsedData(parsed)
      setShowMarkdownImport(true)
      setError(null)
    } catch (err) {
      setError('Failed to parse markdown file')
      console.error('Markdown parsing error:', err)
    }
  }

  const importMarkdownData = () => {
    if (!parsedData) return
    
    // Populate form fields
    setTitle(parsedData.title)
    setContent(parsedData.content)
    setExcerpt(parsedData.excerpt)
    setContentType(parsedData.contentType)
    setAuthor('Ofir Wienerman') // Set default author
    
    // Set first YouTube video if found
    if (parsedData.youtubeVideoIds.length > 0) {
      setYoutubeVideoId(parsedData.youtubeVideoIds[0])
    }
    
    // Close import modal and show success message
    setShowMarkdownImport(false)
    setParsedData(null)
    setMarkdownFile(null)
    
    // Clear any errors and show success
    setError(null)
    setSuccessMessage('✅ Content imported successfully! Review and edit the fields below before publishing.')
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage(null)
    }, 5000)
  }

  const cancelMarkdownImport = () => {
    setShowMarkdownImport(false)
    setParsedData(null)
    setMarkdownFile(null)
  }

  const handleSave = async (status: 'draft' | 'published') => {
    if (!title.trim() || !content.trim() || !author.trim()) {
      setError('Title, content, and author are required')
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccessMessage(null)
      
      // Quick connection test before proceeding
      console.log('🔍 Testing connection before save...')
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your connection and try again.')
      }

      // Auto-generate excerpt if not provided
      const finalExcerpt = excerpt.trim() || ArticleService.generateExcerpt(content, 200)

      // Parse tags
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)

      const articleData = {
        title: title.trim(),
        slug: '', // Will be auto-generated by database trigger
        content: content.trim(),
        excerpt: finalExcerpt,
        featured_image: featuredImage.trim() || undefined,
        youtube_video_id: youtubeVideoId.trim() || undefined,
        author: author.trim(),
        category: contentType,
        tags: tagArray.length > 0 ? tagArray : undefined,
        status,
        featured,
        published_at: status === 'published' ? new Date().toISOString() : undefined
      }

      // ArticleService now handles timeouts internally
      const article = await ArticleService.createArticle(articleData)
      
      // Reset retry count on success
      setRetryCount(0)
      
      onSuccess(article as any)
      handleClose()
    } catch (err) {
      console.error('Error saving article:', err)
      
      // Error handling
      
      // Provide specific error messages
      let errorMessage = 'Failed to save article'
      
      if (err instanceof Error) {
        if (err.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please check your internet connection and try again.'
        } else if (err.message.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection.'
        } else if (err.message.includes('duplicate')) {
          errorMessage = 'An article with this title already exists. Please choose a different title.'
        } else if (err.message.includes('permission')) {
          errorMessage = 'You do not have permission to publish articles. Please contact support.'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      
      // Show retry option for network errors
      if (err instanceof Error && (err.message.includes('timeout') || err.message.includes('network'))) {
        setTimeout(() => {
          if (retryCount < 2) {
            setRetryCount(prev => prev + 1)
          }
        }, 2000)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleRetry = async (status: 'draft' | 'published') => {
    console.log(`Retrying article save (attempt ${retryCount + 1})...`)
    await handleSave(status)
  }

  const handleClose = () => {
    // Reset form
    setTitle('')
    setContent('')
    setExcerpt('')
    setAuthor('')
    setContentType('article')
    setCategory('')
    setTags('')
    setYoutubeVideoId('')
    setFeaturedImage('')
    setImageFile(null)
    setImagePreview('')
    setFeatured(false)
    setError(null)
    setSuccessMessage(null)
    setRetryCount(0)
    setShowMarkdownImport(false)
    setParsedData(null)
    setMarkdownFile(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      zIndex: 1000,
      overflowY: 'auto',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          zIndex: 1
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            margin: 0
          }}>
            Create New Article
          </h2>
          <button
            onClick={handleClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#64748b',
              padding: '4px',
              borderRadius: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              {error}
            </div>
          )}

          {successMessage && (
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '16px' }}>✅</span>
              {successMessage}
            </div>
          )}

          {/* Markdown Import Section */}
          <div style={{
            marginBottom: '24px',
            padding: '20px',
            backgroundColor: highlightImport ? '#eff6ff' : '#f8fafc',
            border: highlightImport ? '2px solid #3b82f6' : '2px dashed #cbd5e1',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: highlightImport ? '0 4px 12px rgba(59, 130, 246, 0.15)' : 'none',
            animation: highlightImport ? 'pulse 2s ease-in-out' : 'none'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
              color: highlightImport ? '#1e40af' : '#334155'
            }}>
              📄 Import from Markdown {highlightImport && '✨'}
            </h3>
            <p style={{
              color: highlightImport ? '#1e40af' : '#64748b',
              fontSize: '14px',
              marginBottom: '16px',
              lineHeight: '1.5',
              fontWeight: highlightImport ? '500' : 'normal'
            }}>
              {highlightImport 
                ? 'Transform your AI-generated content into articles instantly! Upload your .md file below.'
                : 'Upload a markdown file (.md) to automatically fill article fields'
              }
            </p>
            <label style={{
              display: 'inline-block',
              padding: highlightImport ? '14px 28px' : '12px 24px',
              backgroundColor: highlightImport ? '#1d4ed8' : '#3b82f6',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: highlightImport ? '16px' : '14px',
              fontWeight: highlightImport ? '600' : '500',
              transition: 'all 0.2s',
              boxShadow: highlightImport ? '0 4px 12px rgba(29, 78, 216, 0.3)' : 'none',
              transform: highlightImport ? 'translateY(-1px)' : 'none'
            }}>
              📁 Choose Markdown File
              <input
                type="file"
                accept=".md"
                onChange={handleMarkdownUpload}
                style={{ display: 'none' }}
              />
            </label>
            {markdownFile && (
              <div style={{
                marginTop: '12px',
                fontSize: '14px',
                color: '#10b981',
                fontWeight: '500'
              }}>
                ✓ {markdownFile.name} loaded
              </div>
            )}
          </div>

          {/* Article Details */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {/* Title */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
              />
            </div>

            {/* Author */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Author *
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Your name"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Content Type */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Content Type *
              </label>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="contentType"
                    value="article"
                    checked={contentType === 'article'}
                    onChange={(e) => setContentType(e.target.value as 'article')}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ fontSize: '18px', marginRight: '4px' }}>📄</span>
                  Article
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="contentType"
                    value="guide"
                    checked={contentType === 'guide'}
                    onChange={(e) => setContentType(e.target.value as 'guide')}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ fontSize: '18px', marginRight: '4px' }}>📖</span>
                  Guide
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="contentType"
                    value="tool-review"
                    checked={contentType === 'tool-review'}
                    onChange={(e) => setContentType(e.target.value as 'tool-review')}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ fontSize: '18px', marginRight: '4px' }}>🔧</span>
                  Tool Review
                </label>
              </div>
            </div>

            {/* Category */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. AI, Technology, Tutorial"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Tags */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Separate tags with commas: AI, machine learning, tutorial"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* YouTube Video */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Main YouTube Video
              </label>
              <input
                type="text"
                onChange={(e) => handleYouTubeUrl(e.target.value)}
                placeholder="Paste YouTube URL for main video"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              {youtubeVideoId && (
                <div style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#10b981'
                }}>
                  ✓ Video ID extracted: {youtubeVideoId}
                </div>
              )}
            </div>

            {/* Featured Image */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Featured Image
              </label>
              
              {/* Image Upload */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'inline-block',
                  padding: '12px 20px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  📁 Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                <span style={{ marginLeft: '12px', fontSize: '12px', color: '#6b7280' }}>
                  or enter URL below (Max 5MB)
                </span>
              </div>

              {/* URL Input */}
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginBottom: imagePreview || featuredImage ? '16px' : '0'
                }}
              />

              {/* Image Preview */}
              {(imagePreview || featuredImage) && (
                <div style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px',
                  backgroundColor: '#f8fafc'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                    Preview:
                  </div>
                  <img
                    src={imagePreview || featuredImage}
                    alt="Featured image preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      borderRadius: '6px',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                      setError('Invalid image URL')
                    }}
                  />
                  <div style={{ marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview('')
                        setFeaturedImage('')
                      }}
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Remove Image
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Excerpt */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Excerpt (Optional)
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief summary for article preview (auto-generated if left empty)"
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Featured Toggle */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  Feature on home page
                </span>
              </label>
            </div>
          </div>

          {/* Content Editor */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              Content *
            </label>
            <ArticleEditor
              content={content}
              onChange={setContent}
              placeholder="Write your article content here. Use the toolbar to format text and embed YouTube videos."
            />
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #e2e8f0'
          }}>
            <button
              onClick={handleClose}
              disabled={saving}
              style={{
                backgroundColor: 'transparent',
                color: saving ? '#ef4444' : '#64748b',
                border: saving ? '1px solid #ef4444' : '1px solid #d1d5db',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: saving ? 'pointer' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: 1
              }}
            >
              {saving ? 'Force Cancel' : 'Cancel'}
            </button>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {/* 11 Test Buttons */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(num => (
                <button
                  key={num}
                  onClick={async () => {
                    try {
                      setSaving(true)
                      setError(null)
                      console.log(`🧪${num} Running test ${num}...`)
                      const testArticle = await (ArticleService as any)[`createTestArticle${num}`]()
                      setSuccessMessage(`✅ Test ${num} successful! Article ID: ${testArticle.id}`)
                      setTimeout(() => setSuccessMessage(null), 5000)
                    } catch (err) {
                      console.error(`🚨 Test ${num} failed:`, err)
                      setError(`Test ${num} failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
                    } finally {
                      setSaving(false)
                    }
                  }}
                  disabled={saving}
                  style={{
                    backgroundColor: ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#a855f7', '#ef4444'][num - 1],
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontSize: '11px',
                    fontWeight: '500',
                    opacity: saving ? 0.5 : 1
                  }}
                >
                  🧪{num}
                </button>
              ))}

              <button
                onClick={() => handleSave('draft')}
                disabled={saving || !title.trim() || !content.trim() || !author.trim()}
                style={{
                  backgroundColor: saving ? '#9ca3af' : '#64748b',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: saving || !title.trim() || !content.trim() || !author.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: saving || !title.trim() || !content.trim() || !author.trim() ? 0.5 : 1
                }}
              >
                {saving ? 'Saving...' : retryCount > 0 ? 'Retry Save Draft' : 'Save as Draft'}
              </button>

              <button
                onClick={() => handleSave('published')}
                disabled={saving || !title.trim() || !content.trim() || !author.trim()}
                style={{
                  backgroundColor: saving ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: saving || !title.trim() || !content.trim() || !author.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: saving || !title.trim() || !content.trim() || !author.trim() ? 0.5 : 1
                }}
              >
                {saving ? 'Publishing...' : retryCount > 0 ? 'Retry Publish' : 'Publish Article'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Markdown Import Preview Modal */}
      {showMarkdownImport && parsedData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px 32px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                margin: 0,
                color: '#1f2937'
              }}>
                📄 Preview Markdown Import
              </h3>
              <button
                onClick={cancelMarkdownImport}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '32px' }}>
              <div style={{
                display: 'grid',
                gap: '20px',
                marginBottom: '32px'
              }}>
                {/* Title Preview */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#374151'
                  }}>
                    Title
                  </label>
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    {parsedData.title}
                  </div>
                </div>

                {/* Content Type Preview */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#374151'
                  }}>
                    Detected Content Type
                  </label>
                  <div style={{
                    padding: '8px 16px',
                    backgroundColor: parsedData.contentType === 'article' ? '#eff6ff' : 
                                    parsedData.contentType === 'guide' ? '#f3e8ff' : '#ecfdf5',
                    border: '1px solid ' + (parsedData.contentType === 'article' ? '#bfdbfe' : 
                                           parsedData.contentType === 'guide' ? '#d8b4fe' : '#bbf7d0'),
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: parsedData.contentType === 'article' ? '#1e40af' : 
                           parsedData.contentType === 'guide' ? '#7c3aed' : '#166534',
                    textTransform: 'capitalize',
                    width: 'fit-content'
                  }}>
                    {parsedData.contentType === 'tool-review' ? 'Tool Review' : parsedData.contentType}
                  </div>
                </div>

                {/* Excerpt Preview */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#374151'
                  }}>
                    Auto-generated Excerpt
                  </label>
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    color: '#6b7280'
                  }}>
                    {parsedData.excerpt}
                  </div>
                </div>

                {/* YouTube Videos Found */}
                {parsedData.youtubeVideoIds.length > 0 && (
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#374151'
                    }}>
                      YouTube Videos Found ({parsedData.youtubeVideoIds.length})
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {parsedData.youtubeVideoIds.map((videoId: string, index: number) => (
                        <div key={videoId} style={{
                          padding: '8px 12px',
                          backgroundColor: '#fef3c7',
                          border: '1px solid #fbbf24',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          color: '#92400e'
                        }}>
                          {index === 0 ? '★ ' : ''}{videoId} {index === 0 ? '(will be set as main video)' : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Estimated Read Time */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#374151'
                  }}>
                    Estimated Read Time
                  </label>
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #7dd3fc',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#0c4a6e',
                    width: 'fit-content'
                  }}>
                    {parsedData.estimatedReadTime}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '24px',
                borderTop: '1px solid #e2e8f0'
              }}>
                <button
                  onClick={cancelMarkdownImport}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#64748b',
                    border: '1px solid #d1d5db',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={importMarkdownData}
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
                  ✓ Import Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
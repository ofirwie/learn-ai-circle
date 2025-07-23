import { ArticleService } from '../services/articleService'

export interface ParsedMarkdown {
  title: string
  content: string
  excerpt: string
  youtubeVideoIds: string[]
  contentType: 'article' | 'guide' | 'tool-review'
  estimatedReadTime: string
  metadata?: {
    author?: string
    category?: string
    tags?: string[]
  }
}

export class MarkdownParser {
  /**
   * Parse a markdown file and extract article data
   */
  static parseMarkdown(markdownContent: string): ParsedMarkdown {
    const lines = markdownContent.split('\n')
    let title = ''
    let content = markdownContent
    let excerpt = ''
    const youtubeVideoIds: string[] = []
    
    // Extract title from first H1
    for (const line of lines) {
      const trimmedLine = line.trim()
      if (trimmedLine.startsWith('# ')) {
        title = trimmedLine.substring(2).trim()
        break
      }
    }
    
    // Extract YouTube video IDs from multiple formats
    const patterns = [
      /<iframe[^>]*src="https:\/\/www\.youtube\.com\/embed\/([^"?]+)"/g, // iframe embeds
      /https:\/\/www\.youtube\.com\/embed\/([^?\s"]+)/g, // direct embed URLs
      /https:\/\/www\.youtube\.com\/watch\?v=([^&\s"]+)/g, // watch URLs
      /https:\/\/youtu\.be\/([^?\s"]+)/g // short URLs
    ]
    
    for (const pattern of patterns) {
      let match
      while ((match = pattern.exec(markdownContent)) !== null) {
        if (match[1] && !youtubeVideoIds.includes(match[1])) {
          youtubeVideoIds.push(match[1])
        }
      }
    }
    
    // Generate excerpt from first paragraph after title
    excerpt = this.generateExcerpt(markdownContent)
    
    // Detect content type
    const contentType = this.detectContentType(markdownContent, title)
    
    // Estimate read time
    const estimatedReadTime = this.estimateReadTime(markdownContent)
    
    return {
      title: title || 'Untitled Article',
      content,
      excerpt,
      youtubeVideoIds,
      contentType,
      estimatedReadTime
    }
  }
  
  /**
   * Generate excerpt from markdown content
   */
  private static generateExcerpt(content: string, maxLength: number = 200): string {
    // Remove title (first H1)
    const lines = content.split('\n')
    let contentWithoutTitle = ''
    let foundTitle = false
    
    for (const line of lines) {
      if (!foundTitle && line.trim().startsWith('# ')) {
        foundTitle = true
        continue
      }
      if (foundTitle) {
        contentWithoutTitle += line + '\n'
      }
    }
    
    // Remove markdown syntax and HTML tags
    let plainText = contentWithoutTitle
      .replace(/#{1,6}\s/g, '') // Headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1') // Italic
      .replace(/`(.*?)`/g, '$1') // Inline code
      .replace(/```[\s\S]*?```/g, '') // Code blocks
      .replace(/<[^>]*>/g, '') // HTML tags
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Images
      .replace(/\n{2,}/g, ' ') // Multiple newlines
      .replace(/\n/g, ' ') // Single newlines
      .trim()
    
    // Find first meaningful paragraph
    const sentences = plainText.split('. ')
    let excerpt = ''
    
    for (const sentence of sentences) {
      if (sentence.trim().length > 20) { // Skip very short sentences
        excerpt = sentence.trim()
        if (!excerpt.endsWith('.')) {
          excerpt += '.'
        }
        break
      }
    }
    
    // Fallback to ArticleService method if no good sentence found
    if (!excerpt || excerpt.length < 50) {
      return ArticleService.generateExcerpt(plainText, maxLength)
    }
    
    // Truncate if too long
    if (excerpt.length > maxLength) {
      const words = excerpt.split(' ')
      let truncated = ''
      for (const word of words) {
        if ((truncated + word).length > maxLength - 3) break
        truncated += (truncated ? ' ' : '') + word
      }
      excerpt = truncated + '...'
    }
    
    return excerpt
  }
  
  /**
   * Detect content type based on content analysis
   */
  private static detectContentType(content: string, title: string): 'article' | 'guide' | 'tool-review' {
    const lowerContent = (content + ' ' + title).toLowerCase()
    
    // Guide indicators
    const guideKeywords = [
      'step-by-step', 'how to', 'guide', 'tutorial', 'instructions',
      'getting started', 'beginner', 'learn', 'master', 'complete guide',
      'walkthrough', 'setup', 'install', 'configure', 'implement',
      'step 1', 'step 2', 'first,', 'next,', 'then,', 'finally,'
    ]
    
    // Tool review indicators
    const toolReviewKeywords = [
      'review', 'comparison', 'vs', 'features', 'pricing', 'pros and cons',
      'advantages', 'disadvantages', 'tool', 'software', 'platform',
      'best', 'top', 'recommended', 'alternative', 'competitor',
      'overview', 'analysis', 'evaluation', 'assessment', 'ai tool',
      'essential tool', 'use cases', 'capabilities', 'functionality'
    ]
    
    let guideScore = 0
    let toolReviewScore = 0
    
    // Count keyword matches
    guideKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        guideScore += keyword.includes('step') ? 2 : 1
      }
    })
    
    toolReviewKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        toolReviewScore += keyword.includes('review') || keyword.includes('comparison') ? 2 : 1
      }
    })
    
    // Check for numbered lists (guide indicator)
    const numberedListRegex = /^\d+\.\s/gm
    const numberedLists = content.match(numberedListRegex)
    if (numberedLists && numberedLists.length >= 3) {
      guideScore += 2
    }
    
    // Check for feature lists (tool review indicator)
    const bulletListRegex = /^[-*]\s/gm
    const bulletLists = content.match(bulletListRegex)
    if (bulletLists && bulletLists.length >= 5) {
      toolReviewScore += 1
    }
    
    // Determine type based on scores
    if (guideScore > toolReviewScore && guideScore >= 2) {
      return 'guide'
    }
    if (toolReviewScore > guideScore && toolReviewScore >= 2) {
      return 'tool-review'
    }
    
    // Default to article
    return 'article'
  }
  
  /**
   * Estimate reading time based on word count
   */
  private static estimateReadTime(content: string): string {
    // Remove markdown syntax for accurate word count
    const plainText = content
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    
    const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length
    const wordsPerMinute = 200 // Average reading speed
    const minutes = Math.ceil(wordCount / wordsPerMinute)
    
    return `${minutes} min read`
  }
  
  /**
   * Validate markdown file content
   */
  static validateMarkdown(content: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!content || content.trim().length === 0) {
      errors.push('File is empty')
      return { valid: false, errors }
    }
    
    if (content.length < 100) {
      errors.push('Content is too short (minimum 100 characters)')
    }
    
    // Check for title
    const hasTitle = /^#\s.+/m.test(content)
    if (!hasTitle) {
      errors.push('No title found (H1 heading required)')
    }
    
    // Check for basic content structure
    const lineCount = content.split('\n').filter(line => line.trim().length > 0).length
    if (lineCount < 5) {
      errors.push('Content appears to be too minimal')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
  
  /**
   * Extract metadata from markdown frontmatter (if present)
   */
  private static extractMetadata(content: string): ParsedMarkdown['metadata'] {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/
    const match = content.match(frontmatterRegex)
    
    if (!match) return undefined
    
    const frontmatter = match[1]
    const metadata: ParsedMarkdown['metadata'] = {}
    
    // Simple YAML parsing for common fields
    const authorMatch = frontmatter.match(/author:\s*(.+)/i)
    if (authorMatch) metadata.author = authorMatch[1].trim()
    
    const categoryMatch = frontmatter.match(/category:\s*(.+)/i)
    if (categoryMatch) metadata.category = categoryMatch[1].trim()
    
    const tagsMatch = frontmatter.match(/tags:\s*\[(.+)\]/i)
    if (tagsMatch) {
      metadata.tags = tagsMatch[1].split(',').map(tag => tag.trim().replace(/['"]/g, ''))
    }
    
    return metadata
  }
}
import Papa from 'papaparse'
import { AIContentItem, ContentFilters } from '../types/content'
import { ContentService } from '../services/contentService'

export class ExportUtils {
  static async exportToJSON(filters: ContentFilters = {}): Promise<void> {
    try {
      const data = await ContentService.exportContent(filters)
      const jsonString = JSON.stringify(data, null, 2)
      
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `ai-content-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting to JSON:', error)
      throw new Error('Failed to export content to JSON')
    }
  }

  static async exportToCSV(filters: ContentFilters = {}): Promise<void> {
    try {
      const data = await ContentService.exportContent(filters)
      
      // Prepare data for CSV (flatten arrays and objects)
      const csvData = data.map(item => ({
        id: item.id,
        title: item.title,
        url: item.url,
        summary: item.summary,
        source_domain: item.source_domain,
        category: item.category,
        difficulty: item.difficulty,
        tags: item.tags.join(', '),
        innovation_score: item.innovation_score,
        publish_score: item.publish_score,
        scraped_at: item.scraped_at,
        processed_at: item.processed_at || '',
        published: item.published ? 'Yes' : 'No',
        content_snippet: item.content_snippet.replace(/\n/g, ' ').substring(0, 500) // Limit length for CSV
      }))
      
      const csv = Papa.unparse(csvData)
      
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `ai-content-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting to CSV:', error)
      throw new Error('Failed to export content to CSV')
    }
  }

  static async exportApprovedContent(): Promise<void> {
    const filters: ContentFilters = { status: 'published' }
    await this.exportToJSON(filters)
  }

  static async exportPendingContent(): Promise<void> {
    const filters: ContentFilters = { status: 'pending' }
    await this.exportToJSON(filters)
  }

  static formatForAutomation(items: AIContentItem[]): object[] {
    return items.map(item => ({
      id: item.id,
      title: item.title,
      url: item.url,
      summary: item.summary,
      source: item.source_domain,
      category: item.category,
      tags: item.tags,
      scores: {
        innovation: item.innovation_score,
        publish: item.publish_score
      },
      metadata: {
        difficulty: item.difficulty,
        scraped_at: item.scraped_at,
        processed_at: item.processed_at
      },
      content: {
        snippet: item.content_snippet,
        full_url: item.url
      }
    }))
  }

  static async exportForAutomation(filters: ContentFilters = {}): Promise<void> {
    try {
      const data = await ContentService.exportContent(filters)
      const automationFormat = this.formatForAutomation(data)
      
      const jsonString = JSON.stringify({
        exported_at: new Date().toISOString(),
        total_items: automationFormat.length,
        filters_applied: filters,
        data: automationFormat
      }, null, 2)
      
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `ai-content-automation-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting for automation:', error)
      throw new Error('Failed to export content for automation')
    }
  }
}
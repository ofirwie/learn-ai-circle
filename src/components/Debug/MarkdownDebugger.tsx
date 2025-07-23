import React, { useState } from 'react'
import { MarkdownParser } from '../../utils/MarkdownParser'

interface DebugStep {
  step: string
  description: string
  content: string
  h3Patterns: string[]
  h3Tags: string[]
}

export const MarkdownDebugger: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [debugResult, setDebugResult] = useState<DebugStep[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      console.log('File selected:', selectedFile.name, selectedFile.type)
      setFile(selectedFile)
      setDebugResult([]) // Clear previous results
      processFile(selectedFile)
    }
  }

  const processFile = async (file: File) => {
    console.log('Starting to process file:', file.name)
    setIsProcessing(true)
    const steps: DebugStep[] = []

    try {
      // Step 1: Raw file content
      console.log('Reading file content...')
      const rawContent = await file.text()
      console.log('File content length:', rawContent.length)
      console.log('Raw content preview:', rawContent.substring(0, 200))
      
      steps.push({
        step: '1. Raw File Content',
        description: `Original markdown file content (${rawContent.length} chars)`,
        content: rawContent.length > 500 ? rawContent.substring(0, 500) + '...' : rawContent,
        h3Patterns: rawContent.match(/^###\s.*$/gm) || [],
        h3Tags: rawContent.match(/<h3>.*?<\/h3>/g) || []
      })

      console.log('Step 1 complete, found h3 patterns:', steps[0].h3Patterns.length)

      // Step 2: After MarkdownParser
      console.log('Running MarkdownParser...')
      const parsed = MarkdownParser.parseMarkdown(rawContent)
      console.log('Parsed content length:', parsed.content.length)
      
      steps.push({
        step: '2. After MarkdownParser.parseMarkdown()',
        description: `Content after markdown parsing (title removed) - ${parsed.content.length} chars`,
        content: parsed.content.length > 500 ? parsed.content.substring(0, 500) + '...' : parsed.content,
        h3Patterns: parsed.content.match(/^###\s.*$/gm) || [],
        h3Tags: parsed.content.match(/<h3>.*?<\/h3>/g) || []
      })

      console.log('Step 2 complete, h3 patterns:', steps[1].h3Patterns.length)

      // Step 3: Simulate ArticleViewer processing
      let processed = parsed.content

      // Clean up artifacts
      processed = processed
        .replace(/^---+\s*/gm, '')
        .replace(/\s*---+\s*$/gm, '')
        .replace(/^\s*---+\s*$/gm, '<hr>')

      steps.push({
        step: '3. After cleanup',
        description: 'After removing dashes and artifacts',
        content: processed.length > 500 ? processed.substring(0, 500) + '...' : processed,
        h3Patterns: processed.match(/^###\s.*$/gm) || [],
        h3Tags: processed.match(/<h3>.*?<\/h3>/g) || []
      })

      // Header processing - THE KEY STEP
      console.log('Processing headers...')
      const beforeHeaders = processed
      processed = processed
        .replace(/^#{6}\s*(.*)$/gm, '<h6>$1</h6>')
        .replace(/^#{5}\s*(.*)$/gm, '<h5>$1</h5>')
        .replace(/^#{4}\s*(.*)$/gm, '<h4>$1</h4>')
        .replace(/^#{3}\s*(.*)$/gm, '<h3>$1</h3>')
        .replace(/^#{2}\s*(.*)$/gm, '<h2>$1</h2>')
        .replace(/^#{1}\s+(.*)$/gm, '<h1>$1</h1>')

      console.log('Header processing done. Before/after equal?', beforeHeaders === processed)

      steps.push({
        step: '4. After header processing ⭐ KEY STEP',
        description: 'After converting ### to <h3> tags - this should show h3 tags!',
        content: processed.length > 500 ? processed.substring(0, 500) + '...' : processed,
        h3Patterns: processed.match(/^###\s.*$/gm) || [],
        h3Tags: processed.match(/<h3>.*?<\/h3>/g) || []
      })

      console.log('Step 4 complete, h3 tags found:', steps[3].h3Tags.length)

      // Text formatting
      processed = processed
        .replace(/~~([^~]+)~~/g, '<del>$1</del>')
        .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
        .replace(/__([^_\n]+)__/g, '<strong>$1</strong>')
        .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
        .replace(/(?<!_)_([^_\n]+)_(?!_)/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')

      steps.push({
        step: '5. Final result',
        description: 'After all text formatting',
        content: processed.length > 500 ? processed.substring(0, 500) + '...' : processed,
        h3Patterns: processed.match(/^###\s.*$/gm) || [],
        h3Tags: processed.match(/<h3>.*?<\/h3>/g) || []
      })

      console.log('All steps complete, setting results...')
      setDebugResult(steps)
      console.log('Results set, steps count:', steps.length)
      
    } catch (error) {
      console.error('Debug processing error:', error)
      setDebugResult([{
        step: 'ERROR',
        description: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        content: 'Error occurred during processing',
        h3Patterns: [],
        h3Tags: []
      }])
    } finally {
      console.log('Processing finished')
      setIsProcessing(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      zIndex: 9999,
      padding: '20px',
      overflow: 'auto'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{ margin: '0 0 24px 0', color: '#1e293b' }}>
          Markdown Processing Debugger
        </h2>

        <div style={{ marginBottom: '24px' }}>
          <input
            type="file"
            accept=".md"
            onChange={handleFileUpload}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
          />
          {isProcessing && <span style={{ marginLeft: '12px', color: '#6b7280' }}>Processing...</span>}
        </div>

        {debugResult.map((step, index) => (
          <div key={index} style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            marginBottom: '16px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#f9fafb',
              padding: '12px 16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#374151' }}>
                {step.step}
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                {step.description}
              </p>
            </div>
            
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#374151' }}>
                    Content Preview:
                  </h4>
                  <pre style={{
                    background: '#f3f4f6',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    overflow: 'auto',
                    margin: 0
                  }}>
                    {step.content}
                  </pre>
                </div>
                
                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#374151' }}>
                      ### Patterns Found: {step.h3Patterns.length}
                    </h4>
                    {step.h3Patterns.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {step.h3Patterns.map((pattern, i) => (
                          <li key={i} style={{ fontSize: '12px', color: '#dc2626' }}>
                            {pattern}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#16a34a' }}>None (Good!)</span>
                    )}
                  </div>
                  
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#374151' }}>
                      &lt;h3&gt; Tags Found: {step.h3Tags.length}
                    </h4>
                    {step.h3Tags.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {step.h3Tags.map((tag, i) => (
                          <li key={i} style={{ fontSize: '12px', color: '#16a34a' }}>
                            {tag}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#dc2626' }}>None (Problem!)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
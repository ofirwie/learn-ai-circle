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
      setFile(selectedFile)
      processFile(selectedFile)
    }
  }

  const processFile = async (file: File) => {
    setIsProcessing(true)
    const steps: DebugStep[] = []

    try {
      // Step 1: Raw file content
      const rawContent = await file.text()
      steps.push({
        step: '1. Raw File Content',
        description: 'Original markdown file content',
        content: rawContent.substring(0, 500) + '...',
        h3Patterns: rawContent.match(/^###\s.*$/gm) || [],
        h3Tags: rawContent.match(/<h3>.*?<\/h3>/g) || []
      })

      // Step 2: After MarkdownParser
      const parsed = MarkdownParser.parseMarkdown(rawContent)
      steps.push({
        step: '2. After MarkdownParser.parseMarkdown()',
        description: 'Content after markdown parsing (title removed)',
        content: parsed.content.substring(0, 500) + '...',
        h3Patterns: parsed.content.match(/^###\s.*$/gm) || [],
        h3Tags: parsed.content.match(/<h3>.*?<\/h3>/g) || []
      })

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
        content: processed.substring(0, 500) + '...',
        h3Patterns: processed.match(/^###\s.*$/gm) || [],
        h3Tags: processed.match(/<h3>.*?<\/h3>/g) || []
      })

      // Header processing
      processed = processed
        .replace(/^#{6}\s*(.*)$/gm, '<h6>$1</h6>')
        .replace(/^#{5}\s*(.*)$/gm, '<h5>$1</h5>')
        .replace(/^#{4}\s*(.*)$/gm, '<h4>$1</h4>')
        .replace(/^#{3}\s*(.*)$/gm, '<h3>$1</h3>')
        .replace(/^#{2}\s*(.*)$/gm, '<h2>$1</h2>')
        .replace(/^#{1}\s+(.*)$/gm, '<h1>$1</h1>')

      steps.push({
        step: '4. After header processing',
        description: 'After converting ### to <h3> tags',
        content: processed.substring(0, 500) + '...',
        h3Patterns: processed.match(/^###\s.*$/gm) || [],
        h3Tags: processed.match(/<h3>.*?<\/h3>/g) || []
      })

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
        content: processed.substring(0, 500) + '...',
        h3Patterns: processed.match(/^###\s.*$/gm) || [],
        h3Tags: processed.match(/<h3>.*?<\/h3>/g) || []
      })

      setDebugResult(steps)
    } catch (error) {
      console.error('Debug processing error:', error)
    } finally {
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
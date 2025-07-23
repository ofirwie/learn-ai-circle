import React, { useState } from 'react'

interface VideoEmbedDebuggerProps {
  isOpen: boolean
  onClose: () => void
}

export const VideoEmbedDebugger: React.FC<VideoEmbedDebuggerProps> = ({
  isOpen,
  onClose
}) => {
  const [testUrl, setTestUrl] = useState('')
  const [testResults, setTestResults] = useState<any[]>([])
  const [currentTest, setCurrentTest] = useState<string | null>(null)

  // Test URLs from your articles
  const sampleUrls = [
    'https://www.youtube.com/watch?v=1YtB1yrKvXM',
    'https://www.youtube.com/watch?v=gmJeo_1lI6g', 
    'https://www.youtube.com/watch?v=V9TGgD03nQI',
    'https://www.youtube.com/watch?v=CB_2FWwSU0Y',
    'https://www.youtube.com/watch?v=YhTgj7_cuJM',
    'https://www.youtube.com/watch?v=0vmp4N2Tce0'
  ]

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^?]+)/
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    return null
  }

  const testVideoUrl = async (url: string) => {
    const testId = Date.now().toString()
    setCurrentTest(testId)
    
    console.log(`🧪 Testing video URL: ${url}`)
    
    const result = {
      id: testId,
      originalUrl: url,
      timestamp: new Date().toISOString(),
      steps: [] as any[]
    }

    try {
      // Step 1: Extract video ID
      const videoId = extractVideoId(url)
      result.steps.push({
        step: 'Extract Video ID',
        success: !!videoId,
        result: videoId,
        details: videoId ? `Extracted ID: ${videoId}` : 'Failed to extract video ID'
      })

      if (!videoId) {
        throw new Error('Could not extract video ID from URL')
      }

      // Step 2: Test YouTube thumbnail
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      const thumbnailTest = await fetch(thumbnailUrl, { method: 'HEAD' })
      result.steps.push({
        step: 'Thumbnail Test',
        success: thumbnailTest.ok,
        result: thumbnailUrl,
        details: `Status: ${thumbnailTest.status} ${thumbnailTest.statusText}`
      })

      // Step 3: Test embed URL
      const embedUrl = `https://www.youtube.com/embed/${videoId}`
      const embedTest = await fetch(embedUrl, { method: 'HEAD' })
      result.steps.push({
        step: 'Embed URL Test',
        success: embedTest.ok,
        result: embedUrl,
        details: `Status: ${embedTest.status} ${embedTest.statusText}`
      })

      // Step 4: Test with parameters
      const embedUrlWithParams = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`
      result.steps.push({
        step: 'Embed URL with Params',
        success: true,
        result: embedUrlWithParams,
        details: 'URL with recommended parameters'
      })

      // Step 5: Check if video is embeddable (simulate iframe load)
      const checkEmbeddable = new Promise((resolve) => {
        const testFrame = document.createElement('iframe')
        testFrame.src = embedUrl
        testFrame.style.display = 'none'
        testFrame.style.width = '1px'
        testFrame.style.height = '1px'
        
        const timeout = setTimeout(() => {
          document.body.removeChild(testFrame)
          resolve({ success: false, details: 'Embed test timed out' })
        }, 5000)

        testFrame.onload = () => {
          clearTimeout(timeout)
          document.body.removeChild(testFrame)
          resolve({ success: true, details: 'Iframe loaded successfully' })
        }

        testFrame.onerror = () => {
          clearTimeout(timeout)
          document.body.removeChild(testFrame)
          resolve({ success: false, details: 'Iframe failed to load' })
        }

        document.body.appendChild(testFrame)
      })

      const embeddableResult = await checkEmbeddable as any
      result.steps.push({
        step: 'Embeddable Test',
        success: embeddableResult.success,
        result: 'Iframe load test',
        details: embeddableResult.details
      })

    } catch (error) {
      result.steps.push({
        step: 'Error',
        success: false,
        result: error,
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    setTestResults(prev => [result, ...prev])
    setCurrentTest(null)
  }

  const testAllSamples = async () => {
    setTestResults([])
    for (const url of sampleUrls) {
      await testVideoUrl(url)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Delay between tests
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  if (!isOpen) return null

  return (
    <div className="video-debug-overlay">
      <div className="video-debug-modal">
        <div className="debug-header">
          <h2>🧪 Video Embed Debugger</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="debug-controls">
          <div className="test-input">
            <input
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="Enter YouTube URL to test..."
              className="url-input"
            />
            <button 
              onClick={() => testUrl && testVideoUrl(testUrl)}
              disabled={!testUrl || !!currentTest}
              className="test-button"
            >
              {currentTest ? 'Testing...' : 'Test URL'}
            </button>
          </div>

          <div className="sample-tests">
            <button 
              onClick={testAllSamples}
              disabled={!!currentTest}
              className="test-all-button"
            >
              Test All Sample URLs ({sampleUrls.length})
            </button>
            <button onClick={clearResults} className="clear-button">
              Clear Results
            </button>
          </div>

          <div className="sample-urls">
            <h4>Sample URLs from your articles:</h4>
            {sampleUrls.map((url, index) => (
              <div key={index} className="sample-url">
                <span className="url-text">{url}</span>
                <button 
                  onClick={() => testVideoUrl(url)}
                  disabled={!!currentTest}
                  className="test-sample-button"
                >
                  Test
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="debug-results">
          <h3>Test Results ({testResults.length})</h3>
          
          {currentTest && (
            <div className="current-test">
              <div className="spinner"></div>
              <span>Testing in progress...</span>
            </div>
          )}

          {testResults.map((result) => (
            <div key={result.id} className="test-result">
              <div className="result-header">
                <h4>🎬 {result.originalUrl}</h4>
                <span className="timestamp">{new Date(result.timestamp).toLocaleTimeString()}</span>
              </div>
              
              <div className="result-steps">
                {result.steps.map((step, index) => (
                  <div key={index} className={`step ${step.success ? 'success' : 'failure'}`}>
                    <div className="step-header">
                      <span className="step-icon">{step.success ? '✅' : '❌'}</span>
                      <span className="step-name">{step.step}</span>
                    </div>
                    <div className="step-details">
                      <div className="step-result">
                        <strong>Result:</strong> {typeof step.result === 'string' ? step.result : JSON.stringify(step.result)}
                      </div>
                      <div className="step-info">
                        <strong>Details:</strong> {step.details}
                      </div>
                    </div>
                    
                    {/* Show actual embed test for successful extractions */}
                    {step.step === 'Embed URL with Params' && step.success && (
                      <div className="embed-test">
                        <h5>Live Embed Test:</h5>
                        <div className="embed-container">
                          <iframe 
                            src={step.result}
                            width="320"
                            height="180"
                            frameBorder="0"
                            allowFullScreen
                            title={`Test embed ${result.id}`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .video-debug-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }

        .video-debug-modal {
          background: white;
          border-radius: 12px;
          width: 95%;
          max-width: 1000px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .debug-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .debug-header h2 {
          margin: 0;
          font-size: 24px;
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

        .debug-controls {
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .test-input {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .url-input {
          flex: 1;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
        }

        .test-button, .test-all-button, .clear-button {
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        .test-button {
          background: #3b82f6;
          color: white;
        }

        .test-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .sample-tests {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .test-all-button {
          background: #10b981;
          color: white;
        }

        .clear-button {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .sample-urls {
          background: #f8fafc;
          padding: 16px;
          border-radius: 8px;
        }

        .sample-urls h4 {
          margin: 0 0 12px 0;
          color: #374151;
          font-size: 14px;
        }

        .sample-url {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .sample-url:last-child {
          border-bottom: none;
        }

        .url-text {
          font-size: 12px;
          color: #64748b;
          font-family: monospace;
        }

        .test-sample-button {
          padding: 4px 12px;
          background: #e5e7eb;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .debug-results {
          flex: 1;
          overflow: auto;
          padding: 20px 24px;
        }

        .debug-results h3 {
          margin: 0 0 20px 0;
          color: #1e293b;
        }

        .current-test {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #eff6ff;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .test-result {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin-bottom: 16px;
          overflow: hidden;
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #f1f5f9;
          border-bottom: 1px solid #e2e8f0;
        }

        .result-header h4 {
          margin: 0;
          font-size: 14px;
          color: #1e293b;
          word-break: break-all;
        }

        .timestamp {
          font-size: 12px;
          color: #64748b;
        }

        .result-steps {
          padding: 16px;
        }

        .step {
          margin-bottom: 16px;
          padding: 12px;
          border-radius: 6px;
        }

        .step.success {
          background: #f0fdf4;
          border: 1px solid #dcfce7;
        }

        .step.failure {
          background: #fef2f2;
          border: 1px solid #fecaca;
        }

        .step-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .step-name {
          font-weight: 600;
          color: #1e293b;
        }

        .step-details {
          font-size: 12px;
          color: #64748b;
        }

        .step-result, .step-info {
          margin-bottom: 4px;
          word-break: break-all;
        }

        .embed-test {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
        }

        .embed-test h5 {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: #374151;
        }

        .embed-container {
          background: #000;
          border-radius: 8px;
          overflow: hidden;
          width: fit-content;
        }
      `}</style>
    </div>
  )
}
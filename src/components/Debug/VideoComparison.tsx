import React, { useState, useEffect } from 'react'

interface VideoComparisonProps {
  isOpen: boolean
  onClose: () => void
}

export const VideoComparison: React.FC<VideoComparisonProps> = ({
  isOpen,
  onClose
}) => {
  const [testResults, setTestResults] = useState<any[]>([])
  const [testing, setTesting] = useState(false)

  const videoAnalysis = [
    {
      category: "✅ CONFIRMED WORKING VIDEOS",
      videos: [
        {
          id: "cJZigXfPrC0",
          name: "20 BEST MOVIE TRAILERS 2025",
          status: "WORKING ✅"
        },
        {
          id: "43R9l7EkJwE", 
          name: "Predator: Badlands Official Trailer",
          status: "WORKING ✅"
        }
      ]
    },
    {
      category: "❓ YOUR ARTICLE VIDEOS (TO TEST)",
      videos: [
        {
          id: "1YtB1yrKvXM",
          name: "From your article",
          status: "UNKNOWN"
        },
        {
          id: "gmJeo_1lI6g",
          name: "From your article", 
          status: "UNKNOWN"
        },
        {
          id: "V9TGgD03nQI",
          name: "From your article",
          status: "UNKNOWN"
        },
        {
          id: "CB_2FWwSU0Y",
          name: "From your article",
          status: "UNKNOWN"
        },
        {
          id: "YhTgj7_cuJM",
          name: "From your article",
          status: "UNKNOWN"
        },
        {
          id: "0vmp4N2Tce0",
          name: "From your article",
          status: "UNKNOWN"
        }
      ]
    }
  ]

  const analyzeVideoId = (videoId: string) => {
    const analysis = {
      id: videoId,
      length: videoId.length,
      hasSpecialChars: /[^A-Za-z0-9_-]/.test(videoId),
      startsWithNumber: /^[0-9]/.test(videoId),
      pattern: videoId.replace(/[A-Za-z]/g, 'L').replace(/[0-9]/g, 'N').replace(/[-_]/g, 'S'),
      firstChar: videoId[0],
      lastChar: videoId[videoId.length - 1]
    }
    return analysis
  }

  const testVideoAvailability = async (videoId: string) => {
    const results = {
      videoId,
      tests: {} as any
    }

    try {
      // Test 1: Thumbnail availability
      const thumbnailResponse = await fetch(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, { method: 'HEAD' })
      results.tests.thumbnail = {
        success: thumbnailResponse.ok,
        status: thumbnailResponse.status,
        url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      }

      // Test 2: Watch page (check if video exists)
      const watchResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, { method: 'HEAD' })
      results.tests.watchPage = {
        success: watchResponse.ok,
        status: watchResponse.status,
        url: `https://www.youtube.com/watch?v=${videoId}`
      }

      // Test 3: Embed page
      const embedResponse = await fetch(`https://www.youtube.com/embed/${videoId}`, { method: 'HEAD' })
      results.tests.embedPage = {
        success: embedResponse.ok,
        status: embedResponse.status,
        url: `https://www.youtube.com/embed/${videoId}`
      }

    } catch (error) {
      results.tests.error = error
    }

    return results
  }

  const runFullAnalysis = async () => {
    setTesting(true)
    const allVideos = [
      ...videoAnalysis[0].videos,
      ...videoAnalysis[1].videos
    ]

    const results = []
    for (const video of allVideos) {
      const analysis = analyzeVideoId(video.id)
      const availability = await testVideoAvailability(video.id)
      
      results.push({
        ...video,
        analysis,
        availability,
        timestamp: new Date().toISOString()
      })

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setTestResults(results)
    setTesting(false)
  }

  if (!isOpen) return null

  return (
    <div className="comparison-overlay">
      <div className="comparison-modal">
        <div className="comparison-header">
          <h2>🔍 Video ID Analysis & Comparison</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="comparison-content">
          <div className="analysis-intro">
            <h3>🎯 Goal: Find why some videos work and others don't</h3>
            <p>Let's analyze the patterns between working and non-working videos:</p>
          </div>

          <div className="quick-analysis">
            <h4>📊 Quick ID Pattern Analysis:</h4>
            <div className="pattern-grid">
              <div className="pattern-section">
                <h5>✅ Working Videos:</h5>
                {videoAnalysis[0].videos.map(video => {
                  const analysis = analyzeVideoId(video.id)
                  return (
                    <div key={video.id} className="pattern-item working">
                      <div className="video-info">
                        <strong>{video.id}</strong> - {video.name}
                      </div>
                      <div className="pattern-details">
                        Length: {analysis.length}, Pattern: {analysis.pattern}, Starts: {analysis.firstChar}
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="pattern-section">
                <h5>❓ Article Videos:</h5>
                {videoAnalysis[1].videos.map(video => {
                  const analysis = analyzeVideoId(video.id)
                  return (
                    <div key={video.id} className="pattern-item unknown">
                      <div className="video-info">
                        <strong>{video.id}</strong> - {video.name}
                      </div>
                      <div className="pattern-details">
                        Length: {analysis.length}, Pattern: {analysis.pattern}, Starts: {analysis.firstChar}
                      </div>
                      <div className="test-links">
                        <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">
                          Test Watch
                        </a>
                        <a href={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`} target="_blank" rel="noopener noreferrer">
                          Test Thumbnail
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="live-test-section">
            <button 
              onClick={runFullAnalysis}
              disabled={testing}
              className="full-analysis-button"
            >
              {testing ? '🔄 Testing All Videos...' : '🚀 Run Full Analysis'}
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="test-results">
              <h4>📋 Full Analysis Results:</h4>
              {testResults.map(result => (
                <div key={result.id} className={`result-item ${result.status.includes('WORKING') ? 'working' : 'unknown'}`}>
                  <div className="result-header">
                    <h5>{result.id} - {result.name}</h5>
                    <span className="result-status">{result.status}</span>
                  </div>
                  
                  <div className="result-details">
                    <div className="availability-tests">
                      <div className={`test-result ${result.availability.tests.thumbnail?.success ? 'pass' : 'fail'}`}>
                        Thumbnail: {result.availability.tests.thumbnail?.success ? '✅ Available' : '❌ Failed'}
                        ({result.availability.tests.thumbnail?.status})
                      </div>
                      <div className={`test-result ${result.availability.tests.watchPage?.success ? 'pass' : 'fail'}`}>
                        Watch Page: {result.availability.tests.watchPage?.success ? '✅ Available' : '❌ Failed'}
                        ({result.availability.tests.watchPage?.status})
                      </div>
                      <div className={`test-result ${result.availability.tests.embedPage?.success ? 'pass' : 'fail'}`}>
                        Embed Page: {result.availability.tests.embedPage?.success ? '✅ Available' : '❌ Failed'}
                        ({result.availability.tests.embedPage?.status})
                      </div>
                    </div>
                    
                    <div className="pattern-analysis">
                      <strong>Pattern:</strong> {result.analysis.pattern} | 
                      <strong>Length:</strong> {result.analysis.length} | 
                      <strong>Special chars:</strong> {result.analysis.hasSpecialChars ? 'Yes' : 'No'}
                    </div>
                  </div>

                  {/* Live embed test for comparison */}
                  <div className="live-embed-test">
                    <h6>Live Embed Test:</h6>
                    <div className="embed-container-small">
                      <iframe
                        src={`https://www.youtube.com/embed/${result.id}`}
                        width="300"
                        height="169"
                        frameBorder="0"
                        allowFullScreen
                        title={`Test ${result.id}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="insights">
            <h4>🧠 Key Insights to Look For:</h4>
            <ul>
              <li><strong>ID Length:</strong> Working videos are both 11 characters long</li>
              <li><strong>Character patterns:</strong> Mix of letters, numbers, hyphens</li>
              <li><strong>Thumbnail availability:</strong> If thumbnail fails, video likely deleted</li>
              <li><strong>HTTP status codes:</strong> 404 = not found, 403 = forbidden/private</li>
              <li><strong>Embed restrictions:</strong> Some videos disable embedding</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .comparison-overlay {
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

        .comparison-modal {
          background: white;
          border-radius: 12px;
          width: 95%;
          max-width: 1200px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .comparison-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .comparison-header h2 {
          margin: 0;
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

        .comparison-content {
          padding: 24px;
        }

        .analysis-intro {
          background: #eff6ff;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          border-left: 4px solid #3b82f6;
        }

        .analysis-intro h3 {
          margin: 0 0 8px 0;
          color: #1e40af;
        }

        .quick-analysis {
          margin-bottom: 24px;
        }

        .pattern-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 16px;
        }

        .pattern-section h5 {
          margin: 0 0 12px 0;
          color: #374151;
        }

        .pattern-item {
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .pattern-item.working {
          background: #f0fdf4;
          border-left: 4px solid #22c55e;
        }

        .pattern-item.unknown {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
        }

        .video-info {
          font-size: 14px;
          margin-bottom: 4px;
        }

        .pattern-details {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 8px;
        }

        .test-links {
          display: flex;
          gap: 8px;
        }

        .test-links a {
          font-size: 11px;
          padding: 4px 8px;
          background: #e5e7eb;
          color: #374151;
          text-decoration: none;
          border-radius: 4px;
        }

        .test-links a:hover {
          background: #d1d5db;
        }

        .live-test-section {
          text-align: center;
          margin: 24px 0;
        }

        .full-analysis-button {
          padding: 16px 32px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }

        .full-analysis-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .test-results {
          margin-top: 24px;
        }

        .result-item {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin-bottom: 16px;
          overflow: hidden;
        }

        .result-item.working {
          border-left: 4px solid #22c55e;
        }

        .result-item.unknown {
          border-left: 4px solid #f59e0b;
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #f8fafc;
        }

        .result-header h5 {
          margin: 0;
          color: #1e293b;
        }

        .result-status {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 4px;
          background: #e5e7eb;
          color: #374151;
        }

        .result-details {
          padding: 16px;
        }

        .availability-tests {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 8px;
          margin-bottom: 12px;
        }

        .test-result {
          padding: 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .test-result.pass {
          background: #dcfce7;
          color: #15803d;
        }

        .test-result.fail {
          background: #fef2f2;
          color: #dc2626;
        }

        .pattern-analysis {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 16px;
        }

        .live-embed-test h6 {
          margin: 0 0 8px 0;
          color: #374151;
          font-size: 12px;
        }

        .embed-container-small {
          background: #000;
          border-radius: 6px;
          overflow: hidden;
          width: fit-content;
        }

        .insights {
          background: #f0fdf4;
          padding: 16px;
          border-radius: 8px;
          margin-top: 24px;
          border-left: 4px solid #22c55e;
        }

        .insights h4 {
          margin: 0 0 12px 0;
          color: #15803d;
        }

        .insights ul {
          margin: 0;
          padding-left: 20px;
        }

        .insights li {
          margin-bottom: 4px;
          color: #374151;
          font-size: 14px;
        }
      `}</style>
    </div>
  )
}
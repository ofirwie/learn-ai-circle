import React, { useState } from 'react'

interface SimpleVideoTestProps {
  isOpen: boolean
  onClose: () => void
}

export const SimpleVideoTest: React.FC<SimpleVideoTestProps> = ({
  isOpen,
  onClose
}) => {
  const [currentTest, setCurrentTest] = useState(0)
  
  // Test different video IDs and formats
  const videoTests = [
    {
      name: "✅ YOUR WORKING VIDEO",
      videoId: "cJZigXfPrC0",
      description: "20 BEST MOVIE TRAILERS 2025 - CONFIRMED WORKING 100%"
    },
    {
      name: "Your Article Video 1", 
      videoId: "1YtB1yrKvXM",
      description: "From your article content - TEST IF STILL WORKS"
    },
    {
      name: "Your Article Video 2",
      videoId: "gmJeo_1lI6g", 
      description: "From your article content - TEST IF STILL WORKS"
    },
    {
      name: "Your Article Video 3",
      videoId: "V9TGgD03nQI",
      description: "From your article content - TEST IF STILL WORKS"
    },
    {
      name: "Your Article Video 4",
      videoId: "CB_2FWwSU0Y",
      description: "From your article content - TEST IF STILL WORKS"
    },
    {
      name: "Your Article Video 5",
      videoId: "YhTgj7_cuJM",
      description: "From your article content - TEST IF STILL WORKS"
    },
    {
      name: "Your Article Video 6",
      videoId: "0vmp4N2Tce0",
      description: "From your article content - TEST IF STILL WORKS"
    }
  ]

  if (!isOpen) return null

  return (
    <div className="simple-test-overlay">
      <div className="simple-test-modal">
        <div className="test-header">
          <h2>🎬 Simple Video Embed Test</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="test-content">
          <div className="test-selector">
            <h3>Select Test Video:</h3>
            <div className="test-buttons">
              {videoTests.map((test, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTest(index)}
                  className={`test-button ${currentTest === index ? 'active' : ''}`}
                >
                  {test.name}
                </button>
              ))}
            </div>
          </div>

          <div className="current-test">
            <h3>Testing: {videoTests[currentTest].name}</h3>
            <p>{videoTests[currentTest].description}</p>
            <p><strong>Video ID:</strong> {videoTests[currentTest].videoId}</p>
            <p><strong>Embed URL:</strong> https://www.youtube.com/embed/{videoTests[currentTest].videoId}</p>
          </div>

          <div className="embed-tests">
            {/* Test 1: Basic iframe */}
            <div className="test-section">
              <h4>Test 1: Basic iframe (like Gemini suggested)</h4>
              <div className="embed-container">
                <iframe
                  width="560"
                  height="315"
                  src={`https://www.youtube.com/embed/${videoTests[currentTest].videoId}`}
                  title={videoTests[currentTest].name}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Test 2: Responsive iframe */}
            <div className="test-section">
              <h4>Test 2: Responsive iframe (our current method)</h4>
              <div className="youtube-embed" style={{
                position: 'relative',
                paddingBottom: '56.25%',
                height: 0,
                overflow: 'hidden',
                maxWidth: '600px',
                margin: '20px auto',
                borderRadius: '12px'
              }}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoTests[currentTest].videoId}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '12px'
                  }}
                  frameBorder="0"
                  allowFullScreen
                  title={videoTests[currentTest].name}
                />
              </div>
            </div>

            {/* Test 3: With parameters */}
            <div className="test-section">
              <h4>Test 3: With YouTube parameters</h4>
              <div className="embed-container">
                <iframe
                  width="560"
                  height="315"
                  src={`https://www.youtube.com/embed/${videoTests[currentTest].videoId}?rel=0&modestbranding=1&showinfo=0`}
                  title={videoTests[currentTest].name}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Test 4: Minimal parameters */}
            <div className="test-section">
              <h4>Test 4: Minimal iframe</h4>
              <div className="embed-container">
                <iframe
                  width="560"
                  height="315"
                  src={`https://www.youtube.com/embed/${videoTests[currentTest].videoId}`}
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
            </div>
          </div>

          <div className="direct-links">
            <h4>Direct Links for Testing:</h4>
            <p>
              <a href={`https://www.youtube.com/watch?v=${videoTests[currentTest].videoId}`} target="_blank" rel="noopener noreferrer">
                Watch URL: https://www.youtube.com/watch?v={videoTests[currentTest].videoId}
              </a>
            </p>
            <p>
              <a href={`https://www.youtube.com/embed/${videoTests[currentTest].videoId}`} target="_blank" rel="noopener noreferrer">
                Embed URL: https://www.youtube.com/embed/{videoTests[currentTest].videoId}
              </a>
            </p>
            <p>
              <a href={`https://img.youtube.com/vi/${videoTests[currentTest].videoId}/maxresdefault.jpg`} target="_blank" rel="noopener noreferrer">
                Thumbnail: https://img.youtube.com/vi/{videoTests[currentTest].videoId}/maxresdefault.jpg
              </a>
            </p>
          </div>

          <div className="troubleshooting">
            <h4>Troubleshooting Info:</h4>
            <ul>
              <li><strong>If videos don't load:</strong> Check your internet connection and firewall</li>
              <li><strong>If you see "Video unavailable":</strong> The video might be restricted or deleted</li>
              <li><strong>If embed is blocked:</strong> The video owner might have disabled embedding</li>
              <li><strong>If thumbnail doesn't load:</strong> Check the video ID is correct</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .simple-test-overlay {
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

        .simple-test-modal {
          background: white;
          border-radius: 12px;
          width: 95%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .test-header {
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

        .test-header h2 {
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

        .test-content {
          padding: 24px;
        }

        .test-selector {
          margin-bottom: 24px;
        }

        .test-selector h3 {
          margin: 0 0 12px 0;
          color: #374151;
        }

        .test-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .test-button {
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }

        .test-button.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .current-test {
          background: #f0f9ff;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          border-left: 4px solid #3b82f6;
        }

        .current-test h3 {
          margin: 0 0 8px 0;
          color: #1e40af;
        }

        .current-test p {
          margin: 4px 0;
          color: #374151;
          font-size: 14px;
        }

        .embed-tests {
          margin-bottom: 24px;
        }

        .test-section {
          margin-bottom: 32px;
          padding: 20px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #fafafa;
        }

        .test-section h4 {
          margin: 0 0 16px 0;
          color: #374151;
        }

        .embed-container {
          display: flex;
          justify-content: center;
          background: #000;
          border-radius: 8px;
          padding: 20px;
        }

        .direct-links {
          background: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .direct-links h4 {
          margin: 0 0 12px 0;
          color: #374151;
        }

        .direct-links a {
          color: #3b82f6;
          text-decoration: none;
          word-break: break-all;
        }

        .direct-links a:hover {
          text-decoration: underline;
        }

        .troubleshooting {
          background: #fef2f2;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #f87171;
        }

        .troubleshooting h4 {
          margin: 0 0 12px 0;
          color: #dc2626;
        }

        .troubleshooting ul {
          margin: 0;
          padding-left: 20px;
        }

        .troubleshooting li {
          margin-bottom: 8px;
          color: #374151;
          font-size: 14px;
        }
      `}</style>
    </div>
  )
}
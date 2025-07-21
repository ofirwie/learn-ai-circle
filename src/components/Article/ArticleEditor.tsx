import React, { useState, useEffect, useRef } from 'react'
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { ArticleService } from '../../services/articleService'

// Custom toolbar configuration
const modules = {
  toolbar: {
    container: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
    handlers: {
      video: function() {
        const url = prompt('Enter YouTube URL:')
        if (url) {
          const videoId = ArticleService.extractYouTubeId(url)
          if (videoId) {
            const quill = this.quill
            const range = quill.getSelection()
            if (range) {
              // Insert YouTube embed
              const embedHtml = `
                <div class="youtube-embed" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 20px 0;">
                  <iframe 
                    src="https://www.youtube.com/embed/${videoId}" 
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                    frameborder="0" 
                    allowfullscreen>
                  </iframe>
                </div>
              `
              quill.clipboard.dangerouslyPasteHTML(range.index, embedHtml)
            }
          } else {
            alert('Invalid YouTube URL. Please enter a valid YouTube video URL.')
          }
        }
      }
    }
  }
}

interface ArticleEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export const ArticleEditor: React.FC<ArticleEditorProps> = ({ 
  content, 
  onChange, 
  placeholder = 'Start writing your article...' 
}) => {
  const [editorHtml, setEditorHtml] = useState(content)
  const quillRef = useRef<ReactQuill>(null)

  useEffect(() => {
    setEditorHtml(content)
  }, [content])

  const handleChange = (html: string) => {
    setEditorHtml(html)
    onChange(html)
  }

  // Custom styles for the editor
  const editorStyles = {
    '.ql-container': {
      fontSize: '16px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      borderBottomLeftRadius: '8px',
      borderBottomRightRadius: '8px'
    },
    '.ql-toolbar': {
      borderTopLeftRadius: '8px',
      borderTopRightRadius: '8px',
      backgroundColor: '#f8f9fa',
      borderColor: '#e2e8f0'
    },
    '.ql-editor': {
      minHeight: '400px',
      lineHeight: '1.6'
    },
    '.ql-editor h1': {
      fontSize: '2em',
      marginTop: '0.67em',
      marginBottom: '0.67em'
    },
    '.ql-editor h2': {
      fontSize: '1.5em',
      marginTop: '0.83em',
      marginBottom: '0.83em'
    },
    '.ql-editor h3': {
      fontSize: '1.17em',
      marginTop: '1em',
      marginBottom: '1em'
    },
    '.ql-editor p': {
      marginBottom: '1em'
    },
    '.ql-editor blockquote': {
      borderLeft: '4px solid #3b82f6',
      paddingLeft: '16px',
      marginLeft: '0',
      fontStyle: 'italic',
      color: '#64748b'
    },
    '.ql-editor pre': {
      backgroundColor: '#1e293b',
      color: '#e2e8f0',
      padding: '16px',
      borderRadius: '8px',
      overflow: 'auto'
    },
    '.ql-editor img': {
      maxWidth: '100%',
      height: 'auto',
      borderRadius: '8px',
      margin: '16px 0'
    },
    '.youtube-embed': {
      margin: '20px 0'
    }
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      <style>
        {Object.entries(editorStyles).map(([selector, rules]) => 
          `${selector} { ${Object.entries(rules).map(([prop, value]) => 
            `${prop.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`
          ).join(' ')} }`
        ).join('\n')}
      </style>
      
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={editorHtml}
        onChange={handleChange}
        modules={modules}
        placeholder={placeholder}
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}
      />
      
      <div style={{ 
        marginTop: '8px', 
        fontSize: '12px', 
        color: '#64748b',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>Use the video button to embed YouTube videos</span>
        <span>{editorHtml.length} characters</span>
      </div>
    </div>
  )
}
function App() {
  return (
    <div style={{ 
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#2563eb' }}>
        AI Knowledge Hub
      </h1>
      
      <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', direction: 'rtl' }}>
        ברוכים הבאים למרכז הידע לבינה מלאכותית
      </h2>
      
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        background: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <p style={{ marginBottom: '1rem' }}>
          Welcome to the AI Knowledge Hub - your comprehensive platform for AI tools and techniques.
        </p>
        
        <p style={{ marginBottom: '1rem', direction: 'rtl' }}>
          המרכז החכם שלך לכל מה שקשור לבינה מלאכותית - מדריכים, פרומפטים, כלים וקהילה.
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          marginTop: '2rem'
        }}>
          <div style={{ 
            background: '#dbeafe', 
            padding: '1rem', 
            borderRadius: '0.5rem' 
          }}>
            <h3>📚 מדריכים</h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Professional Guides
            </p>
          </div>
          
          <div style={{ 
            background: '#f3e8ff', 
            padding: '1rem', 
            borderRadius: '0.5rem' 
          }}>
            <h3>⚡ פרומפטים</h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Ready Prompts
            </p>
          </div>
          
          <div style={{ 
            background: '#dcfce7', 
            padding: '1rem', 
            borderRadius: '0.5rem' 
          }}>
            <h3>💬 פורום</h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Community Forum
            </p>
          </div>
          
          <div style={{ 
            background: '#fed7aa', 
            padding: '1rem', 
            borderRadius: '0.5rem' 
          }}>
            <h3>📈 חדשות</h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              AI News
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
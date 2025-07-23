// Import Perplexity AI article directly into the database
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nnblfyhjshxyuafylbcb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uYmxmeWhqc2h4eXVhZnlsYmNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NzMzNzMsImV4cCI6MjA1MjQ0OTM3M30.wRvVLHWOBTpTfuCOu8aX5zGjGJkGJaH8rCb8ViQ0RCo'

const supabase = createClient(supabaseUrl, supabaseKey)

const article = {
  title: "Perplexity AI Overview: Why It's Becoming The MOST Essential Tool",
  content: `## What Is Perplexity AI?

Perplexity AI is an innovative AI-powered search tool that stands out for its ability to combine natural language understanding with precise and relevant search results. Designed for both casual users and professionals, Perplexity AI simplifies the process of finding accurate information by interpreting queries in a conversational way. This tool harnesses cutting-edge technology to deliver insights quickly, making it a valuable resource for anyone seeking streamlined research or data analysis.

Perplexity AI's core strength lies in its pragmatic approach to integrating large-scale AI models with a user-friendly interface. It removes unnecessary complexity, ensuring that users can access reliable, fact-driven answers without having to sift through irrelevant results.

## Unique Features of Perplexity AI

Perplexity AI offers several features that distinguish it from traditional search engines and other AI tools. Here are some of the standout capabilities:

**Conversational Interface:** Perplexity AI allows users to input questions in natural language, interpreting nuances and providing clear answers tailored to the query.

**Contextual Understanding:** The tool retains context in multi-step queries, allowing users to refine their searches without starting over.

**Citation Integration:** Its responses include precise citations, enabling users to trace sources and validate the credibility of the information provided.

**Cross-Platform Accessibility:** Fully optimized for both desktop and mobile platforms, Perplexity AI ensures that users can search anytime, anywhere.

**Knowledge Expansion:** The platform connects data from multiple verified sources, presenting users with a well-rounded understanding of the subject matter.

Watch this video to learn how these features work and see Perplexity AI in action:

https://www.youtube.com/watch?v=p8eYHO07o6E

These features are particularly helpful for academics, professionals, and anyone with a curious mind seeking quality information.

## Real-World Use Cases for Perplexity AI

Wondering how Perplexity AI can positively impact your day-to-day activities or professional life? Here are some practical applications for this tool:

### Academic Research:
Students and researchers can use Perplexity AI to find accurate, well-referenced information for papers and projects faster than traditional search engines.

### Professional Analysis:
Business professionals can leverage Perplexity AI to quickly gather market insights, competitor analysis, and industry trends.

### Content Creation:
Writers and content creators can use the tool to research topics thoroughly and find credible sources for their work.

### Personal Learning:
Curious individuals can explore complex topics and receive clear, well-sourced explanations tailored to their level of understanding.`,
  excerpt: "Discover why Perplexity AI is revolutionizing search with its conversational interface, contextual understanding, and citation integration. Learn practical use cases for research, analysis, and content creation.",
  author: "Ofir Wienerman",
  category: "tool-review",
  tags: ["perplexity-ai", "search-tools", "ai-research", "productivity"],
  youtube_video_id: "p8eYHO07o6E",
  published: true,
  featured: false,
  read_time: 4,
  view_count: 0
}

async function importArticle() {
  try {
    console.log('Importing Perplexity AI article...')
    
    const { data, error } = await supabase
      .from('articles')
      .insert([article])
      .select()
    
    if (error) {
      console.error('Error importing article:', error)
      return
    }
    
    console.log('✅ Article imported successfully!')
    console.log('Article ID:', data[0].id)
    console.log('Title:', data[0].title)
    console.log('Video ID:', data[0].youtube_video_id)
    
  } catch (err) {
    console.error('Import failed:', err)
  }
}

importArticle()
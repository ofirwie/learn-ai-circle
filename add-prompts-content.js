import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const prompts = [
  // From vibeprompts.csv - Creative App/Game Development Prompts
  {
    title: "Multiplayer 3D Plane Combat Game",
    content_json: {
      prompt: "Create an immersive multiplayer airplane combat game using Three.js, HTML5, CSS3, and JavaScript with WebSocket for real-time networking. Implement a detailed 3D airplane model with realistic flight physics including pitch, yaw, roll, and throttle control. Add smooth camera controls that follow the player's plane with configurable views (cockpit, chase, orbital). Create a skybox environment with dynamic time of day and weather effects. Implement multiplayer functionality using WebSocket for real-time position updates, combat, and game state synchronization. Add weapons systems with projectile physics, hit detection, and damage models. Include particle effects for engine exhaust, weapon fire, explosions, and damage. Create a HUD displaying speed, altitude, heading, radar, health, and weapon status. Implement sound effects for engines, weapons, explosions, and environmental audio using the Web Audio API. Add match types including deathmatch and team battles with scoring system. Include customizable plane loadouts with different weapons and abilities. Create a lobby system for match creation and team assignment. Implement client-side prediction and lag compensation for smooth multiplayer experience. Add mini-map showing player positions and objectives. Include replay system for match playback and highlight creation. Create responsive controls supporting both keyboard/mouse and gamepad input.",
      category: "Game Development",
      tech_stack: ["HTML", "CSS", "JavaScript", "Three.js", "WebSocket"],
      difficulty: "Advanced",
      source: "@f (vibeprompts.csv)",
      contributor: "@f"
    },
    tags: ["3d-game", "multiplayer", "javascript", "threejs", "websocket", "game-development"],
    priority: "high",
    is_published: true
  },

  {
    title: "Scientific Calculator with Advanced Functions",
    content_json: {
      prompt: "Create a comprehensive scientific calculator with HTML5, CSS3 and JavaScript that mimics professional calculators. Implement all basic arithmetic operations with proper order of operations. Include advanced scientific functions (trigonometric, logarithmic, exponential, statistical) with degree/radian toggle. Add memory operations (M+, M-, MR, MC) with visual indicators. Maintain a scrollable calculation history log that can be cleared or saved. Implement full keyboard support with appropriate key mappings and shortcuts. Add robust error handling for division by zero, invalid operations, and overflow conditions with helpful error messages. Create a responsive design that transforms between standard and scientific layouts based on screen size or orientation. Include multiple theme options (classic, modern, high contrast). Add optional sound feedback for button presses with volume control. Implement copy/paste functionality for results and expressions.",
      category: "Web Development",
      tech_stack: ["HTML", "CSS", "JavaScript"],
      difficulty: "Intermediate",
      source: "@f (vibeprompts.csv)",
      contributor: "@f"
    },
    tags: ["calculator", "javascript", "web-app", "math", "responsive-design"],
    priority: "normal",
    is_published: true
  },

  {
    title: "Interactive Todo List Application",
    content_json: {
      prompt: "Create a responsive todo app with HTML5, CSS3 and vanilla JavaScript. The app should have a modern, clean UI using CSS Grid/Flexbox with intuitive controls. Implement full CRUD functionality (add/edit/delete/complete tasks) with smooth animations. Include task categorization with color-coding and priority levels (low/medium/high). Add due dates with a date-picker component and reminder notifications. Use localStorage for data persistence between sessions. Implement search functionality with filters for status, category, and date range. Add drag and drop reordering of tasks using the HTML5 Drag and Drop API. Ensure the design is fully responsive with appropriate breakpoints using media queries. Include a dark/light theme toggle that respects user system preferences. Add subtle micro-interactions and transitions for better UX.",
      category: "Web Development", 
      tech_stack: ["HTML", "CSS", "JavaScript"],
      difficulty: "Beginner",
      source: "@f (vibeprompts.csv)",
      contributor: "@f"
    },
    tags: ["todo-app", "crud", "javascript", "localstorage", "responsive"],
    priority: "normal",
    is_published: true
  },

  // From prompts.csv - Professional Role-Playing Prompts
  {
    title: "Linux Terminal Simulator",
    content_json: {
      prompt: "I want you to act as a linux terminal. I will type commands and you will reply with what the terminal should show. I want you to only reply with the terminal output inside one unique code block, and nothing else. do not write explanations. do not type commands unless I instruct you to do so. when i need to tell you something in english, i will do so by putting text inside curly brackets {like this}. my first command is pwd",
      category: "Development Tools",
      for_developers: true,
      difficulty: "Intermediate",
      source: "Awesome ChatGPT Prompts Collection",
      use_case: "Learning Linux commands, documentation, testing"
    },
    tags: ["linux", "terminal", "cli", "simulation", "learning"],
    priority: "high",
    is_published: true
  },

  {
    title: "JavaScript Console Simulator",
    content_json: {
      prompt: "I want you to act as a javascript console. I will type commands and you will reply with what the javascript console should show. I want you to only reply with the terminal output inside one unique code block, and nothing else. do not write explanations. do not type commands unless I instruct you to do so. when i need to tell you something in english, i will do so by putting text inside curly brackets {like this}. my first command is console.log(\"Hello World\");",
      category: "Development Tools",
      for_developers: true,
      difficulty: "Beginner",
      source: "Awesome ChatGPT Prompts Collection", 
      use_case: "JavaScript learning, debugging, testing code snippets"
    },
    tags: ["javascript", "console", "debugging", "learning", "web-development"],
    priority: "high",
    is_published: true
  },

  {
    title: "UX/UI Developer Assistant",
    content_json: {
      prompt: "I want you to act as a UX/UI developer. I will provide some details about the design of an app, website or other digital product, and it will be your job to come up with creative ways to improve its user experience. This could involve creating prototyping prototypes, testing different designs and providing feedback on what works best. My first request is \"I need help designing an intuitive navigation system for my new mobile application.\"",
      category: "Design & UX",
      for_developers: true,
      difficulty: "Intermediate",
      source: "Awesome ChatGPT Prompts Collection",
      use_case: "UX design, prototyping, user experience optimization"
    },
    tags: ["ux", "ui", "design", "prototyping", "user-experience"],
    priority: "normal",
    is_published: true
  },

  {
    title: "Cyber Security Specialist",
    content_json: {
      prompt: "I want you to act as a cyber security specialist. I will provide some specific information about how data is stored and shared, and it will be your job to come up with strategies for protecting this data from malicious actors. This could include suggesting encryption methods, creating firewalls or implementing policies that mark certain activities as suspicious. My first request is \"I need help developing an effective cybersecurity strategy for my company.\"",
      category: "Security",
      for_developers: true,
      difficulty: "Advanced",
      source: "Awesome ChatGPT Prompts Collection",
      use_case: "Security strategy, data protection, threat assessment"
    },
    tags: ["cybersecurity", "data-protection", "encryption", "security-strategy"],
    priority: "high",
    is_published: true
  },

  {
    title: "Fullstack Software Developer",
    content_json: {
      prompt: "I want you to act as a software developer. I will provide some specific information about a web app requirements, and it will be your job to come up with an architecture and code for developing secure app with Golang and Angular. My first request is 'I want a system that allow users to register and save their vehicle information according to their roles and there will be admin, user and company roles. I want the system to use JWT for security'",
      category: "Software Development",
      for_developers: true,
      difficulty: "Advanced", 
      source: "Awesome ChatGPT Prompts Collection",
      use_case: "Full-stack development, architecture design, security implementation"
    },
    tags: ["fullstack", "golang", "angular", "jwt", "web-development", "architecture"],
    priority: "high",
    is_published: true
  },

  // From README.md - Claude-Specific Advanced Prompts
  {
    title: "MetaPrompt - Advanced Prompt Engineering",
    content_json: {
      prompt: "You are an expert at creating prompts for AI assistants. I will give you a task description, and you will create a detailed, effective prompt that will produce high-quality results. The prompt should include clear instructions, relevant context, expected output format, and any necessary constraints or guidelines. Consider the AI's capabilities and limitations when crafting the prompt. Make the prompt specific enough to avoid ambiguity but flexible enough to handle variations in the input.",
      category: "AI & Prompting",
      difficulty: "Advanced",
      source: "Awesome Claude Prompts (README.md)",
      official_example: true,
      use_case: "Prompt engineering, AI optimization, instruction design"
    },
    tags: ["metaprompt", "prompt-engineering", "ai-optimization", "claude", "instruction-design"],
    priority: "high",
    is_published: true
  },

  {
    title: "Code Review Helper",
    content_json: {
      prompt: "I want you to act as a Code reviewer who is experienced developer in the given code language. I will provide you with the code block or methods or code file along with the code language name, and I would like you to review the code and share the feedback, suggestions and alternative recommended approaches. Please write explanations behind the feedback or suggestions or alternative approaches.",
      category: "Code Review",
      for_developers: true,
      difficulty: "Intermediate",
      source: "Awesome ChatGPT Prompts Collection",
      use_case: "Code review, best practices, code quality improvement"
    },
    tags: ["code-review", "best-practices", "code-quality", "development", "feedback"],
    priority: "high",
    is_published: true
  }
];

async function addPromptsToContent() {
  console.log('Adding prompts to content table...');
  
  for (const prompt of prompts) {
    try {
      const { data, error } = await supabase
        .from('content')
        .insert([{
          title: prompt.title,
          content_json: prompt.content_json,
          content_type: 'prompt',
          tags: prompt.tags,
          priority: prompt.priority,
          is_published: prompt.is_published,
          published_at: prompt.is_published ? new Date().toISOString() : null,
          view_count: 0,
          engagement_score: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) {
        console.error(`Error adding "${prompt.title}":`, error);
      } else {
        console.log(`✅ Added: "${prompt.title}"`);
      }
    } catch (err) {
      console.error(`Failed to add "${prompt.title}":`, err);
    }
  }
  
  console.log('\n🎉 Finished adding prompts to content database!');
  console.log('These prompts are now available with content_type="prompt" in the content table.');
}

addPromptsToContent();
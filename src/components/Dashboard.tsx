import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ContentCard from "./ContentCard";
import heroImage from "@/assets/hero-ai-hub.jpg";
import { 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Play,
  ArrowRight,
  Zap,
  BookOpen,
  Target,
  Brain
} from "lucide-react";

const Dashboard = () => {
  // Sample content data
  const featuredContent = [
    {
      id: "1",
      title: "Professional Email Template",
      description: "Create professional and effective emails with AI",
      type: "prompt" as const,
      category: "Business",
      difficulty: "basic" as const,
      language: "en" as const,
      viewCount: 234,
      likes: 45
    },
    {
      id: "2",
      title: "Advanced Prompting Techniques",
      description: "Learn how to write prompts that yield precise results",
      type: "tip" as const,
      category: "Techniques",
      difficulty: "advanced" as const,
      language: "en" as const,
      viewCount: 156,
      likes: 32
    },
    {
      id: "3",
      title: "Review: Claude vs ChatGPT",
      description: "Comprehensive comparison between the two leading AI tools",
      type: "tool" as const,
      category: "Tools",
      difficulty: "basic" as const,
      language: "en" as const,
      viewCount: 189,
      likes: 38
    }
  ];

  const forumDiscussions = [
    {
      title: "How to write a good prompt?",
      author: "John Smith",
      replies: 12,
      time: "2 hours ago"
    },
    {
      title: "ChatGPT best practices for content creation",
      author: "Sarah Johnson", 
      replies: 8,
      time: "4 hours ago"
    },
    {
      title: "Automation for time management",
      author: "Mike Wilson",
      replies: 15,
      time: "1 day ago"
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main Content Area - Like Let's AI */}
          <div className="flex-1">
            {/* Hero Article Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
              <div className="p-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <span>AI Hub Guide</span>
                  <span>•</span>
                  <span>AI Hub Team</span>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  🚀 AI Knowledge Hub - English Version UPDATED 
                </h1>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <span>January 20, 2025 📅</span>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">
                    Welcome to AI Hub Knowledge Center - the most comprehensive platform for learning and exploring artificial intelligence tools. Here you'll find professional guides, ready-to-use prompts, tool reviews and more.
                  </p>
                  
                  {/* Image placeholder */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg h-64 flex items-center justify-center mb-6">
                    <div className="text-white text-center">
                      <Brain className="h-16 w-16 mx-auto mb-4" />
                      <p className="text-lg">AI Knowledge Hub</p>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    What will you find on the site?
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <BookOpen className="h-8 w-8 text-blue-600 mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Professional Guides
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Comprehensive guides for the most advanced AI tools
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-6 rounded-lg">
                      <Zap className="h-8 w-8 text-green-600 mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Prompts & Shortcuts
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Ready-to-use prompts and smart shortcuts
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Like Let's AI */}
          <div className="w-80 hidden lg:block">
            {/* Newsletter Signup */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-3">Stay Updated</h3>
              <p className="text-sm text-gray-600 mb-4">
                Sign up to receive updates on everything new and interesting in the AI world and subscribe to our newsletter
              </p>
              <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium w-full hover:bg-emerald-600 transition-colors">
                Subscribe
              </button>
              <p className="text-xs text-gray-500 mt-2">
                No spam or annoying emails ever
              </p>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4 text-center">
                Upcoming AI Events
              </h3>
              
              <div className="space-y-4">
                <div className="border-l-4 border-emerald-400 pl-4">
                  <div className="text-sm text-gray-600">
                    Advanced AI Prompting Workshop
                  </div>
                  <div className="font-semibold text-emerald-600 text-lg">Jan 23, 2025</div>
                  <div className="text-xs text-gray-500">
                    Webinar
                  </div>
                </div>

                <div className="border-l-4 border-emerald-400 pl-4">
                  <div className="text-sm text-gray-600">
                    How AI, Bots, Automation Save Time & Money
                  </div>
                  <div className="font-semibold text-emerald-600 text-lg">Jan 28, 2025</div>
                  <div className="text-xs text-gray-500">
                    Webinar
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                Quick Links
              </h3>
              
              <div className="space-y-3">
                <a href="/guides" className="block text-blue-600 hover:text-blue-800 text-sm">
                  All Professional Guides
                </a>
                <a href="/prompts" className="block text-blue-600 hover:text-blue-800 text-sm">
                  Ready-to-use Prompts
                </a>
                <a href="/tools" className="block text-blue-600 hover:text-blue-800 text-sm">
                  AI Tool Reviews
                </a>
                <a href="/forum" className="block text-blue-600 hover:text-blue-800 text-sm">
                  Community Forum
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
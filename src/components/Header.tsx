import { Button } from "@/components/ui/button";
import { 
  Search,
  Menu
} from "lucide-react";

const Header = () => {
  // English-only for now (Hebrew to be added in stage 2)

  return (
    <header className="bg-white border-b border-gray-200">
      {/* Top Navigation - Let's AI Style */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              🇺🇸 AI Hub ENGLISH
            </h1>
          </div>

          {/* Main Navigation - Horizontal like Let's AI */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-700 hover:text-blue-600 font-medium">
              Home
            </a>
            <a href="/guides" className="text-gray-700 hover:text-blue-600 font-medium">
              Professional Guides
            </a>
            <a href="/prompts" className="text-gray-700 hover:text-blue-600 font-medium">
              Prompts & Shortcuts
            </a>
            <a href="/tools" className="text-gray-700 hover:text-blue-600 font-medium">
              AI Tools
            </a>
            <a href="/news" className="text-gray-700 hover:text-blue-600 font-medium">
              News
            </a>
            <a href="/forum" className="text-gray-700 hover:text-blue-600 font-medium">
              Forum
            </a>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <Button variant="ghost" size="icon" className="text-gray-700">
              <Search className="h-4 w-4" />
            </Button>

            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="md:hidden text-gray-700">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  Lightbulb, 
  Wrench, 
  Video, 
  FileText, 
  Newspaper,
  Copy,
  Eye,
  Heart,
  Share
} from "lucide-react";

interface ContentCardProps {
  id: string;
  title: string;
  description: string;
  type: "prompt" | "tip" | "tool" | "video" | "article" | "news";
  category: string;
  difficulty?: "basic" | "advanced";
  language: "en";
  viewCount?: number;
  likes?: number;
  isBookmarked?: boolean;
}

const ContentCard = ({
  id,
  title,
  description,
  type,
  category,
  difficulty = "basic",
  language,
  viewCount = 0,
  likes = 0,
  isBookmarked = false
}: ContentCardProps) => {
  const typeIcons = {
    prompt: Target,
    tip: Lightbulb,
    tool: Wrench,
    video: Video,
    article: FileText,
    news: Newspaper
  };

  const typeColors = {
    prompt: "bg-primary/10 text-primary border-primary/20",
    tip: "bg-success/10 text-success border-success/20",
    tool: "bg-secondary/10 text-secondary border-secondary/20",
    video: "bg-accent/10 text-accent border-accent/20",
    article: "bg-muted text-muted-foreground border-muted-foreground/20",
    news: "bg-destructive/10 text-destructive border-destructive/20"
  };

  const typeLabels = {
    prompt: "Prompt",
    tip: "Tip", 
    tool: "Tool",
    video: "Video",
    article: "Article",
    news: "News"
  };

  const difficultyLabels = {
    basic: "Basic",
    advanced: "Advanced"
  };

  const IconComponent = typeIcons[type];

  return (
    <Card className="content-card cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className={`p-2 rounded-lg border ${typeColors[type]}`}>
              <IconComponent className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-smooth">
              {title}
            </CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart className={`h-4 w-4 ${isBookmarked ? 'fill-current text-destructive' : ''}`} />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
          {description}
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="text-xs">
            {typeLabels[type]}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {category}
          </Badge>
          <Badge 
            variant="outline" 
            className={`text-xs ${difficulty === 'advanced' ? 'border-accent text-accent' : ''}`}
          >
            {difficultyLabels[difficulty]}
          </Badge>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {viewCount}
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {likes}
            </div>
          </div>

          <div className="flex gap-1">
            {type === "prompt" && (
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Share className="h-3 w-3 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentCard;
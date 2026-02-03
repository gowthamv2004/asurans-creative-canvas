import { Star, Trash2, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromptHistoryItem } from "@/hooks/usePromptHistory";
import { useState } from "react";

interface PromptHistoryProps {
  history: PromptHistoryItem[];
  favorites: PromptHistoryItem[];
  onSelectPrompt: (prompt: string, style: string) => void;
  onToggleFavorite: (id: string) => void;
  onRemove: (id: string) => void;
  onClearHistory: () => void;
}

const PromptHistory = ({
  history,
  favorites,
  onSelectPrompt,
  onToggleFavorite,
  onRemove,
  onClearHistory,
}: PromptHistoryProps) => {
  const [showFavorites, setShowFavorites] = useState(true);
  const [showHistory, setShowHistory] = useState(true);

  const recentHistory = history.filter((item) => !item.isFavorite).slice(0, 10);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (history.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <Clock className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        <h4 className="font-medium mb-1">No history yet</h4>
        <p className="text-sm text-muted-foreground">
          Your generated prompts will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setShowFavorites(!showFavorites)}
            onKeyDown={(e) => e.key === 'Enter' && setShowFavorites(!showFavorites)}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="font-medium">Favorites</span>
              <span className="text-xs text-muted-foreground">
                ({favorites.length})
              </span>
            </div>
            {showFavorites ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          {showFavorites && (
            <div className="px-4 pb-4 space-y-2">
              {favorites.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors cursor-pointer group"
                  onClick={() => onSelectPrompt(item.prompt, item.style)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">{item.prompt}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-primary">{item.style}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(item.timestamp)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(item.id);
                        }}
                      >
                        <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent History Section */}
      <div className="glass-card overflow-hidden">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setShowHistory(!showHistory)}
          onKeyDown={(e) => e.key === 'Enter' && setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Recent History</span>
            <span className="text-xs text-muted-foreground">
              ({recentHistory.length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            {recentHistory.length > 0 && (
              <span
                role="button"
                tabIndex={0}
                className="text-xs text-muted-foreground hover:text-destructive cursor-pointer px-2 py-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearHistory();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.stopPropagation();
                    onClearHistory();
                  }
                }}
              >
                Clear
              </span>
            )}
            {showHistory ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
        {showHistory && recentHistory.length > 0 && (
          <div className="px-4 pb-4 space-y-2">
            {recentHistory.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors cursor-pointer group"
                onClick={() => onSelectPrompt(item.prompt, item.style)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-clamp-2">{item.prompt}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-primary">{item.style}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(item.timestamp)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(item.id);
                      }}
                    >
                      <Star className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(item.id);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptHistory;

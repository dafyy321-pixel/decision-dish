import { Button } from "@/components/ui/button";
import { Restaurant } from "@/data/restaurants";
import { MapPin, RefreshCw } from "lucide-react";

interface ResultDisplayProps {
  result: Restaurant | string;
  mode: "system" | "custom";
  onDrawAgain: () => void;
}

const ResultDisplay = ({ result, mode, onDrawAgain }: ResultDisplayProps) => {
  const isRestaurant = typeof result !== "string";

  return (
    <div className="animate-bounce-in">
      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-3xl p-8 shadow-xl border-2 border-primary/20 mb-6">
        <div className="text-center space-y-4">
          <div className="text-sm text-muted-foreground font-medium">今天吃这个！</div>
          <div className="text-4xl font-bold text-foreground mb-2">
            {isRestaurant ? result.name : result}
          </div>
          {isRestaurant && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{result.address}</span>
            </div>
          )}
          {isRestaurant && result.category && (
            <div className="inline-block px-4 py-1 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium">
              {result.category}
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={onDrawAgain}
        variant="outline"
        className="w-full h-14 rounded-3xl border-2 hover:bg-secondary hover:border-primary/50 transition-all"
      >
        <RefreshCw className="w-5 h-5 mr-2" />
        再抽一次
      </Button>
    </div>
  );
};

export default ResultDisplay;

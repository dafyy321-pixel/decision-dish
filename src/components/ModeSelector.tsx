import { Button } from "@/components/ui/button";
import { Utensils, ListPlus } from "lucide-react";

interface ModeSelectorProps {
  mode: "system" | "custom";
  onModeChange: (mode: "system" | "custom") => void;
}

const ModeSelector = ({ mode, onModeChange }: ModeSelectorProps) => {
  return (
    <div className="flex gap-3 p-2 bg-card rounded-3xl shadow-sm">
      <Button
        variant={mode === "system" ? "default" : "ghost"}
        className={`flex-1 rounded-3xl h-12 gap-2 transition-all ${
          mode === "system" 
            ? "bg-primary text-primary-foreground shadow-md" 
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        }`}
        onClick={() => onModeChange("system")}
      >
        <Utensils className="w-5 h-5" />
        <span className="font-medium">系统推荐</span>
      </Button>
      <Button
        variant={mode === "custom" ? "default" : "ghost"}
        className={`flex-1 rounded-3xl h-12 gap-2 transition-all ${
          mode === "custom" 
            ? "bg-primary text-primary-foreground shadow-md" 
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        }`}
        onClick={() => onModeChange("custom")}
      >
        <ListPlus className="w-5 h-5" />
        <span className="font-medium">自定义</span>
      </Button>
    </div>
  );
};

export default ModeSelector;

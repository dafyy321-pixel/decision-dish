import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface DrawButtonProps {
  onClick: () => void;
  isDrawing: boolean;
  disabled?: boolean;
}

const DrawButton = ({ onClick, isDrawing, disabled }: DrawButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isDrawing}
      className={`w-full h-16 rounded-3xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-black text-lg font-semibold shadow-lg transition-all ${
        isDrawing ? "animate-shake" : "hover:scale-105"
      }`}
    >
      <Sparkles className={`w-6 h-6 mr-2 ${isDrawing ? "animate-spin" : ""}`} />
      {isDrawing ? "抽取中..." : "开始抽取"}
    </Button>
  );
};

export default DrawButton;

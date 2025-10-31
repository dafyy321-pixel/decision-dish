import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";

interface CustomListManagerProps {
  items: string[];
  onItemsChange: (items: string[]) => void;
}

const CustomListManager = ({ items, onItemsChange }: CustomListManagerProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (!inputValue.trim()) {
      toast.error("请输入店铺名称");
      return;
    }
    if (items.includes(inputValue.trim())) {
      toast.error("该店铺已存在");
      return;
    }
    if (items.length >= 20) {
      toast.error("最多添加20个店铺");
      return;
    }
    onItemsChange([...items, inputValue.trim()]);
    setInputValue("");
    toast.success("添加成功");
  };

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onItemsChange(newItems);
    toast.success("删除成功");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="输入店铺名称..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1 h-12 rounded-2xl border-2 border-border focus-visible:ring-primary"
        />
        <Button
          onClick={handleAdd}
          size="icon"
          className="h-12 w-12 rounded-2xl bg-primary hover:bg-primary/90"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="mb-2">还没有添加任何店铺</p>
          <p className="text-sm">快来添加你喜欢的店铺吧～</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-card rounded-2xl border border-border hover:border-primary/50 transition-colors"
            >
              <span className="text-foreground font-medium">{item}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleRemove(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          已添加 {items.length}/20 个店铺
        </p>
      )}
    </div>
  );
};

export default CustomListManager;

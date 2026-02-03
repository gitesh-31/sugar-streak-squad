import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Target, Flame, Drumstick, Wheat, Candy, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface NutritionGoals {
  calorie_goal: number;
  protein_goal: number;
  carbs_goal: number;
  sugar_limit: number;
}

interface NutritionGoalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentGoals: NutritionGoals;
  onSave: (goals: NutritionGoals) => Promise<void>;
}

export function NutritionGoalsDialog({
  open,
  onOpenChange,
  currentGoals,
  onSave,
}: NutritionGoalsDialogProps) {
  const [goals, setGoals] = useState<NutritionGoals>(currentGoals);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setGoals(currentGoals);
  }, [currentGoals, open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(goals);
      toast.success("Nutrition goals updated!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to save goals");
    } finally {
      setSaving(false);
    }
  };

  const presets = [
    { name: "Weight Loss", calories: 1500, protein: 150, carbs: 100, sugar: 15 },
    { name: "Maintenance", calories: 2000, protein: 120, carbs: 250, sugar: 25 },
    { name: "Muscle Gain", calories: 2500, protein: 180, carbs: 300, sugar: 30 },
    { name: "Low Carb", calories: 1800, protein: 140, carbs: 50, sugar: 10 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Nutrition Goals
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Presets */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick Presets</Label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setGoals({
                      calorie_goal: preset.calories,
                      protein_goal: preset.protein,
                      carbs_goal: preset.carbs,
                      sugar_limit: preset.sugar,
                    })
                  }
                  className="text-xs"
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Calories */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-primary" />
                Daily Calories
              </Label>
              <Input
                type="number"
                value={goals.calorie_goal}
                onChange={(e) =>
                  setGoals((g) => ({ ...g, calorie_goal: parseInt(e.target.value) || 0 }))
                }
                className="w-24 h-8 text-right"
              />
            </div>
            <Slider
              value={[goals.calorie_goal]}
              onValueChange={([value]) => setGoals((g) => ({ ...g, calorie_goal: value }))}
              min={1000}
              max={4000}
              step={50}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1000</span>
              <span>4000 kcal</span>
            </div>
          </div>

          {/* Protein */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Drumstick className="h-4 w-4 text-primary" />
                Protein Goal
              </Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={goals.protein_goal}
                  onChange={(e) =>
                    setGoals((g) => ({ ...g, protein_goal: parseInt(e.target.value) || 0 }))
                  }
                  className="w-20 h-8 text-right"
                />
                <span className="text-sm text-muted-foreground">g</span>
              </div>
            </div>
            <Slider
              value={[goals.protein_goal]}
              onValueChange={([value]) => setGoals((g) => ({ ...g, protein_goal: value }))}
              min={50}
              max={300}
              step={5}
            />
          </div>

          {/* Carbs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Wheat className="h-4 w-4 text-accent" />
                Carbs Goal
              </Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={goals.carbs_goal}
                  onChange={(e) =>
                    setGoals((g) => ({ ...g, carbs_goal: parseInt(e.target.value) || 0 }))
                  }
                  className="w-20 h-8 text-right"
                />
                <span className="text-sm text-muted-foreground">g</span>
              </div>
            </div>
            <Slider
              value={[goals.carbs_goal]}
              onValueChange={([value]) => setGoals((g) => ({ ...g, carbs_goal: value }))}
              min={20}
              max={400}
              step={10}
            />
          </div>

          {/* Sugar Limit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Candy className="h-4 w-4 text-warning" />
                Sugar Limit
              </Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={goals.sugar_limit}
                  onChange={(e) =>
                    setGoals((g) => ({ ...g, sugar_limit: parseInt(e.target.value) || 0 }))
                  }
                  className="w-20 h-8 text-right"
                />
                <span className="text-sm text-muted-foreground">g</span>
              </div>
            </div>
            <Slider
              value={[goals.sugar_limit]}
              onValueChange={([value]) => setGoals((g) => ({ ...g, sugar_limit: value }))}
              min={0}
              max={100}
              step={5}
            />
            <p className="text-xs text-muted-foreground">
              {goals.sugar_limit === 0
                ? "Zero sugar tolerance - hardcore mode! 💪"
                : `Stay under ${goals.sugar_limit}g to maintain your streak`}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Goals"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

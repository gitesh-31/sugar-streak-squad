import { cn } from "@/lib/utils";

interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  sugar: number;
}

interface FoodCardProps {
  name: string;
  time: string;
  nutrition: NutritionInfo;
  imageUrl?: string;
  className?: string;
}

export function FoodCard({ name, time, nutrition, imageUrl, className }: FoodCardProps) {
  const hasSugar = nutrition.sugar > 0;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl bg-card shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-0.5",
        hasSugar && "ring-2 ring-warning/30",
        className
      )}
    >
      <div className="flex gap-4 p-4">
        {/* Food Image */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl">
              🍽️
            </div>
          )}
          {hasSugar && (
            <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-warning text-[10px]">
              ⚠️
            </div>
          )}
        </div>

        {/* Food Info */}
        <div className="flex flex-1 flex-col justify-center">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display font-semibold text-foreground">{name}</h3>
              <p className="text-xs text-muted-foreground">{time}</p>
            </div>
            <span className="text-sm font-semibold text-primary">
              {nutrition.calories} kcal
            </span>
          </div>

          {/* Nutrition Pills */}
          <div className="mt-2 flex gap-2">
            <NutritionPill label="P" value={nutrition.protein} unit="g" variant="protein" />
            <NutritionPill label="C" value={nutrition.carbs} unit="g" variant="carbs" />
            <NutritionPill
              label="S"
              value={nutrition.sugar}
              unit="g"
              variant={hasSugar ? "sugar-warning" : "sugar"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface NutritionPillProps {
  label: string;
  value: number;
  unit: string;
  variant: "protein" | "carbs" | "sugar" | "sugar-warning";
}

function NutritionPill({ label, value, unit, variant }: NutritionPillProps) {
  const variantClasses = {
    protein: "bg-primary/10 text-primary",
    carbs: "bg-secondary text-secondary-foreground",
    sugar: "bg-success/10 text-success",
    "sugar-warning": "bg-warning/20 text-warning-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
        variantClasses[variant]
      )}
    >
      <span className="font-semibold">{label}</span>
      <span>
        {value}
        {unit}
      </span>
    </span>
  );
}

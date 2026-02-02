import { useState } from "react";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, MoreVertical, X, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  sugar: number;
}

interface FoodCardProps {
  id?: string;
  name: string;
  time: string;
  nutrition: NutritionInfo;
  imageUrl?: string;
  className?: string;
  onEdit?: (id: string, updates: { name: string; nutrition: NutritionInfo }) => void;
  onDelete?: (id: string) => void;
}

export function FoodCard({ 
  id, 
  name, 
  time, 
  nutrition, 
  imageUrl, 
  className,
  onEdit,
  onDelete 
}: FoodCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editNutrition, setEditNutrition] = useState(nutrition);
  
  const hasSugar = nutrition.sugar > 0;

  const handleSaveEdit = () => {
    if (id && onEdit) {
      onEdit(id, { name: editName, nutrition: editNutrition });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(name);
    setEditNutrition(nutrition);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (id && onDelete) {
      onDelete(id);
    }
    setShowDeleteConfirm(false);
  };

  if (isEditing) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl bg-card shadow-card p-4",
          className
        )}
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Food Name</label>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="h-9"
            />
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Calories</label>
              <Input
                type="number"
                value={editNutrition.calories}
                onChange={(e) => setEditNutrition({ ...editNutrition, calories: parseInt(e.target.value) || 0 })}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Protein</label>
              <Input
                type="number"
                value={editNutrition.protein}
                onChange={(e) => setEditNutrition({ ...editNutrition, protein: parseInt(e.target.value) || 0 })}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Carbs</label>
              <Input
                type="number"
                value={editNutrition.carbs}
                onChange={(e) => setEditNutrition({ ...editNutrition, carbs: parseInt(e.target.value) || 0 })}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Sugar</label>
              <Input
                type="number"
                value={editNutrition.sugar}
                onChange={(e) => setEditNutrition({ ...editNutrition, sugar: parseInt(e.target.value) || 0 })}
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveEdit}>
              <Check className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
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
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-primary">
                  {nutrition.calories} kcal
                </span>
                {(onEdit || onDelete) && id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEdit && (
                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem 
                          onClick={() => setShowDeleteConfirm(true)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
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

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Food Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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

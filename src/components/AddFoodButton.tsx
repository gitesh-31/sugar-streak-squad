import { Plus, Camera, Search, PenLine } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface AddFoodButtonProps {
  onScan?: () => void;
  onSearch?: () => void;
  onManual?: () => void;
  className?: string;
}

export function AddFoodButton({ onScan, onSearch, onManual, className }: AddFoodButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="xl"
          className={cn(
            "fixed bottom-6 right-6 rounded-full shadow-elevated gradient-primary z-50",
            "h-14 w-14 p-0",
            className
          )}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 rounded-xl p-2"
        sideOffset={8}
      >
        <DropdownMenuItem
          onClick={onScan}
          className="flex items-center gap-3 rounded-lg p-3 cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
            <Camera className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">Scan Food</p>
            <p className="text-xs text-muted-foreground">Auto-detect nutrition</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onSearch}
          className="flex items-center gap-3 rounded-lg p-3 cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            <Search className="h-5 w-5 text-secondary-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">Search Food</p>
            <p className="text-xs text-muted-foreground">Find in database</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onManual}
          className="flex items-center gap-3 rounded-lg p-3 cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            <PenLine className="h-5 w-5 text-secondary-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">Add Manually</p>
            <p className="text-xs text-muted-foreground">Enter details yourself</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

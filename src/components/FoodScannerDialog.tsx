import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, Loader2, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFoodEntries } from "@/hooks/useFoodEntries";
import { useAuth } from "@/hooks/useAuth";

interface FoodScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NutritionResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  sugar: number;
}

export function FoodScannerDialog({ open, onOpenChange }: FoodScannerDialogProps) {
  const { user } = useAuth();
  const { addEntry } = useFoodEntries();
  const [step, setStep] = useState<"upload" | "scanning" | "result">("upload");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<NutritionResult | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setStep("upload");
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!imagePreview) return;

    setStep("scanning");

    try {
      const { data, error } = await supabase.functions.invoke("analyze-food", {
        body: { image: imagePreview },
      });

      if (error) throw error;

      setResult(data);
      setStep("result");
    } catch (err) {
      console.error("Scan error:", err);
      toast.error("Failed to analyze food. Please try again.");
      setStep("upload");
    }
  };

  const handleSave = async () => {
    if (!result || !user) return;

    setSaving(true);
    try {
      let imageUrl: string | null = null;

      // Upload image to storage if we have one
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("food-images")
          .upload(fileName, imageFile);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("food-images")
            .getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        }
      }

      const { error } = await addEntry({
        name: result.name,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        sugar: result.sugar,
        image_url: imageUrl,
        logged_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success(`Added ${result.name} to your log! 🎉`);
      onOpenChange(false);
      resetState();
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save food entry.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => {
      if (!o) resetState();
      onOpenChange(o);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Food Scanner
          </DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Food preview"
                  className="w-full h-48 object-cover rounded-xl"
                />
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Tap to take a photo or upload an image
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Photo
              </Button>
              <Button
                className="flex-1"
                disabled={!imagePreview}
                onClick={handleScan}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze
              </Button>
            </div>
          </div>
        )}

        {step === "scanning" && (
          <div className="py-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">
              Analyzing your food with AI...
            </p>
          </div>
        )}

        {step === "result" && result && (
          <div className="space-y-4">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Food"
                className="w-full h-32 object-cover rounded-xl"
              />
            )}

            <div className="space-y-3">
              <div>
                <Label>Food Name</Label>
                <Input
                  value={result.name}
                  onChange={(e) => setResult({ ...result, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Calories</Label>
                  <Input
                    type="number"
                    value={result.calories}
                    onChange={(e) => setResult({ ...result, calories: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Protein (g)</Label>
                  <Input
                    type="number"
                    value={result.protein}
                    onChange={(e) => setResult({ ...result, protein: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Carbs (g)</Label>
                  <Input
                    type="number"
                    value={result.carbs}
                    onChange={(e) => setResult({ ...result, carbs: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Sugar (g)</Label>
                  <Input
                    type="number"
                    value={result.sugar}
                    onChange={(e) => setResult({ ...result, sugar: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={resetState}
              >
                Scan Again
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Add to Log"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { DashboardSummary } from "../backend.d";
import { useUpdateProfile } from "../hooks/useQueries";

const LANGUAGES = [
  { value: "English", label: "🇬🇧 English" },
  { value: "Spanish", label: "🇪🇸 Spanish" },
  { value: "French", label: "🇫🇷 French" },
  { value: "Hindi", label: "🇮🇳 Hindi" },
  { value: "Mandarin", label: "🇨🇳 Mandarin" },
  { value: "Arabic", label: "🇸🇦 Arabic" },
];

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: DashboardSummary | null | undefined;
}

export function SettingsModal({
  open,
  onOpenChange,
  summary,
}: SettingsModalProps) {
  const profile = summary?.profile;
  const [language, setLanguage] = useState(profile?.language ?? "English");
  const [dailyGoal, setDailyGoal] = useState(
    profile ? String(profile.dailyGoal) : "5",
  );

  useEffect(() => {
    if (profile) {
      setLanguage(profile.language ?? "English");
      setDailyGoal(String(profile.dailyGoal));
    }
  }, [profile]);

  const updateProfile = useUpdateProfile();

  const handleSave = async () => {
    const goalNum = Number.parseInt(dailyGoal, 10);
    if (Number.isNaN(goalNum) || goalNum < 1 || goalNum > 50) {
      toast.error("Daily goal must be between 1 and 50");
      return;
    }
    try {
      await updateProfile.mutateAsync({
        language,
        dailyGoal: BigInt(goalNum),
      });
      toast.success("Settings saved!");
      onOpenChange(false);
    } catch {
      toast.error("Failed to save settings");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="settings.dialog"
        className="sm:max-w-md bg-card border-border"
      >
        <DialogHeader>
          <DialogTitle className="font-display font-bold text-lg flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Settings
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Configure your FocusFlow AI preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Preferred Language
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger
                data-ocid="settings.language_select"
                className="bg-background border-border"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="daily-goal"
              className="text-xs text-muted-foreground uppercase tracking-wider"
            >
              Daily Task Goal
            </Label>
            <Input
              id="daily-goal"
              data-ocid="settings.goal_input"
              type="number"
              min={1}
              max={50}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(e.target.value)}
              className="bg-background border-border"
              placeholder="e.g. 5"
            />
            <p className="text-xs text-muted-foreground">
              Number of tasks to complete each day
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            data-ocid="settings.cancel_button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border"
          >
            Cancel
          </Button>
          <Button
            type="button"
            data-ocid="settings.save_button"
            onClick={() => void handleSave()}
            disabled={updateProfile.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
          >
            {updateProfile.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

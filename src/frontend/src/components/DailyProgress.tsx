import { Badge } from "@/components/ui/badge";
import { Target, Trophy, Zap } from "lucide-react";
import { motion } from "motion/react";
import type { DashboardSummary } from "../backend.d";

interface DailyProgressProps {
  summary: DashboardSummary | null | undefined;
  isLoading: boolean;
}

export function DailyProgress({ summary, isLoading }: DailyProgressProps) {
  const profile = summary?.profile;
  const tasks = summary?.tasks ?? [];

  const dailyGoal = profile ? Number(profile.dailyGoal) : 5;
  const completedToday = profile ? Number(profile.completedToday) : 0;
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const completed = Math.max(completedToday, doneTasks);
  const percentage =
    dailyGoal > 0 ? Math.min(100, (completed / dailyGoal) * 100) : 0;
  const isGoalMet = completed >= dailyGoal && dailyGoal > 0;

  if (isLoading) {
    return (
      <div
        className="w-full rounded-xl glass-card p-4 animate-pulse"
        data-ocid="progress.loading_state"
      >
        <div className="h-4 bg-muted rounded-lg w-1/3 mb-3" />
        <div className="h-3 bg-muted rounded-full w-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full rounded-xl glass-card p-4 relative overflow-hidden"
    >
      {/* Background glow accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isGoalMet
            ? "radial-gradient(ellipse at 80% 50%, oklch(0.68 0.18 145 / 0.12) 0%, transparent 70%)"
            : "radial-gradient(ellipse at 80% 50%, oklch(0.73 0.22 40 / 0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex items-center justify-between mb-3 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              isGoalMet
                ? "bg-success/15 border border-success/30"
                : "bg-primary/12 border border-primary/25"
            }`}
          >
            <Target
              className={`w-4.5 h-4.5 ${isGoalMet ? "text-success" : "text-primary"}`}
            />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              Daily Mission
            </p>
            <p className="text-sm font-bold text-foreground">
              {completed}{" "}
              <span className="text-muted-foreground font-normal">
                / {dailyGoal} tasks completed
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isGoalMet ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Badge className="bg-success/20 text-success border border-success/40 font-bold gap-1 px-3 py-1">
                <Trophy className="w-3.5 h-3.5" />
                Goal Met!
              </Badge>
            </motion.div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-bold text-primary tabular-nums">
                {Math.round(percentage)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="w-full h-2 bg-muted/60 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full relative"
            style={{
              background: isGoalMet
                ? "linear-gradient(90deg, oklch(0.68 0.18 145) 0%, oklch(0.72 0.2 160) 100%)"
                : "linear-gradient(90deg, oklch(0.65 0.2 28) 0%, oklch(0.73 0.22 40) 60%, oklch(0.8 0.2 50) 100%)",
              boxShadow: isGoalMet
                ? "0 0 10px oklch(0.68 0.18 145 / 0.7), 0 0 20px oklch(0.68 0.18 145 / 0.3)"
                : "0 0 10px oklch(0.73 0.22 40 / 0.7), 0 0 20px oklch(0.73 0.22 40 / 0.3)",
            }}
            initial={{ width: "0%" }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Shimmer overlay */}
            {percentage > 5 && (
              <div
                className="absolute inset-0 animate-shimmer rounded-full"
                style={{ opacity: 0.6 }}
              />
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

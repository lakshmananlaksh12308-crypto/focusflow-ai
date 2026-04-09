import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Gift,
  Loader2,
  Lock,
  Play,
  Shield,
  ShieldOff,
  Square,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { DashboardSummary, SessionState } from "../backend.d";
import { useUpdateSession } from "../hooks/useQueries";

const BLOCKED_SITES = [
  { name: "Instagram", icon: "📸" },
  { name: "YouTube", icon: "▶️" },
  { name: "TikTok", icon: "🎵" },
  { name: "Twitter / X", icon: "𝕏" },
  { name: "Reddit", icon: "🤖" },
  { name: "Netflix", icon: "🎬" },
  { name: "Facebook", icon: "👤" },
];

interface FocusTimerTabProps {
  summary: DashboardSummary | null | undefined;
  isLoading: boolean;
}

export function FocusTimerTab({ summary, isLoading }: FocusTimerTabProps) {
  const session = summary?.session ?? {
    timerSeconds: BigInt(25 * 60),
    inStudyMode: false,
    currentReward: false,
  };

  const profile = summary?.profile;
  const dailyGoal = profile ? Number(profile.dailyGoal) : 5;
  const completedToday = profile ? Number(profile.completedToday) : 0;
  const isGoalMet = completedToday >= dailyGoal;

  const [localSeconds, setLocalSeconds] = useState(
    Number(session.timerSeconds),
  );
  const [showGoalWarning, setShowGoalWarning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const updateSession = useUpdateSession();

  // Sync from backend
  useEffect(() => {
    setLocalSeconds(Number(session.timerSeconds));
  }, [session.timerSeconds]);

  // Countdown interval
  useEffect(() => {
    if (session.inStudyMode) {
      intervalRef.current = setInterval(() => {
        setLocalSeconds((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [session.inStudyMode]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleStart = async () => {
    if (!isGoalMet) {
      setShowGoalWarning(true);
      setTimeout(() => setShowGoalWarning(false), 4000);
    }
    const newState: SessionState = {
      inStudyMode: true,
      timerSeconds: BigInt(25 * 60),
      currentReward: false,
    };
    try {
      setLocalSeconds(25 * 60);
      await updateSession.mutateAsync(newState);
      toast.success("LOCKDIN MODE activated! Stay focused.");
    } catch {
      toast.error("Failed to start session");
    }
  };

  const handleStop = async () => {
    const newState: SessionState = {
      inStudyMode: false,
      timerSeconds: BigInt(25 * 60),
      currentReward: false,
    };
    try {
      await updateSession.mutateAsync(newState);
      setLocalSeconds(25 * 60);
      toast.success("Session ended. Great work!");
    } catch {
      toast.error("Failed to stop session");
    }
  };

  const progressPercent =
    localSeconds > 0 ? ((25 * 60 - localSeconds) / (25 * 60)) * 100 : 100;

  const circumference = 2 * Math.PI * 108;

  return (
    <div className="space-y-6">
      {/* LOCKDIN Banner */}
      <AnimatePresence>
        {session.inStudyMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl lockdin-border p-4 flex items-center gap-3 overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.73 0.22 40 / 0.1) 0%, oklch(0.13 0.009 258) 100%)",
            }}
          >
            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center animate-pulse-glow flex-shrink-0">
              <Lock className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <p className="font-display font-black text-primary tracking-widest text-sm uppercase">
                LOCKDIN MODE
              </p>
              <p className="text-xs text-muted-foreground">
                Distractions blocked — stay in the zone
              </p>
            </div>
            <Badge className="ml-auto bg-primary/20 text-primary border border-primary/40 animate-pulse font-bold">
              ACTIVE
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward Banner */}
      <AnimatePresence>
        {session.currentReward && (
          <motion.div
            data-ocid="timer.reward_panel"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-xl border border-success/40 p-4 flex items-center gap-3"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.68 0.18 145 / 0.1) 0%, oklch(0.13 0.009 258) 100%)",
            }}
          >
            <Gift className="w-6 h-6 text-success flex-shrink-0" />
            <div>
              <p className="font-display font-bold text-success text-sm">
                🎉 15-min Reward Break Earned!
              </p>
              <p className="text-xs text-muted-foreground">
                You completed a task — enjoy your break
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goal warning */}
      <AnimatePresence>
        {showGoalWarning && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border border-warning/40 p-3 flex items-center gap-2"
            style={{ background: "oklch(0.78 0.18 75 / 0.08)" }}
          >
            <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
            <p className="text-xs text-warning">
              Complete your daily goal to unlock reward breaks!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer display — dramatic center piece */}
      <div className="flex flex-col items-center gap-8 py-6">
        <div className="relative w-64 h-64">
          {/* Outer glow ring — only in focus mode */}
          {session.inStudyMode && (
            <div
              className="absolute inset-0 rounded-full animate-orb-pulse pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, oklch(0.73 0.22 40 / 0.15) 0%, transparent 70%)",
                filter: "blur(16px)",
              }}
            />
          )}

          {/* Pulsing outer ring in focus mode */}
          {session.inStudyMode && (
            <motion.div
              className="absolute -inset-3 rounded-full border-2 border-primary/30"
              animate={{ scale: [1, 1.04, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          )}

          <svg
            className="w-64 h-64 -rotate-90"
            viewBox="0 0 240 240"
            aria-label="Timer progress"
            role="img"
          >
            {/* Track */}
            <circle
              cx="120"
              cy="120"
              r="108"
              fill="none"
              stroke="oklch(0.22 0.012 260)"
              strokeWidth="5"
            />
            {/* Progress arc */}
            <motion.circle
              cx="120"
              cy="120"
              r="108"
              fill="none"
              stroke={
                session.inStudyMode
                  ? "oklch(0.73 0.22 40)"
                  : "oklch(0.5 0.015 260)"
              }
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={false}
              animate={{
                strokeDashoffset:
                  circumference - (circumference * progressPercent) / 100,
              }}
              transition={{ duration: 1, ease: "linear" }}
              style={{
                filter: session.inStudyMode
                  ? "drop-shadow(0 0 8px oklch(0.73 0.22 40 / 0.8)) drop-shadow(0 0 16px oklch(0.73 0.22 40 / 0.4))"
                  : "none",
              }}
            />
          </svg>

          {/* Timer text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isLoading ? (
              <Loader2
                data-ocid="timer.loading_state"
                className="w-8 h-8 animate-spin text-muted-foreground"
              />
            ) : (
              <>
                <span
                  className="timer-display text-6xl tabular-nums"
                  style={{
                    color: session.inStudyMode
                      ? "oklch(0.88 0.18 45)"
                      : "oklch(0.82 0.01 85)",
                    textShadow: session.inStudyMode
                      ? "0 0 40px oklch(0.73 0.22 40 / 0.5), 0 0 80px oklch(0.73 0.22 40 / 0.2)"
                      : "none",
                  }}
                >
                  {formatTime(localSeconds)}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-2 font-semibold">
                  {session.inStudyMode ? "In Session" : "Pomodoro — 25 min"}
                </span>
                {session.inStudyMode && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] text-primary font-bold uppercase tracking-widest">
                      Locked In
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex gap-3">
          {!session.inStudyMode ? (
            <Button
              type="button"
              data-ocid="timer.start_button"
              onClick={() => void handleStart()}
              disabled={updateSession.isPending}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-2 px-10 glow-primary rounded-xl hover:scale-[1.03] active:scale-[0.97] transition-all"
            >
              {updateSession.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5 fill-current" />
              )}
              Start Focus
            </Button>
          ) : (
            <Button
              type="button"
              data-ocid="timer.stop_button"
              onClick={() => void handleStop()}
              disabled={updateSession.isPending}
              size="lg"
              variant="outline"
              className="border-destructive/50 text-destructive hover:bg-destructive/10 font-bold gap-2 px-10 rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97]"
            >
              {updateSession.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Square className="w-5 h-5 fill-current" />
              )}
              End Session
            </Button>
          )}
        </div>

        {updateSession.isError && (
          <p
            data-ocid="timer.error_state"
            className="text-xs text-destructive text-center"
          >
            Failed to update session — try again
          </p>
        )}
      </div>

      {/* Blocked sites panel */}
      <motion.div
        data-ocid="timer.blacklist_panel"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl glass-card p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          {session.inStudyMode ? (
            <Shield className="w-4 h-4 text-primary" />
          ) : (
            <ShieldOff className="w-4 h-4 text-muted-foreground" />
          )}
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {session.inStudyMode
              ? "Active Distraction Shield"
              : "Distraction Shield"}
          </h3>
          <Badge
            variant="outline"
            className={`ml-auto text-[10px] font-bold ${
              session.inStudyMode
                ? "border-primary/40 text-primary bg-primary/10 shadow-[0_0_8px_oklch(0.73_0.22_40/0.2)]"
                : "border-muted-foreground/20 text-muted-foreground"
            }`}
          >
            {session.inStudyMode ? "ENFORCED" : "STANDBY"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {BLOCKED_SITES.map((site) => (
            <div
              key={site.name}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                session.inStudyMode
                  ? "bg-destructive/10 text-destructive/80 border border-destructive/25"
                  : "bg-muted/30 text-muted-foreground border border-border"
              }`}
            >
              <span>{site.icon}</span>
              <span className="truncate">{site.name}</span>
              {session.inStudyMode && (
                <Lock className="w-3 h-3 ml-auto flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

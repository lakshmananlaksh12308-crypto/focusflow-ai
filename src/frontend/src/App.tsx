import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Brain,
  CheckSquare,
  Lock,
  LogOut,
  Settings,
  Sparkles,
  Timer,
  TrendingUp,
  Trophy,
  User,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { DashboardSummary } from "./backend.d";
import { Status } from "./backend.d";
import { AITutorTab } from "./components/AITutorTab";
import { DailyProgress } from "./components/DailyProgress";
import { FocusTimerTab } from "./components/FocusTimerTab";
import { LoginPage } from "./components/LoginPage";
import { QuizTab } from "./components/QuizTab";
import { SettingsModal } from "./components/SettingsModal";
import { StudyContentTab } from "./components/StudyContentTab";
import { TasksTab } from "./components/TasksTab";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useDashboard } from "./hooks/useQueries";

const TABS = [
  { value: "dashboard", label: "Dashboard", Icon: Zap, shortLabel: "Home" },
  { value: "tasks", label: "Tasks", Icon: CheckSquare, shortLabel: "Tasks" },
  { value: "timer", label: "LOCKDIN", Icon: Timer, shortLabel: "Timer" },
  { value: "quiz", label: "Quiz", Icon: Brain, shortLabel: "Quiz" },
  {
    value: "study",
    label: "Study Content",
    Icon: BookOpen,
    shortLabel: "Study",
  },
  { value: "tutor", label: "AI Tutor", Icon: Sparkles, shortLabel: "Tutor" },
];

interface DashboardTabProps {
  summary: DashboardSummary | null | undefined;
  isLoading: boolean;
}

function DashboardTab({ summary, isLoading }: DashboardTabProps) {
  const tasks = summary?.tasks ?? [];
  const doneTasks = tasks.filter((t) => t.status === Status.done).length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === Status.inProgress,
  ).length;
  const profile = summary?.profile;
  const dailyGoal = profile ? Number(profile.dailyGoal) : 5;
  const completedToday = profile ? Number(profile.completedToday) : 0;
  const lastQuizScore = summary?.lastQuizScore;
  const session = summary?.session;
  const isInStudyMode = session?.inStudyMode ?? false;
  const timerMinutes = session
    ? Math.floor(Number(session.timerSeconds) / 60)
    : 25;

  const STAT_CARDS = [
    {
      label: "Tasks Today",
      value: `${completedToday}/${dailyGoal}`,
      icon: CheckSquare,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
      glow: "shadow-[0_0_16px_oklch(0.73_0.22_40/0.15)]",
    },
    {
      label: "In Progress",
      value: String(inProgressTasks),
      icon: TrendingUp,
      color: "text-info",
      bg: "bg-info/10 border-info/20",
      glow: "shadow-[0_0_16px_oklch(0.65_0.18_240/0.15)]",
    },
    {
      label: "Completed",
      value: String(doneTasks),
      icon: Trophy,
      color: "text-success",
      bg: "bg-success/10 border-success/20",
      glow: "shadow-[0_0_16px_oklch(0.68_0.18_145/0.15)]",
    },
    {
      label: "Quiz Score",
      value: lastQuizScore != null ? `${lastQuizScore.toString()} pts` : "—",
      icon: Brain,
      color: "text-warning",
      bg: "bg-warning/10 border-warning/20",
      glow: "shadow-[0_0_16px_oklch(0.78_0.18_75/0.15)]",
    },
  ];

  if (isLoading) {
    return (
      <div data-ocid="dashboard.loading_state" className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-card/80 animate-pulse border border-border"
            />
          ))}
        </div>
        <div className="h-48 rounded-xl bg-card/80 animate-pulse border border-border" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STAT_CARDS.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className={`rounded-xl border p-4 relative overflow-hidden ${card.bg} ${card.glow}`}
          >
            <div
              className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at top right, currentColor / 0.08 0%, transparent 70%)",
                opacity: 0.4,
              }}
            />
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-background/40 flex items-center justify-center flex-shrink-0">
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold truncate">
                  {card.label}
                </p>
                <p
                  className={`font-display font-black text-2xl leading-none mt-1 ${card.color}`}
                >
                  {card.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Session status */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className={`rounded-xl border p-4 flex items-center gap-3 ${
          isInStudyMode
            ? "border-primary/40 bg-primary/5"
            : "border-border bg-card/70"
        }`}
        style={
          isInStudyMode
            ? { boxShadow: "0 0 20px oklch(0.73 0.22 40 / 0.1)" }
            : {}
        }
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isInStudyMode
              ? "bg-primary/20 border border-primary/40 animate-pulse"
              : "bg-muted/50 border border-border"
          }`}
        >
          <Lock
            className={`w-5 h-5 ${isInStudyMode ? "text-primary" : "text-muted-foreground"}`}
          />
        </div>
        <div>
          <p
            className={`font-display font-bold text-sm uppercase tracking-widest ${
              isInStudyMode ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {isInStudyMode ? "LOCKDIN MODE ACTIVE" : "Focus Session Idle"}
          </p>
          <p className="text-xs text-muted-foreground">
            {isInStudyMode
              ? `${timerMinutes} min remaining — distractions blocked`
              : "Start a focus session to enter LOCKDIN mode"}
          </p>
        </div>
        {isInStudyMode && (
          <Badge className="ml-auto bg-primary/20 text-primary border border-primary/40 animate-pulse font-bold">
            ACTIVE
          </Badge>
        )}
      </motion.div>

      {/* Recent tasks */}
      {tasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl glass-card p-4 space-y-3"
        >
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-primary" />
            <h3 className="font-display font-bold uppercase tracking-widest text-xs text-muted-foreground">
              Recent Tasks
            </h3>
            <Badge
              variant="outline"
              className="ml-auto text-[10px] border-border text-muted-foreground"
            >
              {tasks.length} total
            </Badge>
          </div>
          <div className="space-y-2">
            {tasks.slice(0, 4).map((task) => (
              <div
                key={task.id.toString()}
                className="flex items-center gap-2.5 py-1"
              >
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    task.status === Status.done
                      ? "bg-success"
                      : task.status === Status.inProgress
                        ? "bg-info animate-pulse"
                        : "bg-muted-foreground/40"
                  }`}
                />
                <span
                  className={`text-sm flex-1 min-w-0 truncate ${
                    task.status === Status.done
                      ? "line-through text-muted-foreground/60"
                      : "text-foreground"
                  }`}
                >
                  {task.title}
                </span>
                <span className="text-[10px] text-muted-foreground/60 flex-shrink-0">
                  {task.subject}
                </span>
              </div>
            ))}
            {tasks.length > 4 && (
              <p className="text-xs text-muted-foreground/50 text-center pt-1">
                +{tasks.length - 4} more tasks
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {tasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-dashed border-border p-10 text-center"
        >
          <div
            className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3"
            style={{ boxShadow: "0 0 20px oklch(0.73 0.22 40 / 0.12)" }}
          >
            <Zap className="w-6 h-6 text-primary/70" />
          </div>
          <p className="text-muted-foreground font-semibold text-sm">
            Your mission awaits
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Add tasks and start a focus session to begin
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default function App() {
  const { login, clear, identity, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: summary, isLoading: dashboardLoading } = useDashboard();

  const isLoggedIn = !!identity;
  const principalShort = identity
    ? `${identity.getPrincipal().toString().slice(0, 8)}...`
    : null;

  // Loading / initializing state
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        {/* Background orb */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, oklch(0.73 0.22 40 / 0.08) 0%, transparent 60%)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4 relative z-10"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center glow-primary">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            {/* Spinning ring */}
            <div
              className="absolute -inset-2 rounded-3xl border-2 border-transparent animate-spin"
              style={{
                borderTopColor: "oklch(0.73 0.22 40 / 0.6)",
                borderRightColor: "oklch(0.73 0.22 40 / 0.2)",
              }}
            />
          </div>
          <div className="text-center">
            <p className="font-display font-black text-xl text-foreground tracking-tight">
              FocusFlow <span className="gradient-text">AI</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Initializing your study mission...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Login page
  if (!isLoggedIn) {
    return (
      <>
        <LoginPage onLogin={login} isLoggingIn={isLoggingIn} />
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "oklch(0.14 0.009 258)",
              border: "1px solid oklch(0.22 0.012 260)",
              color: "oklch(0.97 0.008 85)",
            },
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Grid background */}
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-25" />

      {/* Ambient glow */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: "-200px",
          left: "-200px",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, oklch(0.73 0.22 40 / 0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Header */}
      <header className="relative z-20 sticky top-0 bg-background/90 backdrop-blur-md header-glow-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mr-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center glow-primary-sm">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-black text-foreground text-[1.15rem] tracking-[-0.025em] leading-none">
                FocusFlow <span className="gradient-text">AI</span>
              </span>
            </div>
          </div>

          {/* Tab nav (desktop) */}
          <nav className="flex-1 hidden md:flex items-center gap-0.5">
            {TABS.map(({ value, label, Icon }) => (
              <button
                type="button"
                key={value}
                data-ocid={`nav.${value}.tab`}
                onClick={() => setActiveTab(value)}
                className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-all cursor-pointer ${
                  activeTab === value
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden lg:inline">{label}</span>
                {activeTab === value && (
                  <motion.span
                    layoutId="active-tab-underline"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                    style={{
                      boxShadow: "0 0 6px oklch(0.73 0.22 40 / 0.6)",
                    }}
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="flex-1 md:hidden" />

          {/* Right controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              data-ocid="settings.open_modal_button"
              onClick={() => setSettingsOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-md border border-border">
                <User className="w-3 h-3" />
                <span className="font-mono">{principalShort}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clear}
                data-ocid="header.logout_button"
                className="gap-1.5 h-8 text-xs border-border hover:border-destructive/50 hover:text-destructive transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 py-6 space-y-5">
        {/* Daily progress */}
        <DailyProgress summary={summary} isLoading={dashboardLoading} />

        {/* Tab content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Mobile tab bar */}
          <TabsList className="grid grid-cols-6 md:hidden w-full bg-card border border-border h-11 mb-2">
            {TABS.map(({ value, shortLabel, Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                data-ocid={`nav.${value}.tab`}
                className="flex flex-col gap-0.5 text-[9px] data-[state=active]:bg-primary/15 data-[state=active]:text-primary h-full transition-all px-1"
              >
                <Icon className="w-3.5 h-3.5" />
                {shortLabel}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab contents */}
          <AnimatePresence mode="wait">
            <TabsContent value="dashboard" className="mt-0">
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <DashboardTab summary={summary} isLoading={dashboardLoading} />
              </motion.div>
            </TabsContent>

            <TabsContent value="tasks" className="mt-0">
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <TasksTab
                  tasks={summary?.tasks ?? []}
                  isLoading={dashboardLoading}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="timer" className="mt-0">
              <motion.div
                key="timer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <FocusTimerTab summary={summary} isLoading={dashboardLoading} />
              </motion.div>
            </TabsContent>

            <TabsContent value="quiz" className="mt-0">
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <QuizTab summary={summary} />
              </motion.div>
            </TabsContent>

            <TabsContent value="study" className="mt-0">
              <motion.div
                key="study"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <StudyContentTab tasks={summary?.tasks ?? []} />
              </motion.div>
            </TabsContent>

            <TabsContent value="tutor" className="mt-0">
              <motion.div
                key="tutor"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <AITutorTab />
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-4 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="font-display font-bold text-xs text-muted-foreground tracking-wider uppercase">
              FocusFlow AI
            </span>
          </div>
          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()}. Built with{" "}
            <span className="text-primary">♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* Settings modal */}
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        summary={summary}
      />

      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "oklch(0.14 0.009 258)",
            border: "1px solid oklch(0.22 0.012 260)",
            color: "oklch(0.97 0.008 85)",
          },
        }}
      />
    </div>
  );
}

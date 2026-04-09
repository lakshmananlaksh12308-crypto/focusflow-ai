import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  Brain,
  Fingerprint,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  Target,
  Timer,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface LoginPageProps {
  onLogin: () => void;
  isLoggingIn: boolean;
}

const FEATURES = [
  {
    icon: Target,
    label: "Adaptive Planning",
    desc: "Syllabus Sage builds your personalized study path",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
  },
  {
    icon: Lock,
    label: "LOCKDIN Focus",
    desc: "AI distraction shield activates during sessions",
    color: "text-teal",
    bg: "bg-teal/10 border-teal/20",
  },
  {
    icon: Brain,
    label: "Smart Assessment",
    desc: "Adaptive quizzes that learn from your performance",
    color: "text-warning",
    bg: "bg-warning/10 border-warning/20",
  },
];

const STATS = [
  { value: "25+", label: "Focus Modes" },
  { value: "3", label: "AI Modules" },
  { value: "100%", label: "Adaptive" },
];

export function LoginPage({ onLogin, isLoggingIn }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-background flex overflow-hidden relative">
      {/* Animated background orbs */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {/* Primary orange orb */}
        <div
          className="absolute animate-float"
          style={{
            top: "10%",
            left: "15%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, oklch(0.73 0.22 40 / 0.18) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        {/* Teal orb */}
        <div
          className="absolute animate-float-slow"
          style={{
            top: "50%",
            right: "10%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, oklch(0.72 0.15 195 / 0.14) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
        {/* Deep accent orb */}
        <div
          className="absolute animate-float-medium"
          style={{
            bottom: "5%",
            left: "35%",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, oklch(0.65 0.18 40 / 0.12) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.28 0.015 260 / 0.5) 1px, transparent 1px), linear-gradient(90deg, oklch(0.28 0.015 260 / 0.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Scan line */}
        <div
          className="absolute left-0 right-0 h-px animate-scan-line"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, oklch(0.73 0.22 40 / 0.3) 30%, oklch(0.73 0.22 40 / 0.6) 50%, oklch(0.73 0.22 40 / 0.3) 70%, transparent 100%)",
          }}
        />
      </div>

      {/* LEFT PANEL — Hero Content */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] relative z-10 p-12 xl:p-16">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/35 flex items-center justify-center glow-primary-sm">
            <Zap className="w-5.5 h-5.5 text-primary" />
          </div>
          <div>
            <span className="font-display font-black text-2xl text-foreground tracking-[-0.02em] leading-none">
              FocusFlow <span className="gradient-text">AI</span>
            </span>
            <p className="text-[9px] text-muted-foreground/60 uppercase tracking-[0.18em] mt-0.5">
              Study Ecosystem
            </p>
          </div>
          <div>
            <span className="font-display font-black text-xl text-foreground tracking-tight">
              FocusFlow <span className="gradient-text">AI</span>
            </span>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest -mt-0.5">
              Study Ecosystem
            </p>
          </div>
        </motion.div>

        {/* Hero content */}
        <div className="space-y-10 hero-glow">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-5"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/8 text-xs text-primary font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Study Platform
            </div>

            <h1 className="font-display font-black text-[clamp(3rem,5vw,4.25rem)] leading-[0.98] tracking-[-0.03em]">
              {/* First line: plain + gradient inline — one sweeping sentence */}
              <span className="text-foreground">Master Your </span>
              <span className="gradient-text">Focus.</span>
              <br />
              {/* Second line: same rhythm */}
              <span className="text-foreground">Unlock Your </span>
              <span className="gradient-text">Potential.</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
              The AI-powered study ecosystem that adapts to you — intelligent
              planning, distraction blocking, and adaptive assessment in one
              mission-critical platform.
            </p>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-10"
          >
            {STATS.map((stat, i) => (
              <div key={stat.label} className="space-y-1 relative">
                <p className="font-display font-black text-3xl gradient-text leading-none tracking-[-0.03em]">
                  {stat.value}
                </p>
                <p className="text-[10px] text-muted-foreground/70 uppercase tracking-[0.15em]">
                  {stat.label}
                </p>
                {/* Divider between stats */}
                {i < STATS.length - 1 && (
                  <div className="absolute right-[-20px] top-1 h-8 w-px bg-border/50" />
                )}
              </div>
            ))}
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="space-y-3"
          >
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                className={`flex items-start gap-3 p-3.5 rounded-xl border ${feature.bg} group`}
              >
                <div className="w-8 h-8 rounded-lg bg-background/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <feature.icon className={`w-4 h-4 ${feature.color}`} />
                </div>
                <div>
                  <p className={`text-sm font-bold ${feature.color}`}>
                    {feature.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex items-center gap-3 text-xs text-muted-foreground/50"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Powered by Internet Computer Protocol</span>
          <span className="mx-2 opacity-40">·</span>
          <Timer className="w-3.5 h-3.5" />
          <span>Pomodoro + AI-Adaptive Sessions</span>
        </motion.div>
      </div>

      {/* RIGHT PANEL — Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-6 lg:p-12">
        {/* Mobile logo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:hidden flex items-center gap-2 mb-8"
        >
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center glow-primary-sm">
            <Zap className="w-4.5 h-4.5 text-primary" />
          </div>
          <span className="font-display font-black text-xl gradient-text">
            FocusFlow AI
          </span>
        </motion.div>

        {/* Mobile feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:hidden flex flex-wrap gap-2 mb-8 justify-center"
        >
          {["Adaptive Planning", "LOCKDIN Focus", "Smart Assessment"].map(
            (label) => (
              <span
                key={label}
                className="text-xs font-semibold text-primary border border-primary/30 bg-primary/8 px-3 py-1 rounded-full"
              >
                {label}
              </span>
            ),
          )}
        </motion.div>

        {/* Glass login card */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card-login w-full max-w-md rounded-2xl p-8 space-y-6"
        >
          {/* Card header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-orb-pulse" />
              <span className="text-[10px] text-primary font-bold uppercase tracking-[0.18em]">
                Secure Access
              </span>
            </div>
            <h2 className="font-display font-black text-[2rem] leading-[1.05] tracking-[-0.025em] text-foreground">
              Welcome Back
            </h2>
            <p className="text-sm text-muted-foreground/80 leading-relaxed">
              Sign in to continue your study mission
            </p>
          </div>

          {/* Sign in form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email field */}
            <div className="space-y-1.5">
              <Label
                htmlFor="login-email"
                className="text-xs text-muted-foreground uppercase tracking-wider font-semibold"
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="login-email"
                  data-ocid="login.email_input"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input pl-9 h-12 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <Label
                htmlFor="login-password"
                className="text-xs text-muted-foreground uppercase tracking-wider font-semibold"
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="login-password"
                  data-ocid="login.password_input"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input pl-9 h-12 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onLogin}
                className="text-xs text-primary/70 hover:text-primary transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In button */}
            <Button
              type="submit"
              data-ocid="login.submit_button"
              disabled={isLoggingIn}
              className="w-full h-12 font-bold text-base gap-2 glow-primary bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground/60 font-medium px-1">
              or continue with
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Internet Identity button */}
          <Button
            type="button"
            data-ocid="login.identity_button"
            variant="outline"
            disabled={isLoggingIn}
            onClick={onLogin}
            className="w-full h-11 font-semibold gap-2.5 border-border hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all duration-200 rounded-xl"
          >
            {isLoggingIn ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
            ) : (
              <Fingerprint className="w-4.5 h-4.5" />
            )}
            Login with Internet Identity
          </Button>

          {/* Sign up link */}
          <p className="text-center text-sm text-muted-foreground">
            New to FocusFlow?{" "}
            <button
              type="button"
              onClick={onLogin}
              className="text-primary font-semibold hover:text-primary/80 transition-colors cursor-pointer hover:underline"
            >
              Get started free
            </button>
          </p>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 text-xs text-muted-foreground/40 text-center"
        >
          © {new Date().getFullYear()}. Built with{" "}
          <span className="text-primary/60">♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/60 hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </motion.p>
      </div>
    </div>
  );
}

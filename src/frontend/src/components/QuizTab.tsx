import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  Brain,
  CheckCircle2,
  History,
  Loader2,
  Plus,
  RotateCcw,
  Trophy,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { DashboardSummary } from "../backend.d";
import {
  useActiveQuiz,
  useStartQuiz,
  useSubmitQuiz,
} from "../hooks/useQueries";

const TOPIC_KEYS = ["topic-0", "topic-1", "topic-2"];
const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3"];

interface QuizTabProps {
  summary: DashboardSummary | null | undefined;
}

export function QuizTab({ summary }: QuizTabProps) {
  const [topics, setTopics] = useState<string[]>(["", "", ""]);
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);
  const [submitted, setSubmitted] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);

  const {
    data: activeQuiz,
    isLoading: quizLoading,
    refetch: refetchQuiz,
  } = useActiveQuiz();
  const startQuiz = useStartQuiz();
  const submitQuiz = useSubmitQuiz();

  const updateTopic = (index: number, value: string) => {
    setTopics((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleGenerateQuiz = async () => {
    const validTopics = topics.filter((t) => t.trim().length > 0);
    if (validTopics.length === 0) {
      toast.error("Enter at least one topic");
      return;
    }
    try {
      await startQuiz.mutateAsync(validTopics);
      await refetchQuiz();
      setAnswers(["", "", ""]);
      setSubmitted(false);
      setLastScore(null);
      toast.success("Quiz generated! Answer the questions.");
    } catch {
      toast.error("Failed to generate quiz");
    }
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    const questions = activeQuiz.questions ?? [];
    let correct = 0;
    questions.forEach((q, i) => {
      const userAns = answers[i]?.trim().toLowerCase() ?? "";
      const correctAns = q.answer?.trim().toLowerCase() ?? "";
      if (userAns && correctAns && userAns === correctAns) correct++;
    });
    const score = BigInt(correct);
    try {
      await submitQuiz.mutateAsync({ quizId: activeQuiz.id, score });
      setLastScore(correct);
      setSubmitted(true);
      if (correct >= questions.length) {
        toast.success("Perfect score! 🏆");
      } else if (correct >= Math.ceil(questions.length / 2)) {
        toast.success(`Good job! ${correct}/${questions.length} correct`);
      } else {
        toast.error(`${correct}/${questions.length} correct — keep studying!`);
      }
    } catch {
      toast.error("Failed to submit quiz");
    }
  };

  const handleReset = () => {
    setTopics(["", "", ""]);
    setAnswers(["", "", ""]);
    setSubmitted(false);
    setLastScore(null);
  };

  const questions = activeQuiz?.questions ?? [];
  const lastQuizScore = summary?.lastQuizScore;

  return (
    <div className="space-y-6">
      {/* Last quiz score */}
      {lastQuizScore !== undefined && lastQuizScore !== null && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 rounded-xl glass-card px-4 py-3 border border-border"
        >
          <History className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground">
            Last quiz score:
          </span>
          <Badge className="bg-primary/15 text-primary border border-primary/35 font-bold">
            {lastQuizScore.toString()} pts
          </Badge>
          <div className="ml-auto flex gap-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  Number(lastQuizScore) >= i
                    ? "bg-primary shadow-[0_0_6px_oklch(0.73_0.22_40/0.6)]"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Topic input section */}
      {!activeQuiz || submitted ? (
        <motion.div
          key="topic-input"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl glass-card p-5 space-y-4 relative overflow-hidden"
        >
          {/* Background accent */}
          <div
            className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at top right, oklch(0.73 0.22 40 / 0.08) 0%, transparent 70%)",
            }}
          />
          <div className="relative flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-display font-bold uppercase tracking-widest text-sm text-muted-foreground">
              Generate Quiz
            </h3>
            <span className="ml-auto text-[10px] text-primary/60 bg-primary/8 border border-primary/20 px-2 py-0.5 rounded-full font-semibold">
              SmartStudy AI
            </span>
          </div>

          {submitted && lastScore !== null && (
            <motion.div
              data-ocid="quiz.success_state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative rounded-xl border p-4 flex items-center gap-3 mb-2 overflow-hidden ${
                lastScore >= 2 ? "border-success/40" : "border-warning/40"
              }`}
              style={{
                background:
                  lastScore >= 2
                    ? "linear-gradient(135deg, oklch(0.68 0.18 145 / 0.1) 0%, oklch(0.13 0.009 258) 100%)"
                    : "linear-gradient(135deg, oklch(0.78 0.18 75 / 0.1) 0%, oklch(0.13 0.009 258) 100%)",
              }}
            >
              {lastScore >= 2 ? (
                <Trophy className="w-6 h-6 text-success flex-shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-warning flex-shrink-0" />
              )}
              <div>
                <p
                  className={`font-bold text-sm ${
                    lastScore >= 2 ? "text-success" : "text-warning"
                  }`}
                >
                  Score: {lastScore}/3 —{" "}
                  {lastScore === 3
                    ? "Perfect!"
                    : lastScore >= 2
                      ? "Well done!"
                      : "Keep studying!"}
                </p>
                {lastScore < 2 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Consider reviewing these topics again tomorrow.
                  </p>
                )}
              </div>
            </motion.div>
          )}

          <div className="relative space-y-3">
            {topics.map((topic, i) => (
              <div key={TOPIC_KEYS[i]} className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                </div>
                <Input
                  data-ocid="quiz.topic_input"
                  placeholder={`Topic ${i + 1} (e.g. Calculus, Photosynthesis...)`}
                  value={topic}
                  onChange={(e) => updateTopic(i, e.target.value)}
                  className="bg-background/60 border-border focus-visible:border-primary/50 focus-visible:ring-primary/20 focus-visible:ring-2 flex-1 transition-all"
                />
              </div>
            ))}
          </div>

          <div className="relative flex gap-2">
            <Button
              data-ocid="quiz.generate_button"
              onClick={handleGenerateQuiz}
              disabled={startQuiz.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-2 flex-1 glow-primary-sm hover:scale-[1.02] active:scale-[0.98] transition-all rounded-lg"
            >
              {startQuiz.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Generate Quiz
            </Button>
            {submitted && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="gap-2 border-border hover:border-primary/40 transition-all rounded-lg"
              >
                <RotateCcw className="w-4 h-4" />
                New Quiz
              </Button>
            )}
          </div>

          {startQuiz.isError && (
            <p
              data-ocid="quiz.error_state"
              className="text-xs text-destructive"
            >
              Failed to generate quiz — please try again
            </p>
          )}
        </motion.div>
      ) : null}

      {/* Active Quiz */}
      <AnimatePresence mode="wait">
        {quizLoading && (
          <motion.div
            key="quiz-loading"
            data-ocid="quiz.loading_state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {SKELETON_KEYS.map((k, i) => (
              <div
                key={k}
                className="h-24 rounded-xl bg-card/80 animate-pulse border border-border"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </motion.div>
        )}

        {activeQuiz && !submitted && !quizLoading && (
          <motion.div
            key="quiz-active"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 px-1">
              <div className="flex gap-1.5 flex-wrap">
                {activeQuiz.topics?.map((t) => (
                  <Badge
                    key={t}
                    variant="outline"
                    className="text-xs border-primary/35 text-primary bg-primary/10 font-semibold"
                  >
                    {t}
                  </Badge>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="ml-auto w-7 h-7 hover:bg-destructive/10 hover:text-destructive transition-colors"
                onClick={handleReset}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>

            {questions.slice(0, 3).map((q, i) => (
              <motion.div
                key={q.question}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl glass-card p-4 space-y-3 relative overflow-hidden"
              >
                {/* Question number accent */}
                <div
                  className="absolute top-0 left-0 w-1 h-full rounded-l-xl"
                  style={{
                    background: `linear-gradient(180deg, oklch(0.73 0.22 ${40 + i * 10}) 0%, oklch(0.65 0.2 ${28 + i * 10}) 100%)`,
                    opacity: 0.7,
                  }}
                />
                <div className="flex items-start gap-3 pl-2">
                  <span className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-black text-primary">
                      {i + 1}
                    </span>
                  </span>
                  <p className="text-sm text-foreground font-medium leading-relaxed">
                    {q.question}
                  </p>
                </div>
                <div className="pl-10">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5 block font-bold">
                    Your Answer
                  </Label>
                  <Input
                    data-ocid={`quiz.answer_input.${i + 1}`}
                    placeholder="Type your answer..."
                    value={answers[i] ?? ""}
                    onChange={(e) => {
                      const newAnswers = [...answers];
                      newAnswers[i] = e.target.value;
                      setAnswers(newAnswers);
                    }}
                    className="bg-background/60 border-border focus-visible:border-primary/50 focus-visible:ring-primary/20 focus-visible:ring-2 transition-all"
                  />
                </div>
              </motion.div>
            ))}

            <Button
              data-ocid="quiz.submit_button"
              onClick={handleSubmitQuiz}
              disabled={submitQuiz.isPending}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-2 glow-primary-sm hover:scale-[1.01] active:scale-[0.99] transition-all rounded-xl h-11"
            >
              {submitQuiz.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Submit Answers
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!activeQuiz && !quizLoading && !submitted && (
        <div className="flex flex-col items-center py-10 gap-3 text-center">
          <div
            className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center"
            style={{
              boxShadow: "0 0 20px oklch(0.73 0.22 40 / 0.15)",
            }}
          >
            <Brain className="w-7 h-7 text-primary/70" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Enter topics above to generate an adaptive quiz
          </p>
          <p className="text-xs text-muted-foreground/50">
            Powered by SmartStudy AI adaptive assessment
          </p>
        </div>
      )}
    </div>
  );
}

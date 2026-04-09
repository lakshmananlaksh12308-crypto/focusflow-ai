import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpenCheck,
  ChevronRight,
  Eye,
  GitBranch,
  Loader2,
  Sparkles,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const LANGUAGES = [
  { value: "English", label: "🇬🇧 English" },
  { value: "Spanish", label: "🇪🇸 Spanish" },
  { value: "French", label: "🇫🇷 French" },
  { value: "Hindi", label: "🇮🇳 Hindi" },
  { value: "Mandarin", label: "🇨🇳 Mandarin" },
  { value: "Arabic", label: "🇸🇦 Arabic" },
];

const TUTOR_SKELETON_KEYS = ["tutor-sk-1", "tutor-sk-2", "tutor-sk-3"];

function generateTutorResponse(
  query: string,
  content: string,
  language: string,
) {
  const topic =
    query.trim() ||
    content.trim().split(" ").slice(0, 3).join(" ") ||
    "this concept";
  const lang =
    language !== "English" ? ` (adapted for ${language} learners)` : "";

  return {
    visual: {
      title: "Visual Explanation",
      icon: Eye,
      color: "text-info",
      bgColor: "bg-info/8 border-info/25",
      accentColor: "oklch(0.65 0.18 240)",
      points: [
        `Core Idea: ${topic} can be visualized as a system with inputs, processes, and outputs${lang}`,
        "Flow: Information → Processing → Understanding → Application",
        `Key Components: Break "${topic}" into 3 layers: Foundation → Mechanism → Outcome`,
        "Mental Map: Think of it as a building — foundations first, then walls, then roof",
      ],
    },
    logical: {
      title: "Logical Explanation",
      icon: GitBranch,
      color: "text-success",
      bgColor: "bg-success/8 border-success/25",
      accentColor: "oklch(0.68 0.18 145)",
      steps: [
        `Define the problem — What exactly is "${topic}" trying to solve?`,
        "Identify the inputs — What data/conditions does it depend on?",
        "Trace the mechanism — How does the transformation happen?",
        "Verify the output — What does a correct result look like?",
        "Apply edge cases — What happens at boundary conditions?",
      ],
    },
    story: {
      title: "Story Explanation",
      icon: BookOpenCheck,
      color: "text-warning",
      bgColor: "bg-warning/8 border-warning/25",
      accentColor: "oklch(0.78 0.18 75)",
      narrative: `Imagine you're a chef${lang}. You've never made "${topic}" before, but you have a recipe. The recipe is your framework — it tells you what ingredients (inputs) to gather, in what order to combine them (process), and what the dish should look and taste like (output). When something goes wrong, you don't throw away the whole kitchen — you trace back through each step to find where you deviated. That's exactly how understanding "${topic}" works: systematic, reproducible, and satisfying when it clicks.`,
    },
  };
}

export function AITutorTab() {
  const [language, setLanguage] = useState("English");
  const [content, setContent] = useState("");
  const [query, setQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [response, setResponse] = useState<ReturnType<
    typeof generateTutorResponse
  > | null>(null);

  const handleExplain = async () => {
    if (!query.trim() && !content.trim()) return;
    setIsGenerating(true);
    setResponse(null);

    await new Promise((r) => setTimeout(r, 1200));
    setResponse(generateTutorResponse(query, content, language));
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Input panel */}
      <div className="rounded-xl glass-card p-5 space-y-4 relative overflow-hidden">
        {/* Corner glow */}
        <div
          className="absolute top-0 left-0 w-40 h-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at top left, oklch(0.73 0.22 40 / 0.1) 0%, transparent 70%)",
          }}
        />
        <div className="relative flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-display font-bold uppercase tracking-widest text-sm text-muted-foreground">
            Reformat Engine
          </h3>
          <div className="ml-auto flex items-center gap-1.5 text-[10px] text-primary/70 bg-primary/8 border border-primary/20 px-2.5 py-0.5 rounded-full font-bold">
            <Zap className="w-3 h-3" />
            Demo Mode
          </div>
        </div>

        <div className="relative space-y-1.5">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Language
          </Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger
              data-ocid="tutor.language_select"
              className="bg-background/60 border-border focus:ring-primary/20"
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

        <div className="relative space-y-1.5">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Study Content
          </Label>
          <Textarea
            data-ocid="tutor.content_textarea"
            placeholder="Paste your study content, textbook excerpt, or notes here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-background/60 border-border min-h-[100px] resize-y focus-visible:border-primary/50 focus-visible:ring-primary/20 focus-visible:ring-2 transition-all"
          />
        </div>

        <div className="relative space-y-1.5">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Your Question
          </Label>
          <Input
            data-ocid="tutor.query_input"
            placeholder="What do you want to understand? (e.g. How does photosynthesis work?)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void handleExplain();
              }
            }}
            className="bg-background/60 border-border focus-visible:border-primary/50 focus-visible:ring-primary/20 focus-visible:ring-2 transition-all"
          />
        </div>

        <Button
          type="button"
          data-ocid="tutor.explain_button"
          onClick={() => void handleExplain()}
          disabled={isGenerating || (!query.trim() && !content.trim())}
          className="relative w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-2 glow-primary-sm hover:scale-[1.01] active:scale-[0.99] transition-all rounded-xl h-11"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Reformatting...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Explain It
            </>
          )}
        </Button>
      </div>

      {/* Loading skeletons */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            data-ocid="tutor.loading_state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {TUTOR_SKELETON_KEYS.map((k, i) => (
              <div
                key={k}
                className="h-28 rounded-xl bg-card/80 border border-border animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Response panel */}
      <AnimatePresence>
        {response && !isGenerating && (
          <motion.div
            data-ocid="tutor.response_panel"
            key="response"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Section header */}
            <div className="flex items-center gap-2 px-1">
              <ChevronRight className="w-4 h-4 text-primary" />
              <h3 className="font-display font-bold text-sm text-foreground">
                3-Mode Explanation
              </h3>
              <span className="text-xs text-muted-foreground/60">
                {`— in ${language}`}
              </span>
            </div>

            {/* Visual Explanation */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              className={`relative rounded-xl border p-5 space-y-3 overflow-hidden ${response.visual.bgColor}`}
            >
              <div
                className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-50"
                style={{
                  background: `radial-gradient(circle at top right, ${response.visual.accentColor} / 0.15 0%, transparent 70%)`,
                }}
              />
              <div className="flex items-center gap-2">
                <response.visual.icon
                  className={`w-5 h-5 ${response.visual.color}`}
                />
                <h4
                  className={`font-display font-bold text-sm uppercase tracking-wider ${response.visual.color}`}
                >
                  {response.visual.title}
                </h4>
              </div>
              <ul className="space-y-2">
                {response.visual.points.map((point) => (
                  <motion.li
                    key={point}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm text-foreground/90 leading-relaxed flex gap-2.5"
                  >
                    <span
                      className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2 ${response.visual.color}`}
                      style={{ opacity: 0.7 }}
                    />
                    <span>{point}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Logical Explanation */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className={`relative rounded-xl border p-5 space-y-3 overflow-hidden ${response.logical.bgColor}`}
            >
              <div className="flex items-center gap-2">
                <response.logical.icon
                  className={`w-5 h-5 ${response.logical.color}`}
                />
                <h4
                  className={`font-display font-bold text-sm uppercase tracking-wider ${response.logical.color}`}
                >
                  {response.logical.title}
                </h4>
              </div>
              <ol className="space-y-2">
                {response.logical.steps.map((step, i) => (
                  <motion.li
                    key={step}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="text-sm text-foreground/90 leading-relaxed flex gap-3"
                  >
                    <span
                      className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${response.logical.color} opacity-80 border border-current mt-0.5`}
                    >
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </motion.li>
                ))}
              </ol>
            </motion.div>

            {/* Story Explanation */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className={`relative rounded-xl border p-5 space-y-3 overflow-hidden ${response.story.bgColor}`}
            >
              <div className="flex items-center gap-2">
                <response.story.icon
                  className={`w-5 h-5 ${response.story.color}`}
                />
                <h4
                  className={`font-display font-bold text-sm uppercase tracking-wider ${response.story.color}`}
                >
                  {response.story.title}
                </h4>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed italic">
                &ldquo;{response.story.narrative}&rdquo;
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
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
import {
  BookOpen,
  ChevronRight,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Difficulty, Status, type Task } from "../backend.d";
import {
  useCreateTask,
  useDeleteTask,
  useUpdateTask,
} from "../hooks/useQueries";

const difficultyConfig = {
  [Difficulty.easy]: {
    label: "Easy",
    className:
      "bg-success/15 text-success border-success/40 shadow-[0_0_8px_oklch(0.68_0.18_145/0.2)]",
  },
  [Difficulty.medium]: {
    label: "Medium",
    className:
      "bg-warning/15 text-warning border-warning/40 shadow-[0_0_8px_oklch(0.78_0.18_75/0.2)]",
  },
  [Difficulty.hard]: {
    label: "Hard",
    className:
      "bg-destructive/15 text-destructive border-destructive/40 shadow-[0_0_8px_oklch(0.62_0.22_15/0.2)]",
  },
};

const statusConfig = {
  [Status.todo]: {
    label: "Todo",
    next: Status.inProgress,
    className: "bg-muted/50 text-muted-foreground border-muted-foreground/20",
  },
  [Status.inProgress]: {
    label: "In Progress",
    next: Status.done,
    className:
      "bg-info/15 text-info border-info/40 shadow-[0_0_8px_oklch(0.65_0.18_240/0.2)]",
  },
  [Status.done]: {
    label: "Done",
    next: Status.todo,
    className:
      "bg-success/15 text-success border-success/40 shadow-[0_0_8px_oklch(0.68_0.18_145/0.2)]",
  },
};

interface TasksTabProps {
  tasks: Task[];
  isLoading: boolean;
}

export function TasksTab({ tasks, isLoading }: TasksTabProps) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.medium);

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) {
      toast.error("Please fill in title and subject");
      return;
    }
    try {
      await createTask.mutateAsync({
        title: title.trim(),
        subject: subject.trim(),
        difficulty,
      });
      setTitle("");
      setSubject("");
      setDifficulty(Difficulty.medium);
      toast.success("Task created!");
    } catch {
      toast.error("Failed to create task");
    }
  };

  const handleStatusToggle = async (task: Task) => {
    const nextStatus = statusConfig[task.status].next;
    try {
      await updateTask.mutateAsync({ taskId: task.id, status: nextStatus });
      if (nextStatus === Status.done) toast.success("Task completed! 🎉");
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async (taskId: bigint) => {
    try {
      await deleteTask.mutateAsync(taskId);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  return (
    <div className="space-y-6">
      {/* Add task form */}
      <div className="rounded-xl glass-card p-5 relative overflow-hidden">
        {/* Subtle corner accent */}
        <div
          className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-40"
          style={{
            background:
              "radial-gradient(circle at top right, oklch(0.73 0.22 40 / 0.12) 0%, transparent 70%)",
          }}
        />
        <div className="relative flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-md bg-primary/15 border border-primary/25 flex items-center justify-center">
            <Plus className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="font-display font-bold text-sm uppercase tracking-widest text-muted-foreground">
            New Task
          </h3>
          <div className="ml-auto flex items-center gap-1.5 text-[10px] text-primary/60 bg-primary/8 px-2 py-0.5 rounded-full border border-primary/20">
            <Sparkles className="w-3 h-3" />
            Syllabus Sage
          </div>
        </div>
        <form onSubmit={handleSubmit} className="relative space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="task-title"
                className="text-xs text-muted-foreground uppercase tracking-wider font-semibold"
              >
                Title
              </Label>
              <Input
                id="task-title"
                data-ocid="tasks.input"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-background/60 border-border focus-visible:border-primary/50 focus-visible:ring-primary/20 focus-visible:ring-2 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="task-subject"
                className="text-xs text-muted-foreground uppercase tracking-wider font-semibold"
              >
                Subject
              </Label>
              <Input
                id="task-subject"
                data-ocid="tasks.subject_input"
                placeholder="e.g. Mathematics, Physics..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-background/60 border-border focus-visible:border-primary/50 focus-visible:ring-primary/20 focus-visible:ring-2 transition-all"
              />
            </div>
          </div>

          <div className="flex items-end gap-3">
            <div className="space-y-1.5 flex-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Difficulty
              </Label>
              <Select
                value={difficulty}
                onValueChange={(v) => setDifficulty(v as Difficulty)}
              >
                <SelectTrigger
                  data-ocid="tasks.difficulty_select"
                  className="bg-background/60 border-border focus:ring-primary/20"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Difficulty.easy}>🟢 Easy</SelectItem>
                  <SelectItem value={Difficulty.medium}>🟡 Medium</SelectItem>
                  <SelectItem value={Difficulty.hard}>🔴 Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              data-ocid="tasks.submit_button"
              disabled={createTask.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-2 glow-primary-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {createTask.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add Task
            </Button>
          </div>
        </form>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {isLoading ? (
          <div data-ocid="tasks.loading_state" className="space-y-2">
            {["sk-1", "sk-2", "sk-3"].map((k, i) => (
              <div
                key={k}
                className="h-16 rounded-xl bg-card/80 animate-pulse border border-border"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <motion.div
            data-ocid="tasks.empty_state"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border border-dashed p-12 text-center relative overflow-hidden"
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, oklch(0.73 0.22 40 / 0.04) 0%, transparent 70%)",
              }}
            />
            <BookOpen className="w-10 h-10 text-primary/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-semibold">No tasks yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Add your first task above to begin your mission
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {tasks.map((task, index) => {
              const ocidSuffix = index + 1;
              const diffConf =
                difficultyConfig[task.difficulty] ??
                difficultyConfig[Difficulty.medium];
              const statusConf =
                statusConfig[task.status] ?? statusConfig[Status.todo];
              const isDeletingThis =
                deleteTask.isPending && deleteTask.variables === task.id;
              const isUpdatingThis =
                updateTask.isPending &&
                updateTask.variables?.taskId === task.id;
              const isDone = task.status === Status.done;

              return (
                <motion.div
                  key={task.id.toString()}
                  data-ocid={`tasks.item.${ocidSuffix}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, height: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card/70 backdrop-blur-sm p-3.5 group task-card-hover"
                >
                  {/* Done indicator stripe */}
                  {isDone && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl"
                      style={{
                        background:
                          "linear-gradient(180deg, oklch(0.68 0.18 145) 0%, oklch(0.72 0.2 160) 100%)",
                        boxShadow: "0 0 8px oklch(0.68 0.18 145 / 0.5)",
                      }}
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`font-medium text-sm truncate transition-all ${
                          isDone
                            ? "line-through text-muted-foreground/60"
                            : "text-foreground"
                        }`}
                      >
                        {task.title}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 shrink-0 ${diffConf.className}`}
                      >
                        {diffConf.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {task.subject}
                    </p>
                  </div>

                  <button
                    type="button"
                    data-ocid={`tasks.status_toggle.${ocidSuffix}`}
                    onClick={() => void handleStatusToggle(task)}
                    disabled={isUpdatingThis}
                    className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer hover:opacity-80 disabled:opacity-50 ${statusConf.className}`}
                  >
                    {isUpdatingThis ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                    {statusConf.label}
                  </button>

                  <Button
                    type="button"
                    data-ocid={`tasks.delete_button.${ocidSuffix}`}
                    variant="ghost"
                    size="icon"
                    onClick={() => void handleDelete(task.id)}
                    disabled={isDeletingThis}
                    className="shrink-0 w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                  >
                    {isDeletingThis ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

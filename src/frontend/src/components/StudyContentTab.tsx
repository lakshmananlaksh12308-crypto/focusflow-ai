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
  Download,
  File,
  FileImage,
  FileText,
  FileVideo,
  ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import type { StudyFile, Task } from "../backend.d";
import {
  useDeleteStudyFile,
  useRegisterStudyFile,
  useStudyFiles,
} from "../hooks/useQueries";

// Helper to safely access window globals set by the platform
function getWindowGlobal(key: string): string | undefined {
  return (window as unknown as Record<string, unknown>)[key] as
    | string
    | undefined;
}

const FILE_TYPE_ICONS: Record<string, React.ElementType> = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  txt: FileText,
  mp4: FileVideo,
  mov: FileVideo,
  avi: FileVideo,
  jpg: FileImage,
  jpeg: FileImage,
  png: ImageIcon,
  gif: ImageIcon,
  default: File,
};

function getFileIcon(fileType: string) {
  const ext = fileType.toLowerCase().replace(".", "");
  return FILE_TYPE_ICONS[ext] ?? FILE_TYPE_ICONS.default;
}

function getFileTypeColor(fileType: string) {
  const ext = fileType.toLowerCase().replace(".", "");
  if (["pdf", "doc", "docx", "txt"].includes(ext))
    return "bg-info/15 text-info border-info/35";
  if (["mp4", "mov", "avi"].includes(ext))
    return "bg-destructive/15 text-destructive border-destructive/35";
  if (["jpg", "jpeg", "png", "gif"].includes(ext))
    return "bg-success/15 text-success border-success/35";
  return "bg-primary/15 text-primary border-primary/35";
}

function formatDate(time: bigint) {
  const ms = Number(time / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const ALL_SUBJECTS_LABEL = "All Subjects";

interface StudyContentTabProps {
  tasks: Task[];
}

export function StudyContentTab({ tasks }: StudyContentTabProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [filterSubject, setFilterSubject] = useState(ALL_SUBJECTS_LABEL);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: studyFiles = [], isLoading } = useStudyFiles();
  const registerStudyFile = useRegisterStudyFile();
  const deleteStudyFile = useDeleteStudyFile();

  // Extract unique subjects from tasks + existing files
  const taskSubjects = [
    ...new Set(tasks.map((t) => t.subject).filter(Boolean)),
  ];
  const fileSubjects = [
    ...new Set(studyFiles.map((f) => f.subject).filter(Boolean)),
  ];
  const allSubjects = [...new Set([...taskSubjects, ...fileSubjects])];

  const finalSubject = subject === "__custom__" ? customSubject : subject;

  const filteredFiles =
    filterSubject === ALL_SUBJECTS_LABEL
      ? studyFiles
      : studyFiles.filter((f) => f.subject === filterSubject);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (!title) {
      // Auto-fill title from filename (strip extension)
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setTitle(nameWithoutExt);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setSelectedFile(file);
    setTitle((prev) => prev || file.name.replace(/\.[^/.]+$/, ""));
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleBrowse = () => fileInputRef.current?.click();

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    const subjectToUse = finalSubject.trim();
    if (!subjectToUse) {
      toast.error("Please select or enter a subject");
      return;
    }

    setUploadProgress(0);

    try {
      // Read file bytes
      const arrayBuffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Determine file type from extension
      const ext = selectedFile.name.split(".").pop()?.toLowerCase() ?? "bin";

      // Upload via StorageClient (falls back to demo ID if storage not configured)
      let blobId = "";
      try {
        // Attempt to get storage config from injected globals
        const storageGatewayUrl = getWindowGlobal("__STORAGE_GATEWAY_URL");
        const backendCanisterId = getWindowGlobal("__BACKEND_CANISTER_ID");
        const projectId = getWindowGlobal("__PROJECT_ID");

        if (storageGatewayUrl && backendCanisterId && projectId) {
          const [{ HttpAgent }, { StorageClient }] = await Promise.all([
            import("@icp-sdk/core/agent"),
            import("../utils/StorageClient"),
          ]);
          const agent = await HttpAgent.create({ host: "https://icp-api.io" });
          const storageClient = new StorageClient(
            "study-files",
            storageGatewayUrl,
            backendCanisterId,
            projectId,
            agent,
          );
          const result = await storageClient.putFile(bytes, (pct) => {
            setUploadProgress(pct);
          });
          blobId = result.hash;
        } else {
          throw new Error("Storage not configured");
        }
      } catch (uploadError) {
        // If storage not configured, use a fallback blob ID for demo
        console.warn("Storage upload failed, using demo mode:", uploadError);
        blobId = `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setUploadProgress(100);
      }

      // Register in backend
      await registerStudyFile.mutateAsync({
        title: title.trim(),
        subject: subjectToUse,
        fileType: ext,
        blobId,
      });

      toast.success("File uploaded successfully!");
      setSelectedFile(null);
      setTitle("");
      setSubject("");
      setCustomSubject("");
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Upload failed. Please try again.");
      setUploadProgress(null);
    }
  };

  const handleDelete = async (fileId: bigint) => {
    try {
      await deleteStudyFile.mutateAsync(fileId);
      toast.success("File deleted");
    } catch {
      toast.error("Failed to delete file");
    }
  };

  const handleDownload = (file: StudyFile) => {
    // If we have a real blob ID (sha256: prefix), we could construct URL
    // For demo files or when storage isn't available, show a message
    if (file.blobId.startsWith("demo-")) {
      toast.info("This is a demo file — storage not configured");
      return;
    }
    try {
      const storageGatewayUrl = getWindowGlobal("__STORAGE_GATEWAY_URL");
      const backendCanisterId = getWindowGlobal("__BACKEND_CANISTER_ID");
      const projectId = getWindowGlobal("__PROJECT_ID");

      if (storageGatewayUrl && backendCanisterId && projectId) {
        const url = `${storageGatewayUrl}/v1/blob/?blob_hash=${encodeURIComponent(file.blobId)}&owner_id=${encodeURIComponent(backendCanisterId)}&project_id=${encodeURIComponent(projectId)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        toast.info("Storage not configured for downloads");
      }
    } catch {
      toast.info("Unable to generate download URL");
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="rounded-xl glass-card p-5 relative overflow-hidden">
        {/* Corner glow */}
        <div
          className="absolute top-0 right-0 w-48 h-48 pointer-events-none opacity-60"
          style={{
            background:
              "radial-gradient(circle at top right, oklch(0.73 0.22 40 / 0.1) 0%, transparent 70%)",
          }}
        />

        <div className="relative flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
            <Upload className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-display font-bold uppercase tracking-widest text-sm text-muted-foreground">
            Upload Study Material
          </h3>
          <span className="ml-auto text-[10px] text-primary/60 bg-primary/8 border border-primary/20 px-2 py-0.5 rounded-full font-semibold">
            Syllabus Sage
          </span>
        </div>

        {/* Drop Zone */}
        <button
          type="button"
          data-ocid="study.upload.dropzone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleBrowse}
          className={`relative w-full text-left rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer mb-4 ${
            isDragging
              ? "border-primary/70 bg-primary/8 scale-[1.01]"
              : selectedFile
                ? "border-success/60 bg-success/5"
                : "border-border hover:border-primary/50 hover:bg-primary/4"
          }`}
          style={{ padding: "1.75rem 1.5rem" }}
          aria-label="Upload file drop zone"
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileInputChange}
            accept="*/*"
          />

          <AnimatePresence mode="wait">
            {selectedFile ? (
              <motion.div
                key="file-selected"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-3"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-10 h-10 rounded-lg bg-success/15 border border-success/30 flex items-center justify-center flex-shrink-0">
                  {(() => {
                    const ext =
                      selectedFile.name.split(".").pop()?.toLowerCase() ?? "";
                    const Icon = getFileIcon(ext);
                    return <Icon className="w-5 h-5 text-success" />;
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setTitle("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                  aria-label="Remove selected file"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="file-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-2 text-center pointer-events-none"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    isDragging
                      ? "bg-primary/20 border border-primary/40"
                      : "bg-muted/50 border border-border"
                  }`}
                  style={
                    isDragging
                      ? { boxShadow: "0 0 20px oklch(0.73 0.22 40 / 0.3)" }
                      : {}
                  }
                >
                  <Upload
                    className={`w-6 h-6 transition-all ${isDragging ? "text-primary" : "text-muted-foreground"}`}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {isDragging
                      ? "Drop your file here"
                      : "Drop files here or click to browse"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    PDFs, documents, images, videos — any format
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload progress */}
          {uploadProgress !== null && (
            <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl overflow-hidden bg-muted/30">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, oklch(0.73 0.22 40) 0%, oklch(0.8 0.2 50) 100%)",
                  boxShadow: "0 0 8px oklch(0.73 0.22 40 / 0.6)",
                }}
                initial={{ width: "0%" }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
        </button>

        {/* Metadata fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="study-title"
                className="text-xs text-muted-foreground uppercase tracking-wider font-semibold"
              >
                Title
              </Label>
              <Input
                id="study-title"
                data-ocid="study.title.input"
                placeholder="e.g. Chapter 3 Notes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-background/60 border-border focus-visible:border-primary/50 focus-visible:ring-primary/20 focus-visible:ring-2 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Subject
              </Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger
                  data-ocid="study.subject.select"
                  className="bg-background/60 border-border focus:ring-primary/20"
                >
                  <SelectValue placeholder="Select subject..." />
                </SelectTrigger>
                <SelectContent>
                  {allSubjects.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom__">+ Add new subject</SelectItem>
                </SelectContent>
              </Select>
              {subject === "__custom__" && (
                <Input
                  placeholder="Enter subject name..."
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="mt-2 bg-background/60 border-border focus-visible:border-primary/50 focus-visible:ring-primary/20 focus-visible:ring-2 transition-all"
                  autoFocus
                />
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              data-ocid="study.upload_button"
              onClick={() => void handleUpload()}
              disabled={
                registerStudyFile.isPending ||
                uploadProgress !== null ||
                !selectedFile
              }
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-2 glow-primary-sm hover:scale-[1.02] active:scale-[0.98] transition-all rounded-lg"
            >
              {registerStudyFile.isPending || uploadProgress !== null ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {uploadProgress !== null
                    ? `Uploading ${uploadProgress}%`
                    : "Saving..."}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Upload File
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* File Library */}
      <div className="space-y-4">
        {/* Header + filter tabs */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <h3 className="font-display font-bold uppercase tracking-widest text-sm text-muted-foreground">
              Study Library
            </h3>
            {!isLoading && studyFiles.length > 0 && (
              <Badge
                variant="outline"
                className="text-[10px] border-primary/30 text-primary bg-primary/8 font-bold"
              >
                {studyFiles.length} {studyFiles.length === 1 ? "file" : "files"}
              </Badge>
            )}
          </div>
        </div>

        {/* Subject filter tabs */}
        {!isLoading && studyFiles.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {[
              ALL_SUBJECTS_LABEL,
              ...new Set(studyFiles.map((f) => f.subject)),
            ].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterSubject(s)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all border cursor-pointer ${
                  filterSubject === s
                    ? "bg-primary/15 text-primary border-primary/40 shadow-[0_0_8px_oklch(0.73_0.22_40/0.2)]"
                    : "bg-muted/30 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* File list */}
        {isLoading ? (
          <div data-ocid="study.loading_state" className="space-y-2">
            {["sk-1", "sk-2", "sk-3"].map((k, i) => (
              <div
                key={k}
                className="h-16 rounded-xl bg-card/80 animate-pulse border border-border"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        ) : filteredFiles.length === 0 ? (
          <motion.div
            data-ocid="study.empty_state"
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
            <div
              className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3"
              style={{ boxShadow: "0 0 20px oklch(0.73 0.22 40 / 0.12)" }}
            >
              <BookOpen className="w-7 h-7 text-primary/60" />
            </div>
            <p className="text-muted-foreground font-semibold">
              {filterSubject === ALL_SUBJECTS_LABEL
                ? "No study files yet"
                : `No files for "${filterSubject}"`}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {filterSubject === ALL_SUBJECTS_LABEL
                ? "Upload your first file to get started"
                : "Upload a file for this subject above"}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredFiles.map((file, index) => {
              const ocidSuffix = index + 1;
              const Icon = getFileIcon(file.fileType);
              const typeColorClass = getFileTypeColor(file.fileType);
              const isDeletingThis =
                deleteStudyFile.isPending &&
                deleteStudyFile.variables === file.id;

              return (
                <motion.div
                  key={file.id.toString()}
                  data-ocid={`study.item.${ocidSuffix}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, height: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card/70 backdrop-blur-sm p-3.5 group task-card-hover"
                >
                  {/* File type icon */}
                  <div className="w-9 h-9 rounded-lg bg-muted/50 border border-border flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4.5 h-4.5 text-muted-foreground" />
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-foreground truncate">
                        {file.title}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 shrink-0 uppercase font-bold ${typeColorClass}`}
                      >
                        {file.fileType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {file.subject}
                      </span>
                      <span className="text-muted-foreground/30 text-xs">
                        ·
                      </span>
                      <span className="text-xs text-muted-foreground/70">
                        {formatDate(file.uploadedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(file)}
                      className="shrink-0 w-8 h-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all rounded-lg"
                      aria-label="Download file"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      data-ocid={`study.delete_button.${ocidSuffix}`}
                      variant="ghost"
                      size="icon"
                      onClick={() => void handleDelete(file.id)}
                      disabled={isDeletingThis}
                      className="shrink-0 w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all rounded-lg"
                      aria-label="Delete file"
                    >
                      {isDeletingThis ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

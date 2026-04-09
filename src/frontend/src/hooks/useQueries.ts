import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Difficulty, SessionState, Status } from "../backend.d";
import { useActor } from "./useActor";

export function useDashboard() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardSummary();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      subject,
      difficulty,
    }: {
      title: string;
      subject: string;
      difficulty: Difficulty;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createTask(title, subject, difficulty);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      status,
    }: {
      taskId: bigint;
      status: Status;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateTask(taskId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (state: SessionState) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateSessionState(state);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useActiveQuiz() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["activeQuiz"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getActiveQuiz();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStartQuiz() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (topics: string[]) => {
      if (!actor) throw new Error("Not connected");
      return actor.startQuiz(topics);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeQuiz"] });
    },
  });
}

export function useSubmitQuiz() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      quizId,
      score,
    }: {
      quizId: bigint;
      score: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitQuiz(quizId, score);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeQuiz", "dashboard"] });
    },
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      language,
      dailyGoal,
    }: {
      language: string;
      dailyGoal: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createOrUpdateUserProfile(language, dailyGoal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useStudyFiles() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["studyFiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStudyFiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStudyFilesBySubject(subject: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["studyFiles", "subject", subject],
    queryFn: async () => {
      if (!actor || !subject) return [];
      return actor.getStudyFilesBySubject(subject);
    },
    enabled: !!actor && !isFetching && !!subject,
  });
}

export function useRegisterStudyFile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      subject,
      fileType,
      blobId,
    }: {
      title: string;
      subject: string;
      fileType: string;
      blobId: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerStudyFile(title, subject, fileType, blobId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studyFiles"] });
    },
  });
}

export function useDeleteStudyFile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fileId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteStudyFile(fileId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studyFiles"] });
    },
  });
}

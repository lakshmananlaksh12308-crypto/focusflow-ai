import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface StudyFile {
    id: bigint;
    title: string;
    subject: string;
    owner: Principal;
    fileType: string;
    blobId: string;
    uploadedAt: Time;
}
export type Time = bigint;
export interface QuizQuestion {
    question: string;
    answer: string;
}
export interface Task {
    id: bigint;
    status: Status;
    title: string;
    subject: string;
    owner: Principal;
    difficulty: Difficulty;
    createdAt: Time;
}
export interface QuizResult {
    id: bigint;
    owner: Principal;
    date: Time;
    score: bigint;
    topics: Array<string>;
    questions: Array<QuizQuestion>;
}
export interface DashboardSummary {
    tasks: Array<Task>;
    lastQuizScore?: bigint;
    session: SessionState;
    profile?: UserProfile;
}
export interface SessionState {
    timerSeconds: bigint;
    inStudyMode: boolean;
    currentReward: boolean;
}
export interface UserProfile {
    dailyGoal: bigint;
    completedToday: bigint;
    owner: Principal;
    createdAt: Time;
    language: string;
}
export enum Difficulty {
    easy = "easy",
    hard = "hard",
    medium = "medium"
}
export enum Status {
    done = "done",
    todo = "todo",
    inProgress = "inProgress"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrUpdateUserProfile(language: string, dailyGoal: bigint): Promise<void>;
    createTask(title: string, subject: string, difficulty: Difficulty): Promise<bigint>;
    deleteStudyFile(fileId: bigint): Promise<void>;
    deleteTask(taskId: bigint): Promise<void>;
    getActiveQuiz(): Promise<QuizResult | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardSummary(): Promise<DashboardSummary>;
    getQuizHistory(user: Principal): Promise<Array<QuizResult>>;
    getSessionState(user: Principal): Promise<SessionState>;
    getStudyFiles(): Promise<Array<StudyFile>>;
    getStudyFilesBySubject(subject: string): Promise<Array<StudyFile>>;
    getTasksForUser(user: Principal): Promise<Array<Task>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerStudyFile(title: string, subject: string, fileType: string, blobId: string): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    startQuiz(topics: Array<string>): Promise<bigint>;
    submitQuiz(quizId: bigint, score: bigint): Promise<void>;
    updateSessionState(state: SessionState): Promise<void>;
    updateTask(taskId: bigint, status: Status): Promise<void>;
}

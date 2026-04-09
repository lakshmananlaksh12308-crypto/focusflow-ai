# FocusFlow AI

## Current State
- Frontend-only demo app with glassmorphism login page, animated dashboard, LOCKDIN focus timer, task management, quiz system, and AI Tutor panel.
- Backend has Motoko actor with: UserProfile, Task, SessionState, QuizResult types, and full CRUD APIs.
- Authorization component installed.
- No file/blob storage for study content.
- No study content library (file upload, view, delete).

## Requested Changes (Diff)

### Add
- **Study Content Library**: A dedicated section where users can upload study files (PDFs, docs, images, videos) and view/delete them.
- **blob-storage component**: For persisting uploaded files on-chain with HTTP URL access.
- **StudyFile metadata** backend type: fileId, title, subject, fileType, uploadedAt, blobId, owner.
- Backend APIs: `uploadStudyFile`, `getStudyFiles`, `deleteStudyFile`, `getStudyFilesBySubject`.
- "Study Content" tab in the dashboard navigation.
- File upload UI with drag-and-drop and subject tagging.
- File listing with preview links, subject filter, and delete button.

### Modify
- Backend `main.mo`: Add StudyFile type, persistent storage map, and file management APIs wired to blob-storage.
- Dashboard navigation: Add "Study Content" tab alongside existing tabs.
- Subjects list: Reuse subject tags from tasks for filtering study files.

### Remove
- Nothing removed.

## Implementation Plan
1. Select `blob-storage` component.
2. Regenerate Motoko backend with StudyFile data model and file APIs integrated with blob-storage.
3. Frontend: Add Study Content tab with file upload (drag-and-drop), file list with subject filter, file preview links, and delete action. Wire to backend APIs and blob-storage upload hook.
4. Validate and deploy.

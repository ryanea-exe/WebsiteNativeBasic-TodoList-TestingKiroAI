# Product: TodoList App

A client-side web application for managing a personal task list (todo). Users can create, read, update, and delete tasks. Each task has a title, a completion status (done/not done), and a creation timestamp.

The app runs entirely in the browser with no backend or external API. Data is persisted across page refreshes using `localStorage`.

## Core Features

- Add new tasks via text input (with validation)
- Display all tasks sorted newest-first
- Toggle task completion status
- Delete tasks
- Filter tasks by status: All / Active (belum selesai) / Completed (selesai)
- Inline editing of task titles (double-click to edit)
- Graceful degradation when `localStorage` is unavailable

## Language

UI labels, error messages, and user-facing text are written in **Bahasa Indonesia**. Code, variable names, comments, and documentation are in English or a mix — follow existing conventions per file.

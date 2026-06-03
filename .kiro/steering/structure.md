# Project Structure

## Root Layout

```
Program-TodoListApp/
├── index.html              # App entry point and markup
├── style.css               # All styles
├── app.js                  # All application logic
├── package.json            # Dev dependencies and scripts
├── vitest.config.js        # Vitest + jsdom configuration
├── tests/
│   ├── unit/
│   │   ├── validation.test.js      # isValidTitle(), getValidationError()
│   │   ├── storage.test.js         # StorageService
│   │   ├── state.test.js           # State mutation functions
│   │   └── render.test.js          # Render sub-functions
│   ├── property/
│   │   ├── task-operations.property.test.js   # Properties 1–5, 6, 7
│   │   ├── filter.property.test.js             # Property 8
│   │   ├── storage.property.test.js            # Properties 9–10
│   │   └── edit.property.test.js               # Properties 11–13
│   └── integration/
│       └── app.integration.test.js # End-to-end flows in jsdom
└── .kiro/
    ├── specs/todolist-app/         # Spec documents
    └── steering/                   # AI steering rules (this folder)
```

## app.js Internal Structure

`app.js` is intentionally a single file. Keep sections in this order:

1. **Data Model** — `Task` typedef comment
2. **State** — `const state = { ... }`
3. **StorageService** — `isAvailable()`, `load()`, `save()`
4. **Input Validation** — `isValidTitle()`, `getValidationError()`
5. **State Mutations** — `addTask()`, `deleteTask()`, `toggleTask()`, `editTask()`, `startEditing()`, `cancelEditing()`, `setFilter()`
6. **Render Engine** — `render()`, `renderTaskList()`, `renderCounter()`, `renderFilterBar()`, `renderEmptyState()`
7. **Event Handlers** — `handleAddTask()`, `handleToggleTask()`, `handleDeleteTask()`, `handleStartEdit()`, `handleSaveEdit()`, `handleCancelEdit()`, `handleSetFilter()`
8. **Pending Queue** — `processingToggle` flag and `pendingToggles` array
9. **Initialization** — app bootstrap, localStorage check, initial `render()` call, event binding

## Key Conventions

- **State is the single source of truth.** Never mutate the DOM directly — always update `state` then call `render()`.
- **`render()` is the only DOM entry point.** All UI updates go through it.
- **Derived values** (`filteredTasks`, `activeCount`, `isEmpty`) are computed inside `render()`, never stored in `state`.
- **localStorage key** is `"todolist_app_tasks"` — do not change it.
- **Task IDs** use `crypto.randomUUID()` with a `Math.random()`-based fallback.
- **Sorting** is applied at render time (descending `createdAt`), not at mutation time.
- **Validation** functions are pure — no side effects, no DOM access.
- **StorageService operations** are silent no-ops (not errors) when storage is unavailable.
- **Property tests** must include a comment referencing the property number and the requirements it validates.

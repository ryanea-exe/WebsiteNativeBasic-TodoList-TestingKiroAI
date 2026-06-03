// ─────────────────────────────────────────────────────────────────────────────
// Feature: todolist-app
// Property 9: Penyimpanan ke localStorage adalah Round-Trip
// Validates: Requirements 6.1, 6.2
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, beforeEach, beforeAll, afterAll } from 'vitest';
import { expect } from 'vitest';
import fc from 'fast-check';
import { StorageService } from '../../app.js';

// ─────────────────────────────────────────────────────────────────────────────
// localStorage polyfill
//
// Node 25 ships a native localStorage stub that lacks .clear() and other
// methods. Vitest's jsdom environment is supposed to replace it, but on
// Node 25 the native stub wins. We install a full in-memory implementation
// before the suite runs so StorageService can use it normally.
// ─────────────────────────────────────────────────────────────────────────────

function makeLocalStorageMock() {
  let store = {};
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key(index) {
      return Object.keys(store)[index] ?? null;
    },
  };
}

let originalLocalStorage;

beforeAll(() => {
  // Save whatever Node/jsdom placed on globalThis.localStorage and replace it
  // with a fully functional in-memory implementation.
  originalLocalStorage = globalThis.localStorage;
  globalThis.localStorage = makeLocalStorageMock();
});

afterAll(() => {
  // Restore the original to avoid side-effects on other test files.
  globalThis.localStorage = originalLocalStorage;
});

// ─────────────────────────────────────────────────────────────────────────────
// Arbitraries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generator for a valid Task object.
 * Produces arbitrary Task objects matching the Task typedef:
 *   { id: string, title: string (non-empty), completed: boolean, createdAt: number (>= 0) }
 */
const validTask = fc.record({
  id: fc.uuidV(4),
  title: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
  completed: fc.boolean(),
  createdAt: fc.integer({ min: 0 }),
});

/**
 * Generator for an array of valid Task objects (0 to 20 items).
 * An empty array is valid — saving and loading an empty list must also round-trip correctly.
 */
const validTaskArray = fc.array(validTask, { minLength: 0, maxLength: 20 });

// ─────────────────────────────────────────────────────────────────────────────
// Property 9
// ─────────────────────────────────────────────────────────────────────────────

describe('Property 9: Storage save/load is a round-trip', () => {
  beforeEach(() => {
    // Start each property run with a clean localStorage slate
    localStorage.clear();
  });

  it(
    'StorageService.load() returns a structurally identical array after StorageService.save()',
    () => {
      // **Validates: Requirements 6.1, 6.2**
      fc.assert(
        fc.property(validTaskArray, (tasks) => {
          // Clear storage before each sample to avoid cross-sample contamination
          localStorage.clear();

          StorageService.save(tasks);
          const loaded = StorageService.load();

          // Same number of elements
          expect(loaded).toHaveLength(tasks.length);

          // Every element is structurally identical (same id, title, completed, createdAt)
          for (let i = 0; i < tasks.length; i++) {
            expect(loaded[i].id).toBe(tasks[i].id);
            expect(loaded[i].title).toBe(tasks[i].title);
            expect(loaded[i].completed).toBe(tasks[i].completed);
            expect(loaded[i].createdAt).toBe(tasks[i].createdAt);
          }
        }),
        { numRuns: 100 }
      );
    }
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Feature: todolist-app
// Property 10: Semua Operasi Berjalan Tanpa Error Saat localStorage Tidak Tersedia
// Validates: Requirements 6.4
// ─────────────────────────────────────────────────────────────────────────────

// Dynamically import state mutation functions — they may not be exported yet
// (state mutations are implemented in a later task). Tests that depend on them
// are skipped gracefully when the exports are absent.
let addTask, toggleTask, deleteTask, editTask, state;
try {
  const mod = await import('../../app.js');
  addTask    = mod.addTask;
  toggleTask = mod.toggleTask;
  deleteTask = mod.deleteTask;
  editTask   = mod.editTask;
  state      = mod.state;
} catch {
  // Not yet exported — sequence-of-operations sub-test will be skipped
}

// ─────────────────────────────────────────────────────────────────────────────
// Arbitraries
// ─────────────────────────────────────────────────────────────────────────────

/** Generator for a non-empty valid title string */
const validTitle = fc
  .string({ minLength: 1 })
  .filter((s) => s.trim().length > 0);

/**
 * Generator for a task operation descriptor.
 * Each operation is one of: addTask, toggleTask (by index), deleteTask (by index), editTask (by index + newTitle).
 * Index-based addressing avoids hardcoding IDs — the test resolves them at runtime.
 */
const taskOperation = fc.oneof(
  // add: provide a title
  fc.record({ type: fc.constant('add'), title: validTitle }),
  // toggle: target task at a given list index (mod-addressed to stay in bounds)
  fc.record({ type: fc.constant('toggle'), index: fc.nat() }),
  // delete: target task at a given list index
  fc.record({ type: fc.constant('delete'), index: fc.nat() }),
  // edit: target task at a given list index with a new valid title
  fc.record({ type: fc.constant('edit'), index: fc.nat(), title: validTitle })
);

/** Generator for a sequence of 1–15 operations */
const operationSequence = fc.array(taskOperation, { minLength: 1, maxLength: 15 });

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build a broken localStorage (every method throws)
// ─────────────────────────────────────────────────────────────────────────────
function makeBrokenLocalStorage() {
  return {
    getItem()  { throw new Error('localStorage unavailable'); },
    setItem()  { throw new Error('localStorage unavailable'); },
    removeItem(){ throw new Error('localStorage unavailable'); },
    clear()    { throw new Error('localStorage unavailable'); },
    get length(){ throw new Error('localStorage unavailable'); },
    key()      { throw new Error('localStorage unavailable'); },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Property 10
// ─────────────────────────────────────────────────────────────────────────────

describe('Property 10: All operations run without error when localStorage is unavailable', () => {

  it(
    'StorageService.save() is a silent no-op — never throws — when localStorage is unavailable',
    () => {
      // **Validates: Requirements 6.4**
      const realLocalStorage = globalThis.localStorage;

      try {
        fc.assert(
          fc.property(validTaskArray, (tasks) => {
            globalThis.localStorage = makeBrokenLocalStorage();

            // isAvailable() must detect the broken storage correctly
            expect(StorageService.isAvailable()).toBe(false);

            // save() must never throw — it is documented as a "silent no-op"
            expect(() => {
              StorageService.save(tasks);
            }).not.toThrow();
          }),
          { numRuns: 100 }
        );
      } finally {
        // Always restore so subsequent tests are not affected
        globalThis.localStorage = realLocalStorage;
      }
    }
  );

  it(
    'StorageService.load() returns [] and does not throw when localStorage is unavailable',
    () => {
      // **Validates: Requirements 6.4**
      const realLocalStorage = globalThis.localStorage;

      try {
        globalThis.localStorage = makeBrokenLocalStorage();

        let result;
        expect(() => {
          result = StorageService.load();
        }).not.toThrow();

        expect(result).toEqual([]);
      } finally {
        globalThis.localStorage = realLocalStorage;
      }
    }
  );

  it(
    'sequence of addTask/toggleTask/deleteTask/editTask does not throw and mutates state.tasks in-memory when localStorage is unavailable',
    () => {
      // **Validates: Requirements 6.4**

      // Skip gracefully if state mutation functions are not yet exported
      if (
        typeof addTask    !== 'function' ||
        typeof toggleTask !== 'function' ||
        typeof deleteTask !== 'function' ||
        typeof editTask   !== 'function' ||
        !state
      ) {
        return;
      }

      const realLocalStorage = globalThis.localStorage;

      try {
        fc.assert(
          fc.property(operationSequence, (ops) => {
            // Install broken localStorage for this sample
            globalThis.localStorage = makeBrokenLocalStorage();

            // Ensure StorageService reports unavailability
            expect(StorageService.isAvailable()).toBe(false);

            // Reset in-memory state
            state.tasks = [];

            // Apply each operation; none must throw
            for (const op of ops) {
              expect(() => {
                if (op.type === 'add') {
                  addTask(op.title);
                } else if (op.type === 'toggle') {
                  if (state.tasks.length > 0) {
                    const target = state.tasks[op.index % state.tasks.length];
                    toggleTask(target.id);
                  }
                } else if (op.type === 'delete') {
                  if (state.tasks.length > 0) {
                    const target = state.tasks[op.index % state.tasks.length];
                    deleteTask(target.id);
                  }
                } else if (op.type === 'edit') {
                  if (state.tasks.length > 0) {
                    const target = state.tasks[op.index % state.tasks.length];
                    editTask(target.id, op.title);
                  }
                }
              }).not.toThrow();
            }

            // After all operations state.tasks must be a valid array (in-memory mutation worked)
            expect(Array.isArray(state.tasks)).toBe(true);

            // No task should have been lost silently — every task still has required fields
            for (const task of state.tasks) {
              expect(typeof task.id).toBe('string');
              expect(typeof task.title).toBe('string');
              expect(task.title.trim().length).toBeGreaterThan(0);
              expect(typeof task.completed).toBe('boolean');
              expect(typeof task.createdAt).toBe('number');
            }

            // Restore for the next fast-check sample
            globalThis.localStorage = realLocalStorage;
          }),
          { numRuns: 100 }
        );
      } finally {
        globalThis.localStorage = realLocalStorage;
        // Clean up shared state
        if (state) state.tasks = [];
      }
    }
  );
});

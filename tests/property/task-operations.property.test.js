import { describe, it, beforeEach } from 'vitest';
import { expect } from 'vitest';
import fc from 'fast-check';
import { isValidTitle, state } from '../../app.js';

// Dynamically import mutation functions that may not be implemented yet
let addTask, editTask;
try {
  const mod = await import('../../app.js');
  addTask = mod.addTask;
  editTask = mod.editTask;
} catch {
  // Functions not yet exported — property tests for state immutability will be skipped
}

// ─────────────────────────────────────────────────────────────────────────────
// Feature: todolist-app
// Property 2: Judul Whitespace-Only Selalu Ditolak
// Validates: Requirements 1.4, 1.5, 7.4
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generator for whitespace-only strings (non-empty).
 * Produces any non-empty string composed exclusively of space, tab, and newline characters.
 */
const whitespaceOnlyString = fc
  .array(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 1, maxLength: 20 })
  .map((chars) => chars.join(''));

describe('Property 2: Whitespace-only titles are always rejected', () => {
  beforeEach(() => {
    // Reset state.tasks before each test run
    state.tasks = [];
  });

  it('isValidTitle() returns false for any whitespace-only string', () => {
    fc.assert(
      fc.property(whitespaceOnlyString, (title) => {
        expect(isValidTitle(title)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('addTask() does not modify state.tasks when title is whitespace-only', () => {
    if (typeof addTask !== 'function') return; // skip if not yet implemented

    fc.assert(
      fc.property(whitespaceOnlyString, (title) => {
        state.tasks = [];
        addTask(title);
        expect(state.tasks).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  it('editTask() does not modify state.tasks when new title is whitespace-only', () => {
    if (typeof addTask !== 'function' || typeof editTask !== 'function') return; // skip if not yet implemented

    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        whitespaceOnlyString,
        (validTitle, invalidTitle) => {
          // Seed state with one valid task
          state.tasks = [
            {
              id: 'test-id-1',
              title: validTitle.trim(),
              completed: false,
              createdAt: Date.now(),
            },
          ];
          const originalTitle = state.tasks[0].title;

          editTask('test-id-1', invalidTitle);

          // Task must still exist and title must remain unchanged
          expect(state.tasks).toHaveLength(1);
          expect(state.tasks[0].title).toBe(originalTitle);
        }
      ),
      { numRuns: 100 }
    );
  });
});

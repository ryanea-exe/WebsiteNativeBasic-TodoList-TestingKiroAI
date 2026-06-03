// =============================================================================
// 1. DATA MODEL
// =============================================================================

/**
 * @typedef {Object} Task
 * @property {string}  id        - UUID unik, dibuat dengan crypto.randomUUID() atau fallback
 * @property {string}  title     - Judul tugas, tidak boleh kosong atau whitespace-only
 * @property {boolean} completed - Status tugas: true = selesai, false = belum selesai
 * @property {number}  createdAt - Unix timestamp (ms) saat tugas dibuat, digunakan untuk pengurutan
 */

// =============================================================================
// 2. STATE
// =============================================================================

const state = {
  tasks: [],          // Array of Task objects
  filter: 'all',      // 'all' | 'active' | 'completed'
  editingId: null,    // ID tugas yang sedang diedit, atau null
  storageAvailable: true
};

// =============================================================================
// 3. STORAGE SERVICE
// =============================================================================

const StorageService = {
  STORAGE_KEY: 'todolist_app_tasks',

  isAvailable() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },

  load() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  save(tasks) {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Silent no-op jika storage quota exceeded
    }
  }
};

// =============================================================================
// 4. INPUT VALIDATION
// =============================================================================

/**
 * Checks whether a task title is valid (has at least one non-whitespace character).
 *
 * @param {string} title - The title to validate
 * @returns {boolean} true if valid, false if empty or whitespace-only
 */
function isValidTitle(title) {
  return typeof title === 'string' && title.trim().length > 0;
}

/**
 * Returns a Bahasa Indonesia error message if the title is invalid, or null if valid.
 *
 * @param {string} title - The title to validate
 * @returns {string|null} Error message string, or null if the title is valid
 */
function getValidationError(title) {
  if (!isValidTitle(title)) {
    return 'Judul tugas tidak boleh kosong.';
  }
  return null;
}

// =============================================================================
// 5. STATE MUTATIONS
// =============================================================================

// Implementations will be added in subsequent tasks

// =============================================================================
// 6. RENDER ENGINE
// =============================================================================

// Implementations will be added in subsequent tasks

// =============================================================================
// 7. EVENT HANDLERS
// =============================================================================

// Implementations will be added in subsequent tasks

// =============================================================================
// 8. PENDING QUEUE
// =============================================================================

// Implementations will be added in subsequent tasks

// =============================================================================
// 9. INITIALIZATION
// =============================================================================

// Bootstrap will be added in subsequent tasks

// =============================================================================
// EXPORTS (for testing)
// =============================================================================

export { isValidTitle, getValidationError, StorageService, state };

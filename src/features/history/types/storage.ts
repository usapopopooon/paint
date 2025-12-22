import type { HistoryAction } from './actions'

/**
 * Result type for async storage operations
 */
export type StorageResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: string }

/**
 * Configuration for storage implementations
 */
export type HistoryStorageConfig = {
  readonly maxUndoLevels?: number // default: 100
}

/**
 * Stack information for UI state
 */
export type StackInfo = {
  readonly undoCount: number
  readonly redoCount: number
}

/**
 * Abstract interface for history storage
 *
 * Implementations:
 * - InMemoryStorage (default)
 * - IndexedDBStorage (future)
 * - LocalStorageStorage (future)
 * - CloudStorage (future)
 */
export interface HistoryStorage {
  /**
   * Push a new action to the undo stack, clearing redo stack
   */
  readonly push: (action: HistoryAction) => Promise<StorageResult<void>>

  /**
   * Pop the most recent action from undo stack and push to redo stack
   * Returns the action that was undone
   */
  readonly undo: () => Promise<StorageResult<HistoryAction | null>>

  /**
   * Pop from redo stack and push to undo stack
   * Returns the action that was redone
   */
  readonly redo: () => Promise<StorageResult<HistoryAction | null>>

  /**
   * Get current undo/redo stack sizes
   */
  readonly getStackInfo: () => Promise<StorageResult<StackInfo>>

  /**
   * Peek at the next action to be undone (without modifying stacks)
   */
  readonly peekUndo: () => Promise<StorageResult<HistoryAction | null>>

  /**
   * Peek at the next action to be redone (without modifying stacks)
   */
  readonly peekRedo: () => Promise<StorageResult<HistoryAction | null>>

  /**
   * Clear all history
   */
  readonly clear: () => Promise<StorageResult<void>>

  /**
   * Dispose of resources (close connections, etc.)
   */
  readonly dispose: () => Promise<void>
}

/**
 * Factory function type for creating storage instances
 */
export type HistoryStorageFactory = (config?: HistoryStorageConfig) => HistoryStorage

/**
 * Helper to create a success result
 */
export const success = <T>(data: T): StorageResult<T> => ({
  success: true,
  data,
})

/**
 * Helper to create a failure result
 */
export const failure = (error: string): StorageResult<never> => ({
  success: false,
  error,
})

import type { HistoryStorage, HistoryStorageConfig, HistoryStorageFactory } from '../types/storage'
import { success } from '../types/storage'
import type { HistoryAction } from '../types/actions'

const DEFAULT_MAX_UNDO_LEVELS = 100

/**
 * インメモリ履歴ストレージの実装
 *
 * 他のストレージが指定されていない場合に使用されるデフォルトストレージ。
 * ページをリフレッシュすると全データが失われる。
 */
export const createInMemoryStorage: HistoryStorageFactory = (
  config?: HistoryStorageConfig
): HistoryStorage => {
  const maxLevels = config?.maxUndoLevels ?? DEFAULT_MAX_UNDO_LEVELS

  let undoStack: HistoryAction[] = []
  let redoStack: HistoryAction[] = []

  const trimStack = (stack: HistoryAction[]): HistoryAction[] =>
    stack.length > maxLevels ? stack.slice(-maxLevels) : stack

  return {
    push: async (action) => {
      undoStack = trimStack([...undoStack, action])
      redoStack = []
      return success(undefined)
    },

    undo: async () => {
      const action = undoStack.at(-1)
      if (!action) {
        return success(null)
      }

      undoStack = undoStack.slice(0, -1)
      redoStack = [action, ...redoStack]
      return success(action)
    },

    redo: async () => {
      const action = redoStack[0]
      if (!action) {
        return success(null)
      }

      redoStack = redoStack.slice(1)
      undoStack = [...undoStack, action]
      return success(action)
    },

    getStackInfo: async () =>
      success({
        undoCount: undoStack.length,
        redoCount: redoStack.length,
      }),

    peekUndo: async () => success(undoStack.at(-1) ?? null),

    peekRedo: async () => success(redoStack[0] ?? null),

    clear: async () => {
      undoStack = []
      redoStack = []
      return success(undefined)
    },

    dispose: async () => {
      undoStack = []
      redoStack = []
    },
  }
}

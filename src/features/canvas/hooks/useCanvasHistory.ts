import { useCallback, useState, useRef, useEffect } from 'react'
import type { Drawable } from '@/features/drawable'
import type { HistoryStorage } from '@/features/history'
import {
  createInMemoryStorage,
  createDrawableAddedAction,
  createDrawablesClearedAction,
} from '@/features/history'

/**
 * Options for useCanvasHistory hook
 */
export type UseCanvasHistoryOptions = {
  readonly storage?: HistoryStorage
  readonly maxUndoLevels?: number
}

/**
 * Canvas history hook with storage abstraction
 *
 * 履歴のみを管理。実際のdrawables状態はuseLayersが単一のsource of truthとして保持。
 * このhookはundo/redo可能かどうかの判定と、アクションの記録・復元を担当。
 *
 * Usage:
 *   const history = useCanvasHistory()
 */
export const useCanvasHistory = (options?: UseCanvasHistoryOptions) => {
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  // Storage instance (default: in-memory)
  const storageRef = useRef<HistoryStorage>(
    options?.storage ??
      createInMemoryStorage({
        maxUndoLevels: options?.maxUndoLevels,
      })
  )

  // Sync stack info from storage
  const updateStackInfo = useCallback(async () => {
    const result = await storageRef.current.getStackInfo()
    if (result.success) {
      setCanUndo(result.data.undoCount > 0)
      setCanRedo(result.data.redoCount > 0)
    }
  }, [])

  // Drawableの追加を履歴に記録
  const addDrawable = useCallback(
    (drawable: Drawable) => {
      const action = createDrawableAddedAction(drawable)
      storageRef.current.push(action).then(updateStackInfo)
    },
    [updateStackInfo]
  )

  // Undo操作を記録（実際のレイヤー操作は呼び出し側で行う）
  const undo = useCallback(async () => {
    const result = await storageRef.current.undo()
    if (result.success) {
      await updateStackInfo()
    }
  }, [updateStackInfo])

  // Redo操作を記録（実際のレイヤー操作は呼び出し側で行う）
  const redo = useCallback(async () => {
    const result = await storageRef.current.redo()
    if (result.success) {
      await updateStackInfo()
    }
  }, [updateStackInfo])

  // Redoで復元されるDrawableを取得
  const getRedoDrawable = useCallback(async (): Promise<Drawable | null> => {
    const result = await storageRef.current.peekRedo()
    if (result.success && result.data && result.data.type === 'drawable:added') {
      return result.data.drawable
    }
    return null
  }, [])

  // クリア操作を履歴に記録
  const recordClear = useCallback(
    async (previousDrawables: readonly Drawable[]) => {
      const action = createDrawablesClearedAction(previousDrawables)
      await storageRef.current.push(action)
      await updateStackInfo()
    },
    [updateStackInfo]
  )

  // Cleanup on unmount
  useEffect(() => {
    const storage = storageRef.current
    return () => {
      storage.dispose()
    }
  }, [])

  return {
    canUndo,
    canRedo,
    addDrawable,
    undo,
    redo,
    getRedoDrawable,
    recordClear,
  } as const
}

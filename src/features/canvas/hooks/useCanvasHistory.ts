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
 * Usage (backward compatible):
 *   const history = useCanvasHistory()
 *
 * Usage (with custom storage):
 *   const history = useCanvasHistory({ storage: myIndexedDBStorage })
 */
export const useCanvasHistory = (options?: UseCanvasHistoryOptions) => {
  const [drawables, setDrawables] = useState<readonly Drawable[]>([])
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

  const addDrawable = useCallback(
    (drawable: Drawable) => {
      const action = createDrawableAddedAction(drawable)

      // Optimistic update
      setDrawables((prev) => [...prev, drawable])

      // Push to storage
      storageRef.current.push(action).then(updateStackInfo)
    },
    [updateStackInfo]
  )

  const undoAction = useCallback(async () => {
    const result = await storageRef.current.undo()
    if (result.success && result.data) {
      const action = result.data

      // Apply reverse of action to state
      if (action.type === 'drawable:added') {
        setDrawables((prev) => prev.slice(0, -1))
      } else if (action.type === 'drawables:cleared') {
        setDrawables(action.previousDrawables)
      }

      await updateStackInfo()
    }
  }, [updateStackInfo])

  const redoAction = useCallback(async () => {
    const result = await storageRef.current.redo()
    if (result.success && result.data) {
      const action = result.data

      // Reapply action to state
      if (action.type === 'drawable:added') {
        setDrawables((prev) => [...prev, action.drawable])
      } else if (action.type === 'drawables:cleared') {
        setDrawables([])
      }

      await updateStackInfo()
    }
  }, [updateStackInfo])

  // Get the drawable that would be redone (async)
  const getRedoDrawable = useCallback(async (): Promise<Drawable | null> => {
    const result = await storageRef.current.peekRedo()
    if (result.success && result.data && result.data.type === 'drawable:added') {
      return result.data.drawable
    }
    return null
  }, [])

  const clear = useCallback(async () => {
    const currentDrawables = drawables
    const action = createDrawablesClearedAction(currentDrawables)

    // Optimistic update
    setDrawables([])

    // Push to storage
    await storageRef.current.push(action)
    await updateStackInfo()
  }, [drawables, updateStackInfo])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      storageRef.current.dispose()
    }
  }, [])

  return {
    drawables,
    canUndo,
    canRedo,
    addDrawable,
    undo: undoAction,
    redo: redoAction,
    getRedoDrawable,
    clear,
  } as const
}

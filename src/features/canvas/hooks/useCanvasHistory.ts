import { useCallback, useState } from 'react'
import type { CanvasHistory, Stroke } from '../types'

const createInitialHistory = (): CanvasHistory => ({
  past: [],
  present: [],
  future: [],
})

const pushToHistory = (
  history: CanvasHistory,
  strokes: readonly Stroke[]
): CanvasHistory => ({
  past: [...history.past, history.present],
  present: strokes,
  future: [],
})

const undo = (history: CanvasHistory): CanvasHistory => {
  if (history.past.length === 0) return history
  const previous = history.past[history.past.length - 1]
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  }
}

const redo = (history: CanvasHistory): CanvasHistory => {
  if (history.future.length === 0) return history
  const next = history.future[0]
  return {
    past: [...history.past, history.present],
    present: next,
    future: history.future.slice(1),
  }
}

export const useCanvasHistory = () => {
  const [history, setHistory] = useState<CanvasHistory>(createInitialHistory)

  const addStroke = useCallback((stroke: Stroke) => {
    setHistory((prev) => pushToHistory(prev, [...prev.present, stroke]))
  }, [])

  const undoAction = useCallback(() => {
    setHistory(undo)
  }, [])

  const redoAction = useCallback(() => {
    setHistory(redo)
  }, [])

  const clear = useCallback(() => {
    setHistory((prev) => pushToHistory(prev, []))
  }, [])

  return {
    strokes: history.present,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    addStroke,
    undo: undoAction,
    redo: redoAction,
    clear,
  } as const
}

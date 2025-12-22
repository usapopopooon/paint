import { describe, it, expect, beforeEach } from 'vitest'
import { createInMemoryStorage } from './inMemory'
import type { HistoryStorage } from '../types/storage'
import type { DrawableAddedAction } from '../types/actions'
import { createSolidBrushTip } from '@/features/brush'
import { createStrokeDrawable } from '@/features/drawable'

const createTestDrawableAction = (id: string): DrawableAddedAction => ({
  id,
  timestamp: Date.now(),
  type: 'drawable:added',
  drawable: createStrokeDrawable(
    [{ x: 0, y: 0 }],
    {
      color: '#000000',
      brushTip: createSolidBrushTip(3),
      blendMode: 'normal',
    }
  ),
})

describe('createInMemoryStorage', () => {
  let storage: HistoryStorage

  beforeEach(() => {
    storage = createInMemoryStorage()
  })

  describe('push', () => {
    it('pushes an action and clears redo stack', async () => {
      const action = createTestDrawableAction('1')
      const result = await storage.push(action)

      expect(result.success).toBe(true)

      const info = await storage.getStackInfo()
      expect(info.success && info.data.undoCount).toBe(1)
      expect(info.success && info.data.redoCount).toBe(0)
    })

    it('respects maxUndoLevels', async () => {
      const storageWithLimit = createInMemoryStorage({ maxUndoLevels: 3 })

      await storageWithLimit.push(createTestDrawableAction('1'))
      await storageWithLimit.push(createTestDrawableAction('2'))
      await storageWithLimit.push(createTestDrawableAction('3'))
      await storageWithLimit.push(createTestDrawableAction('4'))

      const info = await storageWithLimit.getStackInfo()
      expect(info.success && info.data.undoCount).toBe(3)
    })
  })

  describe('undo', () => {
    it('returns null when undo stack is empty', async () => {
      const result = await storage.undo()

      expect(result.success).toBe(true)
      expect(result.success && result.data).toBeNull()
    })

    it('returns the undone action and moves it to redo stack', async () => {
      const action = createTestDrawableAction('1')
      await storage.push(action)

      const result = await storage.undo()

      expect(result.success).toBe(true)
      expect(result.success && result.data?.id).toBe('1')

      const info = await storage.getStackInfo()
      expect(info.success && info.data.undoCount).toBe(0)
      expect(info.success && info.data.redoCount).toBe(1)
    })
  })

  describe('redo', () => {
    it('returns null when redo stack is empty', async () => {
      const result = await storage.redo()

      expect(result.success).toBe(true)
      expect(result.success && result.data).toBeNull()
    })

    it('returns the redone action and moves it to undo stack', async () => {
      const action = createTestDrawableAction('1')
      await storage.push(action)
      await storage.undo()

      const result = await storage.redo()

      expect(result.success).toBe(true)
      expect(result.success && result.data?.id).toBe('1')

      const info = await storage.getStackInfo()
      expect(info.success && info.data.undoCount).toBe(1)
      expect(info.success && info.data.redoCount).toBe(0)
    })
  })

  describe('peekUndo', () => {
    it('returns null when undo stack is empty', async () => {
      const result = await storage.peekUndo()

      expect(result.success).toBe(true)
      expect(result.success && result.data).toBeNull()
    })

    it('returns the next action to undo without modifying stack', async () => {
      const action = createTestDrawableAction('1')
      await storage.push(action)

      const result = await storage.peekUndo()

      expect(result.success).toBe(true)
      expect(result.success && result.data?.id).toBe('1')

      const info = await storage.getStackInfo()
      expect(info.success && info.data.undoCount).toBe(1)
    })
  })

  describe('peekRedo', () => {
    it('returns null when redo stack is empty', async () => {
      const result = await storage.peekRedo()

      expect(result.success).toBe(true)
      expect(result.success && result.data).toBeNull()
    })

    it('returns the next action to redo without modifying stack', async () => {
      await storage.push(createTestDrawableAction('1'))
      await storage.undo()

      const result = await storage.peekRedo()

      expect(result.success).toBe(true)
      expect(result.success && result.data?.id).toBe('1')

      const info = await storage.getStackInfo()
      expect(info.success && info.data.redoCount).toBe(1)
    })
  })

  describe('clear', () => {
    it('clears both undo and redo stacks', async () => {
      await storage.push(createTestDrawableAction('1'))
      await storage.push(createTestDrawableAction('2'))
      await storage.undo()

      await storage.clear()

      const info = await storage.getStackInfo()
      expect(info.success && info.data.undoCount).toBe(0)
      expect(info.success && info.data.redoCount).toBe(0)
    })
  })

  describe('dispose', () => {
    it('clears all data', async () => {
      await storage.push(createTestDrawableAction('1'))
      await storage.dispose()

      const info = await storage.getStackInfo()
      expect(info.success && info.data.undoCount).toBe(0)
    })
  })

  describe('complex scenarios', () => {
    it('handles undo/redo sequence correctly', async () => {
      await storage.push(createTestDrawableAction('1'))
      await storage.push(createTestDrawableAction('2'))
      await storage.push(createTestDrawableAction('3'))

      // Undo twice
      await storage.undo()
      await storage.undo()

      let info = await storage.getStackInfo()
      expect(info.success && info.data.undoCount).toBe(1)
      expect(info.success && info.data.redoCount).toBe(2)

      // Redo once
      await storage.redo()

      info = await storage.getStackInfo()
      expect(info.success && info.data.undoCount).toBe(2)
      expect(info.success && info.data.redoCount).toBe(1)

      // Push new action clears redo stack
      await storage.push(createTestDrawableAction('4'))

      info = await storage.getStackInfo()
      expect(info.success && info.data.undoCount).toBe(3)
      expect(info.success && info.data.redoCount).toBe(0)
    })
  })
})

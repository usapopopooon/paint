import { describe, test, expect, beforeEach } from 'vitest'
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
    test('アクションをプッシュしてredoスタックをクリアする', async () => {
      const action = createTestDrawableAction('1')
      const result = await storage.push(action)

      expect(result.success).toBe(true)

      const info = await storage.getStackInfo()
      expect(info.success && info.data.undoCount).toBe(1)
      expect(info.success && info.data.redoCount).toBe(0)
    })

    test('maxUndoLevelsを尊重する', async () => {
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
    test('undoスタックが空の場合はnullを返す', async () => {
      const result = await storage.undo()

      expect(result.success).toBe(true)
      expect(result.success && result.data).toBeNull()
    })

    test('取り消したアクションを返してredoスタックに移動する', async () => {
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
    test('redoスタックが空の場合はnullを返す', async () => {
      const result = await storage.redo()

      expect(result.success).toBe(true)
      expect(result.success && result.data).toBeNull()
    })

    test('やり直したアクションを返してundoスタックに移動する', async () => {
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
    test('undoスタックが空の場合はnullを返す', async () => {
      const result = await storage.peekUndo()

      expect(result.success).toBe(true)
      expect(result.success && result.data).toBeNull()
    })

    test('スタックを変更せずに次にundoするアクションを返す', async () => {
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
    test('redoスタックが空の場合はnullを返す', async () => {
      const result = await storage.peekRedo()

      expect(result.success).toBe(true)
      expect(result.success && result.data).toBeNull()
    })

    test('スタックを変更せずに次にredoするアクションを返す', async () => {
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
    test('undoとredoの両スタックをクリアする', async () => {
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
    test('全データをクリアする', async () => {
      await storage.push(createTestDrawableAction('1'))
      await storage.dispose()

      const info = await storage.getStackInfo()
      expect(info.success && info.data.undoCount).toBe(0)
    })
  })

  describe('複雑なシナリオ', () => {
    test('undo/redoシーケンスを正しく処理する', async () => {
      await storage.push(createTestDrawableAction('1'))
      await storage.push(createTestDrawableAction('2'))
      await storage.push(createTestDrawableAction('3'))

      // 2回undo
      await storage.undo()
      await storage.undo()

      let info = await storage.getStackInfo()
      expect(info.success && info.data.undoCount).toBe(1)
      expect(info.success && info.data.redoCount).toBe(2)

      // 1回redo
      await storage.redo()

      info = await storage.getStackInfo()
      expect(info.success && info.data.undoCount).toBe(2)
      expect(info.success && info.data.redoCount).toBe(1)

      // 新しいアクションをプッシュするとredoスタックがクリアされる
      await storage.push(createTestDrawableAction('4'))

      info = await storage.getStackInfo()
      expect(info.success && info.data.undoCount).toBe(3)
      expect(info.success && info.data.redoCount).toBe(0)
    })
  })
})

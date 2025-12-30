import { describe, test, expect } from 'vitest'
import { getToolBehavior } from './getToolBehavior'
import { penBehavior, eraserBehavior, handBehavior } from '../entities'

describe('getToolBehavior', () => {
  test('penタイプに対してpenビヘイビアを返す', () => {
    const behavior = getToolBehavior('pen')
    expect(behavior.type).toBe('pen')
    expect(behavior.createStroke).toBe(penBehavior.createStroke)
  })

  test('eraserタイプに対してeraserビヘイビアを返す', () => {
    const behavior = getToolBehavior('eraser')
    expect(behavior.type).toBe('eraser')
    expect(behavior.createStroke).toBe(eraserBehavior.createStroke)
  })

  test('handタイプに対してhandビヘイビアを返す', () => {
    const behavior = getToolBehavior('hand')
    expect(behavior.type).toBe('hand')
    expect(behavior.createStroke).toBe(handBehavior.createStroke)
  })

  test('レジストリ経由でpenの正しいストロークを作成する', () => {
    const behavior = getToolBehavior('pen')
    const stroke = behavior.createStroke(
      { x: 0, y: 0 },
      { type: 'pen', width: 5, color: '#000000' }
    )
    expect(stroke.style.blendMode).toBe('normal')
  })

  test('レジストリ経由でeraserの正しいストロークを作成する', () => {
    const behavior = getToolBehavior('eraser')
    const stroke = behavior.createStroke({ x: 0, y: 0 }, { type: 'eraser', width: 20 })
    expect(stroke.style.blendMode).toBe('erase')
  })

  test('レジストリ経由でhandのカーソル設定を取得する', () => {
    const behavior = getToolBehavior('hand')
    const cursor = behavior.getCursor({ type: 'hand' })
    expect(cursor.size).toBe(0)
    expect(cursor.color).toBe('transparent')
  })
})

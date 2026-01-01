import { describe, test, expect } from 'vitest'
import { createBackgroundLayer } from './createBackgroundLayer'
import { BACKGROUND_LAYER_ID } from '../../constants'

describe('createBackgroundLayer', () => {
  test('背景レイヤーIDを持つレイヤーを作成する', () => {
    const layer = createBackgroundLayer()

    expect(layer.id).toBe(BACKGROUND_LAYER_ID)
  })

  test('backgroundタイプを持つ', () => {
    const layer = createBackgroundLayer()

    expect(layer.type).toBe('background')
  })

  test('デフォルトで非表示状態である', () => {
    const layer = createBackgroundLayer()

    expect(layer.isVisible).toBe(false)
  })

  test('ロック状態である', () => {
    const layer = createBackgroundLayer()

    expect(layer.isLocked).toBe(true)
  })

  test('不透明度が1である', () => {
    const layer = createBackgroundLayer()

    expect(layer.opacity).toBe(1)
  })

  test('通常ブレンドモードである', () => {
    const layer = createBackgroundLayer()

    expect(layer.blendMode).toBe('normal')
  })

  test('空のdrawables配列を持つ', () => {
    const layer = createBackgroundLayer()

    expect(layer.drawables).toEqual([])
  })

  test('名前がBackgroundである', () => {
    const layer = createBackgroundLayer()

    expect(layer.name).toBe('Background')
  })
})

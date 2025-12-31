import { describe, it, expect } from 'vitest'
import { createBackgroundLayer } from './createBackgroundLayer'
import { BACKGROUND_LAYER_ID } from '../../constants'

describe('createBackgroundLayer', () => {
  it('背景レイヤーIDを持つレイヤーを作成する', () => {
    const layer = createBackgroundLayer()

    expect(layer.id).toBe(BACKGROUND_LAYER_ID)
  })

  it('backgroundタイプを持つ', () => {
    const layer = createBackgroundLayer()

    expect(layer.type).toBe('background')
  })

  it('デフォルトで非表示状態である', () => {
    const layer = createBackgroundLayer()

    expect(layer.isVisible).toBe(false)
  })

  it('ロック状態である', () => {
    const layer = createBackgroundLayer()

    expect(layer.isLocked).toBe(true)
  })

  it('不透明度が1である', () => {
    const layer = createBackgroundLayer()

    expect(layer.opacity).toBe(1)
  })

  it('通常ブレンドモードである', () => {
    const layer = createBackgroundLayer()

    expect(layer.blendMode).toBe('normal')
  })

  it('空のdrawables配列を持つ', () => {
    const layer = createBackgroundLayer()

    expect(layer.drawables).toEqual([])
  })

  it('名前がBackgroundである', () => {
    const layer = createBackgroundLayer()

    expect(layer.name).toBe('Background')
  })
})

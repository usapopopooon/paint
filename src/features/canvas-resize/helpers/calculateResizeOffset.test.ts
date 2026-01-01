import { describe, test, expect } from 'vitest'
import { calculateResizeOffset } from './calculateResizeOffset'

describe('calculateResizeOffset', () => {
  describe('中央アンカー', () => {
    test('幅拡大時に半分のオフセットを返す', () => {
      const result = calculateResizeOffset('center', 100, 0)
      expect(result).toEqual({ offsetX: 50, offsetY: 0 })
    })

    test('高さ拡大時に半分のオフセットを返す', () => {
      const result = calculateResizeOffset('center', 0, 100)
      expect(result).toEqual({ offsetX: 0, offsetY: 50 })
    })

    test('幅縮小時に負の半分オフセットを返す', () => {
      const result = calculateResizeOffset('center', -100, 0)
      expect(result).toEqual({ offsetX: -50, offsetY: 0 })
    })
  })

  describe('左上アンカー', () => {
    test('幅拡大時にオフセット0を返す（左上固定）', () => {
      const result = calculateResizeOffset('top-left', 100, 0)
      expect(result).toEqual({ offsetX: 0, offsetY: 0 })
    })

    test('高さ拡大時にオフセット0を返す', () => {
      const result = calculateResizeOffset('top-left', 0, 100)
      expect(result).toEqual({ offsetX: 0, offsetY: 0 })
    })
  })

  describe('右下アンカー', () => {
    test('幅拡大時に全体オフセットを返す（右下固定=左上移動）', () => {
      const result = calculateResizeOffset('bottom-right', 100, 0)
      expect(result).toEqual({ offsetX: 100, offsetY: 0 })
    })

    test('高さ拡大時に全体オフセットを返す', () => {
      const result = calculateResizeOffset('bottom-right', 0, 100)
      expect(result).toEqual({ offsetX: 0, offsetY: 100 })
    })
  })

  describe('各辺アンカー', () => {
    test('上アンカー: 幅は半分、高さは0', () => {
      const result = calculateResizeOffset('top', 100, 50)
      expect(result).toEqual({ offsetX: 50, offsetY: 0 })
    })

    test('下アンカー: 幅は半分、高さは全体', () => {
      const result = calculateResizeOffset('bottom', 100, 50)
      expect(result).toEqual({ offsetX: 50, offsetY: 50 })
    })

    test('左アンカー: 幅は0、高さは半分', () => {
      const result = calculateResizeOffset('left', 100, 50)
      expect(result).toEqual({ offsetX: 0, offsetY: 25 })
    })

    test('右アンカー: 幅は全体、高さは半分', () => {
      const result = calculateResizeOffset('right', 100, 50)
      expect(result).toEqual({ offsetX: 100, offsetY: 25 })
    })
  })

  describe('四隅アンカー', () => {
    test('左上アンカー: 両方0', () => {
      const result = calculateResizeOffset('top-left', 100, 50)
      expect(result).toEqual({ offsetX: 0, offsetY: 0 })
    })

    test('右上アンカー: 幅は全体、高さは0', () => {
      const result = calculateResizeOffset('top-right', 100, 50)
      expect(result).toEqual({ offsetX: 100, offsetY: 0 })
    })

    test('左下アンカー: 幅は0、高さは全体', () => {
      const result = calculateResizeOffset('bottom-left', 100, 50)
      expect(result).toEqual({ offsetX: 0, offsetY: 50 })
    })

    test('右下アンカー: 両方全体', () => {
      const result = calculateResizeOffset('bottom-right', 100, 50)
      expect(result).toEqual({ offsetX: 100, offsetY: 50 })
    })
  })
})

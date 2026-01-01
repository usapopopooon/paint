import { describe, test, expect } from 'vitest'
import { getAnchorOffsetFactors } from './getAnchorOffsetFactors'

describe('getAnchorOffsetFactors', () => {
  test('中央アンカーは(0.5, 0.5)を返す', () => {
    const result = getAnchorOffsetFactors('center')
    expect(result).toEqual({ factorX: 0.5, factorY: 0.5 })
  })

  test('左上アンカーは(0, 0)を返す', () => {
    const result = getAnchorOffsetFactors('top-left')
    expect(result).toEqual({ factorX: 0, factorY: 0 })
  })

  test('右下アンカーは(1, 1)を返す', () => {
    const result = getAnchorOffsetFactors('bottom-right')
    expect(result).toEqual({ factorX: 1, factorY: 1 })
  })

  test('上アンカーは(0.5, 0)を返す', () => {
    const result = getAnchorOffsetFactors('top')
    expect(result).toEqual({ factorX: 0.5, factorY: 0 })
  })

  test('右アンカーは(1, 0.5)を返す', () => {
    const result = getAnchorOffsetFactors('right')
    expect(result).toEqual({ factorX: 1, factorY: 0.5 })
  })

  test('下アンカーは(0.5, 1)を返す', () => {
    const result = getAnchorOffsetFactors('bottom')
    expect(result).toEqual({ factorX: 0.5, factorY: 1 })
  })

  test('左アンカーは(0, 0.5)を返す', () => {
    const result = getAnchorOffsetFactors('left')
    expect(result).toEqual({ factorX: 0, factorY: 0.5 })
  })
})

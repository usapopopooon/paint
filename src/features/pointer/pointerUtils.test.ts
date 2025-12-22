import { describe, test, expect } from 'vitest'
import { getPointerType, getPointerPoint } from './pointerUtils'

describe('getPointerType', () => {
  test('penポインタータイプに対してpenを返す', () => {
    expect(getPointerType('pen')).toBe('pen')
  })

  test('touchポインタータイプに対してtouchを返す', () => {
    expect(getPointerType('touch')).toBe('touch')
  })

  test('mouseポインタータイプに対してmouseを返す', () => {
    expect(getPointerType('mouse')).toBe('mouse')
  })

  test('不明なポインタータイプに対してmouseを返す', () => {
    expect(getPointerType('unknown')).toBe('mouse')
    expect(getPointerType('')).toBe('mouse')
  })
})

describe('getPointerPoint', () => {
  const mockRect: DOMRect = {
    left: 100,
    top: 50,
    right: 900,
    bottom: 650,
    width: 800,
    height: 600,
    x: 100,
    y: 50,
    toJSON: () => ({}),
  }

  test('要素に対する相対座標を計算する', () => {
    const point = getPointerPoint(150, 100, mockRect, 0.5, 'pen')

    expect(point.x).toBe(50) // 150 - 100
    expect(point.y).toBe(50) // 100 - 50
    expect(point.pressure).toBe(0.5)
    expect(point.pointerType).toBe('pen')
  })

  test('筆圧0を処理する', () => {
    const point = getPointerPoint(200, 150, mockRect, 0, 'mouse')

    expect(point.pressure).toBe(0)
    expect(point.pointerType).toBe('mouse')
  })

  test('touchポインタータイプを処理する', () => {
    const point = getPointerPoint(300, 200, mockRect, 1, 'touch')

    expect(point.x).toBe(200) // 300 - 100
    expect(point.y).toBe(150) // 200 - 50
    expect(point.pressure).toBe(1)
    expect(point.pointerType).toBe('touch')
  })

  test('ポインターが要素外にある場合の負の座標を処理する', () => {
    const point = getPointerPoint(50, 25, mockRect, 0.5, 'pen')

    expect(point.x).toBe(-50) // 50 - 100
    expect(point.y).toBe(-25) // 25 - 50
  })
})

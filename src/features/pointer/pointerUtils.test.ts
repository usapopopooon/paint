import { describe, it, expect } from 'vitest'
import { getPointerType, getPointerPoint } from './pointerUtils'

describe('getPointerType', () => {
  it('returns pen for pen pointer type', () => {
    expect(getPointerType('pen')).toBe('pen')
  })

  it('returns touch for touch pointer type', () => {
    expect(getPointerType('touch')).toBe('touch')
  })

  it('returns mouse for mouse pointer type', () => {
    expect(getPointerType('mouse')).toBe('mouse')
  })

  it('returns mouse for unknown pointer type', () => {
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

  it('calculates point coordinates relative to element', () => {
    const point = getPointerPoint(150, 100, mockRect, 0.5, 'pen')

    expect(point.x).toBe(50) // 150 - 100
    expect(point.y).toBe(50) // 100 - 50
    expect(point.pressure).toBe(0.5)
    expect(point.pointerType).toBe('pen')
  })

  it('handles zero pressure', () => {
    const point = getPointerPoint(200, 150, mockRect, 0, 'mouse')

    expect(point.pressure).toBe(0)
    expect(point.pointerType).toBe('mouse')
  })

  it('handles touch pointer type', () => {
    const point = getPointerPoint(300, 200, mockRect, 1, 'touch')

    expect(point.x).toBe(200) // 300 - 100
    expect(point.y).toBe(150) // 200 - 50
    expect(point.pressure).toBe(1)
    expect(point.pointerType).toBe('touch')
  })

  it('handles negative coordinates when pointer is outside element', () => {
    const point = getPointerPoint(50, 25, mockRect, 0.5, 'pen')

    expect(point.x).toBe(-50) // 50 - 100
    expect(point.y).toBe(-25) // 25 - 50
  })
})

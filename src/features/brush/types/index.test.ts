import { describe, it, expect } from 'vitest'
import { createSolidBrushTip, createSoftBrushTip } from './index'

describe('createSolidBrushTip', () => {
  it('creates a solid brush tip with given size', () => {
    const tip = createSolidBrushTip(10)

    expect(tip).toEqual({
      type: 'solid',
      size: 10,
      hardness: 1,
      opacity: 1,
    })
  })

  it('always sets hardness and opacity to 1', () => {
    const tip = createSolidBrushTip(5)

    expect(tip.hardness).toBe(1)
    expect(tip.opacity).toBe(1)
  })
})

describe('createSoftBrushTip', () => {
  it('creates a soft brush tip with default hardness and opacity', () => {
    const tip = createSoftBrushTip(15)

    expect(tip).toEqual({
      type: 'soft',
      size: 15,
      hardness: 0.5,
      opacity: 1,
    })
  })

  it('creates a soft brush tip with custom hardness', () => {
    const tip = createSoftBrushTip(20, 0.3)

    expect(tip.type).toBe('soft')
    expect(tip.size).toBe(20)
    expect(tip.hardness).toBe(0.3)
    expect(tip.opacity).toBe(1)
  })

  it('creates a soft brush tip with custom hardness and opacity', () => {
    const tip = createSoftBrushTip(25, 0.7, 0.8)

    expect(tip).toEqual({
      type: 'soft',
      size: 25,
      hardness: 0.7,
      opacity: 0.8,
    })
  })
})

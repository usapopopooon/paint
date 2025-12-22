import { describe, it, expect } from 'vitest'
import { getToolBehavior } from './registry'
import { penBehavior } from './behaviors/pen'
import { eraserBehavior } from './behaviors/eraser'

describe('getToolBehavior', () => {
  it('returns pen behavior for pen type', () => {
    const behavior = getToolBehavior('pen')
    expect(behavior.type).toBe('pen')
    expect(behavior.createStroke).toBe(penBehavior.createStroke)
  })

  it('returns eraser behavior for eraser type', () => {
    const behavior = getToolBehavior('eraser')
    expect(behavior.type).toBe('eraser')
    expect(behavior.createStroke).toBe(eraserBehavior.createStroke)
  })

  it('creates correct stroke for pen via registry', () => {
    const behavior = getToolBehavior('pen')
    const stroke = behavior.createStroke(
      { x: 0, y: 0 },
      { type: 'pen', width: 5, color: '#000000' }
    )
    expect(stroke.style.blendMode).toBe('normal')
  })

  it('creates correct stroke for eraser via registry', () => {
    const behavior = getToolBehavior('eraser')
    const stroke = behavior.createStroke({ x: 0, y: 0 }, { type: 'eraser', width: 20 })
    expect(stroke.style.blendMode).toBe('erase')
  })
})

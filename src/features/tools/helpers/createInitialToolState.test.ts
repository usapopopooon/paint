import { describe, it, expect } from 'vitest'
import { createInitialToolState, isDrawingToolType } from './createInitialToolState'
import { penBehavior, eraserBehavior } from '../domain'

describe('createInitialToolState', () => {
  it('should create initial tool state with hand tool as default', () => {
    const state = createInitialToolState()

    expect(state.currentType).toBe('hand')
  })

  it('should have null lastDrawingToolType initially', () => {
    const state = createInitialToolState()

    expect(state.lastDrawingToolType).toBeNull()
  })

  it('should create initial pen config from penBehavior.defaultConfig', () => {
    const state = createInitialToolState()

    expect(state.penConfig).toEqual(penBehavior.defaultConfig())
  })

  it('should create initial eraser config from eraserBehavior.defaultConfig', () => {
    const state = createInitialToolState()

    expect(state.eraserConfig).toEqual(eraserBehavior.defaultConfig())
  })

  it('should return a new object each time', () => {
    const state1 = createInitialToolState()
    const state2 = createInitialToolState()

    expect(state1).not.toBe(state2)
    expect(state1.penConfig).not.toBe(state2.penConfig)
    expect(state1.eraserConfig).not.toBe(state2.eraserConfig)
  })
})

describe('isDrawingToolType', () => {
  it('should return true for pen', () => {
    expect(isDrawingToolType('pen')).toBe(true)
  })

  it('should return true for brush', () => {
    expect(isDrawingToolType('brush')).toBe(true)
  })

  it('should return true for eraser', () => {
    expect(isDrawingToolType('eraser')).toBe(true)
  })

  it('should return false for hand', () => {
    expect(isDrawingToolType('hand')).toBe(false)
  })

  it('should return false for eyedropper', () => {
    expect(isDrawingToolType('eyedropper')).toBe(false)
  })
})

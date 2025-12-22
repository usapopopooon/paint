import { describe, it, expect } from 'vitest'
import { penBehavior } from './pen'

describe('penBehavior', () => {
  describe('type', () => {
    it('returns pen', () => {
      expect(penBehavior.type).toBe('pen')
    })
  })

  describe('defaultConfig', () => {
    it('returns default pen config', () => {
      const config = penBehavior.defaultConfig()
      expect(config).toEqual({
        type: 'pen',
        width: 3,
        color: '#000000',
      })
    })
  })

  describe('createStroke', () => {
    it('creates a stroke with given point and config', () => {
      const point = { x: 10, y: 20 }
      const config = { type: 'pen' as const, width: 5, color: '#ff0000' }

      const stroke = penBehavior.createStroke(point, config)

      expect(stroke).toEqual({
        points: [{ x: 10, y: 20 }],
        width: 5,
        color: '#ff0000',
        isEraser: false,
      })
    })
  })

  describe('getCursor', () => {
    it('returns cursor config matching pen config', () => {
      const config = { type: 'pen' as const, width: 10, color: '#00ff00' }

      const cursor = penBehavior.getCursor(config)

      expect(cursor).toEqual({
        size: 10,
        color: '#00ff00',
      })
    })
  })
})

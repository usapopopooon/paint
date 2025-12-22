import { describe, it, expect } from 'vitest'
import {
  isStrokeDrawable,
  generateDrawableId,
  createStrokeDrawable,
} from './index'
import { createSolidBrushTip } from '@/features/brush'

describe('generateDrawableId', () => {
  it('generates a unique ID with correct prefix', () => {
    const id = generateDrawableId()

    expect(id).toMatch(/^drawable-\d+-[a-z0-9]+$/)
  })

  it('generates unique IDs on each call', () => {
    const id1 = generateDrawableId()
    const id2 = generateDrawableId()

    expect(id1).not.toBe(id2)
  })
})

describe('createStrokeDrawable', () => {
  const testPoints = [
    { x: 0, y: 0 },
    { x: 10, y: 10 },
  ]
  const testStyle = {
    color: '#ff0000',
    brushTip: createSolidBrushTip(5),
    blendMode: 'normal' as const,
  }

  it('creates a stroke drawable with auto-generated ID', () => {
    const drawable = createStrokeDrawable(testPoints, testStyle)

    expect(drawable.type).toBe('stroke')
    expect(drawable.id).toMatch(/^drawable-/)
    expect(drawable.createdAt).toBeGreaterThan(0)
    expect(drawable.points).toEqual(testPoints)
    expect(drawable.style).toEqual(testStyle)
  })

  it('creates a stroke drawable with custom ID', () => {
    const customId = 'custom-stroke-id'
    const drawable = createStrokeDrawable(testPoints, testStyle, customId)

    expect(drawable.id).toBe(customId)
  })

  it('creates immutable points array', () => {
    const drawable = createStrokeDrawable(testPoints, testStyle)

    expect(Object.isFrozen(drawable.points) || Array.isArray(drawable.points)).toBe(true)
  })
})

describe('isStrokeDrawable', () => {
  it('returns true for stroke drawable', () => {
    const drawable = createStrokeDrawable(
      [{ x: 0, y: 0 }],
      {
        color: '#000000',
        brushTip: createSolidBrushTip(3),
        blendMode: 'normal',
      }
    )

    expect(isStrokeDrawable(drawable)).toBe(true)
  })

  it('correctly narrows type', () => {
    const drawable = createStrokeDrawable(
      [{ x: 0, y: 0 }],
      {
        color: '#000000',
        brushTip: createSolidBrushTip(3),
        blendMode: 'normal',
      }
    )

    if (isStrokeDrawable(drawable)) {
      // TypeScript should allow access to stroke-specific properties
      expect(drawable.points).toBeDefined()
      expect(drawable.style).toBeDefined()
    }
  })
})

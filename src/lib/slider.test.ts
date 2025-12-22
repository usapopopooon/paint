import { describe, it, expect } from 'vitest'
import { valueToSlider, sliderToValue } from './slider'

describe('valueToSlider', () => {
  it('returns 0 for min value', () => {
    expect(valueToSlider(1, 1, 100)).toBe(0)
  })

  it('returns 100 for max value', () => {
    expect(valueToSlider(100, 1, 100)).toBe(100)
  })

  it('returns ~50 for geometric mean of min and max', () => {
    // geometric mean of 1 and 100 is 10
    const result = valueToSlider(10, 1, 100)
    expect(result).toBeCloseTo(50, 1)
  })

  it('handles custom ranges', () => {
    expect(valueToSlider(5, 5, 300)).toBe(0)
    expect(valueToSlider(300, 5, 300)).toBe(100)
  })

  it('handles mid-range values logarithmically', () => {
    const result = valueToSlider(50, 1, 300)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(100)
  })
})

describe('sliderToValue', () => {
  it('returns min value for 0', () => {
    expect(sliderToValue(0, 1, 100)).toBe(1)
  })

  it('returns max value for 100', () => {
    expect(sliderToValue(100, 1, 100)).toBe(100)
  })

  it('returns geometric mean for 50', () => {
    // geometric mean of 1 and 100 is 10
    expect(sliderToValue(50, 1, 100)).toBe(10)
  })

  it('handles custom ranges', () => {
    expect(sliderToValue(0, 5, 300)).toBe(5)
    expect(sliderToValue(100, 5, 300)).toBe(300)
  })

  it('rounds to integer', () => {
    const result = sliderToValue(25, 1, 100)
    expect(Number.isInteger(result)).toBe(true)
  })
})

describe('valueToSlider and sliderToValue are inverse functions', () => {
  it('roundtrips correctly for various values', () => {
    const testCases = [
      { value: 1, min: 1, max: 100 },
      { value: 50, min: 1, max: 100 },
      { value: 100, min: 1, max: 100 },
      { value: 20, min: 5, max: 300 },
      { value: 150, min: 5, max: 300 },
    ]

    for (const { value, min, max } of testCases) {
      const slider = valueToSlider(value, min, max)
      const roundtrip = sliderToValue(slider, min, max)
      expect(roundtrip).toBe(value)
    }
  })
})

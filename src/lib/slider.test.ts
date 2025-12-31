import { describe, test, expect } from 'vitest'
import { valueToSlider, sliderToValue } from './slider'

describe('valueToSliderとsliderToValueは逆関数', () => {
  test('様々な値でラウンドトリップが正しく動作する', () => {
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

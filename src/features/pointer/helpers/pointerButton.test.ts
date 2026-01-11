import { describe, it, expect } from 'vitest'
import { isPrimaryButton, isPrimaryButtonPressed, isSecondaryButton } from './pointerButton'

describe('isPrimaryButton', () => {
  it('returns true for button 0 (left click)', () => {
    expect(isPrimaryButton(0)).toBe(true)
  })

  it('returns false for button 1 (middle click)', () => {
    expect(isPrimaryButton(1)).toBe(false)
  })

  it('returns false for button 2 (right click)', () => {
    expect(isPrimaryButton(2)).toBe(false)
  })
})

describe('isPrimaryButtonPressed', () => {
  it('returns true when primary button is pressed (buttons = 1)', () => {
    expect(isPrimaryButtonPressed(1)).toBe(true)
  })

  it('returns true when primary and secondary buttons are pressed (buttons = 3)', () => {
    expect(isPrimaryButtonPressed(3)).toBe(true)
  })

  it('returns false when no buttons are pressed (buttons = 0)', () => {
    expect(isPrimaryButtonPressed(0)).toBe(false)
  })

  it('returns false when only secondary button is pressed (buttons = 2)', () => {
    expect(isPrimaryButtonPressed(2)).toBe(false)
  })
})

describe('isSecondaryButton', () => {
  it('returns true for button 2 (right click / barrel button)', () => {
    expect(isSecondaryButton(2)).toBe(true)
  })

  it('returns false for button 0 (left click)', () => {
    expect(isSecondaryButton(0)).toBe(false)
  })

  it('returns false for button 1 (middle click)', () => {
    expect(isSecondaryButton(1)).toBe(false)
  })
})
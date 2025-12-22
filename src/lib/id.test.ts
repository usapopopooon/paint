import { describe, it, expect } from 'vitest'
import { generateId } from './id'

describe('generateId', () => {
  it('generates unique IDs', () => {
    const id1 = generateId()
    const id2 = generateId()

    expect(id1).not.toBe(id2)
  })

  it('generates ID without prefix', () => {
    const id = generateId()

    expect(id).toMatch(/^\d+-[a-z0-9]+$/)
  })

  it('generates ID with prefix', () => {
    const id = generateId('test')

    expect(id).toMatch(/^test-\d+-[a-z0-9]+$/)
  })

  it('uses provided prefix in ID', () => {
    const id = generateId('drawable')

    expect(id.startsWith('drawable-')).toBe(true)
  })
})

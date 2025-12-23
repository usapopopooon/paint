import { describe, test, expect } from 'vitest'
import { generateDrawableId } from './generateDrawableId'

describe('generateDrawableId', () => {
  test('正しいプレフィックスでユニークなIDを生成する', () => {
    const id = generateDrawableId()

    expect(id).toMatch(/^drawable-\d+-[a-z0-9]+$/)
  })

  test('呼び出すたびにユニークなIDを生成する', () => {
    const id1 = generateDrawableId()
    const id2 = generateDrawableId()

    expect(id1).not.toBe(id2)
  })
})

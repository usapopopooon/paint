import { describe, test, expect } from 'vitest'
import { createCanvasResizedAction } from './createCanvasResizedAction'

describe('createCanvasResizedAction', () => {
  test('canvas:resizedアクションを作成する', () => {
    const action = createCanvasResizedAction(800, 600, 1024, 768, 112, 84)

    expect(action.type).toBe('canvas:resized')
    expect(action.previousWidth).toBe(800)
    expect(action.previousHeight).toBe(600)
    expect(action.newWidth).toBe(1024)
    expect(action.newHeight).toBe(768)
    expect(action.offsetX).toBe(112)
    expect(action.offsetY).toBe(84)
    expect(action.id).toBeTruthy()
    expect(action.timestamp).toBeGreaterThan(0)
  })

  test('キャンバス拡大を記録できる', () => {
    const action = createCanvasResizedAction(400, 300, 800, 600, 200, 150)

    expect(action.previousWidth).toBe(400)
    expect(action.previousHeight).toBe(300)
    expect(action.newWidth).toBe(800)
    expect(action.newHeight).toBe(600)
    expect(action.offsetX).toBe(200)
    expect(action.offsetY).toBe(150)
  })

  test('キャンバス縮小を記録できる', () => {
    const action = createCanvasResizedAction(1000, 800, 500, 400, -250, -200)

    expect(action.previousWidth).toBe(1000)
    expect(action.previousHeight).toBe(800)
    expect(action.newWidth).toBe(500)
    expect(action.newHeight).toBe(400)
    expect(action.offsetX).toBe(-250)
    expect(action.offsetY).toBe(-200)
  })
})

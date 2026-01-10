import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const takeScreenshot = async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    colorScheme: 'dark',
  })

  // ビルド済みのアプリを開く（GitHub Pages用のベースパスを考慮）
  await page.goto('http://localhost:4173/paint/')

  // ページが完全に読み込まれるまで待機
  await page.waitForLoadState('networkidle')

  // ペンツールを選択（デフォルトはハンドツールのため）
  await page.keyboard.press('p')

  // 少し描画する（デモ用）
  const canvas = page.locator('canvas')
  const box = await canvas.boundingBox()

  if (box) {
    // キャンバス上で線を描く
    await page.mouse.move(box.x + 100, box.y + 100)
    await page.mouse.down()
    await page.mouse.move(box.x + 300, box.y + 150)
    await page.mouse.move(box.x + 250, box.y + 300)
    await page.mouse.move(box.x + 150, box.y + 250)
    await page.mouse.move(box.x + 100, box.y + 100)
    await page.mouse.up()

    // 色を変更して別の線を描く
    const colorWheel = page.locator('.cursor-crosshair').first()
    const wheelBox = await colorWheel.boundingBox()
    if (wheelBox) {
      // Hueリングをクリックして色を変更
      await page.mouse.click(wheelBox.x + wheelBox.width - 8, wheelBox.y + wheelBox.height / 2)
    }

    // 別の線を描く
    await page.mouse.move(box.x + 400, box.y + 100)
    await page.mouse.down()
    await page.mouse.move(box.x + 500, box.y + 200)
    await page.mouse.move(box.x + 450, box.y + 350)
    await page.mouse.up()
  }

  // 古いスクリーンショットを削除
  const deployDir = 'deploy'
  if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir, { recursive: true })
  }
  const files = fs.readdirSync(deployDir)
  for (const file of files) {
    if (file.startsWith('screenshot_') && file.endsWith('.png')) {
      fs.unlinkSync(path.join(deployDir, file))
    }
  }

  // 環境変数からタイムスタンプを取得、なければ現在時刻を使用
  const timestamp = process.env.SCREENSHOT_TIMESTAMP || Math.floor(Date.now() / 1000)
  const filename = `screenshot_${timestamp}.png`
  await page.screenshot({
    path: `deploy/${filename}`,
    fullPage: false,
  })

  await browser.close()
  console.log(`Screenshot saved to deploy/${filename}`)
}

takeScreenshot().catch(console.error)

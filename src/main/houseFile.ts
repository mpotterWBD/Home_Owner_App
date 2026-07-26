import { dialog, ipcMain, BrowserWindow, OpenDialogOptions } from 'electron'
import { readFile, writeFile, mkdir, copyFile } from 'fs/promises'
import { basename, extname, dirname, join } from 'path'
import {
  HouseFile,
  HOUSE_FILE_EXTENSION,
  createEmptyHouseFile,
  NewHouseInput
} from '../shared/houseFile'

export interface HouseFileResult {
  filePath: string
  data: HouseFile
}

export interface ImagePickResult {
  path: string
  dataUrl: string
}

const IMAGE_MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp'
}

export function registerHouseFileHandlers(): void {
  ipcMain.handle('house-file:pick-image', async (): Promise<ImagePickResult | null> => {
    const window = BrowserWindow.getFocusedWindow()
    const options: OpenDialogOptions = {
      title: 'Choose a Photo',
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp'] }]
    }
    const result = window
      ? await dialog.showOpenDialog(window, options)
      : await dialog.showOpenDialog(options)
    if (result.canceled || result.filePaths.length === 0) return null

    const path = result.filePaths[0]
    const mime = IMAGE_MIME_TYPES[extname(path).toLowerCase()] ?? 'application/octet-stream'
    const buffer = await readFile(path)
    const dataUrl = `data:${mime};base64,${buffer.toString('base64')}`
    return { path, dataUrl }
  })

  ipcMain.handle(
    'house-file:create',
    async (_event, input: NewHouseInput): Promise<HouseFileResult | null> => {
      const window = BrowserWindow.getFocusedWindow()
      const options = {
        title: 'Create New House File',
        defaultPath: `My House.${HOUSE_FILE_EXTENSION}`,
        filters: [{ name: 'Home Owner App File', extensions: [HOUSE_FILE_EXTENSION] }]
      }
      const result = window
        ? await dialog.showSaveDialog(window, options)
        : await dialog.showSaveDialog(options)
      if (result.canceled || !result.filePath) return null

      const filePath = result.filePath
      const name = basename(filePath, extname(filePath))

      let photoPath: string | undefined
      if (input.photoPath) {
        const attachmentsDir = join(dirname(filePath), `${name}.attachments`)
        await mkdir(attachmentsDir, { recursive: true })
        const destPath = join(attachmentsDir, `house-photo${extname(input.photoPath)}`)
        await copyFile(input.photoPath, destPath)
        photoPath = destPath
      }

      const data = createEmptyHouseFile(name, {
        address: input.address,
        city: input.city,
        state: input.state,
        photoPath
      })
      await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
      return { filePath, data }
    }
  )

  ipcMain.handle('house-file:open', async (): Promise<HouseFileResult | null> => {
    const window = BrowserWindow.getFocusedWindow()
    const options: OpenDialogOptions = {
      title: 'Open House File',
      properties: ['openFile'],
      filters: [{ name: 'Home Owner App File', extensions: [HOUSE_FILE_EXTENSION] }]
    }
    const result = window
      ? await dialog.showOpenDialog(window, options)
      : await dialog.showOpenDialog(options)
    if (result.canceled || result.filePaths.length === 0) return null

    const filePath = result.filePaths[0]
    const raw = await readFile(filePath, 'utf-8')
    const data = JSON.parse(raw) as HouseFile
    return { filePath, data }
  })
}

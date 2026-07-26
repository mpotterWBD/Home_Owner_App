import { dialog, ipcMain, shell, BrowserWindow, OpenDialogOptions } from 'electron'
import { readFile, writeFile, mkdir, copyFile } from 'fs/promises'
import { basename, extname, dirname, join } from 'path'
import { randomUUID } from 'crypto'
import {
  HouseFile,
  HOUSE_FILE_EXTENSION,
  createEmptyHouseFile,
  NewHouseInput,
  NewProjectInput,
  Project
} from '../shared/houseFile'

export interface HouseFileResult {
  filePath: string
  data: HouseFile
}

export interface ImagePickResult {
  path: string
  dataUrl: string
}

export interface FilePickResult {
  path: string
  fileName: string
  dataUrl?: string
}

export interface InvoicePreview {
  kind: 'image' | 'pdf' | 'unknown'
  dataUrl?: string
}

const IMAGE_MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp'
}

function attachmentsDirFor(filePath: string): string {
  const name = basename(filePath, extname(filePath))
  return join(dirname(filePath), `${name}.attachments`)
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

  ipcMain.handle('house-file:pick-invoice', async (): Promise<FilePickResult | null> => {
    const window = BrowserWindow.getFocusedWindow()
    const options: OpenDialogOptions = {
      title: 'Choose Invoice',
      properties: ['openFile'],
      filters: [{ name: 'Invoices', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'pdf'] }]
    }
    const result = window
      ? await dialog.showOpenDialog(window, options)
      : await dialog.showOpenDialog(options)
    if (result.canceled || result.filePaths.length === 0) return null

    const path = result.filePaths[0]
    const fileName = basename(path)
    const mime = IMAGE_MIME_TYPES[extname(path).toLowerCase()]
    if (!mime) return { path, fileName }

    const buffer = await readFile(path)
    const dataUrl = `data:${mime};base64,${buffer.toString('base64')}`
    return { path, fileName, dataUrl }
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
        const dir = attachmentsDirFor(filePath)
        await mkdir(dir, { recursive: true })
        const destPath = join(dir, `house-photo${extname(input.photoPath)}`)
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

  ipcMain.handle(
    'house-file:read-invoice',
    async (_event, invoicePath: string): Promise<InvoicePreview> => {
      const ext = extname(invoicePath).toLowerCase()
      const mime = IMAGE_MIME_TYPES[ext]
      if (mime) {
        const buffer = await readFile(invoicePath)
        return { kind: 'image', dataUrl: `data:${mime};base64,${buffer.toString('base64')}` }
      }

      if (ext === '.pdf') {
        const buffer = await readFile(invoicePath)
        return { kind: 'pdf', dataUrl: `data:application/pdf;base64,${buffer.toString('base64')}` }
      }

      return { kind: 'unknown' }
    }
  )

  ipcMain.handle('house-file:open-invoice', async (_event, invoicePath: string): Promise<void> => {
    await shell.openPath(invoicePath)
  })

  ipcMain.handle(
    'house-file:add-project',
    async (_event, filePath: string, input: NewProjectInput): Promise<HouseFileResult> => {
      const raw = await readFile(filePath, 'utf-8')
      const data = JSON.parse(raw) as HouseFile

      let invoicePath: string | undefined
      if (input.invoiceSourcePath) {
        const dir = attachmentsDirFor(filePath)
        await mkdir(dir, { recursive: true })
        const destPath = join(dir, `invoice-${Date.now()}${extname(input.invoiceSourcePath)}`)
        await copyFile(input.invoiceSourcePath, destPath)
        invoicePath = destPath
      }

      const now = new Date().toISOString()
      const project: Project = {
        id: randomUUID(),
        category: input.category,
        description: input.description,
        date: input.date,
        company: input.company,
        houseArea: input.houseArea,
        cost: input.cost,
        invoicePath,
        createdAt: now,
        updatedAt: now
      }

      data.projects.push(project)
      await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
      return { filePath, data }
    }
  )
}

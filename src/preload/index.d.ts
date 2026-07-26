import { ElectronAPI } from '@electron-toolkit/preload'
import { HouseFile, NewHouseInput, NewProjectInput, UpdateProjectInput } from '../shared/houseFile'

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

export interface PhotoPreview {
  dataUrl?: string
}

export interface Api {
  createHouseFile: (input: NewHouseInput) => Promise<HouseFileResult | null>
  openHouseFile: () => Promise<HouseFileResult | null>
  pickImage: () => Promise<ImagePickResult | null>
  pickImages: () => Promise<ImagePickResult[]>
  pickInvoice: () => Promise<FilePickResult | null>
  readInvoice: (invoicePath: string) => Promise<InvoicePreview>
  readPhoto: (photoPath: string) => Promise<PhotoPreview>
  openInvoice: (invoicePath: string) => Promise<void>
  addProject: (filePath: string, input: NewProjectInput) => Promise<HouseFileResult>
  updateProject: (filePath: string, input: UpdateProjectInput) => Promise<HouseFileResult>
  completeProject: (filePath: string, projectId: string) => Promise<HouseFileResult>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}

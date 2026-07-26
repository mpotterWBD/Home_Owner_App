import { ElectronAPI } from '@electron-toolkit/preload'
import { HouseFile, NewHouseInput, NewProjectInput } from '../shared/houseFile'

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

export interface Api {
  createHouseFile: (input: NewHouseInput) => Promise<HouseFileResult | null>
  openHouseFile: () => Promise<HouseFileResult | null>
  pickImage: () => Promise<ImagePickResult | null>
  pickInvoice: () => Promise<FilePickResult | null>
  readInvoice: (invoicePath: string) => Promise<InvoicePreview>
  openInvoice: (invoicePath: string) => Promise<void>
  addProject: (filePath: string, input: NewProjectInput) => Promise<HouseFileResult>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}

import { ElectronAPI } from '@electron-toolkit/preload'
import { HouseFile, NewHouseInput } from '../shared/houseFile'

export interface HouseFileResult {
  filePath: string
  data: HouseFile
}

export interface ImagePickResult {
  path: string
  dataUrl: string
}

export interface Api {
  createHouseFile: (input: NewHouseInput) => Promise<HouseFileResult | null>
  openHouseFile: () => Promise<HouseFileResult | null>
  pickImage: () => Promise<ImagePickResult | null>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}

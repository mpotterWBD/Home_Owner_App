import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { NewHouseInput, NewProjectInput, UpdateProjectInput } from '../shared/houseFile'

// Custom APIs for renderer
const api = {
  createHouseFile: (input: NewHouseInput) => ipcRenderer.invoke('house-file:create', input),
  openHouseFile: () => ipcRenderer.invoke('house-file:open'),
  pickImage: () => ipcRenderer.invoke('house-file:pick-image'),
  pickImages: () => ipcRenderer.invoke('house-file:pick-images'),
  pickInvoice: () => ipcRenderer.invoke('house-file:pick-invoice'),
  readInvoice: (invoicePath: string) => ipcRenderer.invoke('house-file:read-invoice', invoicePath),
  readPhoto: (photoPath: string) => ipcRenderer.invoke('house-file:read-photo', photoPath),
  openInvoice: (invoicePath: string) => ipcRenderer.invoke('house-file:open-invoice', invoicePath),
  addProject: (filePath: string, input: NewProjectInput) =>
    ipcRenderer.invoke('house-file:add-project', filePath, input),
  updateProject: (filePath: string, input: UpdateProjectInput) =>
    ipcRenderer.invoke('house-file:update-project', filePath, input)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

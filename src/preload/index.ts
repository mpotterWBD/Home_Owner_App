import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { NewHouseInput } from '../shared/houseFile'

// Custom APIs for renderer
const api = {
  createHouseFile: (input: NewHouseInput) => ipcRenderer.invoke('house-file:create', input),
  openHouseFile: () => ipcRenderer.invoke('house-file:open'),
  pickImage: () => ipcRenderer.invoke('house-file:pick-image')
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

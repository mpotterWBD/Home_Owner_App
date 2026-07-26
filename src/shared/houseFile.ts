export const HOUSE_FILE_EXTENSION = 'hom'

export interface Attachment {
  id: string
  kind: 'photo' | 'quote' | 'document'
  filePath: string
  originalFileName: string
  addedAt: string
}

export interface Builder {
  id: string
  name: string
  contact?: string
  notes?: string
}

export interface Project {
  id: string
  name: string
  builderId?: string
  cost?: number
  scope?: string
  category?: string
  status: 'planned' | 'in_progress' | 'complete'
  startDate?: string
  endDate?: string
  notes?: string
  attachments: Attachment[]
  createdAt: string
  updatedAt: string
}

export interface HouseInfo {
  name: string
  address?: string
  city?: string
  state?: string
  photoPath?: string
}

export interface HouseFile {
  version: 1
  house: HouseInfo
  builders: Builder[]
  projects: Project[]
}

export interface NewHouseInput {
  address?: string
  city?: string
  state?: string
  photoPath?: string
}

export function createEmptyHouseFile(name: string, info?: NewHouseInput): HouseFile {
  return {
    version: 1,
    house: {
      name,
      address: info?.address,
      city: info?.city,
      state: info?.state,
      photoPath: info?.photoPath
    },
    builders: [],
    projects: []
  }
}

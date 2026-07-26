export const HOUSE_FILE_EXTENSION = 'hom'

export type ProjectCategory = 'in_progress' | 'maintenance' | 'repair' | 'build'

export const PROJECT_CATEGORIES: { value: ProjectCategory; label: string }[] = [
  { value: 'in_progress', label: 'In Progress' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'repair', label: 'Repair' },
  { value: 'build', label: 'Build' }
]

export interface Project {
  id: string
  category: ProjectCategory
  description: string
  notes?: string
  date?: string
  company?: string
  houseArea?: string
  cost?: number
  invoicePath?: string
  photoPaths: string[]
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
  projects: Project[]
}

export interface NewHouseInput {
  address?: string
  city?: string
  state?: string
  photoPath?: string
}

export interface NewProjectInput {
  category: ProjectCategory
  description: string
  notes?: string
  date?: string
  company?: string
  houseArea?: string
  cost?: number
  invoiceSourcePath?: string
  photoSourcePaths?: string[]
}

export interface UpdateProjectInput {
  id: string
  description: string
  notes?: string
  date?: string
  company?: string
  houseArea?: string
  cost?: number
  invoiceSourcePath?: string
  existingPhotoPaths: string[]
  newPhotoSourcePaths: string[]
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
    projects: []
  }
}

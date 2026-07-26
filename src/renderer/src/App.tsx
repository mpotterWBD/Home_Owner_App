import { useEffect, useRef, useState } from 'react'
import Header from './components/Header'
import Toolbar from './components/Toolbar'
import NewHouseModal from './components/NewHouseModal'
import NewProjectModal from './components/NewProjectModal'
import EditProjectModal from './components/EditProjectModal'
import CategorySection from './components/CategorySection'
import DetailPanel from './components/DetailPanel'
import {
  HouseFile,
  NewHouseInput,
  NewProjectInput,
  UpdateProjectInput,
  PROJECT_CATEGORIES
} from '../../shared/houseFile'

function App(): React.JSX.Element {
  const [filePath, setFilePath] = useState<string | null>(null)
  const [houseFile, setHouseFile] = useState<HouseFile | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [addingCategory, setAddingCategory] = useState<(typeof PROJECT_CATEGORIES)[number] | null>(
    null
  )
  const [modalError, setModalError] = useState<string | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const categoryListRef = useRef<HTMLDivElement>(null)
  const [detailMaxHeight, setDetailMaxHeight] = useState<number | undefined>(undefined)

  const selectedProject =
    houseFile?.projects.find((project) => project.id === selectedProjectId) ?? null

  useEffect(() => {
    const el = categoryListRef.current
    if (!el) return

    const observer = new ResizeObserver((entries) => {
      setDetailMaxHeight(entries[0].contentRect.height)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [houseFile !== null])

  const handleCreate = async (input: NewHouseInput): Promise<void> => {
    try {
      const result = await window.api.createHouseFile(input)
      if (result) {
        setFilePath(result.filePath)
        setHouseFile(result.data)
        setShowNewModal(false)
        setModalError(null)
        setSelectedProjectId(null)
      }
    } catch (error) {
      setModalError(error instanceof Error ? error.message : 'Failed to create house file')
    }
  }

  const handleOpen = async (): Promise<void> => {
    try {
      const result = await window.api.openHouseFile()
      if (result) {
        setFilePath(result.filePath)
        setHouseFile(result.data)
        setSelectedProjectId(null)
      }
    } catch (error) {
      console.error('Failed to open house file', error)
    }
  }

  const handleAddProject = async (input: NewProjectInput): Promise<void> => {
    if (!filePath) return
    try {
      const result = await window.api.addProject(filePath, input)
      setHouseFile(result.data)
      setAddingCategory(null)
      setModalError(null)
    } catch (error) {
      setModalError(error instanceof Error ? error.message : 'Failed to add project')
    }
  }

  const handleUpdateProject = async (input: UpdateProjectInput): Promise<void> => {
    if (!filePath) return
    try {
      const result = await window.api.updateProject(filePath, input)
      setHouseFile(result.data)
      setIsEditing(false)
      setModalError(null)
    } catch (error) {
      setModalError(error instanceof Error ? error.message : 'Failed to save changes')
    }
  }

  const handleSelectProject = (id: string): void => {
    setSelectedProjectId((current) => (current === id ? null : id))
    setIsEditing(false)
  }

  return (
    <div className="app">
      <Header />
      <Toolbar onNew={() => setShowNewModal(true)} onOpen={handleOpen} />
      <main className="content">
        {houseFile ? (
          <div className="workspace">
            <div className="category-list" ref={categoryListRef}>
              {PROJECT_CATEGORIES.map((cat) => (
                <CategorySection
                  key={cat.value}
                  title={cat.label}
                  projects={houseFile.projects.filter((p) => p.category === cat.value)}
                  selectedProjectId={selectedProjectId}
                  onAddProject={() => setAddingCategory(cat)}
                  onSelectProject={handleSelectProject}
                />
              ))}
            </div>
            {selectedProject && (
              <DetailPanel
                project={selectedProject}
                maxHeight={detailMaxHeight}
                onEdit={() => setIsEditing(true)}
              />
            )}
          </div>
        ) : (
          <p className="file-status">No house file open</p>
        )}
      </main>
      {showNewModal && (
        <NewHouseModal
          error={modalError}
          onCancel={() => {
            setShowNewModal(false)
            setModalError(null)
          }}
          onCreate={handleCreate}
        />
      )}
      {addingCategory && (
        <NewProjectModal
          category={addingCategory.value}
          categoryLabel={addingCategory.label}
          error={modalError}
          onCancel={() => {
            setAddingCategory(null)
            setModalError(null)
          }}
          onCreate={handleAddProject}
        />
      )}
      {isEditing && selectedProject && (
        <EditProjectModal
          project={selectedProject}
          error={modalError}
          onCancel={() => {
            setIsEditing(false)
            setModalError(null)
          }}
          onSave={handleUpdateProject}
        />
      )}
    </div>
  )
}

export default App

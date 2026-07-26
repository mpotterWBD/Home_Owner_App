import { useState } from 'react'
import Header from './components/Header'
import Toolbar from './components/Toolbar'
import NewHouseModal from './components/NewHouseModal'
import NewProjectModal from './components/NewProjectModal'
import CategorySection from './components/CategorySection'
import { HouseFile, NewHouseInput, NewProjectInput, PROJECT_CATEGORIES } from '../../shared/houseFile'

function App(): React.JSX.Element {
  const [filePath, setFilePath] = useState<string | null>(null)
  const [houseFile, setHouseFile] = useState<HouseFile | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [addingCategory, setAddingCategory] = useState<(typeof PROJECT_CATEGORIES)[number] | null>(
    null
  )
  const [modalError, setModalError] = useState<string | null>(null)

  const handleCreate = async (input: NewHouseInput): Promise<void> => {
    try {
      const result = await window.api.createHouseFile(input)
      if (result) {
        setFilePath(result.filePath)
        setHouseFile(result.data)
        setShowNewModal(false)
        setModalError(null)
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

  return (
    <div className="app">
      <Header />
      <Toolbar onNew={() => setShowNewModal(true)} onOpen={handleOpen} />
      <main className="content">
        {houseFile ? (
          <div className="category-list">
            {PROJECT_CATEGORIES.map((cat) => (
              <CategorySection
                key={cat.value}
                title={cat.label}
                projects={houseFile.projects.filter((p) => p.category === cat.value)}
                onAddProject={() => setAddingCategory(cat)}
              />
            ))}
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
    </div>
  )
}

export default App

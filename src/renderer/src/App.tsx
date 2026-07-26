import { useState } from 'react'
import Header from './components/Header'
import Toolbar from './components/Toolbar'
import NewHouseModal from './components/NewHouseModal'
import { HouseFile, NewHouseInput } from '../../shared/houseFile'

function App(): React.JSX.Element {
  const [filePath, setFilePath] = useState<string | null>(null)
  const [houseFile, setHouseFile] = useState<HouseFile | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)

  const handleCreate = async (input: NewHouseInput): Promise<void> => {
    const result = await window.api.createHouseFile(input)
    if (result) {
      setFilePath(result.filePath)
      setHouseFile(result.data)
      setShowNewModal(false)
    }
  }

  const handleOpen = async (): Promise<void> => {
    const result = await window.api.openHouseFile()
    if (result) {
      setFilePath(result.filePath)
      setHouseFile(result.data)
    }
  }

  return (
    <div className="app">
      <Header />
      <Toolbar onNew={() => setShowNewModal(true)} onOpen={handleOpen} />
      <main className="content">
        {houseFile ? (
          <p className="file-status">
            {houseFile.house.name} — {filePath}
          </p>
        ) : (
          <p className="file-status">No house file open</p>
        )}
      </main>
      {showNewModal && (
        <NewHouseModal onCancel={() => setShowNewModal(false)} onCreate={handleCreate} />
      )}
    </div>
  )
}

export default App

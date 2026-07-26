import { Plus, FolderOpen } from 'lucide-react'

interface ToolbarProps {
  onNew: () => void
  onOpen: () => void
}

function Toolbar({ onNew, onOpen }: ToolbarProps): React.JSX.Element {
  return (
    <div className="toolbar">
      <button className="btn" onClick={onNew}>
        <Plus size={16} />
        New
      </button>
      <button className="btn" onClick={onOpen}>
        <FolderOpen size={16} />
        Open
      </button>
    </div>
  )
}

export default Toolbar

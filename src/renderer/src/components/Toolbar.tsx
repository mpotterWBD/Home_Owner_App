import { useEffect, useRef, useState } from 'react'
import { ChevronDown, FilePlus2, FolderOpen } from 'lucide-react'

interface ToolbarProps {
  onNew: () => void
  onOpen: () => void
}

function Toolbar({ onNew, onOpen }: ToolbarProps): React.JSX.Element {
  const [openMenu, setOpenMenu] = useState<'file' | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent): void => {
      if (!rootRef.current) return
      if (rootRef.current.contains(event.target as Node)) return
      setOpenMenu(null)
    }

    document.addEventListener('mousedown', onDocumentClick)
    return () => document.removeEventListener('mousedown', onDocumentClick)
  }, [])

  const handleSelect = (action: () => void): void => {
    setOpenMenu(null)
    action()
  }

  const toggleMenu = (menu: 'file'): void => {
    setOpenMenu((current) => (current === menu ? null : menu))
  }

  return (
    <div className="toolbar" ref={rootRef}>
      <nav className="menu-bar" aria-label="Application menu">
        <div className="menu-group">
          <button
            type="button"
            className={`menu-trigger ${openMenu === 'file' ? 'menu-trigger-open' : ''}`}
            onClick={() => toggleMenu('file')}
            aria-expanded={openMenu === 'file'}
            aria-haspopup="menu"
          >
            File
            <ChevronDown size={14} />
          </button>
          {openMenu === 'file' && (
            <div className="menu-panel" role="menu" aria-label="File">
              <button type="button" className="menu-item" role="menuitem" onClick={() => handleSelect(onNew)}>
                <FilePlus2 size={15} />
                New House File...
              </button>
              <button type="button" className="menu-item" role="menuitem" onClick={() => handleSelect(onOpen)}>
                <FolderOpen size={15} />
                Open House File...
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}

export default Toolbar

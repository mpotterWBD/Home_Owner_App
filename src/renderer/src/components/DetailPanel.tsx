import { Pencil } from 'lucide-react'
import { Project } from '../../../shared/houseFile'
import ProjectPhoto from './ProjectPhoto'

interface DetailPanelProps {
  project: Project
  maxHeight?: number
  onEdit: () => void
}

function DetailPanel({ project, maxHeight, onEdit }: DetailPanelProps): React.JSX.Element {
  const photoPaths = project.photoPaths ?? []

  return (
    <div className="detail-panel" style={maxHeight !== undefined ? { maxHeight } : undefined}>
      <div className="detail-panel-header">
        <h2 className="detail-heading">Details</h2>
        <button className="detail-edit" aria-label="Edit item" onClick={onEdit}>
          <Pencil size={16} />
        </button>
      </div>
      <div className="detail-content">
        <p>
          <span className="project-label">Description:</span> {project.description}
        </p>
        {project.notes && <p className="detail-notes">{project.notes}</p>}
        <p>
          <span className="project-label">Date:</span> {project.date || '—'}
        </p>
        <p>
          <span className="project-label">Company:</span> {project.company || '—'}
        </p>
        <p>
          <span className="project-label">Part of house:</span> {project.houseArea || '—'}
        </p>
        <p>
          <span className="project-label">Cost:</span>{' '}
          <span className="project-cost">
            {project.cost !== undefined ? `-$${project.cost.toFixed(2)}` : '—'}
          </span>
        </p>
        {photoPaths.length > 0 && (
          <>
            <div className="detail-divider">
              <span>Pictures</span>
            </div>
            <div className="detail-photos">
              {photoPaths.map((path) => (
                <ProjectPhoto key={path} photoPath={path} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default DetailPanel

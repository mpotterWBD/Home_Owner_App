import { useState } from 'react'
import { Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { Project } from '../../../shared/houseFile'
import InvoiceThumbnail from './InvoiceThumbnail'

interface CategorySectionProps {
  title: string
  projects: Project[]
  onAddProject: () => void
}

function CategorySection({
  title,
  projects,
  onAddProject
}: CategorySectionProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="category">
      <div className="category-header">
        <button className="category-toggle" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span>{title}</span>
        </button>
        <button
          className="category-add"
          aria-label={`Add ${title} item`}
          onClick={(e) => {
            e.stopPropagation()
            onAddProject()
          }}
        >
          <Plus size={18} />
        </button>
      </div>
      {expanded && (
        <div className="category-body">
          {projects.length === 0 ? (
            <p className="empty">No items yet</p>
          ) : (
            <ul className="project-list">
              {projects.map((project) => (
                <li key={project.id} className="project-card">
                  <InvoiceThumbnail invoicePath={project.invoicePath} />
                  <div className="project-details">
                    <p>
                      <span className="project-label">Description:</span> {project.description}
                    </p>
                    <p>
                      <span className="project-label">Date:</span> {project.date || '—'}
                    </p>
                    <p>
                      <span className="project-label">Company:</span> {project.company || '—'}
                    </p>
                    <p>
                      <span className="project-label">Part of house:</span>{' '}
                      {project.houseArea || '—'}
                    </p>
                    <p>
                      <span className="project-label">Cost:</span>{' '}
                      <span className="project-cost">
                        {project.cost !== undefined ? `-$${project.cost.toFixed(2)}` : '—'}
                      </span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default CategorySection

import { useState } from 'react'
import { X } from 'lucide-react'
import {
  COMPLETION_CATEGORIES,
  CompletionCategory,
  NewProjectInput,
  ProjectCategory
} from '../../../shared/houseFile'

interface NewProjectModalProps {
  category: ProjectCategory
  categoryLabel: string
  error?: string | null
  onCancel: () => void
  onCreate: (input: NewProjectInput) => void
}

interface PickedPhoto {
  path: string
  dataUrl: string
}

function NewProjectModal({
  category,
  categoryLabel,
  error,
  onCancel,
  onCreate
}: NewProjectModalProps): React.JSX.Element {
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState('')
  const [company, setCompany] = useState('')
  const [houseArea, setHouseArea] = useState('')
  const [cost, setCost] = useState('')
  const [invoicePath, setInvoicePath] = useState<string | undefined>(undefined)
  const [invoiceFileName, setInvoiceFileName] = useState<string | undefined>(undefined)
  const [invoicePreview, setInvoicePreview] = useState<string | undefined>(undefined)
  const [photos, setPhotos] = useState<PickedPhoto[]>([])
  const [targetCategory, setTargetCategory] = useState<CompletionCategory>('maintenance')

  const handleChooseInvoice = async (): Promise<void> => {
    const result = await window.api.pickInvoice()
    if (result) {
      setInvoicePath(result.path)
      setInvoiceFileName(result.fileName)
      setInvoicePreview(result.dataUrl)
    }
  }

  const handleChoosePhotos = async (): Promise<void> => {
    const result = await window.api.pickImages()
    if (result.length > 0) {
      setPhotos((current) => [...current, ...result])
    }
  }

  const handleRemovePhoto = (path: string): void => {
    setPhotos((current) => current.filter((photo) => photo.path !== path))
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    onCreate({
      category,
      description,
      notes: notes || undefined,
      date: date || undefined,
      company: company || undefined,
      houseArea: houseArea || undefined,
      cost: cost ? Number(cost) : undefined,
      invoiceSourcePath: invoicePath,
      photoSourcePaths: photos.map((photo) => photo.path),
      targetCategory: category === 'in_progress' ? targetCategory : undefined
    })
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add {categoryLabel} item</h2>
        {error && <p className="modal-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Description</span>
            <input value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label className="field">
            <span>Notes</span>
            <textarea
              className="notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="field">
            <span>Company</span>
            <input value={company} onChange={(e) => setCompany(e.target.value)} />
          </label>
          <label className="field">
            <span>Part of the house</span>
            <input value={houseArea} onChange={(e) => setHouseArea(e.target.value)} />
          </label>
          <label className="field">
            <span>Cost</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </label>
          {category === 'in_progress' && (
            <label className="field">
              <span>Move to when complete</span>
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value as CompletionCategory)}
              >
                {COMPLETION_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="field">
            <span>Invoice</span>
            {invoicePreview && <img className="photo-preview" src={invoicePreview} alt="Invoice" />}
            {invoiceFileName && !invoicePreview && (
              <p className="file-chip">{invoiceFileName}</p>
            )}
            <button type="button" className="btn btn-full" onClick={handleChooseInvoice}>
              Choose invoice
            </button>
          </div>
          <div className="field">
            <span>Project pictures</span>
            {photos.length > 0 && (
              <div className="picked-photos">
                {photos.map((photo) => (
                  <div key={photo.path} className="picked-photo">
                    <img src={photo.dataUrl} alt="" />
                    <button
                      type="button"
                      className="picked-photo-remove"
                      aria-label="Remove picture"
                      onClick={() => handleRemovePhoto(photo.path)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button type="button" className="btn btn-full" onClick={handleChoosePhotos}>
              Choose pictures
            </button>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewProjectModal

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Project, UpdateProjectInput } from '../../../shared/houseFile'

interface EditProjectModalProps {
  project: Project
  error?: string | null
  onCancel: () => void
  onSave: (input: UpdateProjectInput) => void
}

interface PickedPhoto {
  path: string
  dataUrl: string
}

interface ExistingPhoto {
  path: string
  dataUrl?: string
}

function EditProjectModal({
  project,
  error,
  onCancel,
  onSave
}: EditProjectModalProps): React.JSX.Element {
  const [description, setDescription] = useState(project.description)
  const [notes, setNotes] = useState(project.notes ?? '')
  const [date, setDate] = useState(project.date ?? '')
  const [company, setCompany] = useState(project.company ?? '')
  const [houseArea, setHouseArea] = useState(project.houseArea ?? '')
  const [cost, setCost] = useState(project.cost !== undefined ? String(project.cost) : '')
  const [invoicePath, setInvoicePath] = useState<string | undefined>(undefined)
  const [invoiceFileName, setInvoiceFileName] = useState<string | undefined>(undefined)
  const [invoicePreview, setInvoicePreview] = useState<string | undefined>(undefined)
  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>(
    (project.photoPaths ?? []).map((path) => ({ path }))
  )
  const [newPhotos, setNewPhotos] = useState<PickedPhoto[]>([])

  useEffect(() => {
    if (project.invoicePath) {
      window.api.readInvoice(project.invoicePath).then((result) => {
        if (result.dataUrl) setInvoicePreview(result.dataUrl)
      })
    }
    ;(project.photoPaths ?? []).forEach((path) => {
      window.api.readPhoto(path).then((result) => {
        setExistingPhotos((current) =>
          current.map((photo) => (photo.path === path ? { ...photo, dataUrl: result.dataUrl } : photo))
        )
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      setNewPhotos((current) => [...current, ...result])
    }
  }

  const handleRemoveExistingPhoto = (path: string): void => {
    setExistingPhotos((current) => current.filter((photo) => photo.path !== path))
  }

  const handleRemoveNewPhoto = (path: string): void => {
    setNewPhotos((current) => current.filter((photo) => photo.path !== path))
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    onSave({
      id: project.id,
      description,
      notes: notes || undefined,
      date: date || undefined,
      company: company || undefined,
      houseArea: houseArea || undefined,
      cost: cost ? Number(cost) : undefined,
      invoiceSourcePath: invoicePath,
      existingPhotoPaths: existingPhotos.map((photo) => photo.path),
      newPhotoSourcePaths: newPhotos.map((photo) => photo.path)
    })
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Edit item</h2>
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
          <div className="field">
            <span>Invoice</span>
            {invoicePreview && <img className="photo-preview" src={invoicePreview} alt="Invoice" />}
            {invoiceFileName && !invoicePreview && (
              <p className="file-chip">{invoiceFileName}</p>
            )}
            <button type="button" className="btn btn-full" onClick={handleChooseInvoice}>
              {project.invoicePath ? 'Replace invoice' : 'Choose invoice'}
            </button>
          </div>
          <div className="field">
            <span>Project pictures</span>
            {(existingPhotos.length > 0 || newPhotos.length > 0) && (
              <div className="picked-photos">
                {existingPhotos.map((photo) => (
                  <div key={photo.path} className="picked-photo">
                    {photo.dataUrl && <img src={photo.dataUrl} alt="" />}
                    <button
                      type="button"
                      className="picked-photo-remove"
                      aria-label="Remove picture"
                      onClick={() => handleRemoveExistingPhoto(photo.path)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {newPhotos.map((photo) => (
                  <div key={photo.path} className="picked-photo">
                    <img src={photo.dataUrl} alt="" />
                    <button
                      type="button"
                      className="picked-photo-remove"
                      aria-label="Remove picture"
                      onClick={() => handleRemoveNewPhoto(photo.path)}
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
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProjectModal

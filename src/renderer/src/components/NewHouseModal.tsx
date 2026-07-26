import { useState } from 'react'
import { NewHouseInput } from '../../../shared/houseFile'
import { DEFAULT_MODAL_WIDTH, calculatePhotoModalWidth } from '../lib/modalWidth'

interface NewHouseModalProps {
  error?: string | null
  onCancel: () => void
  onCreate: (input: NewHouseInput) => void
}

function NewHouseModal({ error, onCancel, onCreate }: NewHouseModalProps): React.JSX.Element {
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [photoPath, setPhotoPath] = useState<string | undefined>(undefined)
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(undefined)
  const [modalWidth, setModalWidth] = useState(DEFAULT_MODAL_WIDTH)

  const handleChoosePhoto = async (): Promise<void> => {
    const result = await window.api.pickImage()
    if (result) {
      setPhotoPath(result.path)
      setPhotoPreview(result.dataUrl)
    }
  }

  const handlePhotoLoad = (e: React.SyntheticEvent<HTMLImageElement>): void => {
    const { naturalWidth, naturalHeight } = e.currentTarget
    setModalWidth(calculatePhotoModalWidth(naturalWidth, naturalHeight))
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    onCreate({ address, city, state, photoPath })
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ width: modalWidth }} onClick={(e) => e.stopPropagation()}>
        <h2>New house</h2>
        {error && <p className="modal-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Address</span>
            <input value={address} onChange={(e) => setAddress(e.target.value)} />
          </label>
          <label className="field">
            <span>City</span>
            <input value={city} onChange={(e) => setCity(e.target.value)} />
          </label>
          <label className="field">
            <span>State</span>
            <input value={state} onChange={(e) => setState(e.target.value)} />
          </label>
          <div className="field">
            <span>Photo</span>
            {photoPreview && (
              <img
                className="photo-preview"
                src={photoPreview}
                alt="House"
                onLoad={handlePhotoLoad}
              />
            )}
            <button type="button" className="btn btn-full" onClick={handleChoosePhoto}>
              Choose photo
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

export default NewHouseModal

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EditProjectModal from './EditProjectModal'
import { Project } from '../../../shared/houseFile'

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: '1',
    category: 'repair',
    description: 'Replaced water heater',
    photoPaths: [],
    createdAt: '2026-03-14T00:00:00.000Z',
    updatedAt: '2026-03-14T00:00:00.000Z',
    ...overrides
  }
}

describe('EditProjectModal', () => {
  beforeEach(() => {
    window.api = {
      pickImage: vi.fn(),
      pickImages: vi.fn(),
      pickInvoice: vi.fn(),
      readInvoice: vi.fn(),
      readPhoto: vi.fn(),
      openInvoice: vi.fn(),
      createHouseFile: vi.fn(),
      openHouseFile: vi.fn(),
      addProject: vi.fn(),
      updateProject: vi.fn()
    }
  })

  it('pre-fills the form with the existing project values', () => {
    const project = makeProject({
      notes: 'Old unit was leaking.',
      date: '2026-03-14',
      company: 'Acme Plumbing',
      houseArea: 'Basement',
      cost: 850
    })
    render(<EditProjectModal project={project} onCancel={vi.fn()} onSave={vi.fn()} />)

    expect(screen.getByLabelText('Description')).toHaveValue('Replaced water heater')
    expect(screen.getByLabelText('Notes')).toHaveValue('Old unit was leaking.')
    expect(screen.getByLabelText('Date')).toHaveValue('2026-03-14')
    expect(screen.getByLabelText('Company')).toHaveValue('Acme Plumbing')
    expect(screen.getByLabelText('Part of the house')).toHaveValue('Basement')
    expect(screen.getByLabelText('Cost')).toHaveValue(850)
  })

  it('saves edited fields plus newly added pictures', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    vi.mocked(window.api.pickImages).mockResolvedValue([
      { path: 'C:/photos/after.jpg', dataUrl: 'data:image/jpeg;base64,AAA' }
    ])
    const project = makeProject({ photoPaths: ['C:/photos/before.jpg'] })
    vi.mocked(window.api.readPhoto).mockResolvedValue({ dataUrl: 'data:image/jpeg;base64,ZZZ' })

    render(<EditProjectModal project={project} onCancel={vi.fn()} onSave={onSave} />)

    await user.clear(screen.getByLabelText('Description'))
    await user.type(screen.getByLabelText('Description'), 'Replaced water heater, added drip pan')
    await user.click(screen.getByRole('button', { name: 'Choose pictures' }))
    await screen.findAllByRole('button', { name: 'Remove picture' })

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '1',
        description: 'Replaced water heater, added drip pan',
        existingPhotoPaths: ['C:/photos/before.jpg'],
        newPhotoSourcePaths: ['C:/photos/after.jpg']
      })
    )
  })

  it('removes an existing picture before saving', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    const project = makeProject({ photoPaths: ['C:/photos/before.jpg', 'C:/photos/before2.jpg'] })
    vi.mocked(window.api.readPhoto).mockResolvedValue({ dataUrl: 'data:image/jpeg;base64,ZZZ' })

    render(<EditProjectModal project={project} onCancel={vi.fn()} onSave={onSave} />)

    const removeButtons = await screen.findAllByRole('button', { name: 'Remove picture' })
    expect(removeButtons).toHaveLength(2)
    await user.click(removeButtons[0])

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ existingPhotoPaths: ['C:/photos/before2.jpg'] })
    )
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<EditProjectModal project={makeProject()} onCancel={onCancel} onSave={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalled()
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DetailPanel from './DetailPanel'
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

describe('DetailPanel', () => {
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
      updateProject: vi.fn(),
      completeProject: vi.fn()
    }
  })

  it('shows the full project info, including notes, but not the invoice', () => {
    const project = makeProject({
      notes: 'Old unit was leaking from the base.',
      company: 'Acme Plumbing',
      houseArea: 'Basement',
      date: '2026-03-14',
      cost: 850,
      invoicePath: 'C:/invoices/receipt.pdf'
    })
    render(<DetailPanel project={project} onEdit={vi.fn()} onComplete={vi.fn()} />)

    expect(screen.getByText(/Replaced water heater/)).toBeInTheDocument()
    expect(screen.getByText('Old unit was leaking from the base.')).toBeInTheDocument()
    expect(screen.getByText(/Acme Plumbing/)).toBeInTheDocument()
    expect(screen.getByText(/Basement/)).toBeInTheDocument()
    expect(screen.getByText(/-\$850\.00/)).toBeInTheDocument()
    expect(screen.queryByTestId('invoice-thumb')).not.toBeInTheDocument()
  })

  it('renders one fixed-size photo per entry in photoPaths', () => {
    vi.mocked(window.api.readPhoto).mockResolvedValue({ dataUrl: 'data:image/jpeg;base64,AAA' })
    const project = makeProject({ photoPaths: ['C:/photos/a.jpg', 'C:/photos/b.jpg'] })
    const { container } = render(<DetailPanel project={project} onEdit={vi.fn()} onComplete={vi.fn()} />)

    expect(container.querySelectorAll('.project-photo')).toHaveLength(2)
  })

  it('does not crash on legacy projects saved before photoPaths existed', () => {
    // photoPaths didn't exist in earlier .hom files; simulate that shape reaching the panel
    const legacyProject = makeProject() as Project
    // @ts-expect-error simulating data from disk that predates this field
    delete legacyProject.photoPaths

    expect(() => render(<DetailPanel project={legacyProject} onEdit={vi.fn()} onComplete={vi.fn()} />)).not.toThrow()
    expect(screen.getByText(/Replaced water heater/)).toBeInTheDocument()
  })

  it('calls onEdit when the pencil icon is clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(<DetailPanel project={makeProject()} onEdit={onEdit} onComplete={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Edit item' }))

    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it('shows a Complete button only for In Progress items, and calls onComplete', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const inProgress = makeProject({ category: 'in_progress' })
    const { rerender } = render(
      <DetailPanel project={inProgress} onEdit={vi.fn()} onComplete={onComplete} />
    )

    await user.click(screen.getByRole('button', { name: 'Complete' }))
    expect(onComplete).toHaveBeenCalledTimes(1)

    rerender(
      <DetailPanel project={makeProject({ category: 'repair' })} onEdit={vi.fn()} onComplete={vi.fn()} />
    )
    expect(screen.queryByRole('button', { name: 'Complete' })).not.toBeInTheDocument()
  })
})

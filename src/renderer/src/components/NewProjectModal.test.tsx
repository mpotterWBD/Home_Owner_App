import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewProjectModal from './NewProjectModal'

describe('NewProjectModal', () => {
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

  it('submits all entered fields for the given category', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    render(
      <NewProjectModal
        category="repair"
        categoryLabel="Repair"
        onCancel={vi.fn()}
        onCreate={onCreate}
      />
    )

    await user.type(screen.getByLabelText('Description'), 'Replaced water heater')
    await user.type(screen.getByLabelText('Date'), '2026-03-14')
    await user.type(screen.getByLabelText('Company'), 'Acme Plumbing')
    await user.type(screen.getByLabelText('Part of the house'), 'Basement')
    await user.type(screen.getByLabelText('Cost'), '850')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(onCreate).toHaveBeenCalledWith({
      category: 'repair',
      description: 'Replaced water heater',
      notes: undefined,
      date: '2026-03-14',
      company: 'Acme Plumbing',
      houseArea: 'Basement',
      cost: 850,
      invoiceSourcePath: undefined,
      photoSourcePaths: []
    })
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(
      <NewProjectModal
        category="build"
        categoryLabel="Build"
        onCancel={onCancel}
        onCreate={vi.fn()}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalled()
  })

  it('lets the user search for and attach an image invoice, with a preview', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    vi.mocked(window.api.pickInvoice).mockResolvedValue({
      path: 'C:/invoices/receipt.jpg',
      fileName: 'receipt.jpg',
      dataUrl: 'data:image/jpeg;base64,AAA'
    })
    render(
      <NewProjectModal
        category="maintenance"
        categoryLabel="Maintenance"
        onCancel={vi.fn()}
        onCreate={onCreate}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Choose invoice' }))

    const preview = await screen.findByAltText('Invoice')
    expect(preview).toHaveAttribute('src', 'data:image/jpeg;base64,AAA')
    expect(screen.queryByText('receipt.jpg')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Create' }))
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ invoiceSourcePath: 'C:/invoices/receipt.jpg' })
    )
  })

  it('lets the user search for and attach a PDF invoice, shown as a filename chip', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    vi.mocked(window.api.pickInvoice).mockResolvedValue({
      path: 'C:/invoices/receipt.pdf',
      fileName: 'receipt.pdf'
    })
    render(
      <NewProjectModal
        category="in_progress"
        categoryLabel="In Progress"
        onCancel={vi.fn()}
        onCreate={onCreate}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Choose invoice' }))

    expect(await screen.findByText('receipt.pdf')).toBeInTheDocument()
    expect(screen.queryByAltText('Invoice')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Create' }))
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ invoiceSourcePath: 'C:/invoices/receipt.pdf' })
    )
  })

  it('includes the notes field when provided', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    render(
      <NewProjectModal
        category="repair"
        categoryLabel="Repair"
        onCancel={vi.fn()}
        onCreate={onCreate}
      />
    )

    await user.type(screen.getByLabelText('Description'), 'Replaced water heater')
    await user.type(screen.getByLabelText('Notes'), 'Old unit was leaking from the base.')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ notes: 'Old unit was leaking from the base.' })
    )
  })

  it('lets the user pick multiple project pictures and remove one before submitting', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    vi.mocked(window.api.pickImages).mockResolvedValue([
      { path: 'C:/photos/before.jpg', dataUrl: 'data:image/jpeg;base64,AAA' },
      { path: 'C:/photos/after.jpg', dataUrl: 'data:image/jpeg;base64,BBB' }
    ])
    render(
      <NewProjectModal
        category="repair"
        categoryLabel="Repair"
        onCancel={vi.fn()}
        onCreate={onCreate}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Choose pictures' }))
    expect(await screen.findAllByRole('button', { name: 'Remove picture' })).toHaveLength(2)

    await user.click(screen.getAllByRole('button', { name: 'Remove picture' })[0])
    expect(screen.getAllByRole('button', { name: 'Remove picture' })).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'Create' }))
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ photoSourcePaths: ['C:/photos/after.jpg'] })
    )
  })

  it('shows the "move to when complete" dropdown only for In Progress, and includes the choice', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    render(
      <NewProjectModal
        category="in_progress"
        categoryLabel="In Progress"
        onCancel={vi.fn()}
        onCreate={onCreate}
      />
    )

    await user.type(screen.getByLabelText('Description'), 'Replace roof')
    await user.selectOptions(screen.getByLabelText('Move to when complete'), 'build')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ targetCategory: 'build' }))
  })

  it('does not show the "move to when complete" dropdown for other categories', () => {
    render(
      <NewProjectModal
        category="repair"
        categoryLabel="Repair"
        onCancel={vi.fn()}
        onCreate={vi.fn()}
      />
    )

    expect(screen.queryByLabelText('Move to when complete')).not.toBeInTheDocument()
  })

  it('does not attach an invoice when the file picker is cancelled', async () => {
    const user = userEvent.setup()
    vi.mocked(window.api.pickInvoice).mockResolvedValue(null)
    render(
      <NewProjectModal
        category="build"
        categoryLabel="Build"
        onCancel={vi.fn()}
        onCreate={vi.fn()}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Choose invoice' }))

    expect(screen.queryByAltText('Invoice')).not.toBeInTheDocument()
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewProjectModal from './NewProjectModal'

describe('NewProjectModal', () => {
  beforeEach(() => {
    window.api = {
      pickImage: vi.fn(),
      pickInvoice: vi.fn(),
      readInvoice: vi.fn(),
      openInvoice: vi.fn(),
      createHouseFile: vi.fn(),
      openHouseFile: vi.fn(),
      addProject: vi.fn()
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
      date: '2026-03-14',
      company: 'Acme Plumbing',
      houseArea: 'Basement',
      cost: 850,
      invoiceSourcePath: undefined
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

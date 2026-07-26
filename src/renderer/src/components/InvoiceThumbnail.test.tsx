import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InvoiceThumbnail from './InvoiceThumbnail'

describe('InvoiceThumbnail', () => {
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

  it('opens the invoice with the default app when an image thumbnail is clicked', async () => {
    const user = userEvent.setup()
    vi.mocked(window.api.readInvoice).mockResolvedValue({
      kind: 'image',
      dataUrl: 'data:image/jpeg;base64,AAA'
    })
    render(<InvoiceThumbnail invoicePath="C:/invoices/receipt.jpg" />)

    await screen.findByAltText('Invoice')
    await user.click(screen.getByTestId('invoice-thumb'))

    expect(window.api.openInvoice).toHaveBeenCalledWith('C:/invoices/receipt.jpg')
  })

  it('does nothing when clicked with no invoice attached', async () => {
    const user = userEvent.setup()
    render(<InvoiceThumbnail />)

    await user.click(screen.getByTestId('invoice-thumb'))

    expect(window.api.openInvoice).not.toHaveBeenCalled()
  })
})

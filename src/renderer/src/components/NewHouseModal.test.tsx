import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewHouseModal from './NewHouseModal'
import { DEFAULT_MODAL_WIDTH } from '../lib/modalWidth'

describe('NewHouseModal', () => {
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

  it('submits the entered address, city, and state', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    render(<NewHouseModal onCancel={vi.fn()} onCreate={onCreate} />)

    await user.type(screen.getByLabelText('Address'), '123 Main St')
    await user.type(screen.getByLabelText('City'), 'Decatur')
    await user.type(screen.getByLabelText('State'), 'GA')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(onCreate).toHaveBeenCalledWith({
      address: '123 Main St',
      city: 'Decatur',
      state: 'GA',
      photoPath: undefined
    })
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<NewHouseModal onCancel={onCancel} onCreate={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalled()
  })

  it('shows a photo preview and includes the picked path on submit', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    vi.mocked(window.api.pickImage).mockResolvedValue({
      path: 'C:/photos/house.jpg',
      dataUrl: 'data:image/png;base64,AAA'
    })
    render(<NewHouseModal onCancel={vi.fn()} onCreate={onCreate} />)

    await user.click(screen.getByRole('button', { name: 'Choose photo' }))

    const preview = await screen.findByAltText('House')
    expect(preview).toHaveAttribute('src', 'data:image/png;base64,AAA')

    await user.click(screen.getByRole('button', { name: 'Create' }))
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ photoPath: 'C:/photos/house.jpg' })
    )
  })

  it('does not create a photo preview when the picker is cancelled', async () => {
    const user = userEvent.setup()
    vi.mocked(window.api.pickImage).mockResolvedValue(null)
    render(<NewHouseModal onCancel={vi.fn()} onCreate={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Choose photo' }))

    expect(screen.queryByAltText('House')).not.toBeInTheDocument()
  })

  it('resizes the modal based on the picked photo aspect ratio', async () => {
    const user = userEvent.setup()
    vi.mocked(window.api.pickImage).mockResolvedValue({
      path: 'C:/photos/house.jpg',
      dataUrl: 'data:image/png;base64,AAA'
    })
    const { container } = render(<NewHouseModal onCancel={vi.fn()} onCreate={vi.fn()} />)

    const modal = container.querySelector('.modal') as HTMLElement
    expect(modal.style.width).toBe(`${DEFAULT_MODAL_WIDTH}px`)

    await user.click(screen.getByRole('button', { name: 'Choose photo' }))
    const preview = (await screen.findByAltText('House')) as HTMLImageElement

    Object.defineProperty(preview, 'naturalWidth', { value: 1600, configurable: true })
    Object.defineProperty(preview, 'naturalHeight', { value: 900, configurable: true })
    fireEvent.load(preview)

    expect(parseFloat(modal.style.width)).toBeGreaterThan(DEFAULT_MODAL_WIDTH)
  })
})

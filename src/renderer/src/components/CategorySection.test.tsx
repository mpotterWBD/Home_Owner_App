import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CategorySection from './CategorySection'
import { Project } from '../../../shared/houseFile'

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: '1',
    category: 'repair',
    description: 'Replaced water heater',
    createdAt: '2026-03-14T00:00:00.000Z',
    updatedAt: '2026-03-14T00:00:00.000Z',
    ...overrides
  }
}

describe('CategorySection', () => {
  it('calls onAddProject when the + button is pressed, without expanding the row', async () => {
    const user = userEvent.setup()
    const onAddProject = vi.fn()
    render(<CategorySection title="Repair" projects={[]} onAddProject={onAddProject} />)

    await user.click(screen.getByRole('button', { name: 'Add Repair item' }))

    expect(onAddProject).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('No items yet')).not.toBeInTheDocument()
  })

  it('expands to show "No items yet" when there are no projects', async () => {
    const user = userEvent.setup()
    render(<CategorySection title="Repair" projects={[]} onAddProject={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Repair' }))

    expect(screen.getByText('No items yet')).toBeInTheDocument()
  })

  it('expands to list existing projects', async () => {
    const user = userEvent.setup()
    const project = makeProject({ company: 'Acme Plumbing', cost: 850 })
    render(<CategorySection title="Repair" projects={[project]} onAddProject={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Repair' }))

    expect(screen.getByText(/Replaced water heater/)).toBeInTheDocument()
    expect(screen.getByText(/Acme Plumbing/)).toBeInTheDocument()
    expect(screen.getByText(/-\$850\.00/)).toBeInTheDocument()
  })
})

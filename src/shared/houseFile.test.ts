import { describe, it, expect } from 'vitest'
import { createEmptyHouseFile } from './houseFile'

describe('createEmptyHouseFile', () => {
  it('creates a house file with the given name and empty collections', () => {
    const file = createEmptyHouseFile('123 Main St')

    expect(file.version).toBe(1)
    expect(file.house.name).toBe('123 Main St')
    expect(file.builders).toEqual([])
    expect(file.projects).toEqual([])
  })

  it('includes optional house info when provided', () => {
    const file = createEmptyHouseFile('123 Main St', {
      address: '123 Main St',
      city: 'Decatur',
      state: 'GA',
      photoPath: 'C:/photos/house.jpg'
    })

    expect(file.house.address).toBe('123 Main St')
    expect(file.house.city).toBe('Decatur')
    expect(file.house.state).toBe('GA')
    expect(file.house.photoPath).toBe('C:/photos/house.jpg')
  })

  it('leaves optional fields undefined when not provided', () => {
    const file = createEmptyHouseFile('Empty House')

    expect(file.house.address).toBeUndefined()
    expect(file.house.city).toBeUndefined()
    expect(file.house.state).toBeUndefined()
    expect(file.house.photoPath).toBeUndefined()
  })
})

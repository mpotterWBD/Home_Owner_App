import { describe, it, expect } from 'vitest'
import {
  calculatePhotoModalWidth,
  DEFAULT_MODAL_WIDTH,
  MIN_MODAL_WIDTH,
  MAX_MODAL_WIDTH
} from './modalWidth'

describe('calculatePhotoModalWidth', () => {
  it('widens the modal for a landscape photo', () => {
    const width = calculatePhotoModalWidth(1600, 900)
    expect(width).toBeGreaterThan(DEFAULT_MODAL_WIDTH)
  })

  it('narrows the modal for a portrait photo', () => {
    const width = calculatePhotoModalWidth(900, 1600)
    expect(width).toBeLessThan(DEFAULT_MODAL_WIDTH)
  })

  it('stays within the allowed bounds for a square photo', () => {
    const width = calculatePhotoModalWidth(1000, 1000)
    expect(width).toBeGreaterThanOrEqual(MIN_MODAL_WIDTH)
    expect(width).toBeLessThanOrEqual(MAX_MODAL_WIDTH)
  })

  it('clamps extremely wide photos to the max width', () => {
    const width = calculatePhotoModalWidth(5000, 200)
    expect(width).toBe(MAX_MODAL_WIDTH)
  })

  it('clamps extremely tall photos to the min width', () => {
    const width = calculatePhotoModalWidth(200, 5000)
    expect(width).toBe(MIN_MODAL_WIDTH)
  })
})

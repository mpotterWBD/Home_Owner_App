export const DEFAULT_MODAL_WIDTH = 360
export const MIN_MODAL_WIDTH = 320
export const MAX_MODAL_WIDTH = 560
export const PREVIEW_HEIGHT = 240
export const MODAL_PADDING = 48

export function calculatePhotoModalWidth(naturalWidth: number, naturalHeight: number): number {
  const aspect = naturalWidth / naturalHeight
  const rawWidth = PREVIEW_HEIGHT * aspect + MODAL_PADDING
  return Math.min(MAX_MODAL_WIDTH, Math.max(MIN_MODAL_WIDTH, rawWidth))
}

import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// pdfjs-dist references DOMMatrix at import time, which jsdom doesn't provide.
// Tests never render an actual PDF page, so an empty stub is enough to let the module load.
if (typeof globalThis.DOMMatrix === 'undefined') {
  // @ts-expect-error test-environment polyfill, not a full DOMMatrix implementation
  globalThis.DOMMatrix = class DOMMatrixStub {}
}

afterEach(() => {
  cleanup()
})

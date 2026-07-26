import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { FileText, ImageOff } from 'lucide-react'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

const THUMBNAIL_RENDER_WIDTH = 300

interface InvoiceThumbnailProps {
  invoicePath?: string
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

type Status = 'empty' | 'loading' | 'image' | 'pdf' | 'error'

function InvoiceThumbnail({ invoicePath }: InvoiceThumbnailProps): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState<Status>(invoicePath ? 'loading' : 'empty')
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!invoicePath) {
      setStatus('empty')
      setImageUrl(undefined)
      return
    }

    let cancelled = false
    setStatus('loading')
    setImageUrl(undefined)

    window.api.readInvoice(invoicePath).then(async (result) => {
      if (cancelled) return

      if (result.kind === 'image' && result.dataUrl) {
        setImageUrl(result.dataUrl)
        setStatus('image')
        return
      }

      if (result.kind === 'pdf' && result.dataUrl) {
        try {
          const bytes = base64ToBytes(result.dataUrl.split(',')[1])
          const pdf = await pdfjsLib.getDocument({ data: bytes }).promise
          const page = await pdf.getPage(1)
          const baseViewport = page.getViewport({ scale: 1 })
          const scale = THUMBNAIL_RENDER_WIDTH / baseViewport.width
          const viewport = page.getViewport({ scale })

          const canvas = canvasRef.current
          if (cancelled || !canvas) return

          canvas.width = viewport.width
          canvas.height = viewport.height
          const context = canvas.getContext('2d')
          if (context) {
            await page.render({ canvasContext: context, viewport }).promise
          }
          if (!cancelled) setStatus('pdf')
        } catch (error) {
          console.error('Failed to render PDF thumbnail', error)
          if (!cancelled) setStatus('error')
        }
        return
      }

      if (!cancelled) setStatus('error')
    })

    return () => {
      cancelled = true
    }
  }, [invoicePath])

  const openable = status === 'image' || status === 'pdf' || status === 'error'

  const handleClick = (e: React.MouseEvent): void => {
    e.stopPropagation()
    if (invoicePath && openable) {
      window.api.openInvoice(invoicePath)
    }
  }

  return (
    <div
      className={`invoice-thumb${openable ? ' invoice-thumb-clickable' : ''}`}
      data-testid="invoice-thumb"
      onClick={openable ? handleClick : undefined}
      role={openable ? 'button' : undefined}
      title={openable ? 'Open invoice' : undefined}
    >
      {status === 'image' && imageUrl && <img src={imageUrl} alt="Invoice" />}
      <canvas ref={canvasRef} style={{ display: status === 'pdf' ? 'block' : 'none' }} />
      {status === 'error' && <FileText size={32} />}
      {status === 'empty' && <ImageOff size={24} />}
    </div>
  )
}

export default InvoiceThumbnail

import { useEffect, useState } from 'react'

interface ProjectPhotoProps {
  photoPath: string
}

function ProjectPhoto({ photoPath }: ProjectPhotoProps): React.JSX.Element {
  const [dataUrl, setDataUrl] = useState<string | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    setDataUrl(undefined)
    window.api.readPhoto(photoPath).then((result) => {
      if (!cancelled) setDataUrl(result.dataUrl)
    })
    return () => {
      cancelled = true
    }
  }, [photoPath])

  return <div className="project-photo">{dataUrl && <img src={dataUrl} alt="Project" />}</div>
}

export default ProjectPhoto

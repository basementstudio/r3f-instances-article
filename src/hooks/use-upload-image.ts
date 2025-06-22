import { useCallback, useRef } from "react"
import { useControls, button } from "leva"
import * as THREE from "three"

export function useUploadImage(
  label: string,
  onUploadCallback: (texture: THREE.Texture) => void
) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const callbackRef = useRef(onUploadCallback)
  callbackRef.current = onUploadCallback

  const handleFileUpload = useCallback((event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (!file || !file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // Create texture from the loaded image
        const texture = new THREE.Texture(img)
        texture.needsUpdate = true
        texture.flipY = false // Adjust based on your needs
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter

        callbackRef.current(texture)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)

    // Reset the input so the same file can be selected again
    target.value = ''
  }, [])

  const triggerFileUpload = useCallback(() => {
    // Create file input if it doesn't exist
    if (!fileInputRef.current) {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.style.display = 'none'
      input.addEventListener('change', handleFileUpload)
      document.body.appendChild(input)
      fileInputRef.current = input
    }

    fileInputRef.current.click()
  }, [handleFileUpload])

  useControls(label, {
    "upload image": button(() => triggerFileUpload())
  })

  // Cleanup function to remove the file input when component unmounts
  const cleanup = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.removeEventListener('change', handleFileUpload)
      document.body.removeChild(fileInputRef.current)
      fileInputRef.current = null
    }
  }, [handleFileUpload])

  // Return cleanup function in case it's needed
  return cleanup
} 
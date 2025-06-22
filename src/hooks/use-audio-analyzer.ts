import { useCallback, useEffect, useRef, useState } from "react"

interface UseAudioAnalyzerReturn {
  isPlaying: boolean
  currentVolumeRef: React.MutableRefObject<number>
  playAudio: () => void
  pauseAudio: () => void
  toggleAudio: () => void
}

export function useAudioAnalyzer(audioUrl: string): UseAudioAnalyzerReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const currentVolumeRef = useRef(0)
  const isPlayingRef = useRef(false)

  const [isPlaying, setIsPlaying] = useState(false)

  // Initialize audio context and analyzer
  const initializeAudio = useCallback(async () => {
    if (audioRef.current && !audioContextRef.current) {
      // Create audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Create analyzer
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      analyserRef.current.smoothingTimeConstant = 0.8

      // Create source and connect to analyzer
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current)
      sourceRef.current.connect(analyserRef.current)
      analyserRef.current.connect(audioContextRef.current.destination)

      // Initialize data array
      const bufferLength = analyserRef.current.frequencyBinCount
      dataArrayRef.current = new Uint8Array(bufferLength)
    }
  }, [])

  // Analyze audio data
  const analyzeAudio = useCallback(() => {

    function raf() {
      if (!analyserRef.current || !dataArrayRef.current) return

      analyserRef.current.getByteFrequencyData(dataArrayRef.current)

      // Calculate average volume
      let sum = 0
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        sum += dataArrayRef.current[i]
      }
      const average = sum / dataArrayRef.current.length

      // Normalize to 0-1 range and apply some scaling for better visual response
      const normalizedVolume = Math.min(1, (average / 255) * 3)
      currentVolumeRef.current = normalizedVolume

      // Use ref instead of state to avoid callback recreation
      if (isPlayingRef.current) {
        animationFrameRef.current = requestAnimationFrame(raf)
      }
    }
    raf()
  }, []) // No dependencies to avoid callback recreation

  // Play audio
  const playAudio = useCallback(async () => {
    if (!audioRef.current) return

    try {
      await initializeAudio()

      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume()
      }

      await audioRef.current.play()
      isPlayingRef.current = true
      setIsPlaying(true)
      analyzeAudio()
    } catch (error) {
      console.error('Error playing audio:', error)
    }
  }, [initializeAudio, analyzeAudio])

  // Pause audio
  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      isPlayingRef.current = false
      setIsPlaying(false)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (isPlayingRef.current) {
      pauseAudio()
    } else {
      playAudio()
    }
  }, [playAudio, pauseAudio])

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio(audioUrl)
    audio.crossOrigin = "anonymous"
    audio.loop = false
    audioRef.current = audio

    // Handle audio events
    const handleEnded = () => {
      isPlayingRef.current = false
      setIsPlaying(false)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }

    const handlePause = () => {
      isPlayingRef.current = false
      setIsPlaying(false)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }

    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('pause', handlePause)

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      if (sourceRef.current) {
        sourceRef.current.disconnect()
      }

      if (audioContextRef.current) {
        audioContextRef.current.close()
      }

      audio.pause()
      audio.src = ""
    }
  }, [audioUrl])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return {
    isPlaying,
    currentVolumeRef,
    playAudio,
    pauseAudio,
    toggleAudio
  }
} 
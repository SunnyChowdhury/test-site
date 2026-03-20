import { useCallback, useEffect, useRef, useState } from 'react'
import { useUiScaleToSetRem, useUiAspectRatio } from '@telemetryos/sdk/react'
import { Video, VideoOff, Loader2, AlertTriangle } from 'lucide-react'
import Hls from 'hls.js'
import { FlickeringGrid } from '../components/FlickeringGrid'
import {
  useThemeStoreState,
  useUiScaleStoreState,
  usePagePaddingStoreState,
  useAnimationStoreState,
  useShowBackgroundStoreState,
  useStreamUrlStoreState,
  useVideoWidthStoreState,
  useVideoHeightStoreState,
  useMuteStoreState,
} from '../hooks/store'
import { themes, type ThemeName, type Theme } from '../themes'
import './Render.css'

function applyThemeVars(theme: Theme) {
  const c = theme.colors
  return {
    '--bg-start': c.bgStart,
    '--bg-mid': c.bgMid,
    '--bg-end': c.bgEnd,
    '--card-start': c.cardStart,
    '--card-mid1': c.cardMid1,
    '--card-mid2': c.cardMid2,
    '--card-end': c.cardEnd,
    '--card-shadow': c.cardShadow,
    '--primary': c.primary,
    '--secondary': c.secondary,
    '--muted': c.muted,
    '--accent': c.accent,
    '--card-bg': c.cardBg,
    '--card-border': c.cardBorder,
    '--status-good': c.statusGood,
    '--font-family': theme.fontFamily,
  } as React.CSSProperties
}

type Density = 'full' | 'comfortable' | 'compact' | 'minimal'

function getDensity(uiScale: number, aspectRatio: number): Density {
  const isPortrait = aspectRatio < 1
  const pressure = uiScale * (isPortrait ? 1.2 : 1)
  if (pressure < 1.4) return 'full'
  if (pressure < 1.8) return 'comfortable'
  if (pressure < 2.3) return 'compact'
  return 'minimal'
}

/** Redact credentials from a URL for safe display in error overlays. */
function redactStreamUrl(url: string): string {
  try {
    const parsed = new URL(url)
    if (parsed.username) parsed.username = '***'
    if (parsed.password) parsed.password = '***'
    parsed.search = ''
    parsed.hash = ''
    return parsed.toString()
  } catch {
    const noCreds = url.replace(/\/\/([^/@:]+):([^/@]+)@/, '//$1:***@')
    return noCreds.split('?')[0].split('#')[0]
  }
}

/** Supported protocols that can be handled natively by the TelemetryOS player. */
const NATIVE_PROTOCOLS = ['rtsp:', 'rtsps:', 'rtmp:', 'udp:', 'rtp:', 'mmsh:']

/** Check if a URL is an HLS stream. */
function isHlsUrl(url: string): boolean {
  try {
    const pathname = new URL(url).pathname.toLowerCase()
    return pathname.endsWith('.m3u8')
  } catch {
    return url.toLowerCase().includes('.m3u8')
  }
}

/** Check if a URL uses a protocol that requires native TelemetryOS player support. */
function isNativeProtocol(url: string): boolean {
  const lower = url.toLowerCase()
  return NATIVE_PROTOCOLS.some((p) => lower.startsWith(p))
}

type StreamState = 'idle' | 'loading' | 'playing' | 'error' | 'unsupported'

interface StreamError {
  code: string
  message: string
}

/**
 * Hook that manages video playback for different stream types:
 * - HLS (.m3u8) streams via hls.js
 * - Direct HTTP/HTTPS video URLs via native <video>
 * - RTSP/RTMP/etc. via TelemetryOS native player (ElectronAPI)
 */
function useVideoPlayer(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  streamUrl: string,
  mute: boolean,
) {
  const [state, setState] = useState<StreamState>('idle')
  const [error, setError] = useState<StreamError | null>(null)
  const hlsRef = useRef<Hls | null>(null)

  const cleanup = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !streamUrl) {
      setState('idle')
      setError(null)
      cleanup()
      return
    }

    // Native protocols require TelemetryOS player
    if (isNativeProtocol(streamUrl)) {
      // Check for TelemetryOS native streaming support
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any
      if (typeof window !== 'undefined' && win.supportLiveVideo) {
        // Native player available - use ElectronAPI
        setState('loading')
        try {
          const electronAPI = win.electronAPI as {
            startVideoStreaming?: (opts: { url: string; width?: number; height?: number }) => void
            stopVideoStreaming?: () => void
          } | undefined
          if (electronAPI?.startVideoStreaming) {
            electronAPI.startVideoStreaming({ url: streamUrl })
            setState('playing')
            return () => {
              electronAPI.stopVideoStreaming?.()
            }
          } else {
            setState('unsupported')
            setError({ code: 'unsupported', message: 'Live streams require the TelemetryOS player application' })
          }
        } catch {
          setState('unsupported')
          setError({ code: 'unsupported', message: 'Live streams require the TelemetryOS player application' })
        }
      } else {
        setState('unsupported')
        setError({ code: 'unsupported', message: 'Live streams require the latest TelemetryOS player application to display' })
      }
      return
    }

    // HLS streams
    if (isHlsUrl(streamUrl)) {
      cleanup()
      setState('loading')

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        })
        hlsRef.current = hls

        hls.loadSource(streamUrl)
        hls.attachMedia(video)

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().then(() => {
            setState('playing')
          }).catch(() => {
            // Autoplay blocked - still show video frame
            setState('playing')
          })
        })

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setState('error')
                setError({ code: 'network', message: 'Cannot retrieve stream from URL' })
                break
              case Hls.ErrorTypes.MEDIA_ERROR:
                // Try to recover without setting error state — recovery may succeed
                hls.recoverMediaError()
                break
              default:
                setState('error')
                setError({ code: 'fatal', message: 'Stream playback failed' })
                hls.destroy()
            }
          }
        })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = streamUrl
        const handlePlaying = () => setState('playing')
        const handleError = () => {
          setState('error')
          setError({ code: 'notFound', message: 'Cannot retrieve stream from URL' })
        }
        const handleLoadedMetadata = () => {
          video.play()
            .then(() => setState('playing'))
            .catch(() => {
              // Keep UI responsive when autoplay is blocked
              setState('playing')
            })
        }
        video.addEventListener('playing', handlePlaying)
        video.addEventListener('error', handleError)
        video.addEventListener('loadedmetadata', handleLoadedMetadata)
        return () => {
          video.removeEventListener('playing', handlePlaying)
          video.removeEventListener('error', handleError)
          video.removeEventListener('loadedmetadata', handleLoadedMetadata)
          cleanup()
        }
      } else {
        setState('error')
        setError({ code: 'unsupported', message: 'HLS playback is not supported in this browser' })
      }
      return cleanup
    }

    // Direct HTTP/HTTPS video URL
    cleanup()
    setState('loading')
    video.src = streamUrl

    const handlePlaying = () => setState('playing')
    const handleError = () => {
      setState('error')
      setError({ code: 'notFound', message: 'Cannot retrieve stream from URL' })
    }
    const handleWaiting = () => setState('loading')
    const handleLoadedMetadata = () => setState('playing')

    video.addEventListener('playing', handlePlaying)
    video.addEventListener('error', handleError)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)

    video.play().catch(() => {
      // Keep UI responsive even when autoplay is blocked
      setState('playing')
    })

    return () => {
      video.removeEventListener('playing', handlePlaying)
      video.removeEventListener('error', handleError)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      cleanup()
    }
  }, [streamUrl, videoRef, cleanup])

  // Update mute state separately so it doesn't restart the stream
  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.muted = mute
    }
  }, [mute, videoRef])

  return { state, error }
}

export function Render() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // -- Store state --
  const [isLoadingScale, uiScale] = useUiScaleStoreState()
  const [isLoadingPadding, pagePadding] = usePagePaddingStoreState()
  const [isLoadingTheme, themeName] = useThemeStoreState()
  const [isLoadingAnim, animation] = useAnimationStoreState()
  const [isLoadingBg, showBackground] = useShowBackgroundStoreState()
  const [isLoadingUrl, streamUrl] = useStreamUrlStoreState()
  const [isLoadingWidth, videoWidth] = useVideoWidthStoreState()
  const [isLoadingHeight, videoHeight] = useVideoHeightStoreState()
  const [isLoadingMute, mute] = useMuteStoreState()
  const aspectRatio = useUiAspectRatio()

  useUiScaleToSetRem(uiScale)

  const { state, error } = useVideoPlayer(videoRef, streamUrl, mute)

  // -- Responsive video sizing --
  const [playerStyle, setPlayerStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect
      if (!rect) return

      const safeVideoWidth = Number.isFinite(videoWidth) && videoWidth > 0 ? videoWidth : rect.width
      const safeVideoHeight = Number.isFinite(videoHeight) && videoHeight > 0 ? videoHeight : rect.height
      const sizeRatio = Math.min(
        rect.width / safeVideoWidth,
        rect.height / safeVideoHeight,
      )
      setPlayerStyle({
        width: `${sizeRatio * safeVideoWidth}px`,
        height: `${sizeRatio * safeVideoHeight}px`,
      })
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [videoWidth, videoHeight])

  // -- Loading gate --
  const isStoreLoading = isLoadingScale || isLoadingPadding || isLoadingTheme || isLoadingAnim || isLoadingBg
    || isLoadingUrl || isLoadingWidth || isLoadingHeight || isLoadingMute
  if (isStoreLoading) return null

  // -- Derived layout state --
  const resolvedName = (themeName in themes ? themeName : 'telemetryos') as ThemeName
  const theme = themes[resolvedName]
  const isPortrait = aspectRatio < 1
  const density = getDensity(uiScale, aspectRatio)

  const themeModifier: Record<string, string> = {
    'telemetryos': 'render--telemetryos',
    'neon-pulse': 'render--neon-pulse',
    'solar-flare': 'render--solar-flare',
    'emerald-matrix': 'render--emerald-matrix',
    'arctic-aurora': 'render--arctic-aurora',
    'the-matrix': 'render--the-matrix',
    'plain-light': 'render--plain',
    'plain-dark': 'render--plain',
  }

  const animClass = animation !== 'none' ? `anim--${animation}` : ''
  const layoutClasses = [
    'render',
    themeModifier[resolvedName] ?? '',
    isPortrait ? 'render--portrait' : '',
    `render--${density}`,
    animClass,
    showBackground ? '' : 'render--no-bg',
  ].filter(Boolean).join(' ')

  const showVideo = streamUrl && state !== 'unsupported'
  const showMessage = !streamUrl || state === 'error' || state === 'unsupported'

  return (
    <div key={animation} className={layoutClasses} style={{ ...applyThemeVars(theme), '--page-padding': pagePadding } as React.CSSProperties}>
      {/* Theme-specific background effects */}
      {showBackground && resolvedName === 'telemetryos' && <div className="tos-sweep" />}
      {showBackground && resolvedName === 'neon-pulse' && (
        <div className="neon-pulse-bg">
          <div className="neon-pulse-bg__orb" />
          <div className="neon-pulse-bg__orb" />
          <div className="neon-pulse-bg__orb" />
        </div>
      )}
      {showBackground && resolvedName === 'solar-flare' && <div className="solar-flare-bg" />}
      {showBackground && resolvedName === 'arctic-aurora' && <div className="arctic-aurora-bg" />}
      {showBackground && resolvedName === 'the-matrix' && <div className="matrix-scanlines" />}

      <main className="content-body">
        <section className="content-card live-video-card">
          {showBackground && resolvedName === 'emerald-matrix' && <FlickeringGrid color="rgb(0, 230, 118)" maxOpacity={0.3} flickerChance={0.3} squareSize={4} gridGap={6} />}

          {/* Video player container */}
          <div ref={containerRef} className="live-video-container">
            {/* Loading spinner */}
            {state === 'loading' && (
              <div className="live-video-overlay">
                <Loader2 className="live-video-spinner" />
              </div>
            )}

            {/* Video element for HLS / direct HTTP streams */}
            {showVideo && (
              <video
                ref={videoRef}
                className="live-video-player"
                style={playerStyle}
                muted={mute}
                autoPlay
                playsInline
              />
            )}

            {/* Messages overlay */}
            {showMessage && (
              <div className="live-video-messages">
                {!streamUrl && (
                  <>
                    <Video className="live-video-messages__icon" />
                    <p className="live-video-messages__text">No stream URL configured</p>
                    <p className="live-video-messages__hint">Add a stream URL in the settings panel</p>
                  </>
                )}
                {streamUrl && state === 'unsupported' && error && (
                  <>
                    <VideoOff className="live-video-messages__icon" />
                    <p className="live-video-messages__text">{error.message}</p>
                    <p className="live-video-messages__url">{redactStreamUrl(streamUrl)}</p>
                  </>
                )}
                {streamUrl && state === 'error' && error && (
                  <>
                    <AlertTriangle className="live-video-messages__icon live-video-messages__icon--error" />
                    <p className="live-video-messages__text">{error.message}</p>
                    <p className="live-video-messages__url">{redactStreamUrl(streamUrl)}</p>
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

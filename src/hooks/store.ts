import { createUseInstanceStoreState } from '@telemetryos/sdk/react'

// -- Appearance (common to all apps) --

export const useUiScaleStoreState = createUseInstanceStoreState<number>('ui-scale', 1)
export const usePagePaddingStoreState = createUseInstanceStoreState<number>('page-padding', 1)
export const useThemeStoreState = createUseInstanceStoreState<string>('theme', 'telemetryos')
export const useAnimationStoreState = createUseInstanceStoreState<string>('animation', 'flip')
export const useShowBackgroundStoreState = createUseInstanceStoreState<boolean>('show-background', true)

// -- App-specific --

/** Stream URL (supports rtsp, rtmp, rtsps, http, https, udp, rtp, mmsh protocols). */
export const useStreamUrlStoreState = createUseInstanceStoreState<string>('stream-url', '')

/** Video resolution width in pixels (100-1920). */
export const useVideoWidthStoreState = createUseInstanceStoreState<number>('video-width', 960)

/** Video resolution height in pixels (100-1920). */
export const useVideoHeightStoreState = createUseInstanceStoreState<number>('video-height', 540)

/** Whether to mute the stream audio. */
export const useMuteStoreState = createUseInstanceStoreState<boolean>('mute', true)

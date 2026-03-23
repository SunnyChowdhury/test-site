import {
  SettingsContainer,
  SettingsDivider,
  SettingsField,
  SettingsHeading,
  SettingsHint,
  SettingsLabel,
  SettingsInputFrame,
  SettingsSelectFrame,
  SettingsSliderFrame,
  SettingsCheckboxFrame,
  SettingsCheckboxLabel,
  SettingsSwitchFrame,
  SettingsSwitchLabel,
} from '@telemetryos/sdk/react'
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
import { themes } from '../themes'

const MAX_SIZE = 1920
const MIN_SIZE = 100

function clampSize(value: number): number {
  return Math.max(MIN_SIZE, Math.min(MAX_SIZE, Math.round(value)))
}

export function Settings() {
  const [isLoadingTheme, themeName, setThemeName] = useThemeStoreState()
  const [isLoadingScale, uiScale, setUiScale] = useUiScaleStoreState(5)
  const [isLoadingPadding, pagePadding, setPagePadding] = usePagePaddingStoreState()
  const [isLoadingAnim, animation, setAnimation] = useAnimationStoreState()
  const [isLoadingBg, showBackground, setShowBackground] = useShowBackgroundStoreState()
  const [isLoadingUrl, streamUrl, setStreamUrl] = useStreamUrlStoreState()
  const [isLoadingWidth, videoWidth, setVideoWidth] = useVideoWidthStoreState()
  const [isLoadingHeight, videoHeight, setVideoHeight] = useVideoHeightStoreState()
  const [isLoadingMute, mute, setMute] = useMuteStoreState()

  const isLoading = isLoadingTheme || isLoadingScale || isLoadingPadding || isLoadingAnim || isLoadingBg
    || isLoadingUrl || isLoadingWidth || isLoadingHeight || isLoadingMute

  return (
    <SettingsContainer>
      {/* -- Stream settings -- */}

      <SettingsHeading>Stream</SettingsHeading>

      <SettingsField>
        <SettingsLabel>URL</SettingsLabel>
        <SettingsInputFrame>
          {/* <input
            type="url"
            disabled={isLoading}
            value={streamUrl}
            placeholder="rtsp://... or https://.../*.m3u8"
            onChange={(e) => setStreamUrl(e.target.value)}
          /> */}
        </SettingsInputFrame>
        <SettingsHint>Supports RTSP, RTMP, HLS (.m3u8), HTTP/HTTPS video streams</SettingsHint>
      </SettingsField>

      <SettingsField>
        <SettingsLabel>Width</SettingsLabel>
        <SettingsInputFrame>
          {/* <input
            type="number"
            disabled={isLoading}
            value={videoWidth}
            min={MIN_SIZE}
            max={MAX_SIZE}
            step={10}
            onChange={(e) => setVideoWidth(clampSize(parseInt(e.target.value) || 960))}
          /> */}
        </SettingsInputFrame>
        <SettingsHint>Video resolution width in pixels ({MIN_SIZE}-{MAX_SIZE})</SettingsHint>
      </SettingsField>

      <SettingsField>
        <SettingsLabel>Height</SettingsLabel>
        <SettingsInputFrame>
          {/* <input
            type="number"
            disabled={isLoading}
            value={videoHeight}
            min={MIN_SIZE}
            max={MAX_SIZE}
            step={10}
            onChange={(e) => setVideoHeight(clampSize(parseInt(e.target.value) || 540))}
          /> */}
        </SettingsInputFrame>
        <SettingsHint>Video resolution height in pixels ({MIN_SIZE}-{MAX_SIZE})</SettingsHint>
      </SettingsField>

      <SettingsField>
        <SettingsSwitchFrame>
          {/* <input type="checkbox" disabled={isLoading} checked={mute} onChange={(e) => setMute(e.target.checked)} /> */}
          <SettingsSwitchLabel>Mute Audio</SettingsSwitchLabel>
        </SettingsSwitchFrame>
      </SettingsField>

      <SettingsDivider />

      {/* -- Appearance (common to all apps) -- */}

      <SettingsHeading>Appearance</SettingsHeading>

      <SettingsField>
        <SettingsLabel>Theme</SettingsLabel>
        <SettingsSelectFrame>
          {/* <select
            disabled={isLoading}
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
          >
            {Object.entries(themes).map(([key, theme]) => (
              <option key={key} value={key}>{theme.label}</option>
            ))}
          </select> */}
        </SettingsSelectFrame>
      </SettingsField>

      <SettingsField>
        <SettingsLabel>UI Scale</SettingsLabel>
        <SettingsSliderFrame>
          {/* <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            disabled={isLoading}
            value={uiScale}
            onChange={(e) => setUiScale(parseFloat(e.target.value))}
          /> */}
          <span>{uiScale}x</span>
        </SettingsSliderFrame>
      </SettingsField>

      <SettingsField>
        <SettingsLabel>Padding</SettingsLabel>
        <SettingsSliderFrame>
          {/* <input
            type="range"
            min={0}
            max={3}
            step={0.01}
            disabled={isLoading}
            value={pagePadding}
            onChange={(e) => setPagePadding(parseFloat(e.target.value))}
          />
          <span>{pagePadding}x</span> */}
        </SettingsSliderFrame>
      </SettingsField>

      <SettingsField>
        <SettingsLabel>Entrance Animation</SettingsLabel>
        <SettingsSelectFrame>
          {/* <select
            disabled={isLoading}
            value={animation}
            onChange={(e) => setAnimation(e.target.value)}
          >
            <option value="fade-in">Fade</option>
            <option value="fade">Fade Up</option>
            <option value="flip">Flip</option>
            <option value="unfold">Unfold</option>
            <option value="scale">Scale</option>
            <option value="zoom">Zoom</option>
            <option value="slide">Slide</option>
            <option value="drop">Drop</option>
            <option value="bounce">Bounce</option>
            <option value="rise">Rise</option>
            <option value="swing">Swing</option>
            <option value="blur">Blur</option>
            <option value="glitch">Glitch</option>
            <option value="none">None</option>
          </select> */}
        </SettingsSelectFrame>
      </SettingsField>

      <SettingsField>
        <SettingsCheckboxFrame>
          {/* <input type="checkbox" disabled={isLoading} checked={showBackground} onChange={(e) => setShowBackground(e.target.checked)} /> */}
          <SettingsCheckboxLabel>Show Background</SettingsCheckboxLabel>
        </SettingsCheckboxFrame>
        <SettingsHint>Uncheck for a transparent background</SettingsHint>
      </SettingsField>
    </SettingsContainer>
  )
}

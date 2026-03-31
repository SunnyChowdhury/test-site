export declare const useUiScaleStoreState: (debounceDelay?: number) => [boolean, number, import("react").Dispatch<import("react").SetStateAction<number>>];
export declare const usePagePaddingStoreState: (debounceDelay?: number) => [boolean, number, import("react").Dispatch<import("react").SetStateAction<number>>];
export declare const useThemeStoreState: (debounceDelay?: number) => [boolean, string, import("react").Dispatch<import("react").SetStateAction<string>>];
export declare const useAnimationStoreState: (debounceDelay?: number) => [boolean, string, import("react").Dispatch<import("react").SetStateAction<string>>];
export declare const useShowBackgroundStoreState: (debounceDelay?: number) => [boolean, boolean, import("react").Dispatch<import("react").SetStateAction<boolean>>];
/** Stream URL (supports rtsp, rtmp, rtsps, http, https, udp, rtp, mmsh protocols). */
export declare const useStreamUrlStoreState: (debounceDelay?: number) => [boolean, string, import("react").Dispatch<import("react").SetStateAction<string>>];
/** Video resolution width in pixels (100-1920). */
export declare const useVideoWidthStoreState: (debounceDelay?: number) => [boolean, number, import("react").Dispatch<import("react").SetStateAction<number>>];
/** Video resolution height in pixels (100-1920). */
export declare const useVideoHeightStoreState: (debounceDelay?: number) => [boolean, number, import("react").Dispatch<import("react").SetStateAction<number>>];
/** Whether to mute the stream audio. */
export declare const useMuteStoreState: (debounceDelay?: number) => [boolean, boolean, import("react").Dispatch<import("react").SetStateAction<boolean>>];

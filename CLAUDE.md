# TelemetryOS Application

**Application:** live-video

## Quick Start

```bash
npm install        # Install dependencies
npm run build      # Build and check for TypeScript errors
tos serve          # Start dev server (or: npm run dev)
```

**IMPORTANT:** Always run `npm run build` after making changes to check for TypeScript errors. Do not rely solely on the dev server.

**Development Host:** http://localhost:2026
Both the render and settings mounts points are visible in the development host.
The Render mount point is presented in a resizable pane.
The Settings mount point shows in the right sidebar.

**The development host is already running!** The user has already started it and the agent doesn't need to run it

## Architecture

TelemetryOS apps have two mount points:

| Mount | Purpose | Runs On |
|-------|---------|---------|
| `/render` | Content displayed on devices | Physical device (TV, kiosk) |
| `/settings` | Configuration UI | Studio admin portal |

Settings and Render communicate via instance store hooks.

## Project Structure

```text
src/
├── index.tsx        # Entry point (configure SDK here)
├── App.tsx          # Mount point routing
├── views/
│   ├── Settings.tsx # Configuration UI
│   └── Render.tsx   # Display content
└── hooks/
    └── store.ts     # Store state hooks
```

## Live Video Details

- **Stream protocols**: RTSP, RTMP, RTSPS, HLS (.m3u8), HTTP/HTTPS direct video
- **Native protocols** (RTSP, RTMP, UDP, RTP, MMSH): Require TelemetryOS player application
- **Web protocols** (HLS, HTTP/HTTPS): Played via hls.js or native HTML5 video
- **Settings**: URL, width (100-1920px), height (100-1920px), mute toggle
- **Ported from**: Legacy TelemetryTV `LiveVideo.vue` (User-PWA + Player-PWA)

## Hard Constraints

1. **No device storage in Settings** - Use instance store hooks instead
2. **CORS on external APIs** - Use `proxy().fetch()` when needed
3. **configure() required** - Call in index.tsx before React renders

## Documentation

- [SDK Getting Started](https://docs.telemetryos.com/docs/sdk-getting-started)
- [SDK Method Reference](https://docs.telemetryos.com/docs/sdk-method-reference)
- [Building Applications](https://docs.telemetryos.com/docs/applications)

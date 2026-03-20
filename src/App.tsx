/**
 * Root component — routes between the two TelemetryOS mount points:
 *
 *   /render   → Display view (runs on physical signage devices)
 *   /settings → Configuration UI (runs in Studio admin portal)
 */

import { createBrowserRouter, RouterProvider } from 'react-router'
import { Render } from './views/Render'
import { Settings } from './views/Settings'

const router = createBrowserRouter([
  { path: '/render', Component: Render },
  { path: '/settings', Component: Settings },
])

export function App() {
  return <RouterProvider router={router} />
}

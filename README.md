# Chicago Marine Forecast PWA

One-screen go/no-go dashboard for Belmont Harbor. Consolidates marine zone
forecast, active advisories, buoy observations, land forecast, and the NWS
forecast discussion into a single installable PWA.

## Run locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Hot-reloads on save.

**Note on NDBC buoy data locally:** The buoy fetch goes to `/ndbc/{STATION}.txt`,
which the Netlify proxy rewrites to NDBC's servers. Locally, that path returns
404, so the "Right Now" card will show an error. Everything else (NOAA API, GLERL
image) works locally without a proxy because those APIs send CORS headers.

To test buoy data locally, add a Vite proxy in `vite.config.ts`:

```ts
server: {
  proxy: {
    '/ndbc': {
      target: 'https://www.ndbc.noaa.gov/data/latest_obs',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/ndbc/, ''),
    },
  },
},
```

Remove before committing — it's only needed locally.

## Deploy to Netlify

### Option A — Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify deploy --build --prod
```

### Option B — Git-connected deploy (recommended)

1. Push this branch to GitHub.
2. In the Netlify dashboard → **Add new site → Import an existing project**.
3. Select the repo. Netlify reads `netlify.toml` automatically:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - NDBC proxy redirect is configured
4. Click **Deploy site**.

Subsequent pushes to the branch auto-deploy.

## Install to iOS home screen

1. Open the deployed Netlify URL in **Safari** (must be Safari, not Chrome).
2. Tap the **Share** button (box with arrow pointing up).
3. Scroll down and tap **Add to Home Screen**.
4. Name it **Marine** → tap **Add**.

The app opens full-screen without the browser chrome, and the last-fetched
data is available offline via the service worker cache.

## Data sources

All endpoints are in `src/config.ts`. Change station IDs or coordinates there
without touching any other file.

| Source | What it provides | Endpoint |
|--------|-----------------|----------|
| NOAA Weather API | Marine zone forecast, land forecast, active alerts, AFD discussion | `https://api.weather.gov/` |
| NDBC (via Netlify proxy) | Live buoy observations: wind, waves, water temp | `/ndbc/{STATION}.txt` → `https://www.ndbc.noaa.gov/data/latest_obs/` |
| GLERL CoastWatch | Lake Michigan surface temperature image | `https://coastwatch.glerl.noaa.gov/glsea/glsea.gif` |

### Buoy stations (priority order)

| ID | Name | Notes |
|----|------|-------|
| CHII2 | Chicago Harrison-Dever Crib | Primary — closest to Belmont Harbor |
| 45198 | Michigan City | Good wave height data |
| 45174 | Winthrop Harbor | Nearshore north |
| 45007 | S. Lake Michigan | Offshore reference |

Buoys are pulled for winter (roughly Nov–Apr). When CHII2 is offline, the app
falls back through the list automatically and shows an amber warning.

### Marine zone

**LMZ741** — Wilmette Harbor to Northerly Island, the nearshore zone that
covers Belmont Harbor. Used for the zone forecast and alert queries.

### Land point

Wicker Park (~41.9088, -87.6796). The NOAA `/points/` response is cached for
24 hours; it contains the dynamic forecast URLs for the 7-day and hourly grids.

## Adjusting thresholds

Wind and wave color thresholds (green/yellow/red) are in `src/config.ts`:

```ts
export const WIND_THRESHOLDS = { calm: 10, moderate: 20 }  // knots
export const WAVE_THRESHOLDS = { calm: 2, moderate: 4 }    // feet
```

# München Planscht

Real-time filling level indicator of Munich swimming pools, with historical data.

![Screenshot of the app showing the names of munich public swimming pools. Above each name is a sparkline graph showing how many visitors have been to the pool in the current day. A grey line shows comparison data from one week ago.](screenshot.jpeg)

## Architecture

This repository contains **only the frontend**. The backend — database,
scheduled scrapers (cron jobs), and the JSON API the frontend consumes — lives
on [Val Town](https://val.town) in the val
[`fgeierst/muenchen-plantscht-v2`](https://www.val.town/x/fgeierst/muenchen-plantscht-v2).

The backend provides:

- **SQLite storage** for pool occupancy, water temperatures, and catalog tables.
- **Cron jobs** that scrape SWM pool occupancy and GKD/Feringasee water
  temperatures on a schedule.
- **HTTP API endpoints**, e.g. pool occupancy:
  `https://muenchen-plantscht-pools.val.run/?date=YYYY-MM-DD`

To work on the backend, use the Val Town MCP / web editor, not this repo.

## Quickstart

```bash
pnpm install
pnpm dev
```

## Deployment

The frontend is a static SPA built with
[`@sveltejs/adapter-static`](https://kit.svelte.dev/docs/adapter-static) in SPA
mode (`ssr = false`, fallback `index.html`). It deploys via GitHub Actions over
FTPS to the `/mp/` subfolder of the florian.geierstanger.org server.

Live URL: <https://florian.geierstanger.org/mp/>

The deploy workflow lives in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
On every push to `main` it runs `vp run build` and uploads `build/` to
`server-dir: /mp/`. The Astro site at the server root has its own FTP
action that uploads to `/` and does not delete unknown files, so the two
deploys never interfere.

### Required repository secrets

- `FTP_SERVER`
- `FTP_USERNAME`
- `FTP_PASSWORD`

Add them at <https://github.com/fgeierst/muenchen-plantscht/settings/secrets/actions>.

### Base path

`kit.paths.base = "/mp"` is set in [`svelte.config.js`](svelte.config.js).
Internal links use `base` from `$app/paths`. When running locally with `pnpm dev`,
the app is served at `http://localhost:5173/mp/`.

### Previewing the production build locally

```bash
pnpm build
pnpm preview
```

Then open `http://localhost:4173/mp/`.

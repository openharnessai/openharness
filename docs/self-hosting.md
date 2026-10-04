# Self-hosting OpenHarness

OpenHarness is a static site. Self-hosting means serving the built output.

## Docker (Caddy)

```bash
# 1. build the static export
npm run build        # outputs to ./out

# 2. serve it
docker compose up -d
```

Then open `http://localhost`.

## Any static server

The `out/` directory is plain HTML/CSS/JS. Serve it with any static file server:

```bash
npx serve out
```

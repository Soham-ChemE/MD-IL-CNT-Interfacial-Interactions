# QA for the live page (2026-11-04)

Served from docs/ with python -m http.server, loaded in headless Chromium (software WebGL, so render timing is not representative).

## Lighthouse (desktop preset)

Performance 99, Accessibility 92, Best Practices 96, SEO 100

| Metric | Value |
|---|---|
| First Contentful Paint | 0.3 s |
| Largest Contentful Paint | 0.7 s |
| Speed Index | 0.9 s |
| Total Blocking Time | 0 ms |
| Cumulative Layout Shift | 0 |
| Time to Interactive | 0.7 s |
| Avoids enormous network payloads | Total size was 1,346 KiB |

Report: lighthouse.report.html, lighthouse.report.json.

## Headless-browser check

| View | Load (ms) | Transfer (bytes) | Images loaded | Canvases | Failed requests | Console errors |
|---|---|---|---|---|---|---|
| desktop | 1245 | 3,079,614 | 6/6 | heroCanvas 1440x900, ionCanvas 512x538 | 0 | 0 |
| mobile | 2328 | 3,079,614 | 6/6 | heroCanvas 375x812, ionCanvas 341x355 | 0 | 0 |

Screenshots: 2026-11-04-desktop-hero.png, 2026-11-04-desktop-dark-midscroll.png, 2026-11-04-desktop-full.png, 2026-11-04-mobile-375-hero.png, 2026-11-04-mobile-375-full.png. The figure-fix proof from the first commit of this round is 2026-11-04-figure-fix-desktop-full.png.

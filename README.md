# ghostbug

Zero-config automatic bug context collector for the browser. Drop it in, forget about it. When something breaks, you already have everything you need.

[![npm version](https://img.shields.io/npm/v/ghostbug.svg)](https://www.npmjs.com/package/ghostbug)
[![bundle size](https://img.shields.io/bundlephobia/minzip/ghostbug)](https://bundlephobia.com/package/ghostbug)
[![license](https://img.shields.io/npm/l/ghostbug.svg)](https://github.com/sounakdas/ghostbug/blob/main/LICENSE)

## Why ghostbug?

Testers spend 90% of their time manually collecting bug context — screenshots, error messages, console logs, steps to reproduce. ghostbug eliminates that by silently capturing everything in the background.

| | Sentry / LogRocket | ghostbug |
|---|---|---|
| Setup | Account, API keys, config | `ghostbug.init()` |
| Server needed | Yes (paid) | No — everything local |
| Bundle size | 50-200KB+ | **~7KB gzipped** |
| Dependencies | Multiple | **Zero** |
| Output | Dashboard (another tab) | JSON / Markdown you paste into GitHub Issues |

## Install

```bash
npm install ghostbug
```

## Quick Start

```js
import ghostbug from "ghostbug";

ghostbug.init();
```

That's it. ghostbug now auto-captures:

- **JS errors** — `window.onerror` + unhandled promise rejections
- **Console errors** — `console.error()` and `console.warn()`
- **Failed network requests** — `fetch` and `XMLHttpRequest` (4xx/5xx)
- **User click trail** — last 20 clicks with element selectors
- **Page context** — URL, browser, viewport, timestamp

## API

### `ghostbug.init(options?)`

Initialize ghostbug. Call once when your app loads.

```js
ghostbug.init({
  // Show floating widget UI (default: false)
  widget: true,

  // Or with widget options
  widget: {
    position: "bottom-right", // 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
    collapsed: true,
    zIndex: 2147483647,
  },

  // Toggle individual collectors (all true by default)
  collectors: {
    errors: true,
    console: true,
    network: true,
    clicks: true,
  },

  // Max reports stored (oldest dropped when full)
  maxReports: 50,

  // Max breadcrumb trail per report
  maxBreadcrumbs: 20,

  // Rate limiting (prevent flood from error loops)
  rateLimit: { maxEvents: 10, windowMs: 1000 },

  // Filter/transform reports before storage
  beforeReport: (report) => {
    // Return false to discard
    // Return modified report to transform
    return report;
  },
});
```

### `ghostbug.getReports()`

Returns all captured bug reports as an array.

```js
const reports = ghostbug.getReports();
console.log(reports);
```

### `ghostbug.toMarkdown()`

Returns a GitHub/Jira-ready markdown string of all captured bugs.

```js
const md = ghostbug.toMarkdown();
// Paste into GitHub Issues, Jira, Slack, etc.
```

Example output:

```markdown
## 1. TypeError: Cannot read property 'id' of undefined

- **Type:** error
- **Time:** 2026-02-23T10:21:33.000Z
- **Occurrences:** 3
- **URL:** https://myapp.com/dashboard
- **Browser:** Chrome 122

### Stack Trace
TypeError: Cannot read property 'id' of undefined
    at UserProfile (app.js:42:12)

### Breadcrumbs
| Time | Category | Event |
|------|----------|-------|
| 10:21:30 | click | Clicked button "Save" |
| 10:21:31 | network | POST /api/user -> 500 |
| 10:21:33 | error | TypeError: Cannot read... |
```

### `ghostbug.download(filename?)`

Downloads all reports as a JSON file.

```js
ghostbug.download(); // downloads ghostbug-report.json
ghostbug.download("my-bugs.json"); // custom filename
```

### `ghostbug.onBug(callback)`

Subscribe to bugs in real-time. Returns an unsubscribe function.

```js
const unsubscribe = ghostbug.onBug((report) => {
  // Send to Slack
  fetch("/api/slack-webhook", {
    method: "POST",
    body: JSON.stringify({ text: report.payload.message }),
  });
});

// Later: stop listening
unsubscribe();
```

### `ghostbug.destroy()`

Teardown everything — removes all listeners, restores patched APIs, unmounts widget.

```js
ghostbug.destroy();
```

## Framework Integration

### React / Next.js

```tsx
"use client"; // Next.js App Router

import { useEffect } from "react";
import ghostbug from "ghostbug";

export default function GhostbugProvider({ children }) {
  useEffect(() => {
    ghostbug.init({ widget: true });
    return () => ghostbug.destroy();
  }, []);

  return <>{children}</>;
}
```

```tsx
// layout.tsx
import GhostbugProvider from "./components/GhostbugProvider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GhostbugProvider>{children}</GhostbugProvider>
      </body>
    </html>
  );
}
```

### Vue

```js
// main.ts
import ghostbug from "ghostbug";

ghostbug.init({ widget: true });
```

### Plain HTML

```html
<script src="https://unpkg.com/ghostbug/dist/index.iife.js"></script>
<script>
  ghostbug.default.init({ widget: true });
</script>
```

## Widget

Enable the floating widget for testers — a small bug icon that shows captured bugs with copy/export buttons.

```js
ghostbug.init({ widget: true });
```

The widget:
- Shows a bug count badge
- Click to expand and see all captured bugs
- **Copy MD** — copies markdown to clipboard
- **Export** — downloads JSON file
- Uses Shadow DOM — styles never leak into your app
- Fully isolated — your CSS won't break it

## Bug Report Structure

Each captured bug contains:

```ts
{
  id: string;              // Unique report ID
  fingerprint: string;     // Hash for deduplication
  type: "error" | "console" | "network";
  timestamp: string;       // ISO 8601
  count: number;           // Occurrences (deduped)
  payload: { ... };        // Error details
  breadcrumbs: [ ... ];    // Events leading up to the bug
  context: {
    url: string;
    userAgent: string;
    viewport: { width, height };
    // ...
  };
}
```

## How It Works

- **Error capture** — Patches `window.onerror` and listens for `unhandledrejection`
- **Console capture** — Monkey-patches `console.error` / `console.warn` (always calls originals)
- **Network capture** — Patches `fetch` and `XMLHttpRequest` (only captures 4xx/5xx, never alters responses)
- **Click tracking** — Uses capture-phase click listener (catches clicks even with `stopPropagation`)
- **Deduplication** — Identical errors increment a counter instead of creating duplicate reports
- **Rate limiting** — Token-bucket algorithm prevents floods from error loops
- **Ring buffer** — Fixed-capacity storage prevents memory leaks in long-running apps
- **Safe teardown** — `destroy()` restores all original APIs

## Development

```bash
# Install dependencies
npm install

# Build (ESM + CJS + IIFE)
npm run build

# Run tests
npm test

# Watch mode
npm run test:watch

# Type check
npm run typecheck

# Lint
npm run lint
```

## License

MIT

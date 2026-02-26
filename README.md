<p align="center">
  <img src="https://em-content.zobj.net/source/apple/391/ghost_1f47b.png" width="80" alt="ghostbug" />
</p>

<h1 align="center">ghostbug</h1>

<p align="center">
  <strong>Zero-config bug context collector for the browser.</strong><br />
  Drop it in, forget about it. When something breaks, you already have everything you need.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/ghostbug"><img src="https://img.shields.io/npm/v/ghostbug.svg?style=flat-square&color=10b981" alt="npm version" /></a>
  <a href="https://bundlephobia.com/package/ghostbug"><img src="https://img.shields.io/bundlephobia/minzip/ghostbug?style=flat-square&color=6ee7b7&label=size" alt="bundle size" /></a>
  <a href="https://github.com/LittleBoy9/ghostbug/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/ghostbug.svg?style=flat-square&color=8b5cf6" alt="license" /></a>
  <img src="https://img.shields.io/badge/dependencies-0-10b981?style=flat-square" alt="zero dependencies" />
  <img src="https://img.shields.io/badge/tests-81%20passing-6ee7b7?style=flat-square" alt="tests passing" />
</p>

---

## Why ghostbug?

Testers spend 90% of their time manually collecting bug context — error messages, console logs, network failures, steps to reproduce. **ghostbug eliminates that** by silently capturing everything in the background.

|  | Sentry / LogRocket | ghostbug |
|---|---|---|
| **Setup** | Account, API keys, config | `ghostbug.init()` |
| **Server needed** | Yes (paid SaaS) | **No** — 100% client-side |
| **Bundle size** | 50–200KB+ | **~7KB gzipped** |
| **Dependencies** | Multiple | **Zero** |
| **Data privacy** | Sent to their servers | **Stays in the browser** |
| **Output** | Dashboard (another tab) | JSON / Markdown for GitHub Issues |
| **Pricing** | Free tier / Paid | **Free forever** |

---

## Install

```bash
npm install ghostbug
```

```bash
# or
yarn add ghostbug
# or
pnpm add ghostbug
```

---

## Quick Start

```js
import ghostbug from "ghostbug";

ghostbug.init();
```

That's it. ghostbug now silently auto-captures:

| Collector | What it catches |
|---|---|
| **Errors** | `window.onerror` + unhandled promise rejections with stack traces |
| **Console** | `console.error()` and `console.warn()` with full arguments |
| **Network** | Failed `fetch` and `XMLHttpRequest` (4xx/5xx) with timing |
| **Clicks** | Last 20 user clicks with element selectors and positions |
| **Interactions** | Form input, scroll, and resize events |
| **Performance** | Long Tasks, FCP, LCP, layout shifts via PerformanceObserver |
| **Memory** | Heap usage sampling, high usage (>90%) and rapid growth (>50%) alerts |
| **Context** | URL, browser, viewport, device pixel ratio, referrer |

---

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
    interactions: true,
    performance: true,
    memory: true,
  },

  maxReports: 50,      // Max reports stored (oldest dropped when full)
  maxBreadcrumbs: 20,  // Max breadcrumb trail per report
  maxClicks: 20,       // Max click trail entries

  // Rate limiting (prevent flood from error loops)
  rateLimit: { maxEvents: 10, windowMs: 1000 },

  // Filter/transform reports before storage
  beforeReport: (report) => {
    // Return false/null to discard
    // Return modified report to transform
    return report;
  },

  debug: false, // Enable SDK debug logging
});
```

### `ghostbug.getReports()`

Returns all captured bug reports as an array.

```js
const reports = ghostbug.getReports();
```

### `ghostbug.toMarkdown()`

Returns a GitHub/Jira-ready markdown string of all captured bugs.

```js
const md = ghostbug.toMarkdown();
// Paste into GitHub Issues, Jira, Slack, etc.
```

<details>
<summary><strong>Example markdown output</strong></summary>

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

</details>

### `ghostbug.download(filename?)`

Downloads all reports as a JSON file.

```js
ghostbug.download();              // ghostbug-report.json
ghostbug.download("my-bugs.json"); // custom filename
```

### `ghostbug.onBug(callback)`

Subscribe to bugs in real-time. Returns an unsubscribe function.

```js
const unsubscribe = ghostbug.onBug((report) => {
  // Send to Slack, your API, anywhere
  fetch("/api/slack-webhook", {
    method: "POST",
    body: JSON.stringify({ text: report.payload.message }),
  });
});

// Later: stop listening
unsubscribe();
```

### `ghostbug.setUser(user)`

Attach user context to every report.

```js
ghostbug.setUser({ id: "user-42", plan: "pro", email: "dev@example.com" });
```

### `ghostbug.setTags(tags)`

Add custom tags to every report. Merges with existing tags.

```js
ghostbug.setTags({ environment: "staging", version: "2.1.0" });
```

### `ghostbug.destroy()`

Teardown everything — removes all listeners, restores patched APIs, unmounts widget.

```js
ghostbug.destroy();
```

---

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

### Svelte

```svelte
<!-- +layout.svelte -->
<script>
  import { onMount, onDestroy } from "svelte";
  import ghostbug from "ghostbug";

  onMount(() => ghostbug.init({ widget: true }));
  onDestroy(() => ghostbug.destroy());
</script>

<slot />
```

### Plain HTML (CDN)

```html
<script src="https://unpkg.com/ghostbug/dist/index.iife.js"></script>
<script>
  ghostbug.default.init({ widget: true });
</script>
```

---

## Widget

Enable the floating widget for testers:

```js
ghostbug.init({ widget: true });
```

The widget:
- Shows a **live bug count** badge
- Click to expand and see all captured bugs
- **Copy MD** — copies markdown to clipboard
- **Export** — downloads JSON file
- Uses **Shadow DOM** — styles never leak into your app
- Fully isolated — your CSS won't break it

---

## Bug Report Structure

Each captured bug contains:

```ts
{
  id: string;              // Unique report ID
  fingerprint: string;     // Hash for deduplication
  type: "error" | "unhandled-rejection" | "console" | "network" | "performance" | "memory";
  timestamp: string;       // ISO 8601
  count: number;           // Occurrences (deduped)
  payload: { ... };        // Error/network/console/perf/memory details
  breadcrumbs: [           // Events leading up to the bug
    { timestamp, category, message, data }
  ];
  context: {
    url: string;
    referrer: string;
    userAgent: string;
    language: string;
    viewport: { width, height };
    screen: { width, height };
    devicePixelRatio: number;
    memory?: { usedJSHeapSize, totalJSHeapSize };
    user?: { ... };        // From setUser()
    tags?: { ... };        // From setTags()
  };
}
```

---

## How It Works

| Mechanism | Details |
|---|---|
| **Error capture** | Patches `window.onerror` and listens for `unhandledrejection` |
| **Console capture** | Monkey-patches `console.error` / `console.warn` (always calls originals) |
| **Network capture** | Patches `fetch` and `XMLHttpRequest` (only captures 4xx/5xx, never alters responses) |
| **Click tracking** | Uses capture-phase click listener (catches clicks even with `stopPropagation`) |
| **Interactions** | Listens for `input`, `scroll`, `resize` events as breadcrumbs |
| **Performance** | Uses `PerformanceObserver` for long-task, paint, and layout-shift entries |
| **Memory** | Samples `performance.memory` every 10s, flags high usage and rapid growth |
| **Deduplication** | Identical errors increment a counter instead of creating duplicate reports |
| **Rate limiting** | Token-bucket algorithm prevents floods from error loops |
| **Ring buffer** | Fixed-capacity storage prevents memory leaks in long-running apps |
| **Safe teardown** | `destroy()` restores all original APIs cleanly |

---

## Development

```bash
npm install          # Install dependencies
npm run build        # Build (ESM + CJS + IIFE)
npm test             # Run tests
npm run test:watch   # Watch mode
npm run typecheck    # TypeScript strict check
npm run lint         # ESLint
```

---

## License

MIT — do whatever you want.

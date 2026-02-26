"use client";

import { useState } from "react";
import ghostbug from "ghostbug";

export default function Home() {
  const [memoryChunks, setMemoryChunks] = useState<number[][]>([]);

  // ── JS Errors ──────────────────────────────────
  const triggerError = () => {
    const obj: Record<string, unknown> = {};
    // @ts-expect-error — intentional error for demo
    obj.nested.property.deep;
  };

  const triggerPromiseRejection = () => {
    Promise.reject(new Error("Unhandled promise rejection from ghostbug demo"));
  };

  const triggerTypeError = () => {
    // @ts-expect-error — intentional
    (null).toString();
  };

  const triggerRangeError = () => {
    new Array(-1);
  };

  // ── Console ────────────────────────────────────
  const triggerConsoleError = () => {
    console.error("This is a console.error captured by ghostbug");
  };

  const triggerConsoleWarn = () => {
    console.warn("This is a console.warn captured by ghostbug");
  };

  // ── Network ────────────────────────────────────
  const triggerNetwork404 = () => {
    fetch("/api/this-does-not-exist").catch(() => {});
  };

  const triggerNetwork500 = () => {
    fetch("/api/server-error").catch(() => {});
  };

  const triggerNetworkFailure = () => {
    fetch("https://this-domain-does-not-exist-xyz.com/api").catch(() => {});
  };

  // ── Performance ────────────────────────────────
  const triggerLongTask = () => {
    const start = performance.now();
    // Block the main thread for ~200ms to trigger longtask observer
    while (performance.now() - start < 200) {
      Math.random();
    }
    alert("Heavy computation done! Check breadcrumbs for longtask entry.");
  };

  // ── Memory ─────────────────────────────────────
  const allocateMemory = () => {
    const chunk = new Array(1_250_000).fill(0).map(() => Math.random());
    setMemoryChunks((prev) => [...prev, chunk]);
    alert(
      `Allocated ~10MB (total chunks: ${memoryChunks.length + 1}). ` +
        `Memory collector samples every 10s — wait for it to detect growth.`
    );
  };

  const releaseMemory = () => {
    setMemoryChunks([]);
    alert("Memory released.");
  };

  // ── User Context ───────────────────────────────
  const updateUser = () => {
    ghostbug.setUser({
      id: "user-99",
      name: "John Smith",
      plan: "enterprise",
      email: "john@example.com",
    });
    alert("User context updated — trigger a bug to see it in the report.");
  };

  const updateTags = () => {
    ghostbug.setTags({
      sprint: "sprint-14",
      component: "checkout",
      priority: "high",
    });
    alert("Tags updated — trigger a bug to see them in the report.");
  };

  // ── Export ─────────────────────────────────────
  const downloadReport = () => {
    ghostbug.download();
  };

  const copyMarkdown = () => {
    const md = ghostbug.toMarkdown();
    navigator.clipboard.writeText(md).then(
      () => alert("Markdown copied to clipboard!"),
      () => alert("Copy failed — check console for markdown")
    );
    console.log(md);
  };

  const showReportsJSON = () => {
    const reports = ghostbug.getReports();
    console.log("ghostbug reports:", reports);
    alert(`${reports.length} bug(s) captured. Check console for details.`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            ghostbug Demo
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">
            Full feature showcase — click buttons to trigger bugs and explore
            every collector. The floating bug icon in the bottom-right tracks
            everything.
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">
            v0.2.0-beta.0 &middot; performance, memory, interactions, user
            context, tags
          </p>
        </div>

        {/* ── JS Errors ─────────────────────── */}
        <Section title="JS Errors">
          <div className="flex flex-wrap gap-3">
            <Button color="red" onClick={triggerError}>
              Trigger TypeError
            </Button>
            <Button color="red" onClick={triggerTypeError}>
              Null Reference Error
            </Button>
            <Button color="red" onClick={triggerRangeError}>
              Trigger RangeError
            </Button>
            <Button color="red" onClick={triggerPromiseRejection}>
              Unhandled Promise Rejection
            </Button>
          </div>
        </Section>

        {/* ── Console Errors ────────────────── */}
        <Section title="Console Errors">
          <div className="flex flex-wrap gap-3">
            <Button color="orange" onClick={triggerConsoleError}>
              console.error()
            </Button>
            <Button color="orange" onClick={triggerConsoleWarn}>
              console.warn()
            </Button>
          </div>
        </Section>

        {/* ── Network Errors ────────────────── */}
        <Section title="Network Errors">
          <div className="flex flex-wrap gap-3">
            <Button color="blue" onClick={triggerNetwork404}>
              Fetch 404
            </Button>
            <Button color="blue" onClick={triggerNetwork500}>
              Fetch 500
            </Button>
            <Button color="blue" onClick={triggerNetworkFailure}>
              Network Failure (DNS)
            </Button>
          </div>
        </Section>

        {/* ── Click Tracking ────────────────── */}
        <Section title="Click Tracking">
          <p className="text-zinc-500 dark:text-zinc-400 mb-3 text-sm">
            Click anywhere on this page — ghostbug records the last 20 clicks
            as breadcrumbs in every bug report.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button color="zinc" onClick={() => {}}>
              Button A
            </Button>
            <Button color="zinc" onClick={() => {}}>
              Button B
            </Button>
            <Button color="zinc" onClick={() => {}}>
              Button C
            </Button>
          </div>
        </Section>

        {/* ── Interaction Tracking ──────────── */}
        <Section title="Interaction Tracking" badge="NEW">
          <p className="text-zinc-500 dark:text-zinc-400 mb-3 text-sm">
            Type in the inputs, select a value, or scroll the page — ghostbug
            captures input, change, scroll, resize, and visibility events as
            breadcrumbs.
          </p>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label
                htmlFor="demo-name"
                className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1"
              >
                Name
              </label>
              <input
                id="demo-name"
                type="text"
                placeholder="Type here…"
                className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 w-48"
              />
            </div>
            <div>
              <label
                htmlFor="demo-email"
                className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1"
              >
                Email
              </label>
              <input
                id="demo-email"
                type="email"
                placeholder="user@example.com"
                className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 w-48"
              />
            </div>
            <div>
              <label
                htmlFor="demo-role"
                className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1"
              >
                Role
              </label>
              <select
                id="demo-role"
                className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100"
              >
                <option>Developer</option>
                <option>Designer</option>
                <option>PM</option>
                <option>QA</option>
              </select>
            </div>
          </div>
          <div className="mt-3 max-h-24 overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-xs text-zinc-500 dark:text-zinc-400">
            <p className="mb-2 font-medium">Scrollable area (scroll me!)</p>
            {Array.from({ length: 20 }, (_, i) => (
              <p key={i}>
                Line {i + 1} — scroll interactions are captured as breadcrumbs
              </p>
            ))}
          </div>
        </Section>

        {/* ── Performance ───────────────────── */}
        <Section title="Performance Monitoring" badge="NEW">
          <p className="text-zinc-500 dark:text-zinc-400 mb-3 text-sm">
            Captures Long Tasks (&gt;50ms), FCP, LCP, and layout shifts
            automatically. Click below to block the main thread and trigger a
            longtask detection.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button color="purple" onClick={triggerLongTask}>
              Run Heavy Computation (~200ms)
            </Button>
          </div>
        </Section>

        {/* ── Memory ────────────────────────── */}
        <Section title="Memory Monitoring" badge="NEW">
          <p className="text-zinc-500 dark:text-zinc-400 mb-3 text-sm">
            Samples heap usage every 10s. Triggers a report when heap usage
            &gt;90% or growth &gt;50%. Allocate memory below to simulate a leak
            (Chrome only &mdash; requires{" "}
            <code className="text-xs bg-zinc-200 dark:bg-zinc-800 px-1 rounded">
              performance.memory
            </code>
            ).
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <Button color="purple" onClick={allocateMemory}>
              Allocate ~10MB
            </Button>
            <Button color="zinc" onClick={releaseMemory}>
              Release All
            </Button>
            {memoryChunks.length > 0 && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {memoryChunks.length} chunk(s) held (~
                {memoryChunks.length * 10}MB)
              </span>
            )}
          </div>
        </Section>

        {/* ── User Context & Tags ───────────── */}
        <Section title="User Context & Tags" badge="NEW">
          <p className="text-zinc-500 dark:text-zinc-400 mb-3 text-sm">
            Attach user info and custom tags to every report. Default user &amp;
            tags are set on init — click below to override them at runtime.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button color="teal" onClick={updateUser}>
              Update User Context
            </Button>
            <Button color="teal" onClick={updateTags}>
              Update Tags
            </Button>
          </div>
        </Section>

        {/* Divider */}
        <hr className="border-zinc-200 dark:border-zinc-800 my-8" />

        {/* ── Export ─────────────────────────── */}
        <Section title="Export Bug Reports">
          <div className="flex flex-wrap gap-3">
            <Button color="green" onClick={showReportsJSON}>
              Show Reports (JSON)
            </Button>
            <Button color="green" onClick={copyMarkdown}>
              Copy Markdown
            </Button>
            <Button color="green" onClick={downloadReport}>
              Download JSON File
            </Button>
          </div>
        </Section>

        {/* Info */}
        <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-6 text-sm text-zinc-600 dark:text-zinc-400 mb-10">
          <p className="font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
            How it works:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Auto-captures JS errors, console errors, failed network requests,
              and user clicks
            </li>
            <li>
              Tracks interactions (input, scroll, resize, visibility changes) as
              breadcrumbs
            </li>
            <li>
              Monitors performance (Long Tasks, FCP, LCP, layout shifts)
            </li>
            <li>
              Watches memory usage and flags high heap usage or growth spikes
              (Chrome)
            </li>
            <li>Attaches user context and custom tags to every report</li>
            <li>
              Runs a{" "}
              <code className="bg-zinc-200 dark:bg-zinc-800 px-1 rounded">
                beforeReport
              </code>{" "}
              filter — reports with &quot;secret&quot; in the URL are dropped
            </li>
            <li>All data stays local — nothing is sent to any server</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Reusable Components ──────────────────────────

function Section({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
        {title}
        {badge && (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </h2>
      {children}
    </section>
  );
}

function Button({
  children,
  onClick,
  color,
}: {
  children: React.ReactNode;
  onClick: () => void;
  color: "red" | "orange" | "blue" | "green" | "zinc" | "purple" | "teal";
}) {
  const colorMap = {
    red: "bg-red-600 hover:bg-red-700 text-white",
    orange: "bg-orange-500 hover:bg-orange-600 text-white",
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    green: "bg-emerald-600 hover:bg-emerald-700 text-white",
    zinc: "bg-zinc-200 hover:bg-zinc-300 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200",
    purple: "bg-violet-600 hover:bg-violet-700 text-white",
    teal: "bg-teal-600 hover:bg-teal-700 text-white",
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer ${colorMap[color]}`}
    >
      {children}
    </button>
  );
}

"use client";

import ghostbug from "ghostbug";

export default function Home() {
  // 1. JS Error
  const triggerError = () => {
    const obj: Record<string, unknown> = {};
    // @ts-expect-error — intentional error for demo
    obj.nested.property.deep;
  };

  // 2. Unhandled Promise Rejection
  const triggerPromiseRejection = () => {
    Promise.reject(new Error("Unhandled promise rejection from ghostbug demo"));
  };

  // 3. Console Error
  const triggerConsoleError = () => {
    console.error("This is a console.error captured by ghostbug");
  };

  // 4. Console Warn
  const triggerConsoleWarn = () => {
    console.warn("This is a console.warn captured by ghostbug");
  };

  // 5. Network Error (404)
  const triggerNetwork404 = () => {
    fetch("/api/this-does-not-exist").catch(() => {
      // silently catch — ghostbug already captured it
    });
  };

  // 6. Network Error (500)
  const triggerNetwork500 = () => {
    fetch("/api/server-error").catch(() => {});
  };

  // 7. Network Error (DNS / connection failure)
  const triggerNetworkFailure = () => {
    fetch("https://this-domain-does-not-exist-xyz.com/api").catch(() => {});
  };

  // 8. Type Error
  const triggerTypeError = () => {
    // @ts-expect-error — intentional
    (null).toString();
  };

  // 9. Range Error
  const triggerRangeError = () => {
    new Array(-1);
  };

  // Export actions
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
            Click the buttons below to trigger different error types. Watch the
            bug icon in the bottom-right corner — it counts captured bugs
            automatically.
          </p>
        </div>

        {/* Error Triggers */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
            JS Errors
          </h2>
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
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
            Console Errors
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button color="orange" onClick={triggerConsoleError}>
              console.error()
            </Button>
            <Button color="orange" onClick={triggerConsoleWarn}>
              console.warn()
            </Button>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
            Network Errors
          </h2>
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
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
            Click Tracking
          </h2>
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
        </section>

        {/* Divider */}
        <hr className="border-zinc-200 dark:border-zinc-800 my-8" />

        {/* Export Actions */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
            Export Bug Reports
          </h2>
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
        </section>

        {/* Info */}
        <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-6 text-sm text-zinc-600 dark:text-zinc-400">
          <p className="font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
            How it works:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>ghostbug auto-captures JS errors, console errors, failed network requests, and user clicks</li>
            <li>The floating bug icon shows the count of captured bugs</li>
            <li>Click the icon to see all captured bugs in a panel</li>
            <li>Use &quot;Copy MD&quot; in the panel to copy a GitHub/Jira-ready markdown report</li>
            <li>Use &quot;Export&quot; in the panel to download a JSON file</li>
            <li>All data stays local — nothing is sent to any server</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Button({
  children,
  onClick,
  color,
}: {
  children: React.ReactNode;
  onClick: () => void;
  color: "red" | "orange" | "blue" | "green" | "zinc";
}) {
  const colorMap = {
    red: "bg-red-600 hover:bg-red-700 text-white",
    orange: "bg-orange-500 hover:bg-orange-600 text-white",
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    green: "bg-emerald-600 hover:bg-emerald-700 text-white",
    zinc: "bg-zinc-200 hover:bg-zinc-300 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200",
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

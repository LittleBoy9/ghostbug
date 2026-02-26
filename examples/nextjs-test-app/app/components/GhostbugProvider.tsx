"use client";

import { useEffect } from "react";
import ghostbug from "ghostbug";

export default function GhostbugProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    ghostbug.init({
      widget: {
        position: "bottom-right",
      },
      debug: true,
      collectors: {
        errors: true,
        console: true,
        network: true,
        clicks: true,
        interactions: true,
        performance: true,
        memory: true,
      },
      beforeReport: (report) => {
        // Example filter: strip any PII from report context
        if (report.context.url.includes("secret")) return false;
        return report;
      },
    });

    // Set user context
    ghostbug.setUser({
      id: "demo-user-42",
      name: "Jane Doe",
      plan: "pro",
    });

    // Set tags
    ghostbug.setTags({
      environment: "demo",
      version: "0.2.0-beta.0",
      feature: "full-showcase",
    });

    // Log bugs to console for demo purposes
    ghostbug.onBug((report) => {
      console.log("[ghostbug] Bug captured:", report.type, report.payload);
    });

    return () => {
      ghostbug.destroy();
    };
  }, []);

  return <>{children}</>;
}

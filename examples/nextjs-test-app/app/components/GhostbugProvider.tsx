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
    });

    // Optional: log bugs to console for demo purposes
    ghostbug.onBug((report) => {
      console.log("[ghostbug] Bug captured:", report.type, report.payload);
    });

    return () => {
      ghostbug.destroy();
    };
  }, []);

  return <>{children}</>;
}

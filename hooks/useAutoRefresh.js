"use client";

import { useEffect, useRef } from "react";

export function useAutoRefresh(onRefresh) {
    const lastRefreshRef = useRef(Date.now());

    useEffect(() => {
        // Check every 1 minute (60000 ms)
        // Previous logic had time windows (Sat-Mon), now we want it always active
        // to prevent "manual refresh" need.
        const intervalId = setInterval(() => {
            const now = Date.now();
            const elapsed = now - lastRefreshRef.current;

            // Allow refresh if 60s has passed (just to be safe against multi-firing, 
            // though setInterval handles the cadence)
            if (elapsed >= 60000) {
                console.log("Auto-refreshing dashboard data...");
                if (onRefresh) onRefresh();
                lastRefreshRef.current = now;
            }
        }, 60000);

        return () => clearInterval(intervalId);
    }, [onRefresh]);
}

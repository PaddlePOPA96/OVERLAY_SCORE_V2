"use client";

import { useEffect, useRef } from "react";

export function useAutoRefresh(onRefresh) {
    const lastRefreshRef = useRef(Date.now());

    useEffect(() => {
        // Check every 1 minute
        const intervalId = setInterval(() => {
            const now = new Date();
            const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            const hour = now.getHours();

            // Determine if we are in the refresh window
            // Window 1: Saturday 18:00 - Sunday 03:00
            // Window 2: Sunday 18:00 - Monday 02:00

            let inWindow = false;

            if (day === 6) {
                // Saturday: 18:00 - 23:59
                if (hour >= 18) inWindow = true;
            } else if (day === 0) {
                // Sunday: 00:00 - 03:00 OR 18:00 - 23:59
                // "Sunday 3:00 AM" means up to 03:00 (so 00, 01, 02 are active)
                if (hour < 3 || hour >= 18) inWindow = true;
            } else if (day === 1) {
                // Monday: 00:00 - 02:00
                // "Monday 2:00 AM" means up to 02:00 (so 00, 01 are active)
                if (hour < 2) inWindow = true;
            }

            if (inWindow) {
                const elapsed = Date.now() - lastRefreshRef.current;
                // 1 hour = 3600000 ms
                if (elapsed >= 3600000) {
                    console.log("Auto-refreshing dashboard data...");
                    if (onRefresh) onRefresh();
                    lastRefreshRef.current = Date.now();
                }
            }
        }, 60000); // Check every minute

        return () => clearInterval(intervalId);
    }, [onRefresh]);
}

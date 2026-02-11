import { useState, useEffect } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase";

const defaultSettings = {
    scoreboard: {
        x: 0,
        y: 0,
        scale: 1,
    },
    runningText: {
        y: 0,
        scale: 1,
    },
    canvas: {
        width: 1920,
        height: 1080
    }
};

export function useLayoutSettings() {
    const [settings, setSettings] = useState(defaultSettings);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const settingsRef = ref(db, "settings");

        console.log("Subscribing to settings/...");
        const unsubscribe = onValue(settingsRef, (snapshot) => {
            console.log("Firebase settings snapshot received:", snapshot.exists());
            const data = snapshot.val();
            if (data) {
                console.log("Settings data:", data);
                // Merge with defaults to ensure all fields exist
                setSettings({
                    scoreboard: { ...defaultSettings.scoreboard, ...(data.scoreboard || {}) },
                    runningText: { ...defaultSettings.runningText, ...(data.runningText || {}) },
                    canvas: { ...defaultSettings.canvas, ...(data.canvas || {}) }
                });
            } else {
                console.log("No settings data found, using defaults");
                setSettings(defaultSettings);
            }
            setLoading(false);
        }, (error) => {
            console.error("Firebase Read Error:", error);
            // Fallback to defaults on error
            setSettings(defaultSettings);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateSettings = async (section, newValues) => {
        console.log(`[useLayoutSettings] Updating ${section}:`, newValues);
        try {
            const settingsRef = ref(db, `settings/${section}`);
            await update(settingsRef, newValues);
            console.log(`[useLayoutSettings] Update success for ${section}`);
        } catch (error) {
            console.error("Error updating settings:", error);
        }
    };

    return { settings, loading, updateSettings };
}

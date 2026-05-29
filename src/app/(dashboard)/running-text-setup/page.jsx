"use client";

import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

export default function RunningTextSetupPage() {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const overlayUrl = `${origin}/dashboard/running-text`;

  const handleCopy = () => {
    navigator.clipboard.writeText(overlayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-textPrimary">Running Text Overlay (OBS)</h1>
        <p className="text-textSecondary text-sm">Configure, view, and embed the ticker running text overlay on OBS.</p>
      </div>

      <Card className="max-w-3xl border border-slate-700/20 bg-slate-50 shadow-sm rounded-xl">
        <CardContent className="p-6 space-y-6">
          <div>
            <Typography variant="subtitle2" className="text-xs uppercase text-slate-500 font-bold mb-2">
              OBS Overlay URL
            </Typography>
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <code className="flex-1 p-3 rounded text-sm font-mono bg-slate-900 text-green-400 overflow-x-auto select-all">
                {overlayUrl}
              </code>
              <div className="flex gap-2">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCopy}
                  className="px-4 font-semibold text-sm normal-case"
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button
                  variant="outlined"
                  href={overlayUrl}
                  target="_blank"
                  className="px-4 font-semibold text-sm normal-case"
                >
                  Open Live
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg text-sm bg-blue-50 text-blue-800 border border-blue-100">
            <Typography variant="body2" className="font-semibold mb-2 text-blue-900">
              How to Install in OBS:
            </Typography>
            <ol className="list-decimal list-inside space-y-1.5 opacity-90 text-xs">
              <li>Open OBS and create a new source: <strong>Browser Source</strong></li>
              <li>Paste the URL copied above into the URL field.</li>
              <li>Set Width: <strong>1920</strong> (or same as your OBS canvas width).</li>
              <li>Set Height: <strong>80</strong> (adjust depending on ticker size).</li>
              <li>Check "Refresh browser when scene becomes active" if desired, and click OK.</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

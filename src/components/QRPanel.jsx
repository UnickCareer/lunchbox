import React, { useState } from "react";
import QRCode from "react-qr-code";
import { Smartphone, Copy, Check, TriangleAlert } from "lucide-react";

// The URL encoded in the QR code — set VITE_APP_URL (see .env.example)
// to your deployed link before printing the QR for the office. Falls
// back to the current page URL so it works out of the box in dev.
export const APP_URL =
  import.meta.env.VITE_APP_URL ||
  (typeof window !== "undefined" ? window.location.href : "");

const isLocalHost =
  typeof window !== "undefined" &&
  /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname) &&
  !import.meta.env.VITE_APP_URL;

export default function QRPanel() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(APP_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — the URL text below is still selectable */
    }
  };

  return (
    <div className="glass rounded-3xl p-6 flex flex-col items-center gap-4 text-center">
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <QRCode value={APP_URL} size={148} fgColor="#0A1F19" bgColor="#FFFFFF" />
      </div>

      <div className="flex items-center gap-2 text-ink-700 dark:text-cream-50/70">
        <Smartphone size={16} />
        <p className="text-xs font-body">
          Scan with your phone camera to open the order page
        </p>
      </div>

      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 text-[11px] font-mono text-ink-500 dark:text-cream-50/50 hover:text-emerald-500 transition break-all"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {APP_URL}
      </button>

      {isLocalHost && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-400/15 p-3 text-left">
          <TriangleAlert size={15} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
            This QR points to <strong>localhost</strong> — only this computer
            can open it. Phones on the office Wi-Fi need the network URL
            instead: run <code>npm run dev -- --host</code>, copy the{" "}
            <strong>Network:</strong> address Vite prints, and set it as{" "}
            <code>VITE_APP_URL</code> in a <code>.env</code> file (see
            README). For a permanent link that works from anywhere, deploy
            the build to Vercel or Netlify and use that URL instead.
          </p>
        </div>
      )}
    </div>
  );
}

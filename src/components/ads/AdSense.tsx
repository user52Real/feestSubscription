"use client";

import Script from "next/script";

interface AdSenseProps {
  publisherId: string;
}

export function AdSense({ publisherId }: AdSenseProps) {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <Script
      id="adsbygoogle-init"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
      onError={(e) => {
        console.error("AdSense script failed to load:", e);
      }}
    />
  );
}
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: {
      push: (obj: unknown) => void;
    }[] | undefined;
  }
}

interface AdUnitProps {
  slot: string;
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  layout?: string;
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
}

const AdUnit = ({
  slot,
  format = "vertical",
  layout,
  fullWidthResponsive = true,
  style
}: AdUnitProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const loadAd = () => {
      const intervalId = setInterval(() => {
        try {
          if (typeof window !== "undefined") {
            if (!window.adsbygoogle) {
              window.adsbygoogle = [];
            }
            window.adsbygoogle.push();
            clearInterval(intervalId);
          }
        } catch (error) {
          console.error("AdSense error:", error);
          clearInterval(intervalId);
        }
      }, 300);

      return intervalId;
    };

    // Initial ad load
    const intervalId = loadAd();

    // Cleanup on unmount or route change
    return () => {
      if (intervalId) clearInterval(intervalId);
      
      // Clean up the ad slot
      if (adRef.current) {
        adRef.current.innerHTML = '';
      }
    };
  }, [pathname, searchParams]);

  return (
    <ins
      ref={adRef}
      className="adsbygoogle"
      style={{
        display: "block",
        textAlign: "center",
        minHeight: "100px",
        backgroundColor: process.env.NODE_ENV === "development" ? "#f0f0f0" : "transparent",
        border: process.env.NODE_ENV === "development" ? "1px dashed #ccc" : "none",
        margin: "20px auto",
        maxWidth: "100%",
        overflow: "hidden",
        ...style
      }}
      data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-ad-layout={layout}
      data-full-width-responsive={fullWidthResponsive}
      data-adtest={process.env.NODE_ENV === "development" ? "on" : "off"}
    />
  );
};

export default AdUnit;
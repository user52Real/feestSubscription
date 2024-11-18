'use client';

import { useEffect, useState } from 'react';

export function A11yAnnouncer() {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const handleRouteChange = () => {
      const pageTitle = document.title;
      setAnnouncement(`Navigated to ${pageTitle}`);
    };

    // Listen for route changes
    window.addEventListener('routeChangeComplete', handleRouteChange);
    return () => window.removeEventListener('routeChangeComplete', handleRouteChange);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}
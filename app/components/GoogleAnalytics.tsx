'use client';

import { GoogleAnalytics as GA } from 'nextjs-google-analytics';

export function GoogleAnalytics() {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!gaMeasurementId) {
    return null;
  }

  return <GA gaMeasurementId={gaMeasurementId} trackPageViews />;
}

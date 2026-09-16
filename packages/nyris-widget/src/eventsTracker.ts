export const EVENTS_TRACKER_SCRIPT_URL =
  'https://assets.nyris.io/nyris-tracking/v1/nyris-tracker.min.js';
export const EVENTS_TRACKER_MODE = 'cookiefree';
export const EVENTS_TRACKER_RESULTS_SELECTOR =
  '.nyris__success-multiple-result';
export const EVENTS_TRACKER_RESULTS_CONTAINER = '#nyris-mount-point';
export const EVENTS_TRACKER_PRODUCT_ID_ATTR = 'data-product-id';

declare global {
  interface Window {
    __nyrisTrackerLoaded?: boolean;
  }
}

export function loadEventsTracker(settings: {
  eventsTrackingApiKey?: string;
}): void {
  const apiKey = settings.eventsTrackingApiKey?.trim();
  if (!apiKey) {
    return;
  }

  if (window.__nyrisTrackerLoaded) {
    return;
  }

  if (document.querySelector('script[src*="nyris-tracker"]')) {
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = EVENTS_TRACKER_SCRIPT_URL;
  script.setAttribute('data-api-key', apiKey);
  script.setAttribute('data-mode', EVENTS_TRACKER_MODE);
  script.setAttribute('data-results-selector', EVENTS_TRACKER_RESULTS_SELECTOR);
  script.setAttribute(
    'data-results-container',
    EVENTS_TRACKER_RESULTS_CONTAINER,
  );
  script.setAttribute('data-product-id-attr', EVENTS_TRACKER_PRODUCT_ID_ATTR);
  document.head.appendChild(script);
}

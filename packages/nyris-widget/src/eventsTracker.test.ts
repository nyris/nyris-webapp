import {
  EVENTS_TRACKER_MODE,
  EVENTS_TRACKER_PRODUCT_ID_ATTR,
  EVENTS_TRACKER_RESULTS_CONTAINER,
  EVENTS_TRACKER_RESULTS_SELECTOR,
  EVENTS_TRACKER_SCRIPT_URL,
  loadEventsTracker,
} from './eventsTracker';

describe('loadEventsTracker', () => {
  afterEach(() => {
    document.head.innerHTML = '';
    delete window.__nyrisTrackerLoaded;
  });

  it('does not inject a script when the tracking key is missing', () => {
    loadEventsTracker({});
    loadEventsTracker({ eventsTrackingApiKey: '' });
    loadEventsTracker({ eventsTrackingApiKey: '   ' });
    expect(document.querySelectorAll('script')).toHaveLength(0);
  });

  it('injects one async tracker script with cookie-free attributes', () => {
    loadEventsTracker({ eventsTrackingApiKey: ' tracking-key ' });

    const scripts = document.querySelectorAll('script');
    expect(scripts).toHaveLength(1);
    const script = scripts[0] as HTMLScriptElement;
    expect(script.async).toBe(true);
    expect(script.src).toBe(EVENTS_TRACKER_SCRIPT_URL);
    expect(script.getAttribute('data-api-key')).toBe('tracking-key');
    expect(script.getAttribute('data-mode')).toBe(EVENTS_TRACKER_MODE);
    expect(script.getAttribute('data-results-selector')).toBe(
      EVENTS_TRACKER_RESULTS_SELECTOR,
    );
    expect(script.getAttribute('data-results-container')).toBe(
      EVENTS_TRACKER_RESULTS_CONTAINER,
    );
    expect(script.getAttribute('data-product-id-attr')).toBe(
      EVENTS_TRACKER_PRODUCT_ID_ATTR,
    );
  });

  it('does not inject a second script on a later call', () => {
    loadEventsTracker({ eventsTrackingApiKey: 'tracking-key' });
    loadEventsTracker({ eventsTrackingApiKey: 'tracking-key' });
    expect(document.querySelectorAll('script')).toHaveLength(1);
  });

  it('skips injection when a tracker script is already on the page', () => {
    const existing = document.createElement('script');
    existing.src = EVENTS_TRACKER_SCRIPT_URL;
    document.head.appendChild(existing);

    loadEventsTracker({ eventsTrackingApiKey: 'tracking-key' });
    expect(document.querySelectorAll('script')).toHaveLength(1);
  });

  it('skips injection when the tracker has already loaded', () => {
    window.__nyrisTrackerLoaded = true;
    loadEventsTracker({ eventsTrackingApiKey: 'tracking-key' });
    expect(document.querySelectorAll('script')).toHaveLength(0);
  });
});

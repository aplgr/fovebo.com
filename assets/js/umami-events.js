(function () {
  "use strict";

  function trackUmami(eventName, payload) {
    if (!eventName || !window.umami || typeof window.umami.track !== 'function') {
      return;
    }

    if (payload && Object.keys(payload).length > 0) {
      window.umami.track(eventName, payload);
      return;
    }

    window.umami.track(eventName);
  }

  window.trackUmami = trackUmami;

  document.addEventListener('click', function (event) {
    const trackedElement = event.target.closest('[data-umami-event]');
    if (!trackedElement) {
      return;
    }

    trackUmami(trackedElement.dataset.umamiEvent);
  }, true);
})();

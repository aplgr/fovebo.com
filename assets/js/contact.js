function safeTrackUmami(eventName, payload) {
  if (typeof window.trackUmami === 'function') {
    window.trackUmami(eventName, payload);
    return;
  }

  if (!eventName || !window.umami || typeof window.umami.track !== 'function') {
    return;
  }

  if (payload && Object.keys(payload).length > 0) {
    window.umami.track(eventName, payload);
    return;
  }

  window.umami.track(eventName);
}

document.addEventListener('alpine:init', () => {
  Alpine.store('fg', { status: '' });

  Alpine.data('formGuard', () => ({
    start: 0,
    lastElapsed: 0,
    requestPending: false,
    resultTracked: false,

    init() {
      this.start = Date.now();
      this.setState('idle');

      // Ensure _elapsed_ms is set before htmx/json-enc serializes
      this.$el.addEventListener('submit', () => {
        const elapsed = Math.max(1, Date.now() - this.start);
        this.lastElapsed = elapsed;
        this.requestPending = true;
        this.resultTracked = false;
        safeTrackUmami('contact_form_submit');
        const hidden = this.$el.querySelector('input[name=\"_elapsed_ms\"]');
        if (hidden) hidden.value = String(elapsed);
      }, { capture: true });

      // Fallback: copy hx-post into action if empty
      if (this.$el.getAttribute('action') === '') {
        const hx = this.$el.getAttribute('hx-post') || this.$el.dataset.action;
        if (hx) this.$el.setAttribute('action', hx);
      }

      // Listen for centralized notifications to update SR text / inline boxes
      this.$el.addEventListener('ap:notify', (ev) => {
        const d = ev.detail || {};
        const msg = d.message || '';
        Alpine.store('fg').status = msg;
      });
    },

    // htmx hooks (no strings here)
    configRequest(e) {
      if (e.target !== this.$el) return;
      const elapsed = this.lastElapsed || Math.max(1, Date.now() - this.start);
      const p = e.detail.parameters || (e.detail.parameters = {});
      p._elapsed_ms = elapsed;
      this.setState('loading');
    },

    beforeRequest(e) {
      if (e.target !== this.$el) return;
      const elapsed = this.lastElapsed || Math.max(1, Date.now() - this.start);
      const hidden = this.$el.querySelector('input[name=\"_elapsed_ms\"]');
      if (hidden) hidden.value = String(elapsed);
      const p = e.detail.parameters || (e.detail.parameters = {});
      p._elapsed_ms = elapsed;
    },

    afterRequest(e) {
      if (e.target !== this.$el) return;
      const xhr = e.detail.xhr;
      let data = null;
      try { data = JSON.parse(xhr.responseText || ''); } catch { }
      if (xhr.status >= 200 && xhr.status < 300 && data && data.ok) {
        this.setState('sent');
        this.finalizeTracking('contact_form_success');
        this.$el.reset();
        this.start = Date.now();
        this.lastElapsed = 0;
      } else {
        this.setState('error');
        this.finalizeTracking('contact_form_error');
      }
    },

    sendError(e) {
      if (e.target !== this.$el) return;
      this.setState('error');
      this.finalizeTracking('contact_form_error');
    },

    // visual state for CSS fallbacks
    setState(state) {
      this.$el.setAttribute('data-status', state || 'idle');
    },

    finalizeTracking(eventName) {
      if (!this.requestPending || this.resultTracked) {
        return;
      }

      safeTrackUmami(eventName);
      this.resultTracked = true;
      this.requestPending = false;
    },
  }));
});

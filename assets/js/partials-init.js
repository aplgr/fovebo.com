(function () {
    function reinitVendors() {
        // Nur aufrufen, wenn vorhanden – keine Fehler werfen
        if (window.AOS && typeof AOS.init === 'function') { AOS.init({ once: true }); }
        if (window.GLightbox) { try { GLightbox(); } catch (e) { } }
        if (window.Swiper) { /* ggf. deine Swiper-Instanzen hier erzeugen */ }
        if (window.PureCounter) { try { new PureCounter(); } catch (e) { } }
        // ggf. weitere Template-spezifische Re-Initialisierungen …
    }

    document.addEventListener('DOMContentLoaded', reinitVendors);
    document.body.addEventListener('htmx:afterSwap', reinitVendors);
})();

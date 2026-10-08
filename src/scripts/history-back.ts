function initializeHistoryBackLinks() {
    document.querySelectorAll<HTMLAnchorElement>("[data-history-back]:not([data-history-back-ready])").forEach((link) => {
        link.dataset.historyBackReady = "true";
        link.addEventListener("click", (event) => {
            if (window.history.length < 2) return;
            event.preventDefault();
            window.history.back();
        });
    });
}

initializeHistoryBackLinks();
document.addEventListener("astro:page-load", initializeHistoryBackLinks);

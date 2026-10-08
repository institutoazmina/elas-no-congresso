function initializeProposalCarousels() {
    document.querySelectorAll<HTMLElement>("[data-proposal-carousel]").forEach((carousel) => {
        if (carousel.dataset.initialized) return;
        const track = carousel.querySelector<HTMLElement>("[data-carousel-track]");
        const previous = carousel.querySelector<HTMLButtonElement>('[data-carousel-direction="previous"]');
        const next = carousel.querySelector<HTMLButtonElement>('[data-carousel-direction="next"]');
        const cards = Array.from(carousel.querySelectorAll<HTMLAnchorElement>("[data-proposal-card]"));
        const size = Number(carousel.dataset.groupSize);
        if (!track || !previous || !next || !size || cards.length !== size * 3) return;
        carousel.dataset.initialized = "true";
        const controller = new AbortController();
        const { signal } = controller;
        let index = size;
        let moving = false;
        let timeout: ReturnType<typeof setTimeout> | undefined;

        const update = () => {
            const width = cards[index].getBoundingClientRect().width;
            const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
            track.style.transform = `translateX(${-index * (width + gap) - width / 2}px)`;
            cards.forEach((card, position) => {
                const active = position === index;
                card.dataset.featured = String(active);
                card.setAttribute("aria-hidden", String(!active));
                card.tabIndex = active ? 0 : -1;
            });
        };
        const finish = () => {
            clearTimeout(timeout);
            if (index < size || index >= size * 2) {
                index = size + ((index % size) + size) % size;
                track.style.transition = "none";
                update();
                // Commit the equivalent middle copy before restoring animation.
                track.getBoundingClientRect();
                track.style.transition = "";
            }
            moving = false;
        };
        const move = (direction: number) => {
            if (moving || size < 2) return;
            moving = true;
            index += direction;
            update();
            if (matchMedia("(prefers-reduced-motion: reduce)").matches) finish();
            else timeout = setTimeout(finish, 250);
        };
        track.addEventListener("transitionend", (event) => {
            if (event.target === track && event.propertyName === "transform") finish();
        }, { signal });
        previous.addEventListener("click", () => move(-1), { signal });
        next.addEventListener("click", () => move(1), { signal });
        const resizeObserver = new ResizeObserver(update);
        resizeObserver.observe(carousel);
        document.addEventListener("astro:before-swap", () => {
            controller.abort();
            resizeObserver.disconnect();
            clearTimeout(timeout);
        }, { once: true, signal });
        update();
    });
}

initializeProposalCarousels();
document.addEventListener("astro:page-load", initializeProposalCarousels);

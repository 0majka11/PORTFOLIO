document.addEventListener("DOMContentLoaded", () => {

    const sections = ["home", "about", "projects", "expertise", "contact"];

    const stage = document.getElementById("carousel-stage");
    const panels = Array.from(document.querySelectorAll(".carousel-panel"));

    const arrowLeftBig = document.getElementById("arrow-left-big");
    const arrowRightBig = document.getElementById("arrow-right-big");
    const leftLabel = document.querySelector(".arrow-label-left");
    const rightLabel = document.querySelector(".arrow-label-right");

    let currentIndex = 0;      // intentionally unbounded — can go negative or past
                                // sections.length, so navigation always moves exactly
                                // one step in the direction pressed, never the long way
    let floatIndex = 0;

    const EASE = 0.035; // lower = slower, more "liquid" motion

    function normalizeIndex(i) {
        const n = sections.length;
        return ((i % n) + n) % n;
    }

    /* ============================================================
       DEPTH CAROUSEL RENDER LOOP
       Continuously eases floatIndex toward currentIndex every frame.
       Changing currentIndex mid-motion just moves the target — the
       animation smoothly redirects from wherever it currently is,
       which is what makes it interruptible instead of snapping.
       ============================================================ */
       
function render() {
    // Smooth movement
    floatIndex += (currentIndex - floatIndex) * 0.12;

    // FULL STOP when close
    if (Math.abs(currentIndex - floatIndex) < 0.001) {
        floatIndex = currentIndex;
    }

    const activeFloat = floatIndex;
    const activeIndex = normalizeIndex(currentIndex);

    panels.forEach((panel, i) => {

        let offset = i - activeFloat;

        const n = panels.length;
        offset = (((offset % n) + n) % n); // first wrap into [0, n) —
                                            // JS's % keeps the sign of
                                            // negative numbers, so this
                                            // extra +n%n step is required,
                                            // not optional
        if (offset > n / 2) offset -= n;   // then shift into [-n/2, n/2]

        const absOffset = Math.abs(offset);

        panel.style.transform =
        `translate(-50%, -50%)
         translateX(${offset * 60}vw)
         translateZ(${ -absOffset * 300 }px)
         rotateY(${ offset * 22 }deg)
         scale(${ 1 - absOffset * 0.08 })`;

        panel.style.opacity = (absOffset < 0.5) ? "1" : "0.35";
        panel.style.filter = (absOffset < 0.5) ? "none" : "blur(2px)";
        panel.style.zIndex = 100 - Math.round(absOffset * 10);

        panel.style.pointerEvents = (i === activeIndex) ? "auto" : "none";
    });

    requestAnimationFrame(render);
}

render();
    
    function updateArrowLabels() {
        const idx = normalizeIndex(currentIndex);
        let prev = idx - 1;
        if (prev < 0) prev = sections.length - 1;
        let next = idx + 1;
        if (next >= sections.length) next = 0;
        leftLabel.textContent = sections[prev];
        rightLabel.textContent = sections[next];
    }

    function afterNavigate() {
        updateArrowLabels();
        if (sections[normalizeIndex(currentIndex)] === "expertise") {
            animateSkillBars();
        } else {
            resetSkillBars();
        }
    }

    function go(dir) {
    currentIndex += dir; // NEVER normalize here — this preserves direction,
                          // so floatIndex always eases the short way, one
                          // step at a time. normalizeIndex() is only for
                          // array lookups (see afterNavigate, render, etc.)
    afterNavigate();
}

    function goToPage(id) {
    const targetIdx = sections.indexOf(id);
    if (targetIdx === -1) return;

    // direct jump to that page
    currentIndex = targetIdx;
    afterNavigate();
}


    updateArrowLabels();

    arrowLeftBig.addEventListener("click", () => go(-1));
    arrowRightBig.addEventListener("click", () => go(1));

    /* BUTTON PAGE NAVIGATION (e.g. Home buttons linking to other pages) */
    const btnExpertise = document.querySelector("button[onclick*='#expertise']");
    const btnProjects = document.querySelector("button[onclick*='#projects']");
    const btnContact = document.querySelector("button[onclick*='#contact']");
    if (btnExpertise) btnExpertise.onclick = () => goToPage("expertise");
    if (btnProjects) btnProjects.onclick = () => goToPage("projects");
    if (btnContact) btnContact.onclick = () => goToPage("contact");

    /* EXPERTISE TABS — Skills / Certificates toggle */
    const expertiseTabs = document.querySelectorAll(".expertise-tab");
    expertiseTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            expertiseTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            document.querySelectorAll(".expertise-panel").forEach(p => p.classList.remove("active"));
            document.getElementById(`panel-${tab.dataset.tab}`).classList.add("active");
        });
    });

    /* SKILL BAR FILL ANIMATION */
    function resetSkillBars() {
        document.querySelectorAll(".bar span").forEach(bar => { bar.style.width = "0%"; });
    }
    function animateSkillBars() {
        document.querySelectorAll(".bar span").forEach(bar => {
            const target = bar.getAttribute("data-percent");
            requestAnimationFrame(() => { bar.style.width = target + "%"; });
        });
    }

console.log("SCRIPT.JS LOADED");

    /* PHYSICAL DEPTH CARDS — cursor moves a light/shadow across the
       surface via CSS custom properties (--mx, --my). Nothing ever
       rotates; the card itself never moves except a tiny hover-lift
       handled entirely in CSS. */

    function initDepthCards() {
        document.querySelectorAll('.depth-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const mx = ((e.clientX - rect.left) / rect.width) * 100;
                const my = ((e.clientY - rect.top) / rect.height) * 100;
                card.style.setProperty('--mx', mx + '%');
                card.style.setProperty('--my', my + '%');
            });
            card.addEventListener('mouseleave', () => {
                card.style.setProperty('--mx', '50%');
                card.style.setProperty('--my', '50%');
            });
            card.addEventListener('touchmove', (e) => {
                const t = e.touches[0];
                const rect = card.getBoundingClientRect();
                const mx = ((t.clientX - rect.left) / rect.width) * 100;
                const my = ((t.clientY - rect.top) / rect.height) * 100;
                card.style.setProperty('--mx', mx + '%');
                card.style.setProperty('--my', my + '%');
            }, { passive: true });
            card.addEventListener('touchend', () => {
                card.style.setProperty('--mx', '50%');
                card.style.setProperty('--my', '50%');
            });
        });
    }
    initDepthCards();

    /* HOME TITLE — scramble/decode reveal, no 3D, letters lock in
       one at a time left to right like the name is being decrypted */
    function initGlitchTitle() {
        const letters = document.querySelectorAll('.ghost-title .letter');
        if (!letters.length) return;

        const finalChars = Array.from(letters).map(el => el.textContent);
        const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=';

        letters.forEach((el, i) => {
            let cycles = 0;
            const maxCycles = 8 + i * 3; // each letter locks in slightly later than the last
            const interval = setInterval(() => {
                if (cycles < maxCycles) {
                    el.textContent = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
                    cycles++;
                } else {
                    el.textContent = finalChars[i];
                    el.classList.add('locked');
                    clearInterval(interval);
                }
            }, 45);
        });
    }
    initGlitchTitle();

    /* ============================================================
       NAVIGATION INPUT — drag (mouse) and swipe (touch) change pages.
       Vertical touch scroll inside a panel's *-scroll wrapper still
       works normally; only a clearly horizontal gesture on the stage
       itself triggers a page change.
       ============================================================ */

    stage.addEventListener('mousedown', (e) => {
    if (e.target.closest('.about-scroll, .projects-scroll, .expertise-scroll, .contact-scroll')) {
        return;
    }
    dragStartX = e.clientX;
    isSwiping = true;   // ⭐ ADD THIS
});


    window.addEventListener('mouseup', (e) => {
    if (!isSwiping) return;   // ⭐ ADD THIS

    const dx = e.clientX - dragStartX;
    if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);

    dragStartX = null;
    isSwiping = false;
});


    let touchStartX = 0, touchStartY = 0, touchDeltaX = 0, touchDeltaY = 0, isSwiping = false;
    const SWIPE_THRESHOLD = 50;
    const DIRECTION_LOCK_RATIO = 1.6;

    /* MOUSE WHEEL SCROLLING — handled manually rather than left to native
       browser routing. With multiple panels overlapping in real 3D depth
       space (preserve-3d), native wheel-to-scroll targeting becomes
       ambiguous even with pointer-events correctly set — so we take
       direct control: whichever panel is currentIndex gets the scroll. */

    stage.addEventListener('wheel', (e) => {
        const activePanel = panels[normalizeIndex(currentIndex)];
        if (!activePanel) return;
        const scrollEl = activePanel.querySelector(
            '.about-scroll, .projects-scroll, .expertise-scroll, .contact-scroll'
        );
        if (scrollEl) {
            scrollEl.scrollTop += e.deltaY;
            e.preventDefault();
        }
    }, { passive: false });

    stage.addEventListener("touchstart", (e) => {
        const t = e.touches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
        touchDeltaX = 0;
        touchDeltaY = 0;
        isSwiping = false;
    }, { passive: true });

    stage.addEventListener("touchmove", (e) => {
        const t = e.touches[0];
        touchDeltaX = t.clientX - touchStartX;
        touchDeltaY = t.clientY - touchStartY;
        if (Math.abs(touchDeltaX) > Math.abs(touchDeltaY) * DIRECTION_LOCK_RATIO) {
            isSwiping = true;
            e.preventDefault();
        }
    }, { passive: false });

    stage.addEventListener("touchend", () => {
        if (isSwiping && Math.abs(touchDeltaX) > SWIPE_THRESHOLD) {
            go(touchDeltaX < 0 ? 1 : -1);
        }
        isSwiping = false;
        touchDeltaX = 0;
        touchDeltaY = 0;
    }, { passive: true });


});

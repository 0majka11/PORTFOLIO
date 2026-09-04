document.addEventListener("DOMContentLoaded", () => {

    /* ============================================================
       CV DOWNLOAD BUTTONS
       ============================================================ */

    const cvButtons = [
        document.getElementById("cv-download-btn"),
        document.getElementById("cv-download-btn-2")
    ];

    cvButtons.forEach(btn => {
        if (!btn) return;

        // IMPORTANT: do NOT block other event listeners
        btn.addEventListener("click", (e) => {
            e.stopPropagation();   // prevents carousel from swallowing the click
            window.open("files/Andrew_Majka_CV_2026.pdf?v=2", "_blank");
        });
    });

});

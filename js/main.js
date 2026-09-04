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
            window.open("files/Andrzej_Majka_CV.pdf?v=2", "_blank");
        });
    });

});

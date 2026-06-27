// =======================================
// Gallery Viewer
// =======================================

let galleryImages = [];
let galleryIndex = 0;

// ---------------------------------------
// Elements
// ---------------------------------------

const galleryModal = document.getElementById("galleryModal");
const galleryImage = document.getElementById("galleryImage");
const galleryCounter = document.getElementById("galleryCounter");

const galleryPrev = document.getElementById("galleryPrev");
const galleryNext = document.getElementById("galleryNext");
const galleryClose = document.getElementById("galleryClose");
const galleryOverlay = document.querySelector(".gallery-overlay");


// =======================================
// Update Image
// =======================================

function updateGallery() {

    if (!galleryImages.length) return;

    galleryImage.style.opacity = 0;

    setTimeout(() => {

        galleryImage.src = galleryImages[galleryIndex];

        galleryCounter.textContent =
            `${galleryIndex + 1} / ${galleryImages.length}`;

        galleryImage.style.opacity = 1;

    }, 150);

}


// =======================================
// Open Gallery
// =======================================

function openGallery(images, startIndex = 0) {

    if (!images || images.length === 0) return;

    galleryImages = images;
    galleryIndex = startIndex;

    updateGallery();

    galleryModal.classList.add("show");

    document.body.style.overflow = "hidden";

}


// =======================================
// Close Gallery
// =======================================

function closeGallery() {

    galleryModal.classList.remove("show");

    document.body.style.overflow = "";

}


// =======================================
// Next Image
// =======================================

function nextImage() {

    if (!galleryImages.length) return;

    galleryIndex++;

    if (galleryIndex >= galleryImages.length) {

        galleryIndex = 0;

    }

    updateGallery();

}


// =======================================
// Previous Image
// =======================================

function prevImage() {

    if (!galleryImages.length) return;

    galleryIndex--;

    if (galleryIndex < 0) {

        galleryIndex = galleryImages.length - 1;

    }

    updateGallery();

}


// =======================================
// Button Events
// =======================================

galleryNext.addEventListener("click", nextImage);

galleryPrev.addEventListener("click", prevImage);

galleryClose.addEventListener("click", closeGallery);

galleryOverlay.addEventListener("click", closeGallery);


// =======================================
// Keyboard
// =======================================

document.addEventListener("keydown", (e) => {

    if (!galleryModal.classList.contains("show")) return;

    switch (e.key) {

        case "ArrowRight":
            nextImage();
            break;

        case "ArrowLeft":
            prevImage();
            break;

        case "Escape":
            closeGallery();
            break;

    }

});


// =======================================
// Export
// =======================================

window.openGallery = openGallery;

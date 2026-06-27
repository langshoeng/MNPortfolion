console.log("gallery.js loaded");

let galleryImages = [];

let galleryIndex = 0;

const modal = document.getElementById("galleryModal");

const image = document.getElementById("galleryImage");

const counter = document.getElementById("galleryCounter");

function openGallery(images, index = 0){

    galleryImages = images;

    galleryIndex = index;

    image.src = galleryImages[galleryIndex];

    counter.textContent =
        `${galleryIndex + 1} / ${galleryImages.length}`;

    modal.classList.add("show");

}

window.openGallery = openGallery;

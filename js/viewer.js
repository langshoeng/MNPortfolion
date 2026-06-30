// ===========================================
// PROJECT VIEWER V2
// ===========================================

const viewer = document.getElementById("projectViewer");
const viewerWindow = document.querySelector(".viewer-window");

const viewerMedia = document.getElementById("viewerMedia");

const viewerTitle = document.getElementById("viewerTitle");
const viewerMeta = document.getElementById("viewerMeta");
const viewerDescription = document.getElementById("viewerDescription");
const viewerSoftware = document.getElementById("viewerSoftware");

const viewerPrev = document.getElementById("viewerPrevMedia");
const viewerNext = document.getElementById("viewerNextMedia");

const viewerDots = document.getElementById("viewerDots");
const viewerCounter = document.getElementById("viewerCounter");


// ===========================================
// CURRENT STATE
// ===========================================

let currentProject = null;

let currentGallery = [];

let currentImage = 0;

// ===========================================
// Missing Image Placeholder
// ===========================================
function createMissingPlaceholder() {
    const div = document.createElement("div");
    div.className = "missing-media";
    div.textContent = "Preview not available";
    return div;
}

// Fullscreen toggle
function toggleFullscreen() {
    viewerWindow.classList.toggle("fullscreen-mode");
}

// Zoom controls
let zoomLevel = 1;
let offsetX = 0, offsetY = 0;

function applyZoom(img) {
    img.style.transform = `scale(${zoomLevel}) translate(${offsetX}px, ${offsetY}px)`;
}

function zoomIn() {
    zoomLevel += 0.25;
    const img = document.getElementById("viewerGalleryImage");
    if (img) applyZoom(img);
}

function zoomOut() {
    zoomLevel = Math.max(1, zoomLevel - 0.25);
    const img = document.getElementById("viewerGalleryImage");
    if (img) applyZoom(img);
}

// ===========================================
// Spinner between each transition
// ===========================================
function showLoadingSpinner() {
    const overlay = document.createElement("div");
    overlay.className = "viewer-loading";

    const spinner = document.createElement("div");
    spinner.className = "viewer-spinner";

    overlay.appendChild(spinner);
    viewerMedia.appendChild(overlay);
}

function hideLoadingSpinner() {
    const overlay = viewerMedia.querySelector(".viewer-loading");
    if (overlay) overlay.remove();
}

// ===========================================
// YOUTUBE
// ===========================================

function getYoutubeEmbed(url){

    let id = "";

    try{

        const u = new URL(url);

        if(u.hostname.includes("youtu.be")){

            id = u.pathname.substring(1);

        }else{

            id = u.searchParams.get("v");

        }

    }catch(e){

        return "";

    }

    return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;

}


// ===========================================
// OPEN PROJECT
// ===========================================

function openProject(project){

    currentProject = project;

    currentGallery = [];

    currentImage = 0;

    viewer.classList.add("show");

    // Reset viewer mode
    viewerWindow.classList.remove(
        "gallery-mode",
        "video-mode"
    );

    // Hide gallery controls by default
    viewerPrev.style.display = "none";
    viewerNext.style.display = "none";

    viewerMedia.innerHTML = "";

    viewerDots.innerHTML = "";

    viewerCounter.textContent = "";


    // ======================================
    // TITLE
    // ======================================

    viewerTitle.textContent = project.title || "";


    // ======================================
    // META
    // ======================================

    viewerMeta.innerHTML = `

        <div>

            <strong>Client</strong><br>

            ${project.client || "-"}

        </div>

        <div style="margin-top:12px;">

            <strong>Year</strong><br>

            ${project.year || "-"}

        </div>

    `;


    // ======================================
    // DESCRIPTION
    // ======================================

    viewerDescription.textContent =
        project.description || "";


    // ======================================
    // SOFTWARE
    // ======================================

    viewerSoftware.innerHTML = "";

    if(project.software){

        project.software.forEach(app=>{

            const badge =
                document.createElement("span");

            badge.className = "viewerBadge";

            badge.textContent = app;

            viewerSoftware.appendChild(badge);

        });

    }


    // ======================================
    // YOUTUBE
    // ======================================

    if(
        project.video &&
        project.video.type === "youtube"
    ){

        viewerWindow.classList.add("video-mode");

        viewerMedia.innerHTML = `
            <iframe
                src="${getYoutubeEmbed(project.video.url)}"
                allow="autoplay; fullscreen; encrypted-media"
                allowfullscreen
                onerror="this.replaceWith(createMissingPlaceholder())"
            ></iframe>
        `;

        return;

    }


    // ======================================
    // LOCAL VIDEO
    // ======================================

    if(
        project.video &&
        project.video.type === "mp4"
    ){

        viewerWindow.classList.add("video-mode");

        viewerMedia.innerHTML = `
            <video controls autoplay onerror="this.replaceWith(createMissingPlaceholder())">
                <source src="${project.video.url}" type="video/mp4">
            </video>
        `;

        return;

    }


    // ======================================
    // IMAGE GALLERY
    // ======================================

    if(
        project.gallery &&
        project.gallery.length
    ){

        viewerWindow.classList.add("gallery-mode");

        currentGallery = project.gallery;

        currentImage = 0;

        // Show gallery arrows
        viewerPrev.style.display = "";
        viewerNext.style.display = "";

        viewerMedia.innerHTML = `
            <img
                id="viewerGalleryImage"
                src="${currentGallery[0]}"
                alt="Gallery Image"
            >
        `;
        
        const img = document.getElementById("viewerGalleryImage");
        img.onerror = () => {
            viewerMedia.innerHTML = "";
            const placeholder = createMissingPlaceholder();
            viewerMedia.appendChild(placeholder);
        };

        buildViewerGallery();

    }

}

// ===========================================
// BUILD GALLERY
// ===========================================

function buildViewerGallery(){

    viewerPrev.onclick = previousViewerImage;

    viewerNext.onclick = nextViewerImage;

    updateViewerGallery();

}


// ===========================================
// UPDATE GALLERY
// ===========================================

function updateViewerGallery() {
    let galleryImg = document.getElementById("viewerGalleryImage");

    // If placeholder was showing, rebuild <img>
    if (!galleryImg) {
        viewerMedia.innerHTML = `<img id="viewerGalleryImage" alt="Gallery Image">`;
        galleryImg = document.getElementById("viewerGalleryImage");
    }

    const nextSrc = currentGallery[currentImage];
    const preload = new Image();
    preload.src = nextSrc;

    // Show spinner while loading
    showLoadingSpinner();

    preload.onload = () => {
        // Swap immediately to the new image
        galleryImg.src = nextSrc;

        // Start with opacity 0, then fade in
        galleryImg.style.transition = "opacity 0.3s ease";
        galleryImg.style.opacity = "0";

        requestAnimationFrame(() => {
            galleryImg.style.opacity = "1";
        });

        hideLoadingSpinner();
    };

    preload.onerror = () => {
        hideLoadingSpinner();
        const placeholder = createMissingPlaceholder();
        placeholder.style.opacity = "1";
        galleryImg.replaceWith(placeholder);
    };

    // Update counter and dots
    viewerCounter.textContent = `${currentImage + 1} of ${currentGallery.length}`;
    preloadGallery();

    viewerDots.innerHTML = "";
    currentGallery.forEach((image, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = index === currentImage ? "viewerDot active" : "viewerDot";
        dot.onclick = () => {
            currentImage = index;
            updateViewerGallery();
        };
        viewerDots.appendChild(dot);
    });
}

// ===========================================
// NEXT IMAGE
// ===========================================
function nextViewerImage() {
    if (!currentGallery.length) return;
    currentImage = (currentImage + 1) % currentGallery.length;
    updateViewerGallery();
}

// ===========================================
// PREVIOUS IMAGE
// ===========================================
function previousViewerImage() {
    if (!currentGallery.length) return;
    currentImage = (currentImage - 1 + currentGallery.length) % currentGallery.length;
    updateViewerGallery();
}


function preloadGallery(){

    if(currentGallery.length<2)
        return;

    const next =
        new Image();

    next.src =
        currentGallery[
            (currentImage+1)
            %
            currentGallery.length
        ];

    const prev =
        new Image();

    prev.src =
        currentGallery[
            (currentImage-1+currentGallery.length)
            %
            currentGallery.length
        ];

}

document.addEventListener("load",(e)=>{

    if(e.target.id==="viewerGalleryImage"){

        e.target.style.opacity="1";

    }

},true);


// ===========================================
// CLOSE
// ===========================================

function closeProject(){

    viewer.classList.remove("show");

    viewerWindow.classList.remove(
        "gallery-mode",
        "video-mode"
    );

    viewerMedia.innerHTML = "";

    viewerDots.innerHTML = "";

    viewerCounter.textContent = "";

    currentGallery = [];

    currentImage = 0;

    currentProject = null;

}


// ===========================================
// BUTTON EVENTS
// ===========================================

document
.getElementById("viewerClose")
.onclick = closeProject;


document
.querySelector(".viewer-overlay")
.onclick = closeProject;


// ===========================================
// KEYBOARD
// ===========================================

document.addEventListener("keydown",(e)=>{

    if(!viewer.classList.contains("show"))
        return;

    switch(e.key){

        case "Escape":

            closeProject();

            break;

        case "ArrowLeft":

            if(currentGallery.length){

                previousViewerImage();

            }

            break;

        case "ArrowRight":

            if(currentGallery.length){

                nextViewerImage();

            }

            break;

    }

});

// Double-click image to toggle fullscreen
document.addEventListener("dblclick", e => {
    if (e.target.id === "viewerGalleryImage") {
        toggleFullscreen();
    }
});

// Mouse wheel zoom
document.addEventListener("wheel", e => {
    const img = document.getElementById("viewerGalleryImage");
    if (!img) return;
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
});

// Drag to pan when zoomed
let isDragging = false, startX, startY;
document.addEventListener("mousedown", e => {
    const img = document.getElementById("viewerGalleryImage");
    if (!img) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
});
document.addEventListener("mouseup", () => { isDragging = false; });
document.addEventListener("mousemove", e => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    startX = e.clientX;
    startY = e.clientY;
    offsetX += dx / zoomLevel;
    offsetY += dy / zoomLevel;
    const img = document.getElementById("viewerGalleryImage");
    if (img) applyZoom(img);
});

// ===========================================
// GLOBAL
// ===========================================

window.openProject = openProject;

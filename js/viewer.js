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

// Touch gesture state
let touchStartX = 0, touchStartY = 0;
let initialDistance = 0;
let pinchZoomLevel = 1;

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
    if (viewerWindow.classList.contains("fullscreen-mode")) {
        enableFullscreenGestures();
        updateArrowState(); // <-- add here
    } else {
        disableFullscreenGestures();
        zoomLevel = 1; offsetX = 0; offsetY = 0;
        const img = document.getElementById("viewerGalleryImage");
        if (img) applyZoom(img);
        updateArrowState();
    }
}

// Zoom controls
let zoomLevel = 1;
let offsetX = 0, offsetY = 0;

function applyZoom(img) {
    img.style.transform = `scale(${zoomLevel}) translate(${offsetX}px, ${offsetY}px)`;
    updateArrowState();
}

function updateArrowState() {
    if (zoomLevel > 1) {
        viewerPrev.classList.add("disabled");
        viewerNext.classList.add("disabled");
    } else {
        viewerPrev.classList.remove("disabled");
        viewerNext.classList.remove("disabled");
    }
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

function getDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx*dx + dy*dy);
}

// Pinch Gesture Handlers (fullscreen only)
let pinchActive = false;
let pinchJustEnded = false;

function pinchStart(e) {
    if (e.touches.length === 2) {
        initialDistance = getDistance(e.touches);
        pinchZoomLevel = zoomLevel;
        pinchActive = true; // mark pinch as active
    }
}

function pinchMove(e) {
    if (e.touches.length === 2) {
        e.preventDefault(); // block browser zoom
        const newDistance = getDistance(e.touches);
        const scaleChange = newDistance / initialDistance;
        zoomLevel = Math.min(4, Math.max(1, pinchZoomLevel * scaleChange));
        applyZoom(document.getElementById("viewerGalleryImage"));
    }
}

function pinchEnd(e) {
    if (e.touches.length === 0) {
        pinchActive = false;
        pinchJustEnded = true;
        setTimeout(() => { pinchJustEnded = false; }, 100); // short guard window
    }
}

// ===========================================
// Double‑tap to Zoom (fullscreen only)
// ===========================================
let lastTapTime = 0;

function handleDoubleTap(e) {
    if (!viewerWindow.classList.contains("fullscreen-mode")) return;
    if (e.target.id !== "viewerGalleryImage") return;

    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;

    if (tapLength < 300 && tapLength > 0) {
        // Double‑tap detected
        if (zoomLevel === 1) {
            zoomLevel = 2; // zoom in
        } else {
            zoomLevel = 1; offsetX = 0; offsetY = 0; // reset zoom
        }
        applyZoom(document.getElementById("viewerGalleryImage"));
    }

    lastTapTime = currentTime;
}

document.addEventListener("touchend", handleDoubleTap, { passive:true });


// ===========================================
// Touch Drag to Pan (fullscreen only)
// ===========================================
let isTouchDragging = false;
let lastTouchX = 0, lastTouchY = 0;

function touchDragStart(e) {
    if (!viewerWindow.classList.contains("fullscreen-mode")) return;
    if (e.touches.length === 1 && zoomLevel > 1) {
        isTouchDragging = true;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
    }
}

function touchDragMove(e) {
    if (!isTouchDragging) return;
    if (e.touches.length === 1) {
        e.preventDefault(); // prevent page scroll
        const dx = e.touches[0].clientX - lastTouchX;
        const dy = e.touches[0].clientY - lastTouchY;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
        offsetX += dx / zoomLevel;
        offsetY += dy / zoomLevel;
        const img = document.getElementById("viewerGalleryImage");
        if (img) applyZoom(img);
    }
}

function touchDragEnd(e) {
    isTouchDragging = false;
}

// ===========================================
// Swipe Navigation (fullscreen only, safe threshold)
// ===========================================
let swipeStartX = 0, swipeStartY = 0;
let isSwipeCandidate = false;

document.addEventListener("touchstart", e => {
    if (!viewerWindow.classList.contains("fullscreen-mode")) return;

    // Only allow swipe if one finger AND not zoomed
    if (e.touches.length === 1 && zoomLevel === 1) {
        swipeStartX = e.touches[0].clientX;
        swipeStartY = e.touches[0].clientY;
        isSwipeCandidate = true;
    } else {
        isSwipeCandidate = false;
    }
}, { passive:true });

document.addEventListener("touchend", e => {
    if (!viewerWindow.classList.contains("fullscreen-mode")) return;
    if (!isSwipeCandidate) return;
    if (pinchActive) return;
    if (pinchJustEnded) return;   // <-- new guard
    if (zoomLevel > 1) return;

    const dx = e.changedTouches[0].clientX - swipeStartX;
    const dy = e.changedTouches[0].clientY - swipeStartY;

    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) previousViewerImage();
        else nextViewerImage();
    }
    isSwipeCandidate = false;
}, { passive:true });

function enableFullscreenGestures() {
    document.addEventListener("touchstart", pinchStart, { passive:false });
    document.addEventListener("touchmove", pinchMove, { passive:false });
    document.addEventListener("touchend", pinchEnd, { passive:false });

    document.addEventListener("touchstart", touchDragStart, { passive:false });
    document.addEventListener("touchmove", touchDragMove, { passive:false });
    document.addEventListener("touchend", touchDragEnd, { passive:false });
}

function disableFullscreenGestures() {
    document.removeEventListener("touchstart", pinchStart);
    document.removeEventListener("touchmove", pinchMove);
    document.removeEventListener("touchend", pinchEnd);

    document.removeEventListener("touchstart", touchDragStart);
    document.removeEventListener("touchmove", touchDragMove);
    document.removeEventListener("touchend", touchDragEnd);
}

// ===========================================
// Close Button Behavior
// ===========================================
function handleCloseButton() {
    const img = document.getElementById("viewerGalleryImage");

    // If image exists, check transform state
    const isTransformed = (zoomLevel !== 1 || offsetX !== 0 || offsetY !== 0);

    if (viewerWindow.classList.contains("fullscreen-mode")) {
        if (isTransformed) {
            // Case 1: fullscreen + zoomed/panned
            zoomLevel = 1;
            offsetX = 0;
            offsetY = 0;
            if (img) applyZoom(img);
            return;
        } else {
            // Case 2: fullscreen + default transform
            toggleFullscreen(); // exit fullscreen back to metadata mode
            return;
        }
    } else {
        if (isTransformed) {
            // Case 3: metadata mode + zoomed/panned
            zoomLevel = 1;
            offsetX = 0;
            offsetY = 0;
            if (img) applyZoom(img);
            return;
        } else {
            // Case 4: metadata mode + default transform
            closeProject(); // exit viewer entirely
        }
    }
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

    if (!galleryImg) {
        viewerMedia.innerHTML = `<img id="viewerGalleryImage" alt="Gallery Image" class="zoomable">`;
        galleryImg = document.getElementById("viewerGalleryImage");
    }

    const nextSrc = currentGallery[currentImage];
    const preload = new Image();
    preload.src = nextSrc;

    showLoadingSpinner();

    preload.onload = () => {
        galleryImg.src = nextSrc;
        galleryImg.style.opacity = "0";

        hideLoadingSpinner();

        requestAnimationFrame(() => {
            galleryImg.style.transition = "opacity 0.3s ease";
            galleryImg.style.opacity = "1";
        });

    };

    preload.onerror = () => {
        hideLoadingSpinner();
        const placeholder = createMissingPlaceholder();
        placeholder.style.opacity = "1";
        galleryImg.replaceWith(placeholder);
    };

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
    zoomLevel = 1; offsetX = 0; offsetY = 0; // reset here
    updateViewerGallery();
}

// ===========================================
// PREVIOUS IMAGE
// ===========================================
function previousViewerImage() {
    if (!currentGallery.length) return;
    currentImage = (currentImage - 1 + currentGallery.length) % currentGallery.length;
    zoomLevel = 1; offsetX = 0; offsetY = 0; // reset here
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

// Close button (X) with layered behavior
document.getElementById("viewerClose").addEventListener("click", handleCloseButton);

// Overlay click always closes viewer
document.querySelector(".viewer-overlay").addEventListener("click", closeProject);

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

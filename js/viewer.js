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

const fullscreenBtn = document.getElementById("viewerFullscreenToggle");

const viewerDots = document.getElementById("viewerDots");
const viewerCounter = document.getElementById("viewerCounter");

// Touch gesture state
let touchStartX = 0, touchStartY = 0;
let initialDistance = 0;
let pinchZoomLevel = 1;

let savedScrollY = 0;

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

// Fullscreen button click
if (fullscreenBtn) {
  fullscreenBtn.addEventListener("click", toggleFullscreen);
}

// ✅ Global double-click fullscreen binding
document.addEventListener("dblclick", e => {
  const img = document.getElementById("viewerGalleryImage");
  if (img && e.target === img) {
    toggleFullscreen();
  }
});

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

// Pinch Gesture Handlers
let pinchActive = false;
let pinchJustEnded = false;

function pinchStart(e) {
    if (e.touches.length === 2) {
        initialDistance = getDistance(e.touches);
        pinchZoomLevel = zoomLevel;
        pinchActive = true;
    }
}

function pinchMove(e) {
    if (e.touches.length === 2) {
        e.preventDefault();
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
        setTimeout(() => { pinchJustEnded = false; }, 100);
    }
}

// Double‑tap to Zoom
let lastTapTime = 0;
function handleDoubleTap(e) {
    if (!viewerWindow.classList.contains("fullscreen-mode")) return;
    if (e.target.id !== "viewerGalleryImage") return;

    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;

    if (tapLength < 300 && tapLength > 0) {
        if (zoomLevel === 1) {
            zoomLevel = 2;
        } else {
            zoomLevel = 1; offsetX = 0; offsetY = 0;
        }
        applyZoom(document.getElementById("viewerGalleryImage"));
    }
    lastTapTime = currentTime;
}
document.addEventListener("touchend", handleDoubleTap, { passive:true });

// Touch Drag to Pan
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
        e.preventDefault();
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
function touchDragEnd(e) { isTouchDragging = false; }

// Swipe Navigation
let swipeStartX = 0, swipeStartY = 0;
let isSwipeCandidate = false;

document.addEventListener("touchstart", e => {
    if (!viewerWindow.classList.contains("fullscreen-mode")) return;
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
    if (pinchActive || pinchJustEnded || zoomLevel > 1) return;

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

// Close Button Behavior
function handleCloseButton() {
    const img = document.getElementById("viewerGalleryImage");
    const isTransformed = (zoomLevel !== 1 || offsetX !== 0 || offsetY !== 0);

    if (viewerWindow.classList.contains("fullscreen-mode")) {
        if (isTransformed) {
            zoomLevel = 1; offsetX = 0; offsetY = 0;
            if (img) applyZoom(img);
            return;
        } else {
            toggleFullscreen();
            return;
        }
    } else {
        if (isTransformed) {
            zoomLevel = 1; offsetX = 0; offsetY = 0;
            if (img) applyZoom(img);
            return;
        } else {
            closeProject();
        }
    }
}

// Spinner
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
    try {
        const u = new URL(url);
        if (u.hostname.includes("youtu.be")) {
            id = u.pathname.substring(1);
        } else {
            id = u.searchParams.get("v");
        }
    } catch(e) {
        return "";
    }
    return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
}

// ===========================================
// OPEN PROJECT
// ===========================================
function openProject(project) {
    currentProject = project;
    currentGallery = [];
    currentImage = 0;

    viewer.classList.add("show");

    // Save current homepage scroll position
    savedScrollY = window.scrollY;

    // Reset fullscreen state
    viewerWindow.classList.remove("fullscreen-mode");
    zoomLevel = 1; offsetX = 0; offsetY = 0;

    // Block homepage scroll while viewer is open
    viewerWindow.addEventListener("wheel", blockPageScroll, { passive:false });
    viewerWindow.addEventListener("touchmove", blockPageScroll, { passive:false });

    // Listen for Escape key
    document.addEventListener("keydown", handleEscapeKey);

    // Reset viewer mode
    viewerWindow.classList.remove("gallery-mode", "video-mode");

    // Hide gallery controls by default
    viewerPrev.style.display = "none";
    viewerNext.style.display = "none";

    viewerMedia.innerHTML = "";
    viewerDots.innerHTML = "";
    viewerCounter.textContent = "";

    // Title
    viewerTitle.textContent = project.title || "";

    // Meta
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

    // Description
    viewerDescription.textContent = project.description || "";

    // Software badges
    viewerSoftware.innerHTML = "";
    if (project.software) {
        project.software.forEach(app => {
            const badge = document.createElement("span");
            badge.className = "viewerBadge";
            badge.textContent = app;
            viewerSoftware.appendChild(badge);
        });
    }

    // Video (YouTube or local)
    if (project.video && project.video.type === "youtube") {
        viewerWindow.classList.add("video-mode");
        viewerMedia.innerHTML = `
            <iframe
                src="${getYoutubeEmbed(project.video.url)}"
                frameborder="0"
                allow="autoplay; fullscreen; encrypted-media"
                onerror="this.replaceWith(createMissingPlaceholder())"
            ></iframe>
        `;
        return;
    }
    if (project.video && project.video.type === "mp4") {
        viewerWindow.classList.add("video-mode");
        viewerMedia.innerHTML = `
            <video controls autoplay onerror="this.replaceWith(createMissingPlaceholder())">
                <source src="${project.video.url}" type="video/mp4">
            </video>
        `;
        return;
    }

    // Gallery
    if (project.gallery && project.gallery.length) {
        viewerWindow.classList.add("gallery-mode");
        currentGallery = project.gallery;
        currentImage = 0;

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
        viewerMedia.innerHTML = `<img id="viewerGalleryImage" alt="Gallery Image" class="zoomable">`;
        galleryImg = document.getElementById("viewerGalleryImage");
    }

    const nextSrc = currentGallery[currentImage];
    const preload = new Image();
    preload.src = nextSrc;

    // Show spinner while loading
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

    // Update counter and preload neighbors
    viewerCounter.textContent = `${currentImage + 1} of ${currentGallery.length}`;
    preloadGallery();

    // Update dots
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

// ===========================================
// PRELOAD NEIGHBORS
// ===========================================
function preloadGallery(){
    if(currentGallery.length < 2) return;

    const next = new Image();
    next.src = currentGallery[(currentImage+1) % currentGallery.length];

    const prev = new Image();
    prev.src = currentGallery[(currentImage-1+currentGallery.length) % currentGallery.length];
}

// ===========================================
// IMAGE LOAD FADE-IN
// ===========================================
document.addEventListener("load",(e)=>{
    if(e.target.id==="viewerGalleryImage"){
        e.target.style.opacity="1";
    }
}, true);

// ===========================================
// BLOCK PAGE SCROLL
// ===========================================
function blockPageScroll(e) {
    if (!viewer.classList.contains("show")) return;

    // If the event is inside the viewer media (image/video), let zoom/pan handlers run
    if (viewerMedia.contains(e.target)) {
        return; // allow zoom/pan
    }

    // Otherwise block homepage scroll
    e.preventDefault();
    e.stopPropagation();
}

// ===========================================
// ESCAPE KEY HANDLER
// ===========================================
function handleEscapeKey(e) {
  if (!viewer.classList.contains("show")) return;

  if (e.key === "Escape") {
    if (document.fullscreenElement) {
      // Exit fullscreen only
      document.exitFullscreen();
    } else {
      // Not in fullscreen → close viewer
      closeProject();
    }
  }
  if (e.key === "ArrowLeft" && currentGallery.length) {
    previousViewerImage();
  }
  if (e.key === "ArrowRight" && currentGallery.length) {
    nextViewerImage();
  }
}

// ===========================================
// CLOSE
// ===========================================
function closeProject() {
    window.scrollTo(0, savedScrollY);

    viewerWindow.removeEventListener("wheel", blockPageScroll);
    viewerWindow.removeEventListener("touchmove", blockPageScroll);

    document.removeEventListener("keydown", handleEscapeKey);

    viewer.classList.remove("show");
    viewerWindow.classList.remove("gallery-mode", "video-mode");

    viewerMedia.innerHTML = "";
    viewerDots.innerHTML = "";
    viewerCounter.textContent = "";

    currentGallery = [];
    currentImage = 0;
    currentProject = null;
}

// ===========================================
// FULLSCREEN TOGGLE
// ===========================================
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    viewerWindow.requestFullscreen().then(() => {
      viewerWindow.classList.add("fullscreen-mode");
      enableFullscreenGestures();
    }).catch(err => console.error("Fullscreen error:", err));
  } else {
    document.exitFullscreen().then(() => {
      disableFullscreenGestures();
    });
  }
}

// ===========================================
// FULLSCREEN CHANGE LISTENER
// ===========================================
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement && viewerWindow.classList.contains("fullscreen-mode")) {
    viewerWindow.classList.remove("fullscreen-mode");
    zoomLevel = 1; offsetX = 0; offsetY = 0;
    const img = document.getElementById("viewerGalleryImage");
    if (img) applyZoom(img);
    disableFullscreenGestures();
  }
});

// ===========================================
// BUTTON EVENTS
// ===========================================

// Close button (X) with layered behavior
document.getElementById("viewerClose").addEventListener("click", handleCloseButton);

// Overlay click always closes viewer
document.querySelector(".viewer-overlay").addEventListener("click", closeProject);

// ===========================================
// KEYBOARD + MOUSE
// ===========================================

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

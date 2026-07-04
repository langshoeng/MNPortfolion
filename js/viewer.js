// ===========================================
// PROJECT VIEWER V2
// ===========================================

const viewer = document.getElementById("projectViewer");
const viewerWindow = document.querySelector(".viewer-window");
const viewerMedia = document.getElementById("viewerMedia"); // ✅ container

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

// Fullscreen toggle
function toggleFullscreen() {
  const wrapper = document.getElementById("viewerMediaWrapper");

  if (viewerWindow.classList.contains("fullscreen-mode")) {
    // Exit fullscreen
    viewerWindow.classList.remove("fullscreen-mode");

    if (wrapper) {
      wrapper.style.removeProperty("aspect-ratio");
      wrapper.style.width = "";
      wrapper.style.height = "";
    }
  } else {
    // Enter fullscreen
    viewerWindow.classList.add("fullscreen-mode");

    if (wrapper) {
      wrapper.style.aspectRatio = "auto";
      wrapper.style.width = "100%";
      wrapper.style.height = "100%";
    }
  }
}

// Fullscreen button click
if (fullscreenBtn) {
  fullscreenBtn.addEventListener("click", toggleFullscreen);
}

// Zoom controls
let zoomLevel = 1;
let offsetX = 0, offsetY = 0;

function applyZoom(img) {
  img.style.transformOrigin = "center center"; // ✅ zoom from center
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
  const img = viewerMedia.querySelector(".viewer-media");
  if (img) applyZoom(img);
}

function zoomOut() {
  zoomLevel = Math.max(1, zoomLevel - 0.25);
  const img = viewerMedia.querySelector(".viewer-media");
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
    pinchActive = true;
  }
}

function pinchMove(e) {
  if (e.touches.length === 2) {
    e.preventDefault();
    const newDistance = getDistance(e.touches);
    const scaleChange = newDistance / initialDistance;
    zoomLevel = Math.min(4, Math.max(1, pinchZoomLevel * scaleChange));
    const img = viewerMedia.querySelector(".viewer-media");
    if (img) applyZoom(img);
  }
}

function pinchEnd(e) {
  if (e.touches.length === 0) {
    pinchActive = false;
    pinchJustEnded = true;
    setTimeout(() => { pinchJustEnded = false; }, 100);
  }
}

// ===========================================
// Double‑tap to Zoom (fullscreen only)
// ===========================================
let lastTapTime = 0;

function handleDoubleTap(e) {
  if (!viewerWindow.classList.contains("fullscreen-mode")) return;
  const img = viewerMedia.querySelector(".viewer-media");
  if (!img || e.target !== img) return;

  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTapTime;

  if (tapLength < 300 && tapLength > 0) {
    if (zoomLevel === 1) {
      zoomLevel = 2;
    } else {
      zoomLevel = 1; offsetX = 0; offsetY = 0;
    }
    applyZoom(img);
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
    e.preventDefault();
    const dx = e.touches[0].clientX - lastTouchX;
    const dy = e.touches[0].clientY - lastTouchY;
    lastTouchX = e.touches[0].clientX;
    lastTouchY = e.touches[0].clientY;
    offsetX += dx / zoomLevel;
    offsetY += dy / zoomLevel;
    const img = viewerMedia.querySelector(".viewer-media");
    if (img) applyZoom(img);
  }
}

function touchDragEnd(e) {
  isTouchDragging = false;
}

// ===========================================
// Swipe Navigation (fullscreen only)
// ===========================================
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
  if (pinchActive) return;
  if (pinchJustEnded) return;
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
// OPEN PROJECT (final corrected version)
// ===========================================
function openProject(project) {
  currentProject = project;
  currentGallery = [];
  currentImage = 0;

  // ✅ Guard: make sure container exists
  const viewerMedia = document.getElementById("viewerMedia");
  if (!viewerMedia) {
    console.error("viewerMedia container not found in DOM");
    return;
  }

  viewer.classList.add("show");
  savedScrollY = window.scrollY;

  viewerWindow.classList.remove("fullscreen-mode");
  zoomLevel = 1; offsetX = 0; offsetY = 0;

  viewerWindow.addEventListener("wheel", blockPageScroll, { passive:false });
  viewerWindow.addEventListener("touchmove", blockPageScroll, { passive:false });

  viewerWindow.classList.remove("gallery-mode","video-mode");
  viewerPrev.style.display = "none";
  viewerNext.style.display = "none";

  viewerMedia.innerHTML = "";
  viewerDots.innerHTML = "";
  viewerCounter.textContent = "";

  // Metadata
  viewerTitle.textContent = project.title || "";
  viewerMeta.innerHTML = `
      <div><strong>Client</strong><br>${project.client || "-"}</div>
      <div style="margin-top:12px;"><strong>Year</strong><br>${project.year || "-"}</div>
  `;
  viewerDescription.textContent = project.description || "";

  viewerSoftware.innerHTML = "";
  if (project.software) {
    project.software.forEach(app => {
      const badge = document.createElement("span");
      badge.className = "viewerBadge";
      badge.textContent = app;
      viewerSoftware.appendChild(badge);
    });
  }

  // Video (YouTube)
  if (project.video && project.video.type === "youtube") {
    viewerWindow.classList.add("video-mode");
    viewerMedia.innerHTML = `
        <iframe class="viewer-media"
            src="${getYoutubeEmbed(project.video.url)}"
            frameborder="0"
            allow="autoplay; fullscreen; encrypted-media"
            onerror="this.replaceWith(createMissingPlaceholder())"></iframe>
    `;
    return;
  }

  // Video (MP4)
  if (project.video && project.video.type === "mp4") {
    viewerWindow.classList.add("video-mode");
    viewerMedia.innerHTML = `
        <video class="viewer-media" controls autoplay onerror="this.replaceWith(createMissingPlaceholder())">
            <source src="${project.video.url}" type="video/mp4">
        </video>
    `;
    return;
  }

  // Image gallery
  if (project.gallery && project.gallery.length) {
    viewerWindow.classList.add("gallery-mode");
    currentGallery = project.gallery;
    currentImage = 0;

    viewerPrev.style.display = "";
    viewerNext.style.display = "";

    viewerMedia.innerHTML = `
        <img src="${currentGallery[0]}"
             class="viewer-media"
             alt="Gallery Image">
    `;
    const img = viewerMedia.querySelector(".viewer-media");

    img.onerror = () => {
      viewerMedia.innerHTML = "";
      const placeholder = createMissingPlaceholder();
      viewerMedia.appendChild(placeholder);
    };

    buildViewerGallery();
  }
}


// ===========================================
// Build Viewer Gallery
// ===========================================
function buildViewerGallery() {
  viewerDots.innerHTML = "";
  viewerCounter.textContent = `${currentImage + 1} / ${currentGallery.length}`;

  currentGallery.forEach((src, index) => {
    const dot = document.createElement("span");
    dot.className = "viewerDot";
    if (index === currentImage) dot.classList.add("active");

    dot.addEventListener("click", () => {
      showGalleryImage(index);
    });

    viewerDots.appendChild(dot);
  });
}

// ===========================================
// Show Gallery Image
// ===========================================
function showGalleryImage(index) {
  currentImage = index;

  viewerMedia.innerHTML = `
    <img src="${currentGallery[currentImage]}"
         class="viewer-media"
         alt="Gallery Image">
  `;

  const img = viewerMedia.querySelector(".viewer-media");

  img.onerror = () => {
    viewerMedia.innerHTML = "";
    const placeholder = createMissingPlaceholder();
    viewerMedia.appendChild(placeholder);
  };

  // Update dots and counter
  Array.from(viewerDots.children).forEach((dot, i) => {
    dot.classList.toggle("active", i === currentImage);
  });
  viewerCounter.textContent = `${currentImage + 1} / ${currentGallery.length}`;
}

// ===========================================
// Navigation (Prev/Next)
// ===========================================
viewerPrev.addEventListener("click", () => {
  if (currentGallery.length) {
    const newIndex = (currentImage - 1 + currentGallery.length) % currentGallery.length;
    showGalleryImage(newIndex);
  }
});

viewerNext.addEventListener("click", () => {
  if (currentGallery.length) {
    const newIndex = (currentImage + 1) % currentGallery.length;
    showGalleryImage(newIndex);
  }
});


// ===========================================
// Preload Gallery
// ===========================================
function preloadGallery() {
  if (currentGallery.length < 2) return;

  const next = new Image();
  next.src = currentGallery[(currentImage + 1) % currentGallery.length];

  const prev = new Image();
  prev.src = currentGallery[(currentImage - 1 + currentGallery.length) % currentGallery.length];
}

// ===========================================
// Block Page Scroll
// ===========================================
function blockPageScroll(e) {
  if (!viewer.classList.contains("show")) return;

  // Allow zoom/pan inside viewer media
  if (viewerMedia.contains(e.target)) return;

  e.preventDefault();
  e.stopPropagation();
}

// ===========================================
// Close Project
// ===========================================
function closeProject() {
  window.scrollTo(0, savedScrollY);

  viewerWindow.removeEventListener("wheel", blockPageScroll);
  viewerWindow.removeEventListener("touchmove", blockPageScroll);

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
// Button Events
// ===========================================
document.getElementById("viewerClose").addEventListener("click", handleCloseButton);
document.querySelector(".viewer-overlay").addEventListener("click", closeProject);

// ===========================================
// Keyboard Navigation
// ===========================================
document.addEventListener("keydown", (e) => {
  if (!viewer.classList.contains("show")) return;

  switch (e.key) {
    case "Escape":
      handleCloseButton();
      break;
    case "ArrowLeft":
      if (currentGallery.length) {
        const newIndex = (currentImage - 1 + currentGallery.length) % currentGallery.length;
        showGalleryImage(newIndex);
      }
      break;
    case "ArrowRight":
      if (currentGallery.length) {
        const newIndex = (currentImage + 1) % currentGallery.length;
        showGalleryImage(newIndex);
      }
      break;
  }
});

// Desktop double-click
function handleDoubleClick(e) {
  if (!viewer.classList.contains("show")) return;
  const img = viewerMedia.querySelector(".viewer-media");
  if (!img || e.target !== img) return;

  const wrapper = document.getElementById("viewerMediaWrapper");

  if (viewerWindow.classList.contains("fullscreen-mode")) {
    // Exit fullscreen → restore metadata
    viewerWindow.classList.remove("fullscreen-mode");

    if (wrapper) {
      wrapper.style.aspectRatio = "16/9";   // restore default ratio
      wrapper.style.width = "100%";
      wrapper.style.height = "auto";
    }
  } else {
    // Enter fullscreen → true fullscreen
    viewerWindow.classList.add("fullscreen-mode");

    if (wrapper) {
      wrapper.style.aspectRatio = "auto";   // remove ratio constraint
      wrapper.style.width = "100%";
      wrapper.style.height = "100%";
    }
  }
}
viewer.addEventListener("dblclick", handleDoubleClick);

// Mobile double-tap
let lastTapTimeMobile = 0;
function handleDoubleTap(e) {
  if (!viewer.classList.contains("show")) return;
  const img = viewerMedia.querySelector(".viewer-media");
  if (!img || e.target !== img) return;

  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTapTimeMobile;

  if (tapLength < 300 && tapLength > 0) {
    const wrapper = document.getElementById("viewerMediaWrapper");

    if (viewerWindow.classList.contains("fullscreen-mode")) {
      viewerWindow.classList.remove("fullscreen-mode");
      if (wrapper) {
        wrapper.style.aspectRatio = "16/9";
        wrapper.style.width = "100%";
        wrapper.style.height = "auto";
      }
    } else {
      viewerWindow.classList.add("fullscreen-mode");
      if (wrapper) {
        wrapper.style.aspectRatio = "auto";
        wrapper.style.width = "100%";
        wrapper.style.height = "100%";
      }
    }
  }
  lastTapTimeMobile = currentTime;
}
viewer.addEventListener("touchend", handleDoubleTap, { passive:true });

// ===========================================
// Mouse wheel zoom (desktop)
// ===========================================
document.addEventListener("wheel", e => {
  if (!viewer.classList.contains("show")) return;
  const img = viewerMedia.querySelector(".viewer-media");
  if (!img) return;

  e.preventDefault(); // stop page scroll while zooming

  if (e.deltaY < 0) {
    zoomIn();   // zoom in
  } else {
    zoomOut();  // zoom out
  }

  // ✅ Apply transform immediately
  applyZoom(img);
}, { passive:false });

// ===========================================
// Drag to pan
// ===========================================
let isDragging = false, startX, startY;
document.addEventListener("mousedown", e => {
  if (!viewer.classList.contains("show")) return;
  const img = viewerMedia.querySelector(".viewer-media");
  if (!img) return;
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
});
document.addEventListener("mouseup", () => { isDragging = false; });
document.addEventListener("mousemove", e => {
  if (!viewer.classList.contains("show")) return;
  if (!isDragging) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  startX = e.clientX;
  startY = e.clientY;
  offsetX += dx / zoomLevel;
  offsetY += dy / zoomLevel;
  const img = viewerMedia.querySelector(".viewer-media");
  if (img) applyZoom(img);
});

// ===========================================
// Global
// ===========================================
window.openProject = openProject;

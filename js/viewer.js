// ===========================================
// PROJECT VIEWER (FIXED V2)
// ===========================================

const viewer = document.getElementById("projectViewer");

const viewerMedia = document.getElementById("viewerMedia");
const viewerTitle = document.getElementById("viewerTitle");
const viewerMeta = document.getElementById("viewerMeta");
const viewerDescription = document.getElementById("viewerDescription");
const viewerSoftware = document.getElementById("viewerSoftware");

// ===========================================
// STATE
// ===========================================

let currentProject = null;
let currentGallery = [];
let currentImage = 0;

// ===========================================
// YOUTUBE EMBED
// ===========================================

function getYoutubeEmbed(url) {
    let id = "";

    try {
        const u = new URL(url);

        if (u.hostname.includes("youtu.be")) {
            id = u.pathname.substring(1);
        } else {
            id = u.searchParams.get("v");
        }
    } catch (e) {
        return "";
    }

    return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
}

// ===========================================
// OPEN PROJECT
// ===========================================

function openProject(project) {
    currentProject = project;

    viewer.classList.add("show");

    currentGallery = [];
    currentImage = 0;

    // ------------------------------------
    // TEXT
    // ------------------------------------

    viewerTitle.textContent = project.title || "";

    viewerMeta.innerHTML = `
        <div><strong>Client</strong><br>${project.client || "-"}</div>
        <div style="margin-top:12px;">
            <strong>Year</strong><br>
            ${project.year || "-"}
        </div>
    `;

    viewerDescription.textContent = project.description || "";

    viewerSoftware.innerHTML = "";

    if (project.software && Array.isArray(project.software)) {
        project.software.forEach(app => {
            viewerSoftware.innerHTML +=
                `<span class="viewerBadge">${app}</span>`;
        });
    }

    // ------------------------------------
    // MEDIA RESET
    // ------------------------------------

    viewerMedia.innerHTML = "";

    // ====================================
    // VIDEO (YOUTUBE)
    // ====================================

    if (project.video?.type === "youtube") {
        viewerMedia.innerHTML = `
            <iframe
                src="${getYoutubeEmbed(project.video.url)}"
                allow="autoplay; fullscreen; encrypted-media"
                allowfullscreen
            ></iframe>
        `;
        return;
    }

    // ====================================
    // VIDEO (MP4)
    // ====================================

    if (project.video?.type === "mp4") {
        viewerMedia.innerHTML = `
            <video controls autoplay>
                <source src="${project.video.url}" type="video/mp4">
            </video>
        `;
        return;
    }

    // ====================================
    // GALLERY
    // ====================================

    if (project.gallery && project.gallery.length > 0) {
        currentGallery = project.gallery;
        currentImage = 0;

        viewerMedia.innerHTML = `
            <div class="viewerImageWrap">
                <img id="viewerGalleryImage" src="${currentGallery[0]}">
            </div>

            <div id="viewerCounter"></div>

            <div id="viewerThumbs"></div>
        `;

        setTimeout(buildViewerGallery, 0);
    }
}

// ===========================================
// BUILD GALLERY
// ===========================================

function buildViewerGallery() {
    // wait one tick to ensure DOM is fully mounted
    requestAnimationFrame(() => {
        updateViewerGallery();
    });
}

// ===========================================
// UPDATE GALLERY
// ===========================================

function updateViewerGallery() {
    const img = document.getElementById("viewerGalleryImage");
    const counter = document.getElementById("viewerCounter");
    const thumbs = document.getElementById("viewerThumbs");

    // SAFETY CHECKS
    if (!img || !counter || !thumbs) {
        console.warn("Viewer DOM not ready");
        return;
    }

    img.src = currentGallery[currentImage];

    counter.textContent = `${currentImage + 1} / ${currentGallery.length}`;

    thumbs.innerHTML = "";

    currentGallery.forEach((image, index) => {
        const thumb = document.createElement("img");

        thumb.src = image;
        thumb.className =
            index === currentImage
                ? "viewerThumb active"
                : "viewerThumb";

        thumb.onclick = () => {
            currentImage = index;
            updateViewerGallery();
        };

        thumbs.appendChild(thumb);
    });
}

// ===========================================
// NAVIGATION
// ===========================================

function nextViewerImage() {
    if (!currentGallery.length) return;

    currentImage++;
    if (currentImage >= currentGallery.length) {
        currentImage = 0;
    }

    updateViewerGallery();
}

function previousViewerImage() {
    if (!currentGallery.length) return;

    currentImage--;
    if (currentImage < 0) {
        currentImage = currentGallery.length - 1;
    }

    updateViewerGallery();
}

// ===========================================
// CLOSE
// ===========================================

function closeProject() {
    viewer.classList.remove("show");

    viewerMedia.innerHTML = "";

    currentProject = null;
    currentGallery = [];
    currentImage = 0;
}

// ===========================================
// EVENTS
// ===========================================

document.getElementById("viewerClose").onclick = closeProject;
document.querySelector(".viewer-overlay").onclick = closeProject;

document.addEventListener("keydown", (e) => {
    if (!viewer.classList.contains("show")) return;

    if (e.key === "Escape") {
        closeProject();
    }

    if (currentGallery.length) {
        if (e.key === "ArrowRight") nextViewerImage();
        if (e.key === "ArrowLeft") previousViewerImage();
    }
});

// ===========================================
// GLOBAL
// ===========================================

window.openProject = openProject;

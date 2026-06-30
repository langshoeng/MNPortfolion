// ===========================================
// PROJECT VIEWER V3
// Part 1 - Variables + Helpers
// ===========================================

// ---------- Main Elements ----------

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
// STATE
// ===========================================

let currentProject = null;

let currentGallery = [];

let currentImage = 0;


// ===========================================
// YOUTUBE EMBED
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
// RESET VIEWER
// ===========================================

function resetViewer(){

    viewerWindow.classList.remove(
        "gallery-mode",
        "video-mode"
    );

    viewerMedia.innerHTML = "";

    viewerDots.innerHTML = "";

    viewerCounter.textContent = "";

    viewerPrev.style.display = "none";
    viewerNext.style.display = "none";

    currentGallery = [];

    currentImage = 0;

}


// ===========================================
// PLACEHOLDER
// ===========================================

function showPlaceholder(

    icon = "🖼️",

    title = "Preview Coming Soon",

    text = "This project doesn't have any preview images or videos yet."

){

    viewerMedia.innerHTML = `

        <div class="viewerPlaceholder">

            <div class="viewerPlaceholderIcon">

                ${icon}

            </div>

            <h3>

                ${title}

            </h3>

            <p>

                ${text}

            </p>

        </div>

    `;

}


// ===========================================
// BUILD SOFTWARE BADGES
// ===========================================

function buildSoftware(project){

    viewerSoftware.innerHTML = "";

    if(!project.software) return;

    project.software.forEach(app=>{

        const badge = document.createElement("span");

        badge.className = "viewerBadge";

        badge.textContent = app;

        viewerSoftware.appendChild(badge);

    });

}


// ===========================================
// BUILD META
// ===========================================

function buildMeta(project){

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

}

// ===========================================
// OPEN PROJECT
// ===========================================

function openProject(project){

    currentProject = project;

    currentGallery = [];

    currentImage = 0;

    viewer.classList.add("show");

    viewerWindow.classList.remove(
        "gallery-mode",
        "video-mode"
    );

    hidePlaceholder();

    viewerPrev.style.display = "none";
    viewerNext.style.display = "none";

    viewerMedia.innerHTML = "";

    viewerDots.innerHTML = "";

    viewerCounter.textContent = "";


    // ======================================
    // TITLE
    // ======================================

    viewerTitle.textContent =
        project.title || "";


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

            badge.className =
                "viewerBadge";

            badge.textContent =
                app;

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

        viewerWindow.classList.add(
            "video-mode"
        );

        viewerMedia.innerHTML = `

            <iframe
                src="${getYoutubeEmbed(project.video.url)}"
                allow="autoplay; fullscreen; encrypted-media"
                allowfullscreen
            ></iframe>

        `;

        return;

    }


    // ======================================
    // LOCAL MP4
    // ======================================

    if(
        project.video &&
        project.video.type === "mp4"
    ){

        viewerWindow.classList.add(
            "video-mode"
        );

        viewerMedia.innerHTML = `

            <video controls autoplay>

                <source
                    src="${project.video.url}"
                    type="video/mp4"
                >

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

        viewerWindow.classList.add(
            "gallery-mode"
        );

        currentGallery =
            project.gallery;

        currentImage = 0;

        viewerPrev.style.display = "";

        viewerNext.style.display = "";

        viewerMedia.innerHTML = `

            <img
                id="viewerGalleryImage"
                alt="Gallery Image"
            >

        `;

        buildViewerGallery();

        return;

    }


    // ======================================
    // NO MEDIA
    // ======================================

    showPlaceholder(
        "🖼️",
        "Preview Coming Soon",
        "This project doesn't have preview images or videos yet."
    );

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

function updateViewerGallery(){

    const img = document.getElementById("viewerGalleryImage");

    if(!img) return;

    img.style.opacity = "0";

    setTimeout(()=>{

        img.src = currentGallery[currentImage];

        viewerCounter.textContent =
            `${currentImage + 1} of ${currentGallery.length}`;

        buildViewerDots();

        preloadGallery();

    },120);

}


// ===========================================
// BUILD DOTS
// ===========================================

function buildViewerDots(){

    viewerDots.innerHTML = "";

    currentGallery.forEach((image,index)=>{

        const dot = document.createElement("button");

        dot.type = "button";

        dot.className =
            index === currentImage
            ? "viewerDot active"
            : "viewerDot";

        dot.onclick = ()=>{

            if(index === currentImage)
                return;

            currentImage = index;

            updateViewerGallery();

        };

        viewerDots.appendChild(dot);

    });

}


// ===========================================
// PRELOAD
// ===========================================

function preloadGallery(){

    if(currentGallery.length < 2)
        return;

    const next = new Image();

    next.src =
        currentGallery[
            (currentImage + 1) %
            currentGallery.length
        ];

    const prev = new Image();

    prev.src =
        currentGallery[
            (currentImage - 1 + currentGallery.length) %
            currentGallery.length
        ];

}


// ===========================================
// IMAGE LOADED
// ===========================================

document.addEventListener("load",(e)=>{

    if(e.target.id === "viewerGalleryImage"){

        e.target.style.opacity = "1";

    }

},true);


// ===========================================
// NEXT IMAGE
// ===========================================

function nextViewerImage(){

    if(!currentGallery.length) return;

    currentImage++;

    if(currentImage >= currentGallery.length){

        currentImage = 0;

    }

    updateViewerGallery();

}


// ===========================================
// PREVIOUS IMAGE
// ===========================================

function previousViewerImage(){

    if(!currentGallery.length) return;

    currentImage--;

    if(currentImage < 0){

        currentImage = currentGallery.length - 1;

    }

    updateViewerGallery();

}


// ===========================================
// PLACEHOLDER
// ===========================================

function showPlaceholder(icon,title,text){

    viewerMedia.innerHTML = `

        <div class="viewerPlaceholder">

            <div class="viewerPlaceholderIcon">
                ${icon}
            </div>

            <h3>
                ${title}
            </h3>

            <p>
                ${text}
            </p>

        </div>

    `;

}


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

    viewerPrev.style.display = "none";
    viewerNext.style.display = "none";

    currentGallery = [];

    currentImage = 0;

    currentProject = null;

}


// ===========================================
// BUTTON EVENTS
// ===========================================

viewerPrev.onclick = previousViewerImage;

viewerNext.onclick = nextViewerImage;

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


// ===========================================
// IMAGE FADE-IN
// ===========================================

document.addEventListener("load",(e)=>{

    if(e.target.id === "viewerGalleryImage"){

        e.target.style.opacity = "1";

    }

},true);


// ===========================================
// GLOBAL
// ===========================================

window.openProject = openProject;

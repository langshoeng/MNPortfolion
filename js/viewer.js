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

    viewerWindow.classList.remove(
        "gallery-mode",
        "video-mode"
    );

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

            badge.className =
                "viewerBadge";

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
    // LOCAL VIDEO
    // ======================================

    if(

        project.video &&
        project.video.type === "mp4"

    ){

        viewerWindow.classList.add(
            "video-mode"
        );

        viewerMedia.innerHTML = `

            <video

                controls

                autoplay

            >

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

        currentGallery = project.gallery;

        currentImage = 0;

        viewerMedia.innerHTML = `

            <img

                id="viewerGalleryImage"

                src="${currentGallery[0]}"

                alt="Gallery Image"

            >

        `;

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

function updateViewerGallery(){

    const img =
        document.getElementById("viewerGalleryImage");

    if(!img) return;

    img.src = currentGallery[currentImage];

    // -----------------------------
    // Counter
    // -----------------------------

    viewerCounter.textContent =
        `${currentImage + 1} of ${currentGallery.length}`;

    // -----------------------------
    // Dots
    // -----------------------------

    viewerDots.innerHTML = "";

    currentGallery.forEach((image,index)=>{

        const dot =
            document.createElement("div");

        dot.className =
            index === currentImage
                ? "viewerDot active"
                : "viewerDot";

        dot.onclick = ()=>{

            currentImage = index;

            updateViewerGallery();

        };

        viewerDots.appendChild(dot);

    });

}


// ===========================================
// NEXT IMAGE
// ===========================================

function nextViewerImage(){

    if(!currentGallery.length)
        return;

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

    if(!currentGallery.length)
        return;

    currentImage--;

    if(currentImage < 0){

        currentImage =
            currentGallery.length - 1;

    }

    updateViewerGallery();

}


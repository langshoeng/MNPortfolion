// ===========================================
// PROJECT VIEWER
// ===========================================

const viewer = document.getElementById("projectViewer");

const viewerMedia = document.getElementById("viewerMedia");

const viewerTitle = document.getElementById("viewerTitle");

const viewerMeta = document.getElementById("viewerMeta");

const viewerDescription = document.getElementById("viewerDescription");

const viewerSoftware = document.getElementById("viewerSoftware");


// ===========================================
// Current Project
// ===========================================

let currentProject = null;

let currentGallery = [];

let currentImage = 0;

// ===========================================
// Convert YouTube URL
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
// Open Project
// ===========================================

function openProject(project){

    currentProject = project;

    viewer.classList.add("show");



    // ------------------------------------
    // Title
    // ------------------------------------

    viewerTitle.textContent = project.title;



    // ------------------------------------
    // Meta
    // ------------------------------------

    viewerMeta.innerHTML = `

        <div><strong>Client</strong><br>${project.client || "-"}</div>

        <div style="margin-top:12px;">

            <strong>Year</strong><br>

            ${project.year || "-"}

        </div>

    `;



    // ------------------------------------
    // Description
    // ------------------------------------

    viewerDescription.textContent =

        project.description || "";



    // ------------------------------------
    // Software
    // ------------------------------------

    viewerSoftware.innerHTML = "";



    if(project.software){

        project.software.forEach(app=>{

            viewerSoftware.innerHTML +=

                `<span class="viewerBadge">${app}</span>`;

        });

    }



    // =====================================
    // MEDIA
    // =====================================

    viewerMedia.innerHTML = "";



    // -------------------------------------
    // YouTube
    // -------------------------------------

    if(

        project.video &&

        project.video.type === "youtube"

    ){

        viewerMedia.innerHTML = `

        <iframe

            src="${getYoutubeEmbed(project.video.url)}"

            allow="autoplay; fullscreen; encrypted-media"

            allowfullscreen

        ></iframe>

        `;

    }



    // -------------------------------------
    // Local MP4
    // -------------------------------------

    else if(

        project.video &&

        project.video.type === "mp4"

    ){

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

    }



    // -------------------------------------
    // Gallery
    // -------------------------------------

    else if (
        project.gallery &&
        project.gallery.length
    ) {
    
        currentGallery = project.gallery;
        currentImage = 0;
    
        viewerMedia.innerHTML = `
    
            <button class="viewerArrow left" id="viewerPrev">&#10094;</button>
    
            <img
                id="viewerGalleryImage"
                src="${currentGallery[0]}"
            >
    
            <button class="viewerArrow right" id="viewerNext">&#10095;</button>
    
            <div id="viewerCounter"></div>
    
            <div id="viewerThumbs"></div>
    
        `;
    
        buildViewerGallery();
    
    }

}


// ===========================================
// Build Gallery
// ===========================================

function buildViewerGallery(){

    updateViewerGallery();

    document
        .getElementById("viewerPrev")
        .onclick = previousViewerImage;

    document
        .getElementById("viewerNext")
        .onclick = nextViewerImage;

}


function updateViewerGallery(){

    const img = document.getElementById("viewerGalleryImage");

    const counter = document.getElementById("viewerCounter");

    const thumbs = document.getElementById("viewerThumbs");

    img.src = currentGallery[currentImage];

    counter.textContent =
        `${currentImage + 1} / ${currentGallery.length}`;

    thumbs.innerHTML = "";

    currentGallery.forEach((image,index)=>{

        const thumb = document.createElement("img");

        thumb.src = image;

        thumb.className =
            index === currentImage
                ? "viewerThumb active"
                : "viewerThumb";

        thumb.dataset.index = index;

        thumb.onclick = ()=>{

            currentImage = index;

            updateViewerGallery();

        };

        thumbs.appendChild(thumb);

    });

}


function nextViewerImage(){

    currentImage++;

    if(currentImage>=currentGallery.length){

        currentImage=0;

    }

    updateViewerGallery();

}


function previousViewerImage(){

    currentImage--;

    if(currentImage<0){

        currentImage=currentGallery.length-1;

    }

    updateViewerGallery();

}


// ===========================================
// Close
// ===========================================

function closeProject(){

    viewer.classList.remove("show");



    // Stop YouTube

    viewerMedia.innerHTML = "";



    currentProject = null;

}


// ===========================================
// Close Events
// ===========================================

document
.getElementById("viewerClose")
.onclick = closeProject;


document
.querySelector(".viewer-overlay")
.onclick = closeProject;


// ===========================================
// ESC
// ===========================================

document.addEventListener("keydown",(e)=>{

    if(!viewer.classList.contains("show")) return;

    if(e.key==="Escape"){

        closeProject();

    }

    if(currentGallery.length){

        if(e.key==="ArrowRight"){

            nextViewerImage();

        }

        if(e.key==="ArrowLeft"){

            previousViewerImage();

        }

    }

});


// ===========================================
// Global
// ===========================================

window.openProject = openProject;

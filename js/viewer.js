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

    else if(

        project.gallery &&

        project.gallery.length

    ){

        viewerMedia.innerHTML = `

        <img

            src="${project.gallery[0]}"

            id="viewerGalleryImage"

        >

        `;

    }

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

    if(

        e.key==="Escape" &&

        viewer.classList.contains("show")

    ){

        closeProject();

    }

});


// ===========================================
// Global
// ===========================================

window.openProject = openProject;

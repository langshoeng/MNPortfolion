const viewer = document.getElementById("projectViewer");

const viewerMedia = document.getElementById("viewerMedia");

const viewerTitle = document.getElementById("viewerTitle");

const viewerMeta = document.getElementById("viewerMeta");

const viewerDescription = document.getElementById("viewerDescription");

const viewerSoftware = document.getElementById("viewerSoftware");

document
.getElementById("viewerClose")
.onclick = () => {

    viewer.classList.remove("show");

    viewerMedia.innerHTML = "";

};

document
.querySelector(".viewer-overlay")
.onclick = () => {

    viewer.classList.remove("show");

    viewerMedia.innerHTML = "";

};

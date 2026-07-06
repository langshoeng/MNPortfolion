// =======================================
// Global YouTube API setup
// =======================================
let ytPlayer;

function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('peekVideo', {
    videoId: '',
    playerVars: {
      autoplay: 1,
      mute: 1,
      controls: 1,
      rel: 0
    }
  });
}

function ensureYTPlayer() {
  if (!ytPlayer) {
    ytPlayer = new YT.Player('peekVideo', {
      videoId: '',
      playerVars: {
        autoplay: 1,
        mute: 1,
        controls: 1,
        rel: 0
      }
    });
    console.log("YT player ensured");
  }
}

// =======================================
// Project Loader
// =======================================
let allProjects = [];

async function loadProjects() {
  try {
    const response = await fetch("data/projects.json?nocache=" + Date.now());
    if (!response.ok) throw new Error("Unable to load projects.json");
    allProjects = await response.json();
    renderProjects("All");
  } catch (err) {
    console.error(err);
  }
}

// =======================================
// Render Projects
// =======================================
function renderProjects(filter = "All") {
  const grid = document.getElementById("projectsGrid");
  grid.innerHTML = "";

  let projects = allProjects;
  if (filter !== "All") {
    projects = allProjects.filter(project =>
      project.categories.includes(filter)
    );
  }

  projects.forEach(project => {
    const software = project.software ? project.software.join(" • ") : "";
    const category = project.categories ? project.categories.join(" / ") : "";

    let mediaBadge = "";
    if (project.video && project.video.type !== "none") {
      mediaBadge = `
        <span class="project-badge video">
          ${project.video.duration ? project.video.duration + " | " : ""}
          ▶
        </span>
      `;
    } else if (project.gallery && project.gallery.length) {
      mediaBadge = `
        <span class="project-badge image">
          🖼 ${project.gallery.length} Images
        </span>
      `;
    }

    let previewAttr = "";
    if (project.video && project.video.type !== "none") {
      const embedUrl = project.video.url.replace("watch?v=", "embed/").split("&")[0];
      previewAttr = `data-video="${embedUrl}"`;
    } else if (project.gallery && project.gallery.length) {
      previewAttr = `data-image="${project.gallery[0]}"`;
    }

    grid.innerHTML += `
      <div class="col-lg-4 col-md-6">
        <div class="project-card" data-project="${project.id}" ${previewAttr}>
          <div class="project-thumb">
            <img src="${project.thumbnail}" alt="${project.title}">
            ${mediaBadge}
            <span class="peek-hint">Hold to Peek</span>
          </div>
          <div class="project-info">
            <span class="project-category">${category}</span>
            <h4>${project.title}</h4>
            <p>${software}</p>
          </div>
        </div>
      </div>
    `;
  });

  // Peek modal logic
  const peekModal = document.getElementById("peekModal");
  const peekImage = document.getElementById("peekImage");
  const peekClose = document.getElementById("peekClose");
  const peekPrev = document.getElementById("peekPrev");
  const peekNext = document.getElementById("peekNext");
  const peekVideoWrapper = document.getElementById("peekVideoWrapper");

  let currentGallery = [];
  let currentIndex = 0;

  function showPreview(card) {
    const video = card.dataset.video;
    const image = card.dataset.image;
  
    if (video) {
      let videoId = "";
      if (video.includes("embed/")) {
        videoId = video.split("embed/")[1].split("?")[0];
      } else if (video.includes("v=")) {
        videoId = video.split("v=")[1].split("&")[0];
      }
  
      peekVideoWrapper.style.display = "block";
      peekImage.style.display = "none";
      currentGallery = [];
  
      ensureYTPlayer();
  
      if (ytPlayer && videoId) {
        ytPlayer.loadVideoById({ videoId: videoId, startSeconds: 0 });
        ytPlayer.mute();
      }
  
      // ✅ Show pill, but do NOT auto-fade
      const unmuteHint = document.querySelector(".unmute-hint");
      if (unmuteHint) {
        unmuteHint.classList.remove("fade-out");
      }
  
      if (peekPrev) peekPrev.style.display = "none";
      if (peekNext) peekNext.style.display = "none";
    } else if (image) {
      const projectId = card.dataset.project;
      const project = allProjects.find(p => p.id === projectId);
      currentGallery = project.gallery || [image];
      currentIndex = 0;
  
      peekImage.src = currentGallery[currentIndex];
      peekImage.style.display = "block";
      peekVideoWrapper.style.display = "none";
  
      if (peekPrev) peekPrev.style.display = "block";
      if (peekNext) peekNext.style.display = "block";
    }
  
    peekModal.classList.add("show");
  }

  function hidePreview() {
    peekModal.classList.remove("show");
    peekImage.src = "";
    peekVideoWrapper.style.display = "none";
    currentGallery = [];
    currentIndex = 0;
    if (ytPlayer) ytPlayer.stopVideo();
  }

  if (peekClose) peekClose.addEventListener("click", hidePreview);
  if (peekPrev) peekPrev.addEventListener("click", () => showImageAt(currentIndex - 1));
  if (peekNext) peekNext.addEventListener("click", () => showImageAt(currentIndex + 1));

  peekModal.addEventListener("click", (e) => {
    if (e.target === peekModal) hidePreview();
  });

  document.querySelectorAll(".project-card").forEach(card => {
    let pressTimer;
    let startX, startY;
    const threshold = 10;

    card.addEventListener("mousedown", () => {
      pressTimer = setTimeout(() => showPreview(card), 500);
    });
    card.addEventListener("mouseup", () => clearTimeout(pressTimer));
    card.addEventListener("mouseleave", () => clearTimeout(pressTimer));

    card.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      pressTimer = setTimeout(() => showPreview(card), 500);
    });

    card.addEventListener("touchmove", (e) => {
      const touch = e.touches[0];
      if (Math.abs(touch.clientX - startX) > threshold ||
          Math.abs(touch.clientY - startY) > threshold) {
        clearTimeout(pressTimer);
      }
    });

    card.addEventListener("touchend", () => clearTimeout(pressTimer));
  });
}

// Initial Load
loadProjects();

// Global Unmute Pill Listener
document.addEventListener("DOMContentLoaded", () => {
  const unmuteHint = document.querySelector(".unmute-hint");
  if (unmuteHint) {
    unmuteHint.addEventListener("click", () => {
      if (ytPlayer) {
        ytPlayer.unMute();
        unmuteHint.classList.add("fade-out");
      }
    });
  }
});

// Global Click Events
document.addEventListener("click", (e) => {
  // Filter Buttons
  const filterBtn = e.target.closest(".filter-btn");
  if (filterBtn) {
    document.querySelectorAll(".filter-btn")
      .forEach(btn => btn.classList.remove("active"));
    filterBtn.classList.add("active");
    renderProjects(filterBtn.dataset.filter);
    return;
  }

  // Project Card
  const card = e.target.closest(".project-card");
  if (!card) return;

  const projectId = card.dataset.project;
  const project = allProjects.find(p => p.id === projectId);
  if (!project) return;

  openProject(project);
});

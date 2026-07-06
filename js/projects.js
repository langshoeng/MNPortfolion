// =======================================
// Project Loader
// =======================================

let allProjects = [];

async function loadProjects() {

    try {

        const response = await fetch(
            "data/projects.json?nocache=" + Date.now()
        );

        if (!response.ok) {
            throw new Error("Unable to load projects.json");
        }

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

    //-----------------------------------
    // Badge
    //-----------------------------------
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

    //-----------------------------------
    // Card
    //-----------------------------------
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

  //-----------------------------------
  // Peek modal logic
  //-----------------------------------
  const peekModal = document.getElementById("peekModal");
  const peekImage = document.getElementById("peekImage");
  const peekVideo = document.getElementById("peekVideo");
  const peekClose = document.getElementById("peekClose");

  function showPreview(card) {
    const video = card.dataset.video;
    const image = card.dataset.image;
    if (video) {
      peekVideo.src = video;
      peekVideo.style.display = "block";
      peekVideo.style.width = "90%";   // bigger video on desktop
      peekVideo.style.height = "70vh"; // taller video
      peekImage.style.display = "none";
    } else if (image) {
      peekImage.src = image;
      peekImage.style.display = "block";
      peekImage.style.width = "80%";
      peekImage.style.height = "auto";
      peekVideo.style.display = "none";
    }
    peekModal.classList.add("show");
  }

  function hidePreview() {
    peekModal.classList.remove("show");
    peekVideo.src = "";
    peekImage.src = "";
  }

  if (peekClose) {
    peekClose.addEventListener("click", hidePreview);
  }
  peekModal.addEventListener("click", (e) => {
    if (e.target === peekModal) hidePreview();
  });

  //-----------------------------------
  // Bind events
  //-----------------------------------
  document.querySelectorAll(".project-card").forEach(card => {
    let pressTimer;
    let startX, startY;
    const threshold = 10; // px movement allowed before treating as scroll

    // Desktop
    card.addEventListener("mousedown", () => {
      pressTimer = setTimeout(() => showPreview(card), 500);
    });
    card.addEventListener("mouseup", () => clearTimeout(pressTimer));
    card.addEventListener("mouseleave", () => clearTimeout(pressTimer));

    // Mobile
    card.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;

      pressTimer = setTimeout(() => {
        showPreview(card);
      }, 500);
    });

    card.addEventListener("touchmove", (e) => {
      const touch = e.touches[0];
      if (Math.abs(touch.clientX - startX) > threshold ||
          Math.abs(touch.clientY - startY) > threshold) {
        clearTimeout(pressTimer); // cancel peek if scrolling
      }
    });

    card.addEventListener("touchend", () => clearTimeout(pressTimer));
  });
}

// =======================================
// Initial Load
// =======================================

loadProjects();

// =======================================
// Global Click Events
// =======================================

document.addEventListener("click",(e)=>{


    //-----------------------------------
    // Filter Buttons
    //-----------------------------------

    const filterBtn = e.target.closest(".filter-btn");

    if(filterBtn){

        document
        .querySelectorAll(".filter-btn")
        .forEach(btn=>btn.classList.remove("active"));

        filterBtn.classList.add("active");

        renderProjects(
            filterBtn.dataset.filter
        );

        return;

    }


    //-----------------------------------
    // Project Card
    //-----------------------------------

    const card = e.target.closest(".project-card");

    if(!card) return;


    const projectId = card.dataset.project;


    const project = allProjects.find(

        p => p.id === projectId

    );


    if(!project) return;


    //-----------------------------------
    // NEW
    //-----------------------------------

    openProject(project);

});

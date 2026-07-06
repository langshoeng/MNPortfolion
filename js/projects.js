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
  
  // Auto-show hint when card scrolls into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const hint = entry.target.querySelector(".peek-hint");
        if (hint) {
          hint.style.opacity = "1";
          setTimeout(() => hint.style.opacity = "0", 3000); // show for 3s
        }
        observer.unobserve(entry.target); // only show once per card
      }
    });
  }, { threshold: 0.3 }); // trigger when ~30% of card is visible
  
  document.querySelectorAll(".project-card").forEach(card => {
    observer.observe(card);
  });

  //-----------------------------------
  // Peek modal logic
  //-----------------------------------
  const peekModal = document.getElementById("peekModal");
  const peekImage = document.getElementById("peekImage");
  const peekVideo = document.getElementById("peekVideo");
  const peekClose = document.getElementById("peekClose");
  const peekPrev = document.getElementById("peekPrev");
  const peekNext = document.getElementById("peekNext");
  const peekVideoWrapper = document.getElementById("peekVideoWrapper");
  const unmuteHint = document.querySelector(".unmute-hint");
  
  let currentGallery = [];
  let currentIndex = 0;
  
  function showPreview(card) {
    const video = card.dataset.video;
    const image = card.dataset.image;
  
    if (video) {
      // Add autoplay=1 and mute=1 when showing
      let autoplayUrl = video.includes("?") 
        ? video + "&autoplay=1&mute=1" 
        : video + "?autoplay=1&mute=1";
  
      peekVideo.src = autoplayUrl;
      peekVideoWrapper.style.display = "block";   // ✅ show wrapper
      peekImage.style.display = "none";
      currentGallery = [];
  
      // Show unmute hint briefly
      if (unmuteHint) {
        unmuteHint.classList.remove("fade-out");
        setTimeout(() => unmuteHint.classList.add("fade-out"), 4000);
      }
  
      // Hide navigation arrows for video
      if (peekPrev) peekPrev.style.display = "none";
      if (peekNext) peekNext.style.display = "none";
  
      if (window.innerWidth > 768) {
        peekVideo.style.width = "80vw";
        peekVideo.style.height = "45vw";
      } else {
        peekVideo.style.width = "95%";
        peekVideo.style.height = "50vh";
      }
    } else if (image) {
      const projectId = card.dataset.project;
      const project = allProjects.find(p => p.id === projectId);
      currentGallery = project.gallery || [image];
      currentIndex = 0;
  
      peekImage.src = currentGallery[currentIndex];
      peekImage.style.display = "block";
      peekVideoWrapper.style.display = "none";   // ✅ hide wrapper
      peekVideo.src = "";
  
      // Show navigation arrows for image galleries
      if (peekPrev) peekPrev.style.display = "block";
      if (peekNext) peekNext.style.display = "block";
  
      if (window.innerWidth <= 768) {
        peekImage.style.width = "95%";
      } else {
        peekImage.style.width = "80%";
      }
    }
  
    peekModal.classList.add("show");
  }
  
  function showImageAt(index) {
    if (currentGallery.length > 0) {
      currentIndex = (index + currentGallery.length) % currentGallery.length;
      peekImage.src = currentGallery[currentIndex];
    }
  }
  
  function hidePreview() {
    peekModal.classList.remove("show");
    peekVideo.src = "";
    peekImage.src = "";
    peekVideoWrapper.style.display = "none";   // ✅ hide wrapper
    currentGallery = [];
    currentIndex = 0;
  }
  
  if (peekClose) peekClose.addEventListener("click", hidePreview);
  if (peekPrev) peekPrev.addEventListener("click", () => showImageAt(currentIndex - 1));
  if (peekNext) peekNext.addEventListener("click", () => showImageAt(currentIndex + 1));
  
  peekModal.addEventListener("click", (e) => {
    if (e.target === peekModal) hidePreview();
  });
  
  // Keyboard navigation for gallery
  document.addEventListener("keydown", (e) => {
    if (!peekModal.classList.contains("show")) return;
  
    if (currentGallery.length > 0) {
      if (e.key === "ArrowLeft") {
        showImageAt(currentIndex - 1);
        peekPrev.classList.add("active");
        setTimeout(() => peekPrev.classList.remove("active"), 200);
      } else if (e.key === "ArrowRight") {
        showImageAt(currentIndex + 1);
        peekNext.classList.add("active");
        setTimeout(() => peekNext.classList.remove("active"), 200);
      }
    }
    if (e.key === "Escape") {
      hidePreview();
    }
  });
  
  // ✅ Wire the unmute pill itself
  if (unmuteHint) {
    unmuteHint.addEventListener("click", () => {
      if (peekVideo.src) {
        // Reload video with autoplay but unmuted
        let unmutedUrl = peekVideo.src.replace("&mute=1", "").replace("?mute=1", "");
        peekVideo.src = unmutedUrl;
      }
    });
  }

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

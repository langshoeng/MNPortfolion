// =======================================
// Project Loader
// =======================================

let allProjects = [];

async function loadProjects() {

    try {

        const response = await fetch("data/projects.json");

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

        const software = project.software.join(" • ");

        const category = project.categories.join(" / ");

        // ---------------------------------
        // Thumbnail Badge
        // ---------------------------------

        let mediaBadge = "";

        if (
            project.video &&
            project.video.type !== "none"
        ) {

            mediaBadge = `
                <span class="project-badge video">
                    ▶ ${project.video.duration || ""}
                </span>
            `;

        } else if (
            project.gallery &&
            project.gallery.length > 0
        ) {

            mediaBadge = `
                <span class="project-badge image">
                    🖼 ${project.gallery.length} Images
                </span>
            `;

        }

        // ---------------------------------
        // Card
        // ---------------------------------

        grid.innerHTML += `

        <div class="col-lg-4 col-md-6">

            <div
                class="project-card"
                data-type="${project.video?.type || "none"}"
                data-video="${project.video?.url || ""}"
                data-gallery="${project.gallery?.[0] || ""}"
            >

                <div class="project-thumb">

                    <img
                        src="${project.thumbnail}"
                        alt="${project.title}"
                    >

                    ${mediaBadge}

                </div>

                <div class="project-info">

                    <span class="project-category">

                        ${category}

                    </span>

                    <h4>${project.title}</h4>

                    <p>${software}</p>

                </div>

            </div>

        </div>

        `;

    });

}


// =======================================
// Initial Load
// =======================================

loadProjects();


// =======================================
// Click Events
// =======================================

document.addEventListener("click", (e) => {

    // ----------------------------
    // Filter Buttons
    // ----------------------------

    const filterBtn = e.target.closest(".filter-btn");

    if (filterBtn) {

        document
            .querySelectorAll(".filter-btn")
            .forEach(btn => btn.classList.remove("active"));

        filterBtn.classList.add("active");

        renderProjects(
            filterBtn.dataset.filter
        );

        return;

    }


    // ----------------------------
    // Project Card
    // ----------------------------

    const card = e.target.closest(".project-card");

    if (!card) return;

    const type = card.dataset.type;

    const video = card.dataset.video;

    const gallery = card.dataset.gallery;


    // Open YouTube

    if (
        type !== "none" &&
        video
    ) {

        window.open(
            video,
            "_blank"
        );

        return;

    }


    // Open first gallery image

    if (gallery) {

        window.open(
            gallery,
            "_blank"
        );

    }

});

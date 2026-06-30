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

        const software = project.software
            ? project.software.join(" • ")
            : "";

        const category = project.categories
            ? project.categories.join(" / ")
            : "";

        //-----------------------------------
        // Badge
        //-----------------------------------

        let mediaBadge = "";

        if (
            project.video &&
            project.video.type !== "none"
        ) {

            mediaBadge = `

                <span class="project-badge video">

                    ▶ ${project.duration || ""}

                </span>

            `;

        }

        else if (

            project.gallery &&
            project.gallery.length

        ) {

            mediaBadge = `

                <span class="project-badge image">

                    🖼 ${project.gallery.length} Images

                </span>

            `;

        }


        //-----------------------------------
        // Card
        //-----------------------------------

        grid.innerHTML += `

        <div class="col-lg-4 col-md-6">

            <div
                class="project-card"
                data-project="${project.id}"
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

                    <h4>

                        ${project.title}

                    </h4>

                    <p>

                        ${software}

                    </p>

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

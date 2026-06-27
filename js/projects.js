let allProjects = [];

async function loadProjects() {

    const response = await fetch("data/projects.json");

    allProjects = await response.json();

    renderProjects("All");
}

function renderProjects(filter) {

    const grid = document.getElementById("projectsGrid");

    grid.innerHTML = "";

    let projects = allProjects;

    if(filter !== "All"){

        projects = allProjects.filter(project =>
            project.categories.includes(filter)
        );

    }

    projects.forEach(project=>{

        const software = project.software.join(" • ");

        const category = project.categories.join(" / ");

        grid.innerHTML += `

        <div class="col-lg-4 col-md-6">

            <div class="project-card">

                <img src="${project.thumbnail}">

                <div class="project-info">

                    <span class="project-category">

                        ${category}

                    </span>

                    <h4>${project.title}</h4>

                    <p>${software}</p>

                    <button
                        class="btn btn-outline-light btn-sm mt-3 view-project"
                        data-video="${project.video.url}">

                        Watch Project

                    </button>

                </div>

            </div>

        </div>

        `;

    });

}

loadProjects();

document.addEventListener("click",(e)=>{

    if(e.target.classList.contains("filter-btn")){

        document
            .querySelectorAll(".filter-btn")
            .forEach(btn=>btn.classList.remove("active"));

        e.target.classList.add("active");

        renderProjects(
            e.target.dataset.filter
        );

    }

    if(e.target.classList.contains("view-project")){

        window.open(
            e.target.dataset.video,
            "_blank"
        );

    }

});

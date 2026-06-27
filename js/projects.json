async function loadProjects() {

    const response = await fetch("data/projects.json");

    const projects = await response.json();

    const grid = document.getElementById("projectsGrid");

    grid.innerHTML = "";

    projects
        .filter(project => project.featured)
        .forEach(project => {

            const software = project.software.join(" • ");

            const card = document.createElement("div");

            card.className = "col-lg-4 col-md-6";

            card.innerHTML = `

                <div class="project-card">

                    <img src="${project.thumbnail}" alt="${project.title}">

                    <div class="project-info">

                        <span class="project-category">
                            ${project.category}
                        </span>

                        <h4>${project.title}</h4>

                        <p>${software}</p>

                        <button
                            class="btn btn-outline-light btn-sm mt-3 view-project"
                            data-video="${project.video.url}"
                        >
                            View Project
                        </button>

                    </div>

                </div>

            `;

            grid.appendChild(card);

        });

}

loadProjects();

document.addEventListener("click",(e)=>{

    if(!e.target.classList.contains("view-project")) return;

    window.open(
        e.target.dataset.video,
        "_blank"
    );

});

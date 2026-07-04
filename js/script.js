// ===============================
// Typing Effect
// ===============================

const words = [
    "Motion Graphics",
    "Graphic Designer",
    "Video Editor",
    "Photographer"
];

let wordIndex = 0;
let charIndex = 0;
let deleting = false;

const typing = document.getElementById("typing");

function type() {

    const currentWord = words[wordIndex];

    if (!deleting) {

        typing.textContent = currentWord.substring(0, charIndex);
        charIndex++;

        if (charIndex > currentWord.length) {
            deleting = true;
            setTimeout(type, 1500); // Pause before deleting
            return;
        }

    } else {

        typing.textContent = currentWord.substring(0, charIndex);
        charIndex--;

        if (charIndex < 0) {
            deleting = false;
            charIndex = 0;
            wordIndex = (wordIndex + 1) % words.length;
        }

    }

    setTimeout(type, deleting ? 45 : 85);
}

type();


// ===============================
// Navbar Scroll Effect
// ===============================

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }

});


// ===============================
// Active Navigation Link
// ===============================

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 100;

        if (window.scrollY >= sectionTop) {
            current = section.getAttribute("id");
        }

    });

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {
            link.classList.add("active");
        }

    });

});


// ===============================
// Fade-in Animation on Scroll
// ===============================

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }

    });

}, {
    threshold: 0.15
});

document.querySelectorAll(".fade-up, .project-card").forEach(el => {
    observer.observe(el);
});

// ===============================
// Skill Badge Animation (reset + replay)
// ===============================

document.querySelectorAll('.skill-wrapper').forEach(wrapper => {
  const badge = wrapper.querySelector('.skill-badge');
  const fill = wrapper.querySelector('.skill-fill');
  const percentText = wrapper.querySelector('.skill-percent');
  const target = parseInt(badge.getAttribute('data-skill'), 10);

  wrapper.addEventListener('mouseenter', () => {
    fill.style.width = '0%';
    percentText.textContent = '0%';

    const duration = 800; // total animation time (ms)
    const startTime = performance.now();

    // Animate bar with same duration
    setTimeout(() => {
      fill.style.transition = `width ${duration}ms ease`;
      fill.style.width = target + '%';
    }, 50);

    function easeOutQuad(t) {
      return t * (2 - t); // easing curve
    }

    function animateNumber(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1); // 0 → 1
      const eased = easeOutQuad(progress);
      const value = Math.round(eased * target);
      percentText.textContent = value + '%';

      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      }
    }

    requestAnimationFrame(animateNumber);
  });

  wrapper.addEventListener('mouseleave', () => {
    fill.style.transition = 'width 300ms ease';
    fill.style.width = '0%';
    percentText.textContent = '0%';
  });
});

// ===============================
// Timeline Fade-in on Scroll (with staggered delay)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".timeline li");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = Array.from(items).indexOf(entry.target);
        entry.target.style.transitionDelay = `${index * 0.15}s`;
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.2 });

  items.forEach(item => observer.observe(item));
});


// ===============================
// Contact Info Obfuscation
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  // Email
  const user = "manayoeurm";
  const domain = "gmail.com";
  const email = `${user}@${domain}`;
  document.getElementById("email").innerHTML =
    `<a href="mailto:${email}">${email}</a>`;

  // Phone
  const countryCode = "+855";
  const number = "70705221";
  const phone = `${countryCode} ${number}`;
  document.getElementById("phone").innerHTML =
    `<a href="tel:${countryCode}${number}">${phone}</a>`;

  // LinkedIn
  const linkedinBase = "https://linkedin.com/in/";
  const linkedinProfile = "mana-yoeurm-406a23136"; // replace with your slug
  const linkedinUrl = linkedinBase + linkedinProfile;
  document.getElementById("linkedin").innerHTML =
    `<a href="${linkedinUrl}" target="_blank">mana yoeurm</a>`;

  // Facebook
  const fbBase = "https://facebook.com/";
  const fbProfile = "mana.yoeurm"; // replace with your slug
  const fbUrl = fbBase + fbProfile;
  document.getElementById("facebook").innerHTML =
    `<a href="${fbUrl}" target="_blank">Mana Yoeurm</a>`;

  // Address
  const city = "Battambang";
  const country = "Cambodia";
  const address = `${city}, ${country}`;
  document.getElementById("address").textContent = address;
});

document.addEventListener("DOMContentLoaded", () => {
  // ===============================
  // Experience Duration Calculator
  // ===============================
  function calculateDuration(startYear, startMonth, endYear = null, endMonth = null) {
    const startDate = new Date(startYear, startMonth - 1);
    const endDate = endYear && endMonth ? new Date(endYear, endMonth - 1) : new Date();

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    return `${years} yr${years !== 1 ? "s" : ""} ${months} mo${months !== 1 ? "s" : ""}`;
  }

  // Fill durations
  document.getElementById("self-employed-duration").textContent = calculateDuration(2024, 5);
  document.getElementById("marketing-duration").textContent = calculateDuration(2024, 1, 2024, 5);
  document.getElementById("masterit-duration").textContent = calculateDuration(2021, 1, 2023, 11);
  document.getElementById("iteam-duration").textContent = calculateDuration(2019, 4, 2020, 11);
  document.getElementById("cashier-duration").textContent = calculateDuration(2016, 12, 2018, 12);

  // ===============================
  // Navbar Collapse Behavior
  // ===============================
  const navbarCollapse = document.getElementById("menu");
  const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: false });

  document.addEventListener("click", (event) => {
    const isClickInside = navbarCollapse.contains(event.target) || event.target.closest(".navbar-toggler");
    if (!isClickInside && navbarCollapse.classList.contains("show")) {
      bsCollapse.hide();
    }
  });

  document.querySelectorAll(".navbar-nav .nav-link").forEach(link => {
    link.addEventListener("click", () => {
      if (navbarCollapse.classList.contains("show")) {
        bsCollapse.hide();
      }
    });
  });

  window.addEventListener("scroll", () => {
    if (navbarCollapse.classList.contains("show")) {
      bsCollapse.hide();
    }
  });

// ===============================
// Metadata Toggle Behavior (Fullscreen-driven + Mobile Landscape Auto-collapse)
// ===============================
const toggleBtn = document.querySelector(".metadata-toggle");
const metadata = document.querySelector(".viewerContent");
const viewer = document.querySelector(".viewer-window"); // main viewer container
const viewerMediaContainer = document.getElementById("viewerMedia"); // ✅ container div

let currentMode = "metadata"; // default when opening project

function enterMetadata() {
  metadata.classList.remove("collapsed");
  viewer.classList.remove("fullscreen-mode");
  currentMode = "metadata";
  toggleBtn.textContent = "Hide Details";
}

function enterFullscreen() {
  viewer.classList.add("fullscreen-mode");
  metadata.classList.add("collapsed"); // always hide metadata in fullscreen
  currentMode = "fullscreen";
  toggleBtn.textContent = "Show Details";
}

// ✅ Auto-apply collapsed state only on mobile landscape
function setInitialState() {
  const isMobileLandscape =
    window.innerWidth <= 768 &&
    window.matchMedia("(orientation: landscape)").matches;

  if (isMobileLandscape) {
    metadata.classList.add("collapsed");
    currentMode = "plain";
    toggleBtn.textContent = "Show Details";
  } else {
    enterMetadata();
  }
}

// Run once on load
setInitialState();

// Run again if window is resized or orientation changes
window.addEventListener("resize", setInitialState);

// Button click
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    if (currentMode === "metadata") {
      enterFullscreen();
    } else if (currentMode === "fullscreen") {
      enterMetadata();
    } else if (currentMode === "plain") {
      enterMetadata();
    }
  });
}

// Double-click on media (bind to container, check for child)
viewerMediaContainer.addEventListener("dblclick", (e) => {
  const mediaEl = viewerMediaContainer.querySelector(".viewer-media");
  if (!mediaEl || e.target !== mediaEl) return;

  if (currentMode === "metadata" || currentMode === "plain") {
    enterFullscreen();
  } else if (currentMode === "fullscreen") {
    enterMetadata();
  }
    
});

});

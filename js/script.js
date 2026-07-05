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

  // Close menu when clicking outside
  document.addEventListener("click", (event) => {
    const isClickInside = navbarCollapse.contains(event.target) || event.target.closest(".navbar-toggler");
    if (!isClickInside && navbarCollapse.classList.contains("show")) {
      bsCollapse.hide();
    }
  });

  // Close menu when clicking a nav-link
  document.querySelectorAll(".navbar-nav .nav-link").forEach(link => {
    link.addEventListener("click", () => {
      if (navbarCollapse.classList.contains("show")) {
        bsCollapse.hide();
      }
    });
  });

  // Close menu when scrolling
  window.addEventListener("scroll", () => {
    if (navbarCollapse.classList.contains("show")) {
      bsCollapse.hide();
    }
  });

  // ===============================
  // Metadata Toggle Behavior
  // ===============================
  const toggleBtn = document.querySelector(".metadata-toggle");
  const metadata = document.querySelector(".viewerContent");

  if (toggleBtn && metadata) {
    toggleBtn.addEventListener("click", () => {
      metadata.classList.toggle("collapsed");
      toggleBtn.textContent = metadata.classList.contains("collapsed")
        ? "Show Details"
        : "Hide Details";
    });
  }

  // ===============================
  // Certificate Modal Behavior
  // ===============================
  const certificateModal = document.getElementById('certificateModal');
  if (certificateModal) {
    certificateModal.addEventListener('show.bs.modal', function (event) {
      const button = event.relatedTarget;
      const title = button.getAttribute('data-title');
      const link = button.getAttribute('data-link');

      certificateModal.querySelector('.modal-title').textContent = title;
      certificateModal.querySelector('#certificateFrame').src = link;
    });

    certificateModal.addEventListener('hidden.bs.modal', function () {
      certificateModal.querySelector('#certificateFrame').src = "";
    });
  }
});

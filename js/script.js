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


// Fade-in timeline items on scroll with staggered delay
document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".timeline li");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Find index of the item
        const index = Array.from(items).indexOf(entry.target);
        // Apply staggered delay based on index
        entry.target.style.transitionDelay = `${index * 0.15}s`;
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.2 });

  items.forEach(item => observer.observe(item));
});

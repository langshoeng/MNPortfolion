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
  const items = document.querySelectorAll(".timeline > li");
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
// Experience Timeline — Details Toggle
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".timeline-toggle").forEach(btn => {
    const details = btn.nextElementSibling;
    const label = btn.querySelector(".timeline-toggle-label");
    if (!details || !details.classList.contains("timeline-details")) return;

    btn.addEventListener("click", () => {
      const isOpen = details.classList.contains("open");
      if (isOpen) {
        details.style.maxHeight = null;
        details.classList.remove("open");
        btn.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
        if (label) label.textContent = "Show Details";
      } else {
        details.classList.add("open");
        details.style.maxHeight = details.scrollHeight + "px";
        btn.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
        if (label) label.textContent = "Hide Details";
      }
    });
  });
});

// ===============================
// Contact Info Obfuscation
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const user = "manayoeurm";
  const domain = "gmail.com";
  const email = `${user}@${domain}`;
  document.getElementById("email").innerHTML =
    `<a href="mailto:${email}">${email}</a>`;

  const countryCode = "+855";
  const number = "Available_on_Request";
  const phone = `${countryCode} ${number}`;
  document.getElementById("phone").innerHTML =
    `<a href="tel:${countryCode}${number}">${phone}</a>`;

  const linkedinUrl = "https://linkedin.com/in/mana-yoeurm-406a23136";
  document.getElementById("linkedin").innerHTML =
    `<a href="${linkedinUrl}" target="_blank">mana yoeurm</a>`;

  const fbUrl = "https://facebook.com/mana.yoeurm";
  document.getElementById("facebook").innerHTML =
    `<a href="${fbUrl}" target="_blank">Mana Yoeurm</a>`;

  const address = "Battambang, Cambodia";
  document.getElementById("address").textContent = address;
});

// ===============================
// Experience Duration, Navbar, Metadata, Certificate, Peek Preview
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  // Experience Duration Calculator
  function calculateDuration(startYear, startMonth, endYear = null, endMonth = null) {
    const startDate = new Date(startYear, startMonth - 1);
    const endDate = endYear && endMonth ? new Date(endYear, endMonth - 1) : new Date();
    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();
    if (months < 0) { years--; months += 12; }
    return `${years} yr${years !== 1 ? "s" : ""} ${months} mo${months !== 1 ? "s" : ""}`;
  }
  document.getElementById("self-employed-duration").textContent = calculateDuration(2024, 5);
  document.getElementById("marketing-duration").textContent = calculateDuration(2024, 1, 2024, 5);
  document.getElementById("masterit-duration").textContent = calculateDuration(2021, 1, 2023, 11);
  document.getElementById("iteam-duration").textContent = calculateDuration(2019, 4, 2020, 11);
  document.getElementById("cashier-duration").textContent = calculateDuration(2016, 12, 2018, 12);

  // Navbar Collapse Behavior
  const navbarCollapse = document.getElementById("menu");
  const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: false });
  document.addEventListener("click", (event) => {
    const isClickInside = navbarCollapse.contains(event.target) || event.target.closest(".navbar-toggler");
    if (!isClickInside && navbarCollapse.classList.contains("show")) bsCollapse.hide();
  });
  document.querySelectorAll(".navbar-nav .nav-link").forEach(link => {
    link.addEventListener("click", () => {
      if (navbarCollapse.classList.contains("show")) bsCollapse.hide();
    });
  });
  window.addEventListener("scroll", () => {
    if (navbarCollapse.classList.contains("show")) bsCollapse.hide();
  });

  // Metadata Toggle Behavior
  const toggleBtn = document.querySelector(".metadata-toggle");
  const metadata = document.querySelector(".viewerContent");
  if (toggleBtn && metadata) {
    toggleBtn.addEventListener("click", () => {
      metadata.classList.toggle("collapsed");
      toggleBtn.textContent = metadata.classList.contains("collapsed")
        ? "Show Details" : "Hide Details";
    });
  }

  // Certificate Modal Behavior
  const certificateModal = document.getElementById('certificateModal');
  if (certificateModal) {
    // The trigger elements themselves are the source of truth for order —
    // no separate data array to keep in sync, just whatever's in the DOM
    const certificateTriggers = Array.from(document.querySelectorAll('[data-bs-target="#certificateModal"]'));
    const certificateFrame = certificateModal.querySelector('#certificateFrame');
    const certificateTitleEl = certificateModal.querySelector('.modal-title');
    const certificateCounterEl = document.getElementById('certificateCounter');
    const certificatePrevBtn = document.getElementById('certificatePrev');
    const certificateNextBtn = document.getElementById('certificateNext');
    let currentCertificateIndex = 0;

    function showCertificateAt(index) {
      if (!certificateTriggers.length) return;
      currentCertificateIndex = (index + certificateTriggers.length) % certificateTriggers.length;
      const trigger = certificateTriggers[currentCertificateIndex];
      certificateTitleEl.textContent = trigger.getAttribute('data-title');
      certificateFrame.src = trigger.getAttribute('data-link');
      if (certificateCounterEl) {
        certificateCounterEl.textContent = `${currentCertificateIndex + 1} of ${certificateTriggers.length}`;
      }
    }

    certificateModal.addEventListener('show.bs.modal', function (event) {
      const button = event.relatedTarget;
      const index = certificateTriggers.indexOf(button);
      showCertificateAt(index >= 0 ? index : 0);
    });

    certificateModal.addEventListener('hidden.bs.modal', function () {
      certificateFrame.src = "";
    });

    if (certificatePrevBtn) {
      certificatePrevBtn.addEventListener('click', () => showCertificateAt(currentCertificateIndex - 1));
    }
    if (certificateNextBtn) {
      certificateNextBtn.addEventListener('click', () => showCertificateAt(currentCertificateIndex + 1));
    }

    document.addEventListener('keydown', (e) => {
      if (!certificateModal.classList.contains('show')) return;
      if (e.key === 'ArrowLeft') showCertificateAt(currentCertificateIndex - 1);
      else if (e.key === 'ArrowRight') showCertificateAt(currentCertificateIndex + 1);
    });
  }

  // Achievement cards — click anywhere on the card to open its certificate,
  // while the actual <a> stays the real, keyboard-focusable trigger (Tab +
  // Enter still work natively on it, unchanged). This just forwards a click
  // from elsewhere on the card to that same element, so mouse users get a
  // bigger target without adding a second, redundant tab-stop.
  document.querySelectorAll('.achievement-card').forEach(card => {
    const trigger = card.querySelector('.achievement-btn');
    if (!trigger) return;
    card.addEventListener('click', (e) => {
      if (e.target.closest('.achievement-btn')) return; // already handled natively
      trigger.click();
    });
  });

  // Peek Preview Behavior
  const peekModal = document.getElementById("peekModal");
  const peekImage = document.getElementById("peekImage");
  const peekVideo = document.getElementById("peekVideo");
  let pressTimer;

  function showPreview(card) {
    const video = card.dataset.video;
    const image = card.dataset.image;
    if (video) {
      peekVideo.src = video;
      peekVideo.style.display = "block";
      peekImage.style.display = "none";
    } else if (image) {
      peekImage.src = image;
      peekImage.style.display = "block";
      peekVideo.style.display = "none";
    }
    peekModal.classList.add("show");
  }

  function hidePreview() {
    peekModal.classList.remove("show");
    peekVideo.src = "";
    peekImage.src = "";
  }

  document.querySelectorAll(".project-card").forEach(card => {
    card.addEventListener("mousedown", () => {
      pressTimer = setTimeout(() => showPreview(card), 300);
    });
    card.addEventListener("mouseup", () => {
      clearTimeout(pressTimer);
      hidePreview();
    });
    card.addEventListener("mouseleave", () => {
      clearTimeout(pressTimer);
      hidePreview();
    });
    card.addEventListener("touchstart", () => {
      pressTimer = setTimeout(() => showPreview(card), 300);
    });
    card.addEventListener("touchend", () => {
      clearTimeout(pressTimer);
      hidePreview();
    });
  });
});

// ===============================
// Scroll Indicator — top/bottom-aware next/previous section nav
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const upBtn = document.getElementById("scrollUpBtn");
  const downBtn = document.getElementById("scrollDownBtn");
  if (!upBtn || !downBtn) return;

  function getSections() {
    return Array.from(document.querySelectorAll("section"));
  }

  function isAtBottom() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    return window.scrollY >= maxScroll - 10;
  }

  function updateScrollIndicator() {
    const atTop = window.scrollY <= 10;
    upBtn.style.display = atTop ? "none" : "flex";
    downBtn.style.display = isAtBottom() ? "none" : "flex";
  }

  // Matches `section { scroll-margin-top: 80px }` in the CSS — scrollIntoView
  // lands 80px ABOVE a section's raw offsetTop, not exactly at it. The
  // buffer here must safely exceed that gap, or the section just landed on
  // still satisfies "next" on the following click and re-selects itself.
  const SCROLL_MARGIN = 80;

  function scrollToNextSection() {
    const sections = getSections();
    const currentY = window.scrollY + 10;
    const next = sections.find(s => s.offsetTop > currentY + SCROLL_MARGIN + 20);
    if (next) {
      next.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
    }
  }

  function scrollToPrevSection() {
    const sections = getSections();
    const currentY = window.scrollY - 10;
    const prevCandidates = sections.filter(s => s.offsetTop < currentY - 50);
    const prev = prevCandidates[prevCandidates.length - 1];
    if (prev) {
      prev.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  downBtn.addEventListener("click", scrollToNextSection);
  upBtn.addEventListener("click", scrollToPrevSection);

  window.addEventListener("scroll", updateScrollIndicator, { passive: true });
  window.addEventListener("resize", updateScrollIndicator);
  updateScrollIndicator(); // set correct initial state before first scroll event

  // ===============================
  // Scroll Nudge — idle-triggered reminder, separate from the persistent
  // corner arrows above. Appears mid-right after a period of no activity,
  // auto-hides, and repeats as long as the visitor stays idle and hasn't
  // reached the bottom of the page.
  // ===============================
  const nudge = document.getElementById("scrollNudge");
  if (nudge) {
    const IDLE_DELAY = 5000;   // ms of inactivity before showing
    const SHOW_DURATION = 3000; // ms visible before auto-hiding
    let idleTimer = null;
    let hideTimer = null;

    function scheduleIdleTimer() {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(showNudge, IDLE_DELAY);
    }

    function showNudge() {
      if (isAtBottom()) {
        scheduleIdleTimer(); // don't show here, but keep checking — user may scroll up later
        return;
      }
      nudge.classList.add("show");
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        nudge.classList.remove("show");
        scheduleIdleTimer(); // still idle after hiding — this is the "periodically" part
      }, SHOW_DURATION);
    }

    function resetIdleTimer() {
      nudge.classList.remove("show");
      clearTimeout(hideTimer);
      scheduleIdleTimer();
    }

    ["scroll", "mousemove", "touchstart", "touchmove", "keydown", "wheel", "click"].forEach(evt => {
      window.addEventListener(evt, resetIdleTimer, { passive: true });
    });

    scheduleIdleTimer();
  }
});

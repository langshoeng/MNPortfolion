// ===========================================
// HERO SHOWREEL — depth coverflow, self-hosted <video>
// Rewritten from the YouTube IFrame API version: these clips are now local
// MP4 files, so there's no iframe, no YouTube branding to block, and none
// of the YouTube-specific workarounds (click-shield, forceHighQuality,
// disableCaptions) apply anymore — this file is simpler as a result, not
// just cleaner-looking.
// ===========================================

let heroReelData = [];
let heroReelIndex = 0;
let heroReelVideoEl = null;
let heroReelCurrentlyPlaying = false; // true once the front card's video has been started

// Called when the user clicks a card's own idle play button.
function playHeroReelFront() {
  heroReelCurrentlyPlaying = true;
  mountHeroReelVideo();
}

function mountHeroReelVideo() {
  const front = document.getElementById("heroReelFront");
  if (!front) return;
  const entry = heroReelData[heroReelIndex];
  const startTime = entry.video.start || 0;
  const endTime = entry.video.end; // optional — omit to just play the whole file

  front.innerHTML = `
    <video class="hero-reel-video" muted playsinline preload="auto"></video>
    <div class="hero-reel-pause-indicator" aria-hidden="true">
      <span class="hero-reel-play-icon">▶</span>
    </div>
  `;
  const video = front.querySelector(".hero-reel-video");
  heroReelVideoEl = video;

  // encodeURI so filenames with spaces (e.g. "3-Juice Product.mp4") load
  // correctly without needing to rename the actual files in the repo
  video.src = encodeURI(entry.video.url);

  // Guards against advancing twice if both the trim check (timeupdate) and
  // the video's own natural end (ended) fire close together
  let hasAdvanced = false;
  function advanceOnce() {
    if (hasAdvanced) return;
    hasAdvanced = true;
    advanceHeroReel();
  }

  video.addEventListener("loadedmetadata", () => {
    if (startTime) video.currentTime = startTime;
  });

  video.addEventListener("timeupdate", () => {
    if (endTime !== undefined && endTime !== null && video.currentTime >= endTime) {
      advanceOnce();
    }
  });

  video.addEventListener("ended", advanceOnce);

  video.addEventListener("click", () => {
    toggleHeroReelPlayback();
  });

  video.play().catch(() => {}); // autoplay can occasionally be blocked — fail silently rather than throw
  updateHeroReelPauseIndicator();
}

// Shows/hides the pause indicator based on INTENT (heroReelCurrentlyPlaying),
// not the video's raw .paused state. Those two differ on purpose: a video
// paused by scrolling out of view still has "intent" to be playing (it
// should silently resume when back in view, no indicator needed), while a
// video the user actually clicked to pause should show it clearly.
function updateHeroReelPauseIndicator() {
  const front = document.getElementById("heroReelFront");
  if (!front) return;
  front.classList.toggle("is-paused", !heroReelCurrentlyPlaying);
}

function toggleHeroReelPlayback() {
  if (!heroReelVideoEl) return;
  if (heroReelVideoEl.paused) {
    heroReelVideoEl.play();
    heroReelCurrentlyPlaying = true;
  } else {
    heroReelVideoEl.pause();
    heroReelCurrentlyPlaying = false;
  }
  updateHeroReelPauseIndicator();
}

// Builds the idle state for the front card: just a play button.
function buildIdleFrontCard(entry) {
  const front = document.getElementById("heroReelFront");
  if (!front) return;
  front.innerHTML = `
    <div class="hero-reel-idle">
      <button class="hero-reel-play" aria-label="Play ${entry.title}">
        <span class="hero-reel-play-icon" aria-hidden="true">▶</span>
      </button>
    </div>
  `;
  const playBtn = front.querySelector(".hero-reel-play");
  if (playBtn) {
    playBtn.onclick = (ev) => {
      ev.stopPropagation();
      playHeroReelFront();
    };
  }
}

function renderHeroReelFront(index, autoplay) {
  heroReelIndex = index;
  const entry = heroReelData[index];
  if (!entry) return;
  heroReelCurrentlyPlaying = false;
  buildIdleFrontCard(entry);
  if (autoplay) {
    playHeroReelFront();
  }
}

// Purely visual: the two receded cards behind the front one, labeled with
// the next titles in the queue so the stack order is legible.
function updateHeroReelStackPreview() {
  if (!heroReelData.length) return;
  const back1 = document.getElementById("heroReelBack1");
  const back2 = document.getElementById("heroReelBack2");
  const next1 = heroReelData[(heroReelIndex + 1) % heroReelData.length];
  const next2 = heroReelData[(heroReelIndex + 2) % heroReelData.length];
  if (back1) {
    const label = back1.querySelector(".hero-reel-card-label");
    if (label) label.textContent = next1.title;
  }
  if (back2) {
    const label = back2.querySelector(".hero-reel-card-label");
    if (label) label.textContent = next2.title;
  }
}

// Advances to the next reel — used for both auto-advance (video finished)
// and the manual "Next showreel" button. The next card inherits whatever
// play state the current card was in at the moment of advancing.
function advanceHeroReel() {
  const wasPlaying = heroReelCurrentlyPlaying;
  if (heroReelVideoEl) {
    heroReelVideoEl.pause();
    heroReelVideoEl.removeAttribute("src");
    heroReelVideoEl.load(); // releases the old file from memory/network
    heroReelVideoEl = null;
  }
  const nextIndex = (heroReelIndex + 1) % heroReelData.length;
  renderHeroReelFront(nextIndex, wasPlaying);
  updateHeroReelStackPreview();
}

// Hooked into pauseAllPreviews() (projects.js) via a typeof guard there —
// pauses so the reel's DOM/idle-vs-playing state survives if the user
// triggers a different preview elsewhere on the page.
function stopHeroReelPlayback() {
  if (!heroReelVideoEl) return;
  heroReelVideoEl.pause();
  heroReelCurrentlyPlaying = false;
  updateHeroReelPauseIndicator();
}

// Resumes/pauses playback based on scroll visibility, independent of
// heroReelCurrentlyPlaying (the user's actual intent). Scrolling out pauses
// the video without touching intent; scrolling back in resumes it ONLY if
// intent was still "playing" — so a video the user explicitly clicked to
// pause correctly stays paused when scrolled back into view, while one
// that was merely paused by leaving the viewport picks back up on its own.
function setupHeroReelVisibilityObserver() {
  const heroReelEl = document.getElementById("heroReel");
  if (!heroReelEl || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!heroReelVideoEl) return;
      if (entry.isIntersecting) {
        if (heroReelCurrentlyPlaying && heroReelVideoEl.paused) {
          heroReelVideoEl.play().catch(() => {});
        }
      } else {
        if (!heroReelVideoEl.paused) {
          heroReelVideoEl.pause();
        }
      }
    });
  }, { threshold: 0.3 });

  observer.observe(heroReelEl);
}

document.addEventListener("DOMContentLoaded", async () => {
  const stack = document.getElementById("heroReelStack");
  if (!stack) return; // widget markup not present on this page

  try {
    const res = await fetch("data/hero-reel.json?nocache=" + Date.now());
    if (!res.ok) throw new Error("Unable to load hero-reel.json");
    heroReelData = await res.json();
  } catch (err) {
    console.error(err);
    return;
  }

  if (!heroReelData.length) return;

  renderHeroReelFront(0, true); // autoplay on load — muted, so browser autoplay policies allow it
  updateHeroReelStackPreview();
  setupHeroReelVisibilityObserver();

  const nextBtn = document.getElementById("heroReelNext");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => advanceHeroReel());
  }
});

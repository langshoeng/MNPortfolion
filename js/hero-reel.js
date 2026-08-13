// ===========================================
// HERO SHOWREEL — depth coverflow
// A 5th playback surface alongside Quick Preview, Peek, the metadata modal,
// and hover preview. No custom controls, no audio — a plain muted clip with
// a single play button, auto-advancing on end or on manual "Next showreel".
// Relies on shared helpers already defined globally in projects.js:
// clearIntervals, forceHighQuality, disableCaptions, pauseAllPreviews.
// ===========================================

let heroReelData = [];
let heroReelIndex = 0;
let heroReelPlayer = null;
let heroReelIntervals = [];
let heroReelCurrentlyPlaying = false; // true once the front card's video has been started

function heroReelExtractVideoId(url) {
  if (url.includes("embed/")) return url.split("embed/")[1].split("?")[0];
  if (url.includes("v=")) return url.split("v=")[1].split("&")[0];
  return "";
}

// Same idea as enforceCutoff in projects.js, but instead of just stopping at
// the trim point, it auto-advances the reel — that's the "auto-switch when
// each reel finishes" behavior.
function heroReelEnforceCutoff(player, startTime, endTime, store) {
  const interval = setInterval(() => {
    if (!player || player.getPlayerState() !== YT.PlayerState.PLAYING) return;
    const current = player.getCurrentTime();
    if (current < startTime) {
      player.seekTo(startTime, true);
      return;
    }
    if (current >= endTime || current > endTime - 0.3) {
      clearInterval(interval);
      advanceHeroReel();
    }
  }, 400);
  if (store) store.push(interval);
  return interval;
}

// Called when the mouse/tap targets a card's own idle play button.
function playHeroReelFront() {
  heroReelCurrentlyPlaying = true;
  mountHeroReelPlayer();
}

function mountHeroReelPlayer() {
  const front = document.getElementById("heroReelFront");
  if (!front) return;
  const entry = heroReelData[heroReelIndex];
  const videoId = heroReelExtractVideoId(entry.video.url);
  const startTime = entry.video.start || 0;
  const endTime = entry.video.end;
  const playerId = `heroReelPlayer-${heroReelIndex}-${Date.now()}`;

  front.innerHTML = `
    <div id="${playerId}" style="width:100%; height:100%;"></div>
    <div class="yt-click-shield" style="top:0; left:0; right:0; bottom:0;"></div>
  `;

  const shieldEl = front.querySelector(".yt-click-shield");

  heroReelPlayer = new YT.Player(playerId, {
    videoId: videoId,
    playerVars: {
      autoplay: 1,
      mute: 1,
      controls: 0,
      rel: 0,
      modestbranding: 1,
      iv_load_policy: 3,
      cc_load_policy: 0,
      disablekb: 1,
      playsinline: 1,
      fs: 0,
      start: startTime
    },
    events: {
      'onReady': () => {
        heroReelPlayer.seekTo(startTime);
        forceHighQuality(heroReelPlayer);
        // Click-to-pause/resume — wired here (not right after shield
        // creation) so the player reference passed to toggleShieldPlayback
        // is guaranteed ready
        if (shieldEl) {
          shieldEl.onclick = (ev) => {
            ev.stopPropagation();
            const willPlay = toggleShieldPlayback(shieldEl, heroReelPlayer);
            heroReelCurrentlyPlaying = willPlay;
          };
        }
      },
      'onApiChange': () => {
        disableCaptions(heroReelPlayer);
      },
      'onStateChange': (e) => {
        if (e.data === YT.PlayerState.PLAYING) {
          forceHighQuality(heroReelPlayer);
          clearIntervals(heroReelIntervals);
          if (endTime !== undefined) {
            heroReelEnforceCutoff(heroReelPlayer, startTime, endTime, heroReelIntervals);
          }
        }
      }
    }
  });
}

// Builds the idle state for the front card: just a play button, no thumbnail
// required (these are placeholder entries with no real image yet).
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
// play state the current card was in at the moment of advancing: still
// playing (auto-advance always calls this while playing) or idle (manual
// skip before ever hitting play).
function advanceHeroReel() {
  const wasPlaying = heroReelCurrentlyPlaying;
  clearIntervals(heroReelIntervals);
  if (heroReelPlayer) {
    try { heroReelPlayer.destroy(); } catch (e) {}
    heroReelPlayer = null;
  }
  const nextIndex = (heroReelIndex + 1) % heroReelData.length;
  renderHeroReelFront(nextIndex, wasPlaying);
  updateHeroReelStackPreview();
}

// Hooked into pauseAllPreviews() (projects.js) via a typeof guard there —
// pauses (doesn't destroy) so the reel's DOM/idle-vs-playing state survives
// if the user scrolls to a project card and triggers a different preview.
function stopHeroReelPlayback() {
  if (!heroReelPlayer) return;
  try { heroReelPlayer.pauseVideo(); } catch (e) {}
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

  const nextBtn = document.getElementById("heroReelNext");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => advanceHeroReel());
  }
});

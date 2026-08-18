function enforceCutoff(player, startTime, endTime, store) {
  const interval = setInterval(() => {
    if (!player || player.getPlayerState() !== YT.PlayerState.PLAYING) return;

    const current = player.getCurrentTime();

    // Prevent rewinding before start
    if (current < startTime) {
      player.seekTo(startTime, true);
    }

    // Stop at cutoff OR if user scrubs past end backwards
    if (current >= endTime || current > endTime - 0.5) {
      player.stopVideo();
      clearInterval(interval);
    }
  }, 500);
  if (store) store.push(interval);
  return interval;
}

// =======================================
// Global YouTube API setup
// =======================================
let ytPlayer;

// Track currently active inline video card
let activeInlineVideo = null;
let activeInlinePlayer = null;

// Interval ids driving each preview surface, tracked separately so
// clearing one never accidentally kills the other's progress bar/timer
let peekIntervals = [];
let inlineIntervals = [];

// Small helper to clear a batch of intervals and empty the array
function clearIntervals(store) {
  store.forEach(id => clearInterval(id));
  store.length = 0;
}

// Rebuilds a project card's default thumbnail markup exactly as
// renderProjects() first creates it (image + media badge + peek hint) — used
// whenever a preview surface (Quick Preview, hover preview) reverts, so the
// badge doesn't disappear the way it used to.
function buildThumbMarkup(project) {
  let mediaBadge = "";
  if (project.video && project.video.type !== "none") {
    mediaBadge = `
      <span class="project-badge video">
        ${project.video.duration ? project.video.duration + " | " : ""}
        ▶
      </span>
    `;
  } else if (project.gallery && project.gallery.length) {
    mediaBadge = `
      <span class="project-badge image">
        🖼 ${project.gallery.length} Images
      </span>
    `;
  }
  return `
    <img src="${project.thumbnail}" alt="${project.title}">
    ${mediaBadge}
    <span class="peek-hint">Hold to Peek</span>
  `;
}

// Fully stop whatever inline Quick Preview is playing (if any) and
// revert that card back to its static thumbnail.
function stopInlinePreview() {
  if (!activeInlineVideo) return;

  const project = allProjects.find(p => p.id === activeInlineVideo.dataset.project);
  const thumb = activeInlineVideo.querySelector(".project-thumb");

  if (thumb && project) {
    thumb.innerHTML = buildThumbMarkup(project);
  }

  clearIntervals(inlineIntervals);
  activeInlinePlayer = null;
  activeInlineVideo = null;
}

// Pause the Peek modal's video without closing the modal
function pausePeekPlayback() {
  if (ytPlayer && typeof ytPlayer.pauseVideo === "function") {
    try { ytPlayer.pauseVideo(); } catch (e) {}
  }
}

// Single entry point — call this before opening ANY preview surface
// (Peek modal, Quick Preview, or full metadata view) so only one video can
// ever be playing at a time.
function pauseAllPreviews() {
  stopInlinePreview();
  pausePeekPlayback();
  stopHoverPreview();
  stopHoverGallery();
  if (typeof stopHeroReelPlayback === "function") stopHeroReelPlayback();
}

function peekModalIsOpen() {
  const el = document.getElementById("peekModal");
  return !!(el && el.classList.contains("show"));
}

function metadataModalIsOpen() {
  return typeof viewer !== "undefined" && !!(viewer && viewer.classList.contains("show"));
}

// =======================================
// Hover Preview — video projects
// Silently auto-plays the trimmed clip while the mouse rests on the card;
// unlike Quick Preview (which stops at the end), this loops back to the
// start so it keeps going for as long as the hover lasts.
// =======================================
let hoverPreviewCard = null;
let hoverPreviewPlayer = null;
let hoverPreviewIntervals = [];

function enforceLoopingCutoff(player, startTime, endTime, store) {
  const interval = setInterval(() => {
    if (!player || player.getPlayerState() !== YT.PlayerState.PLAYING) return;
    const current = player.getCurrentTime();
    if (current < startTime) {
      player.seekTo(startTime, true);
    }
    if (current >= endTime || current > endTime - 0.3) {
      player.seekTo(startTime, true);
    }
  }, 400);
  if (store) store.push(interval);
  return interval;
}

function startHoverPreview(card, project) {
  if (!project.video || project.video.type !== "youtube") return;
  if (activeInlineVideo === card) return; // Quick Preview already owns this thumb
  if (peekModalIsOpen() || metadataModalIsOpen()) return;

  pauseAllPreviews();

  const thumb = card.querySelector(".project-thumb");
  if (!thumb) return;

  const videoId = project.video.url.split("v=")[1].split("&")[0];
  const startTime = project.video.start || 0;
  const endTime = project.video.end;

  // Sized to match the default thumbnail image (230px) so hovering doesn't
  // shift the card's height. Shield gets explicit inline positioning so it
  // sizes to THIS box, independent of Quick Preview's 200px CSS rule.
  thumb.innerHTML = `
    <div style="position:relative; width:100%; height:230px; border-radius:8px; overflow:hidden;">
      <div id="hoverPlayer-${project.id}" style="width:100%; height:100%;"></div>
      <div class="yt-click-shield" style="top:0; left:0; right:0; bottom:0;"></div>
    </div>
  `;

  hoverPreviewCard = card;

  const hoverPlayer = new YT.Player(`hoverPlayer-${project.id}`, {
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
        hoverPlayer.seekTo(startTime);
        forceHighQuality(hoverPlayer);
      },
      'onApiChange': () => {
        disableCaptions(hoverPlayer);
      },
      'onStateChange': (e) => {
        if (e.data === YT.PlayerState.PLAYING) {
          forceHighQuality(hoverPlayer);
          clearIntervals(hoverPreviewIntervals);
          if (endTime !== undefined) {
            enforceLoopingCutoff(hoverPlayer, startTime, endTime, hoverPreviewIntervals);
          }
        }
      }
    }
  });

  hoverPreviewPlayer = hoverPlayer;
}

function stopHoverPreview() {
  if (!hoverPreviewCard) return;

  const project = allProjects.find(p => p.id === hoverPreviewCard.dataset.project);
  const thumb = hoverPreviewCard.querySelector(".project-thumb");
  if (thumb && project) {
    thumb.innerHTML = buildThumbMarkup(project);
  }

  clearIntervals(hoverPreviewIntervals);
  hoverPreviewPlayer = null;
  hoverPreviewCard = null;
}

// =======================================
// Hover Preview — gallery projects
// Cross-fades through project.gallery images while the mouse rests on the
// card, reverts to project.thumbnail the moment it leaves.
// =======================================
let hoverGalleryCard = null;
let hoverGalleryTimer = null;

function startHoverGallery(card, project) {
  if (!project.gallery || project.gallery.length < 2) return;
  if (peekModalIsOpen() || metadataModalIsOpen()) return;

  const img = card.querySelector(".project-thumb img");
  if (!img) return;

  hoverGalleryCard = card;
  img.style.transition = "opacity 0.25s ease";

  let index = 0;
  hoverGalleryTimer = setInterval(() => {
    index = (index + 1) % project.gallery.length;
    img.style.opacity = "0";
    setTimeout(() => {
      if (hoverGalleryCard !== card) return; // hover ended mid-fade, bail out
      img.src = project.gallery[index];
      img.style.opacity = "1";
    }, 250);
  }, 1100);
}

function stopHoverGallery() {
  if (hoverGalleryTimer) {
    clearInterval(hoverGalleryTimer);
    hoverGalleryTimer = null;
  }
  if (hoverGalleryCard) {
    const project = allProjects.find(p => p.id === hoverGalleryCard.dataset.project);
    const img = hoverGalleryCard.querySelector(".project-thumb img");
    if (img && project) {
      img.style.opacity = "0";
      setTimeout(() => {
        img.src = project.thumbnail;
        img.style.opacity = "1";
      }, 150);
    }
    hoverGalleryCard = null;
  }
}

// Custom progress updater
function updateProgress(player, startTime, endTime, barEl, store) {
  const duration = endTime - startTime;
  const interval = setInterval(() => {
    if (!player || player.getPlayerState() !== YT.PlayerState.PLAYING) return;
    const current = player.getCurrentTime();
    const progress = ((current - startTime) / duration) * 100;
    barEl.style.width = `${Math.min(progress, 100)}%`;
  }, 500);
  if (store) store.push(interval);
  return interval;
}

// Custom timer updater
function formatTime(seconds) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(Math.floor(seconds % 60)).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function updateTimer(player, startTime, endTime, timerEl, store) {
  const interval = setInterval(() => {
    if (!player || player.getPlayerState() !== YT.PlayerState.PLAYING) return;
    const current = player.getCurrentTime();
    if (current >= endTime) return;
    timerEl.textContent = formatTime(current - startTime);
  }, 500);
  if (store) store.push(interval);
  return interval;
}

// Wires up the mute/volume combo button — click toggles mute (drops to 0 /
// restores last non-zero value), hover reveals a vertical slider for manual
// volume control. Uses property assignment (onclick/oninput, not
// addEventListener) throughout so it's always safe to call again on a
// container that already had it wired — matters for Peek, whose DOM is
// static and reused across opens, unlike Quick Preview/metadata modal
// whose containers are rebuilt fresh every time.
function setupVolumeControl(player, container) {
  if (!player || !container) return;
  const muteBtn = container.querySelector(".mute-toggle");
  const slider = container.querySelector(".volume-slider");
  if (!muteBtn || !slider) return;

  // Track state locally instead of re-querying player.isMuted()/getVolume()
  // right after changing them — those calls are asynchronous under the
  // YouTube IFrame API (they post a message to the iframe), so reading them
  // back immediately returns the OLD value and the icon ends up one click
  // behind. We already know what we just told the player to do, so just
  // remember it ourselves.
  let lastVolume = 100;
  let muted = true; // every player in this project starts muted (autoplay policy)

  function render() {
    muteBtn.textContent = muted ? "🔇" : "🔊";
    slider.value = muted ? 0 : lastVolume;
  }

  muteBtn.onclick = (ev) => {
    ev.stopPropagation();
    if (muted) {
      player.setVolume(lastVolume);
      player.unMute();
      muted = false;
    } else {
      player.mute();
      muted = true;
    }
    render();
  };

  slider.oninput = (ev) => {
    ev.stopPropagation();
    const val = Number(slider.value);
    if (val > 0) {
      lastVolume = val;
      player.setVolume(val);
      player.unMute();
      muted = false;
    } else {
      player.mute();
      muted = true;
    }
    render();
  };

  // Don't let interacting with the slider trigger card hold-to-peek,
  // card click-through, or bubble into anything else behind it
  container.onmousedown = e => e.stopPropagation();
  container.ontouchstart = e => e.stopPropagation();
  container.onclick = e => e.stopPropagation();

  render();
}

// Brief play/pause icon flash on the click-shield, purely visual
function flashPlayPauseIcon(shieldEl, willPlay) {
  if (!shieldEl) return;
  let flash = shieldEl.querySelector(".play-pause-flash");
  if (!flash) {
    flash = document.createElement("div");
    flash.className = "play-pause-flash";
    shieldEl.appendChild(flash);
  }
  flash.textContent = willPlay ? "▶" : "⏸";
  flash.classList.remove("show");
  void flash.offsetWidth; // restart the CSS transition
  flash.classList.add("show");
  clearTimeout(flash._hideTimer);
  flash._hideTimer = setTimeout(() => flash.classList.remove("show"), 500);
}

// The click-shield blocks clicks from reaching YouTube's iframe (that's the
// point — no accidental navigation), which also means it swallows the click
// a user would normally use to pause/resume. This restores that on the
// shield itself instead.
function toggleShieldPlayback(shieldEl, player) {
  if (!player || typeof player.getPlayerState !== "function") return;
  let isPlaying = false;
  try { isPlaying = player.getPlayerState() === YT.PlayerState.PLAYING; } catch (e) {}
  if (isPlaying) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
  flashPlayPauseIcon(shieldEl, !isPlaying);
  return !isPlaying; // the state we just switched TO, for callers that need to track it
}

// Best-effort request for the highest available resolution. YouTube's
// embed player is largely adaptive-bitrate now and often overrides this
// based on the viewer's actual bandwidth, so this nudges it rather than
// guarantees it — still worth calling on every load since it costs nothing.
function forceHighQuality(player) {
  if (!player || typeof player.setPlaybackQuality !== "function") return;
  try { player.setPlaybackQuality("hd1080"); } catch (e) {}
}

// cc_load_policy:0 in playerVars only sets the DEFAULT caption state for a
// viewer with no prior preference — if the browser/account has ever turned
// captions on for any YouTube video, that preference is often stored at the
// browser/account level and silently overrides cc_load_policy on every
// embed. This clears the active caption track directly via the (undocumented
// but widely relied-on) captions module, which is more reliable. Must be
// called from the player's onApiChange event — calling it before the
// captions module has loaded does nothing.
function disableCaptions(player) {
  if (!player || typeof player.setOption !== "function") return;
  try { player.setOption("captions", "track", {}); } catch (e) {}
}


function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('peekVideo', {
    videoId: '',
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
      fs: 0
    },
    events: {
      'onApiChange': () => disableCaptions(ytPlayer)
    }
  });
}

function ensureYTPlayer() {
  if (!ytPlayer) {
    ytPlayer = new YT.Player('peekVideo', {
      videoId: '',
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
        fs: 0
      },
      events: {
        'onApiChange': () => disableCaptions(ytPlayer)
      }
    });
    console.log("YT player ensured");
  }
}

// =======================================
// Project Loader
// =======================================
let allProjects = [];

async function loadProjects() {
  try {
    const response = await fetch("data/projects.json?nocache=" + Date.now());
    if (!response.ok) throw new Error("Unable to load projects.json");
    allProjects = await response.json();
    renderProjects("All");
  } catch (err) {
    console.error(err);
  }
}

// =======================================
// Render Projects
// =======================================
// Tracks whatever's currently visible in the grid (after filtering), so the
// metadata modal's project prev/next (viewer.js) can navigate within the
// same set the user is actually browsing — not silently jump across an
// unrelated category if a filter is active.
let currentFilteredProjects = [];

function renderProjects(filter = "All") {
  const grid = document.getElementById("projectsGrid");
  grid.innerHTML = "";

  let projects = allProjects;
  if (filter !== "All") {
    projects = allProjects.filter(project =>
      project.categories.includes(filter)
    );
  }

  currentFilteredProjects = projects;

  projects.forEach(project => {
    const software = project.software ? project.software.join(" • ") : "";
    const category = project.categories ? project.categories.join(" / ") : "";

    let mediaBadge = "";
    if (project.video && project.video.type !== "none") {
      mediaBadge = `
        <span class="project-badge video">
          ${project.video.duration ? project.video.duration + " | " : ""}
          ▶
        </span>
      `;
    } else if (project.gallery && project.gallery.length) {
      mediaBadge = `
        <span class="project-badge image">
          🖼 ${project.gallery.length} Images
        </span>
      `;
    }

    let previewAttr = "";
    if (project.video && project.video.type !== "none") {
      const embedUrl = project.video.url.replace("watch?v=", "embed/").split("&")[0];
      previewAttr = `data-video="${embedUrl}"`;
    } else if (project.gallery && project.gallery.length) {
      previewAttr = `data-image="${project.gallery[0]}"`;
    }

    grid.innerHTML += `
      <div class="col-lg-4 col-md-6">
        <div class="project-card" data-project="${project.id}" ${previewAttr}>
          <div class="project-thumb">
            <img src="${project.thumbnail}" alt="${project.title}">
            ${mediaBadge}
            <span class="peek-hint">Hold to Peek</span>
          </div>
          <div class="project-actions">
            ${project.video && project.video.type !== "none" ? `
              <button class="quick-preview-btn" title="Plays video directly here, small view, no detail info">
                ▶ Quick Preview
              </button>
              <button class="metadata-btn" title="Open full project view with details, gallery, fullscreen">
                ▶ View Details
              </button>
            ` : ""}
          </div>
          <div class="project-info">
            <span class="project-category">${category}</span>
            <h4>${project.title}</h4>
            <p>${software}</p>
          </div>
        </div>
      </div>
    `;

  });

  // Peek modal logic
    const peekModal = document.getElementById("peekModal");
    const peekImage = document.getElementById("peekImage");
    const peekClose = document.getElementById("peekClose");
    const peekPrev = document.getElementById("peekPrev");
    const peekNext = document.getElementById("peekNext");
    const peekVideoWrapper = document.getElementById("peekVideoWrapper");
  
    let currentGallery = [];
    let currentIndex = 0;
  
    // ✅ Define showImageAt BEFORE attaching listeners
    function showImageAt(index) {
      if (currentGallery.length > 0) {
        currentIndex = (index + currentGallery.length) % currentGallery.length;
        peekImage.src = currentGallery[currentIndex];
      }
    }
  
    function showPreview(card) {
      pauseAllPreviews(); // stop any Quick Preview / pause peek video before opening

      const projectId = card.dataset.project;
      const project = allProjects.find(p => p.id === projectId);
      const video = card.dataset.video;
      const image = card.dataset.image;
    
      if (video) {
        let videoId = "";
        if (video.includes("embed/")) {
          videoId = video.split("embed/")[1].split("?")[0];
        } else if (video.includes("v=")) {
          videoId = video.split("v=")[1].split("&")[0];
        }
    
        peekVideoWrapper.style.display = "block";
        peekImage.style.display = "none";
        currentGallery = [];
    
        // Reset controls
        peekVideoWrapper.querySelector(".custom-progress-bar").style.width = "0%";
        peekVideoWrapper.querySelector(".playback-timer").textContent = "00:00:00";
    
        ensureYTPlayer();
    
        if (ytPlayer && videoId) {
          ytPlayer.loadVideoById({
            videoId: videoId,
            startSeconds: project?.video?.start || 0
          });
          ytPlayer.mute();
          forceHighQuality(ytPlayer);
          disableCaptions(ytPlayer);
    
          if (project?.video?.end !== undefined) {
            clearIntervals(peekIntervals); // drop any stale peek intervals first
            enforceCutoff(ytPlayer, project.video.start || 0, project.video.end, peekIntervals);
            updateProgress(ytPlayer, project.video.start || 0, project.video.end,
                           peekVideoWrapper.querySelector(".custom-progress-bar"), peekIntervals);
            updateTimer(ytPlayer, project.video.start || 0, project.video.end,
                        peekVideoWrapper.querySelector(".playback-timer"), peekIntervals);
          }

          // Mute/volume combo button + play-pause on the click-shield
          setupVolumeControl(ytPlayer, peekVideoWrapper.querySelector(".volume-control"));
          const peekShield = peekVideoWrapper.querySelector(".yt-click-shield");
          if (peekShield) peekShield.onclick = (ev) => { ev.stopPropagation(); toggleShieldPlayback(peekShield, ytPlayer); };
    
          // ✅ Click-to-seek on custom progress bar
          const progressTrack = peekVideoWrapper.querySelector(".custom-progress");
          progressTrack.onclick = (ev) => {
            ev.stopPropagation();
            const rect = progressTrack.getBoundingClientRect();
            const clickX = ev.clientX - rect.left;
            const percent = clickX / rect.width;
            const duration = project.video.end - (project.video.start || 0);
            const newTime = (project.video.start || 0) + percent * duration;
            ytPlayer.seekTo(newTime, true);
          };
        }
    
        if (peekPrev) peekPrev.style.display = "none";
        if (peekNext) peekNext.style.display = "none";
      } else if (image) {
        currentGallery = project.gallery || [image];
        currentIndex = 0;
    
        peekImage.src = currentGallery[currentIndex];
        peekImage.style.display = "block";
        peekVideoWrapper.style.display = "none";
    
        if (peekPrev) peekPrev.style.display = "block";
        if (peekNext) peekNext.style.display = "block";
      }
    
      peekModal.classList.add("show");
    }
  
    function hidePreview() {
      peekModal.classList.remove("show");
      peekImage.src = "";
      peekVideoWrapper.style.display = "none";
      currentGallery = [];
      currentIndex = 0;
      clearIntervals(peekIntervals);
      if (ytPlayer) ytPlayer.stopVideo();
    }
  
    // ✅ Now listeners can safely call showImageAt
    if (peekClose) peekClose.addEventListener("click", hidePreview);
    if (peekPrev) peekPrev.addEventListener("click", () => showImageAt(currentIndex - 1));
    if (peekNext) peekNext.addEventListener("click", () => showImageAt(currentIndex + 1));
  
    peekModal.addEventListener("click", (e) => {
      if (e.target === peekModal) hidePreview();
    });
  
    // ✅ Keyboard navigation restored
    document.addEventListener("keydown", (e) => {
      if (!peekModal.classList.contains("show")) return;
    
      if (e.key === "ArrowLeft") {
        showImageAt(currentIndex - 1);
      } else if (e.key === "ArrowRight") {
        showImageAt(currentIndex + 1);
      } else if (e.key === "Escape") {
        hidePreview();
      }
    });
    
    // ✅ Swipe gesture navigation
    let touchStartX = 0;
    
    peekModal.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
    });
    
    peekModal.addEventListener("touchend", (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diffX = touchEndX - touchStartX;
    
      if (Math.abs(diffX) > 50) { // threshold
        if (diffX > 0) {
          showImageAt(currentIndex - 1); // swipe right → previous
        } else {
          showImageAt(currentIndex + 1); // swipe left → next
        }
      }
    });

  // ✅ Add inline play button listeners

  // Handle Quick Preview
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".quick-preview-btn");
    if (!btn) return;
  
    e.stopPropagation();
    const card = btn.closest(".project-card");
    const projectId = card.dataset.project;
    const project = allProjects.find(p => p.id === projectId);
    if (!project || !project.video || project.video.type !== "youtube") return;
  
    // Stop whatever else is playing (previous Quick Preview card,
    // and/or the Peek modal video) before starting this one
    pauseAllPreviews();
  
    // Replace with player + custom UI
    const thumb = card.querySelector(".project-thumb");
    thumb.innerHTML = `
      <div id="inlinePlayer-${projectId}" 
           style="width:100%; height:200px; border-radius:8px; overflow:hidden;">
      </div>
      <div class="yt-click-shield"></div>
      <div class="custom-controls">
        <div class="custom-progress">
          <div class="custom-progress-bar"></div>
        </div>
        <div class="playback-timer">00:00:00</div>
        <div class="volume-control">
          <button class="mute-toggle" aria-label="Mute">🔇</button>
          <div class="volume-popup">
            <input type="range" class="volume-slider" min="0" max="100" value="100">
          </div>
        </div>
      </div>
    `;

    activeInlineVideo = card;
  
    // ✅ Create the YouTube player
    const videoId = project.video.url.split("v=")[1].split("&")[0];
    const inlinePlayer = new YT.Player(`inlinePlayer-${projectId}`, {
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        mute: 1,
        rel: 0,
        controls: 0,
        modestbranding: 1,
        iv_load_policy: 3,
        cc_load_policy: 0,
        disablekb: 1,
        playsinline: 1,
        fs: 0,
        start: project.video.start || 0
      },
      events: {
        'onReady': () => {
          inlinePlayer.seekTo(project.video.start || 0);
          forceHighQuality(inlinePlayer);
        },
        'onApiChange': () => {
          disableCaptions(inlinePlayer);
        },
        'onStateChange': (e) => {
          if (e.data === YT.PlayerState.PLAYING && project.video.end !== undefined) {
            forceHighQuality(inlinePlayer);
            clearIntervals(inlineIntervals); // avoid stacking duplicate loops
            enforceCutoff(inlinePlayer, project.video.start || 0, project.video.end, inlineIntervals);
            updateProgress(inlinePlayer, project.video.start || 0, project.video.end,
                           thumb.querySelector(".custom-progress-bar"), inlineIntervals);
            updateTimer(inlinePlayer, project.video.start || 0, project.video.end,
                        thumb.querySelector(".playback-timer"), inlineIntervals);
          }
        }
      }
    });

    activeInlinePlayer = inlinePlayer; // expose the live player so other code can pause it

    // Mute/volume combo button + play-pause on the click-shield
    setupVolumeControl(inlinePlayer, thumb.querySelector(".volume-control"));
    const inlineShield = thumb.querySelector(".yt-click-shield");
    if (inlineShield) inlineShield.onclick = (ev) => { ev.stopPropagation(); toggleShieldPlayback(inlineShield, inlinePlayer); };
  
    // ✅ Add click-to-seek on custom progress bar
    const progressTrack = thumb.querySelector(".custom-progress");
    progressTrack.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const rect = progressTrack.getBoundingClientRect();
      const clickX = ev.clientX - rect.left;
      const percent = clickX / rect.width;
      const duration = project.video.end - (project.video.start || 0);
      const newTime = (project.video.start || 0) + percent * duration;
      inlinePlayer.seekTo(newTime, true);
    });
  });
  
  // Handle Metadata Mode button
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".metadata-btn");
    if (!btn) return;
  
    e.stopPropagation();
    const card = btn.closest(".project-card");
    const projectId = card.dataset.project;
    const project = allProjects.find(p => p.id === projectId);
    if (!project) return;
  
    pauseAllPreviews(); // stop any playing preview before opening full detail view
    openProject(project); // your existing metadata modal function
  });

  // Bind events for cards
  document.querySelectorAll(".project-card").forEach(card => {
    let pressTimer;
    let startX, startY;
    const threshold = 10;

    card.addEventListener("mousedown", () => {
      pressTimer = setTimeout(() => showPreview(card), 500);
    });
    card.addEventListener("mouseup", () => clearTimeout(pressTimer));
    card.addEventListener("mouseleave", () => clearTimeout(pressTimer));

    card.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      pressTimer = setTimeout(() => showPreview(card), 500);
    });

    card.addEventListener("touchmove", (e) => {
      const touch = e.touches[0];
      if (Math.abs(touch.clientX - startX) > threshold ||
          Math.abs(touch.clientY - startY) > threshold) {
        clearTimeout(pressTimer);
      }
    });

    card.addEventListener("touchend", () => clearTimeout(pressTimer));

    // Hover preview: auto-play video / cycle gallery images while the
    // mouse rests on the card, revert the instant it leaves. Delayed
    // slightly so it doesn't fire on quick mouse-passes over the grid.
    const cardProjectId = card.dataset.project;
    const cardProject = allProjects.find(p => p.id === cardProjectId);
    let hoverDelayTimer = null;

    if (cardProject) {
      card.addEventListener("mouseenter", () => {
        hoverDelayTimer = setTimeout(() => {
          if (cardProject.video && cardProject.video.type === "youtube") {
            startHoverPreview(card, cardProject);
          } else if (cardProject.gallery && cardProject.gallery.length > 1) {
            startHoverGallery(card, cardProject);
          }
        }, 350);
      });

      card.addEventListener("mouseleave", () => {
        clearTimeout(hoverDelayTimer);
        stopHoverPreview();
        stopHoverGallery();
      });
    }
  });
}

// Initial Load
loadProjects();

// Global Unmute Pill Listener
document.addEventListener("DOMContentLoaded", () => {
  const unmuteHint = document.querySelector(".unmute-hint");
  if (unmuteHint) {
    unmuteHint.addEventListener("click", () => {
      if (ytPlayer) {
        ytPlayer.unMute();
        unmuteHint.classList.add("fade-out");
      }
    });
  }
});

// Global Click Events
document.addEventListener("click", (e) => {
  // Filter Buttons
  const filterBtn = e.target.closest(".filter-btn");
  if (filterBtn) {
    document.querySelectorAll(".filter-btn")
      .forEach(btn => btn.classList.remove("active"));
    filterBtn.classList.add("active");
    renderProjects(filterBtn.dataset.filter);
    return;
  }

  // Project Card
  const card = e.target.closest(".project-card");
  if (!card) return;

  const projectId = card.dataset.project;
  const project = allProjects.find(p => p.id === projectId);
  if (!project) return;

  pauseAllPreviews(); // stop any playing preview before opening full detail view
  openProject(project);
});

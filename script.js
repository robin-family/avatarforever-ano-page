const CATEGORY_META = {
  talk: { label: "Talking", description: "Audio-driven talking" },
  emotion: { label: "Emotion", description: "Expressive performance" },
  movie_shot: { label: "Cinematic", description: "Cinematic portrait" },
  sing: { label: "Singing", description: "Singing performance" },
  conversion: { label: "Conversation", description: "Long-form conversation" },
  animal: { label: "Animals", description: "Non-human subjects" },
  general_cases: { label: "General scenes", description: "General streaming scene" },
};

const CATEGORY_ORDER = ["talk", "emotion", "movie_shot", "sing", "conversion", "animal", "general_cases"];

const METHOD_META = {
  our: { label: "Avatar-Forever", ours: true },
  our_cache: { label: "Avatar-Forever + ForeverCache", ours: true },
  inftalk: { label: "InfiniteTalk", ours: false },
  liveavatar: { label: "LiveAvatar", ours: false },
  omni: { label: "OmniAvatar", ours: false },
  soulx: { label: "Soul-X", ours: false },
};

const METHOD_ORDER = ["our", "our_cache", "inftalk", "liveavatar", "omni", "soulx"];

const REBUTTAL_METHODS = {
  our: { label: "Avatar-Forever", detail: "Decoupled DMD + RRT" },
  dmd_only: { label: "DMD only", detail: "Few-step distillation only" },
  fm_only: { label: "FM only", detail: "Flow matching only" },
  d2rrt: { label: "DMD → RRT", detail: "Sequential training" },
  rrt2d: { label: "RRT → DMD", detail: "Sequential training" },
  soulx: { label: "Soul-X", detail: "Baseline" },
};

const HERO_CASES = [
  {
    title: "Talking · Case 06",
    category: "Talking performance",
    src: "assets/videos/good_cases/talk/sample_0032__14.mp4",
    poster: "assets/posters/good_cases/talk/sample_0032__14.jpg",
    duration: 9.2,
  },
  {
    title: "Emotion · Case 01",
    category: "Expressive performance",
    src: "assets/videos/good_cases/emotion/sample_0127__speak_Gratitude_da9c.mp4",
    poster: "assets/posters/good_cases/emotion/sample_0127__speak_Gratitude_da9c.jpg",
    duration: 9.64,
  },
  {
    title: "Cinematic · Case 02",
    category: "Cinematic portrait",
    src: "assets/videos/good_cases/movie_shot/sample_0117__cry_md0001.mp4",
    poster: "assets/posters/good_cases/movie_shot/sample_0117__cry_md0001.jpg",
    duration: 12.2,
  },
  {
    title: "Singing · Case 05",
    category: "Singing performance",
    src: "assets/videos/good_cases/sing/sample_0024__7.mp4",
    poster: "assets/posters/good_cases/sing/sample_0024__7.jpg",
    duration: 13.68,
  },
  {
    title: "Animal · Case 04",
    category: "Non-human subject",
    src: "assets/videos/good_cases/animal/sample_0005__5.mp4",
    poster: "assets/posters/good_cases/animal/sample_0005__5.jpg",
    duration: 13.16,
  },
];

const heroState = {
  index: 0,
  timer: null,
  videoActive: false,
  reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
};

const state = {
  manifest: [],
  showcaseCategory: "talk",
  shortCase: "case1",
  longCase: "case1",
};

function formatDuration(seconds) {
  const rounded = Math.round(seconds);
  const minutes = Math.floor(rounded / 60);
  const remainder = rounded % 60;
  return minutes ? `${minutes}:${String(remainder).padStart(2, "0")}` : `${remainder}s`;
}

function stopHeroRotation() {
  if (heroState.timer) window.clearInterval(heroState.timer);
  heroState.timer = null;
}

function startHeroRotation() {
  stopHeroRotation();
  if (heroState.reducedMotion || heroState.videoActive || document.hidden) return;
  heroState.timer = window.setInterval(() => {
    showHeroCase(heroState.index + 1, false);
  }, 6500);
}

function renderHeroDots() {
  const container = document.querySelector("#hero-carousel-dots");
  container.replaceChildren();
  HERO_CASES.forEach((item, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot";
    dot.setAttribute("aria-label", `Show ${item.title}`);
    dot.setAttribute("aria-current", String(index === heroState.index));
    dot.addEventListener("click", () => showHeroCase(index, true));
    container.append(dot);
  });
}

function showHeroCase(index, restartRotation = true) {
  heroState.index = (index + HERO_CASES.length) % HERO_CASES.length;
  heroState.videoActive = false;
  const item = HERO_CASES[heroState.index];
  document.querySelector("#hero-carousel-stage").innerHTML = `
    <button
      class="media-launch media-launch-hero"
      type="button"
      data-video-src="${item.src}"
      data-poster-src="${item.poster}"
      aria-label="Play ${item.title}"
    >
      <img src="${item.poster}" alt="Preview of ${item.title}" />
      <span class="play-button" aria-hidden="true">▶</span>
      <span class="media-overlay">
        <span class="media-kicker">Featured inference · ${heroState.index + 1} of ${HERO_CASES.length}</span>
        <strong>${item.title}</strong>
        <small>${item.category} · ${formatDuration(item.duration)} · click to play with audio</small>
      </span>
    </button>`;
  renderHeroDots();
  if (restartRotation) startHeroRotation();
}

function initializeHeroCarousel() {
  const carousel = document.querySelector("#hero-carousel");
  document.querySelector("#hero-carousel-prev").addEventListener("click", () => showHeroCase(heroState.index - 1));
  document.querySelector("#hero-carousel-next").addEventListener("click", () => showHeroCase(heroState.index + 1));
  carousel.addEventListener("pointerenter", stopHeroRotation);
  carousel.addEventListener("pointerleave", startHeroRotation);
  carousel.addEventListener("focusin", stopHeroRotation);
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) startHeroRotation();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopHeroRotation();
    else startHeroRotation();
  });
  showHeroCase(0);
}

function mediaButton(item, label, extraClass = "") {
  return `
    <button
      class="media-launch ${extraClass}"
      type="button"
      data-video-src="${item.src}"
      data-poster-src="${item.poster}"
      aria-label="Play ${label}"
    >
      <img src="${item.poster}" alt="${label} video preview" loading="lazy" />
      <span class="play-button" aria-hidden="true">▶</span>
    </button>`;
}

function videoCard(item, title, subtitle, options = {}) {
  const oursClass = options.ours ? " is-ours" : "";
  const badge = options.badge ? `<span class="method-badge">${options.badge}</span>` : "";
  return `
    <article class="video-card${oursClass}">
      ${mediaButton(item, title)}
      <div class="video-caption">
        <div>
          <h3>${title}</h3>
          <p>${subtitle}</p>
        </div>
        ${badge}
      </div>
    </article>`;
}

function renderTabs(container, entries, activeValue, onSelect) {
  container.replaceChildren();
  entries.forEach(({ value, label, count }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tab-button";
    button.role = "tab";
    button.setAttribute("aria-selected", String(value === activeValue));
    button.innerHTML = `${label}${Number.isFinite(count) ? `<span class="tab-count">${count}</span>` : ""}`;
    button.addEventListener("click", () => onSelect(value));
    container.append(button);
  });
}

function renderShowcase() {
  const items = state.manifest.filter(
    (item) => item.group === "good_cases" && item.category === state.showcaseCategory,
  );
  const tabs = CATEGORY_ORDER.map((category) => ({
    value: category,
    label: CATEGORY_META[category].label,
    count: state.manifest.filter((item) => item.group === "good_cases" && item.category === category).length,
  }));

  renderTabs(document.querySelector("#showcase-tabs"), tabs, state.showcaseCategory, (category) => {
    state.showcaseCategory = category;
    renderShowcase();
  });

  document.querySelector("#general-note").hidden = state.showcaseCategory !== "general_cases";
  document.querySelector("#showcase-grid").innerHTML = items
    .map((item, index) => videoCard(
      item,
      `${CATEGORY_META[item.category].label} · Case ${String(index + 1).padStart(2, "0")}`,
      `${CATEGORY_META[item.category].description} · ${formatDuration(item.duration)}`,
    ))
    .join("");
  document.querySelector("#showcase-status").textContent =
    `Showing ${items.length} ${CATEGORY_META[state.showcaseCategory].label.toLowerCase()} result${items.length === 1 ? "" : "s"}.`;
}

function renderComparison(group, caseName, tabsSelector, gridSelector, stateKey) {
  const cases = [...new Set(state.manifest.filter((item) => item.group === group).map((item) => item.case))].sort();
  renderTabs(
    document.querySelector(tabsSelector),
    cases.map((value, index) => ({ value, label: `Case ${index + 1}` })),
    caseName,
    (nextCase) => {
      state[stateKey] = nextCase;
      renderComparison(group, nextCase, tabsSelector, gridSelector, stateKey);
    },
  );

  const items = state.manifest
    .filter((item) => item.group === group && item.case === caseName)
    .sort((a, b) => METHOD_ORDER.indexOf(a.method) - METHOD_ORDER.indexOf(b.method));

  document.querySelector(gridSelector).innerHTML = items
    .map((item) => {
      const method = METHOD_META[item.method] || { label: item.method, ours: false };
      return videoCard(
        item,
        method.label,
        `${formatDuration(item.duration)} · matched input case`,
        { ours: method.ours, badge: method.ours ? "Ours" : "Baseline" },
      );
    })
    .join("");
}

function renderExtended() {
  const item = state.manifest.find((entry) => entry.group === "extended");
  if (!item) return;
  document.querySelector("#extended-video").innerHTML = `
    <button
      class="media-launch"
      type="button"
      data-video-src="${item.src}"
      data-poster-src="${item.poster}"
      aria-label="Play the extended eleven-minute result"
    >
      <img src="${item.poster}" alt="Preview of the extended Avatar-Forever generation" loading="lazy" />
      <span class="play-button" aria-hidden="true">▶</span>
      <span class="media-overlay">
        <span class="media-kicker">Continuous generation</span>
        <strong>Extended result · ${formatDuration(item.duration)}</strong>
        <small>Click to play with audio</small>
      </span>
    </button>`;
}

function rebuttalItems(group, methods) {
  return methods.map((method) => {
    const item = state.manifest.find((entry) => entry.group === group && entry.method === method);
    if (!item) throw new Error(`Missing ${group} video for ${method}`);
    return { ...item, ...REBUTTAL_METHODS[method] };
  });
}

function renderRebuttal() {
  const ablation = rebuttalItems("ablation_decouple", ["our", "dmd_only", "fm_only", "d2rrt", "rrt2d"]);
  document.querySelector("#ablation-grid").innerHTML = ablation
    .map((item) => videoCard(item, item.label, `${item.detail} · ${formatDuration(item.duration)}`, {
      ours: item.method === "our",
    }))
    .join("");

  const items = rebuttalItems("10min_compare", ["our", "dmd_only", "soulx"]);
  const grid = document.querySelector("#rebuttal-long-grid");
  grid.innerHTML = items.map((item) => `
    <article class="video-card${item.method === "our" ? " is-ours" : ""}">
      <video poster="${item.poster}" preload="none" playsinline aria-label="${item.label} comparison"></video>
      <div class="video-caption"><div><h3>${item.label}</h3><p>${item.detail}</p></div></div>
    </article>`).join("");

  const videos = Array.from(grid.querySelectorAll("video"));
  const lengths = document.querySelectorAll("#rebuttal-lengths button");
  const play = document.querySelector("#rebuttal-play");
  const seek = document.querySelector("#rebuttal-seek");
  const time = document.querySelector("#rebuttal-time");
  const audio = document.querySelector("#rebuttal-audio");
  const status = document.querySelector("#rebuttal-playback-status");
  const maxDuration = Math.min(...items.map((item) => item.duration));
  let limit = Math.min(60, maxDuration);
  let position = 0;
  let playing = false;
  let attempt = 0;
  let loaded = false;
  audio.replaceChildren(...items.map((item, index) => new Option(item.label, index)), new Option("Muted", -1));

  function clock(seconds) {
    const whole = Math.floor(seconds + 0.001);
    return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
  }

  function updateTimeline(seconds) {
    position = Math.min(limit, Math.max(0, seconds));
    seek.value = position;
    time.textContent = `${clock(position)} / ${clock(limit)}`;
    seek.setAttribute("aria-valuetext", time.textContent);
  }

  function pause() {
    attempt += 1;
    playing = false;
    videos.forEach((video) => video.pause());
    play.textContent = "Play comparison";
  }

  function jump(seconds) {
    updateTimeline(seconds);
    if (loaded) videos.forEach((video) => { video.currentTime = position; });
  }

  function setAudio() {
    videos.forEach((video, index) => { video.muted = index !== Number(audio.value); });
  }

  function reportPlaybackError() {
    pause();
    status.textContent = "Could not play all comparison videos. Reload this page and try again.";
    status.hidden = false;
  }

  lengths.forEach((button) => button.addEventListener("click", () => {
    pause();
    limit = Math.min(Number(button.dataset.seconds), maxDuration);
    lengths.forEach((option) => option.setAttribute("aria-pressed", String(option === button)));
    seek.max = limit;
    jump(0);
  }));
  seek.max = limit;
  seek.addEventListener("input", () => {
    pause();
    jump(Number(seek.value));
  });
  audio.addEventListener("change", setAudio);
  videos.forEach((video, index) => {
    video.addEventListener("timeupdate", () => {
      if (!playing) return;
      if (video.currentTime >= limit) {
        pause();
        jump(limit);
      } else if (index === 0) {
        updateTimeline(video.currentTime);
        videos.slice(1).forEach((peer) => {
          if (peer.readyState >= 2 && !peer.seeking && Math.abs(peer.currentTime - position) > 0.5) {
            peer.currentTime = position;
          }
        });
      }
    });
    video.addEventListener("ended", () => {
      if (!playing) return;
      pause();
      jump(Math.min(video.currentTime, limit));
    });
    video.addEventListener("error", reportPlaybackError);
  });
  play.addEventListener("click", () => {
    if (playing) {
      pause();
      return;
    }
    if (!loaded) {
      videos.forEach((video, index) => { video.src = items[index].src; });
      loaded = true;
    }
    status.hidden = true;
    jump(position >= limit ? 0 : position);
    setAudio();
    playing = true;
    play.textContent = "Pause comparison";
    const currentAttempt = ++attempt;
    Promise.all(videos.map((video) => video.play())).catch(() => {
      if (currentAttempt === attempt) reportPlaybackError();
    });
  });
  updateTimeline(0);
  document.querySelector("#rebuttal-transport").hidden = false;
}

function activateVideo(button) {
  if (button.closest("#hero-carousel")) {
    heroState.videoActive = true;
    stopHeroRotation();
  }
  const video = document.createElement("video");
  video.controls = true;
  video.autoplay = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.poster = button.dataset.posterSrc;
  video.src = button.dataset.videoSrc;
  video.setAttribute("aria-label", button.getAttribute("aria-label").replace(/^Play /, ""));
  button.replaceWith(video);
  video.play().catch(() => {});
}

function showLoadError() {
  const message = "The video library could not be displayed. Please refresh the page.";
  ["#showcase-grid", "#short-grid", "#long-grid", "#extended-video", "#ablation-grid", "#rebuttal-long-grid"].forEach((selector) => {
    document.querySelector(selector).innerHTML = `<div class="error-card">${message}</div>`;
  });
  document.querySelector("#showcase-status").textContent = "Video library unavailable.";
}

function initialize() {
  try {
    const library = document.querySelector("#video-library-data");
    if (!library) throw new Error("Embedded video library is missing");
    state.manifest = JSON.parse(library.textContent);
    renderShowcase();
    renderComparison("short_comparisons", state.shortCase, "#short-tabs", "#short-grid", "shortCase");
    renderComparison("long_comparisons", state.longCase, "#long-tabs", "#long-grid", "longCase");
    renderExtended();
    renderRebuttal();
  } catch (error) {
    console.error(error);
    showLoadError();
  }
}

document.addEventListener("click", (event) => {
  const launchButton = event.target.closest(".media-launch");
  if (launchButton) activateVideo(launchButton);
});

initializeHeroCarousel();
initialize();

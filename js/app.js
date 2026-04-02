document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("loaded");

  renderDynamicContent();
  setupSearch();
  setupZombieCursor();
  setupEmbers();
  setupTracker();
  setCurrentYear();
});

function renderDynamicContent() {
  const page = document.body.dataset.page || "";

  if (page === "home") renderHomePage();
  if (page === "maps") renderMapsPage();
  if (page === "guide") renderGuidePage();
}

function getRootPrefix() {
  return document.body.dataset.rootPrefix || "";
}

function assetPath(path) {
  return `${getRootPrefix()}${path}`;
}

function getGuideUrl(slug) {
  return `${getRootPrefix()}maps/guide.html?map=${encodeURIComponent(slug)}`;
}

function getGuides() {
  return Array.isArray(window.MAP_GUIDES) ? window.MAP_GUIDES : [];
}

function getFeaturedGuide() {
  const guides = getGuides();
  return guides.find((guide) => guide.featured) || guides[0] || null;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getCardMarkup(guide, isFeatured = false) {
  const extraClasses = isFeatured ? " featured-card" : "";
  const guideLabel = guide.cardLabel || "Guide";
  const altText = `${guide.title} ${guideLabel}`;
  const searchName = `${guide.title} ${guideLabel} ${guide.searchTerms || ""}`.trim();

  return `
    <article class="card${extraClasses}" data-name="${escapeHtml(searchName)}">
      <a href="${escapeHtml(getGuideUrl(guide.slug))}" aria-label="Open ${escapeHtml(guide.title)} ${escapeHtml(guideLabel)}">
        <img
          src="${escapeHtml(assetPath(`images/${guide.image}`))}"
          alt="${escapeHtml(altText)}"
          class="map-image"
        >
      </a>
      <h3>${escapeHtml(guide.title)}</h3>
      <p>${escapeHtml(guideLabel)}</p>
      <a href="${escapeHtml(getGuideUrl(guide.slug))}">${isFeatured ? "ENTER GUIDE" : "OPEN GUIDE"}</a>
    </article>
  `;
}

function renderHomePage() {
  const guideList = document.getElementById("guideList");
  const featuredTitleText = document.getElementById("featuredGuideTitleText");
  const latestGuideCta = document.getElementById("latestGuideCta");
  const featuredGuide = getFeaturedGuide();

  if (!guideList || !featuredGuide) return;

  guideList.innerHTML = getCardMarkup(featuredGuide, true);

  if (featuredTitleText) {
    featuredTitleText.textContent = featuredGuide.title;
  }

  if (latestGuideCta) {
    latestGuideCta.href = getGuideUrl(featuredGuide.slug);
  }
}

function renderMapsPage() {
  const guideList = document.getElementById("guideList");
  const guides = getGuides();

  if (!guideList) return;

  if (guides.length === 0) {
    guideList.innerHTML = `
      <div class="notes-box search-empty">
        <h3>No maps available</h3>
        <p>Add your first guide to <code>js/maps-data.js</code>.</p>
      </div>
    `;
    return;
  }

  guideList.innerHTML = guides.map((guide) => getCardMarkup(guide)).join("");
}

function renderGuidePage() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("map");
  const guides = getGuides();
  const guide = guides.find((item) => item.slug === slug);

  const content = document.getElementById("guideContent");
  const pageSubtitle = document.getElementById("guidePageSubtitle");
  const guideImage = document.getElementById("guideImage");
  const trackerHeading = document.getElementById("trackerHeading");
  const quickNotesBox = document.getElementById("quickNotesBox");
  const quickNotesList = document.getElementById("quickNotesList");
  const notesText = document.getElementById("notesText");
  const stepsList = document.getElementById("steps");

  if (!content || !pageSubtitle || !guideImage || !trackerHeading || !notesText || !stepsList) {
    return;
  }

  if (!guide) {
    document.title = "Guide Not Found - Undead Intel";
    pageSubtitle.textContent = "Guide Not Found";
    content.removeAttribute("data-tracker-key");
    content.innerHTML = `
      <div class="notes-box">
        <h2>Guide Not Found</h2>
        <p>The map you tried to open does not exist in your data file.</p>
        <p><a class="primary-link" href="../maps.html">Go Back to Maps</a></p>
      </div>
    `;
    return;
  }

  document.title = `${guide.title} - Undead Intel`;

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute(
      "content",
      `${guide.title} Easter Egg guide and tracker on Undead Intel.`
    );
  }

  pageSubtitle.textContent = guide.title;
  trackerHeading.textContent = `🧪 ${guide.title} Easter Egg Tracker`;
  notesText.textContent = guide.notes || "";
  content.dataset.trackerKey = guide.trackerKey || guide.slug.replaceAll("-", "_");

  guideImage.src = assetPath(`images/${guide.image}`);
  guideImage.alt = `${guide.title} ${guide.cardLabel || "Guide"}`;
  guideImage.hidden = false;

  stepsList.textContent = "";

  guide.steps.forEach((step) => {
    const li = document.createElement("li");
    const label = document.createElement("label");
    const input = document.createElement("input");
    const textNode = document.createTextNode(` ${step}`);

    input.type = "checkbox";
    label.appendChild(input);
    label.appendChild(textNode);
    li.appendChild(label);
    stepsList.appendChild(li);
  });

  if (quickNotesBox && quickNotesList) {
    quickNotesList.textContent = "";

    if (Array.isArray(guide.quickNotes) && guide.quickNotes.length > 0) {
      guide.quickNotes.forEach((note) => {
        const li = document.createElement("li");
        li.textContent = note;
        quickNotesList.appendChild(li);
      });

      quickNotesBox.hidden = false;
    } else {
      quickNotesBox.hidden = true;
    }
  }
}

function setupSearch() {
  const searchInput = document.getElementById("search");
  const guideList = document.getElementById("guideList");
  const cards = Array.from(document.querySelectorAll(".card"));

  if (!searchInput || !guideList || cards.length === 0) return;

  let noResults = document.getElementById("search-empty");

  if (!noResults) {
    noResults = document.createElement("div");
    noResults.id = "search-empty";
    noResults.className = "notes-box search-empty";
    noResults.hidden = true;
    noResults.innerHTML = `
      <h3>No results found</h3>
      <p>Try a different map name or search term.</p>
    `;
    guideList.insertAdjacentElement("afterend", noResults);
  }

  function filterCards() {
    const input = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const dataName = (card.getAttribute("data-name") || "").toLowerCase();
      const heading = (card.querySelector("h3")?.textContent || "").toLowerCase();
      const text = (card.querySelector("p")?.textContent || "").toLowerCase();

      const searchableText = `${dataName} ${heading} ${text}`.trim();
      const isMatch = input === "" || searchableText.includes(input);

      card.hidden = !isMatch;

      if (isMatch) {
        visibleCount += 1;
      }
    });

    noResults.hidden = visibleCount > 0;
  }

  searchInput.addEventListener("input", filterCards);
  filterCards();
}

function setupZombieCursor() {
  const cursor = document.querySelector(".zombie-cursor");
  if (!cursor) return;

  const supportsCustomCursor =
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (!supportsCustomCursor) return;

  let mouseX = 0;
  let mouseY = 0;
  let rafId = null;

  function renderCursor() {
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
    cursor.style.opacity = "1";
    rafId = null;
  }

  document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    if (!rafId) {
      rafId = requestAnimationFrame(renderCursor);
    }
  });

  document.addEventListener("mouseleave", () => {
    cursor.style.opacity = "0";
  });

  document.addEventListener("mouseenter", () => {
    cursor.style.opacity = "1";
  });
}

function setupEmbers() {
  const canvas = document.getElementById("particles");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  let embers = [];
  let animationId = null;
  let width = 0;
  let height = 0;
  let dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

  function getEmberCount() {
    return window.innerWidth <= 760 ? 90 : 150;
  }

  function emberColor() {
    const colors = [
      { fill: "255,190,95", glow: "255,170,70" },
      { fill: "255,150,60", glow: "255,110,35" },
      { fill: "255,120,40", glow: "255,90,25" },
      { fill: "255,215,150", glow: "255,180,90" },
      { fill: "255,85,25", glow: "255,60,15" }
    ];

    return colors[Math.floor(Math.random() * colors.length)];
  }

  function createEmber(fromBottom = false) {
    const warm = emberColor();
    const size = Math.random() * 3.8 + 1.1;

    return {
      x: Math.random() * width,
      y: fromBottom ? height + Math.random() * 160 : Math.random() * height,
      baseSize: size,
      width: size * (Math.random() * 1.6 + 0.7),
      height: size * (Math.random() * 1.2 + 0.8),
      speedY: Math.random() * 1.25 + 0.28,
      speedX: (Math.random() - 0.5) * 0.42,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.028 + 0.006,
      alpha: Math.random() * 0.50 + 0.22,
      flicker: Math.random() * 0.05 + 0.012,
      rotation: Math.random() * Math.PI,
      rotationSpeed: (Math.random() - 0.5) * 0.014,
      fill: warm.fill,
      glow: warm.glow
    };
  }

  function rebuildEmbers() {
    const targetCount = getEmberCount();
    embers = [];

    for (let index = 0; index < targetCount; index += 1) {
      embers.push(createEmber(false));
    }
  }

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    rebuildEmbers();
  }

  function drawEmber(ember) {
    ctx.save();
    ctx.translate(ember.x, ember.y);
    ctx.rotate(ember.rotation);

    const alpha = Math.max(0, Math.min(1, ember.alpha));
    ctx.fillStyle = `rgba(${ember.fill}, ${alpha})`;
    ctx.shadowBlur = ember.baseSize * 10;
    ctx.shadowColor = `rgba(${ember.glow}, ${Math.min(1, alpha + 0.22)})`;

    ctx.beginPath();
    ctx.ellipse(0, 0, ember.width, ember.height, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 240, 210, ${alpha * 0.34})`;
    ctx.beginPath();
    ctx.ellipse(
      -ember.width * 0.14,
      -ember.height * 0.14,
      ember.width * 0.34,
      ember.height * 0.26,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
  }

  function animateEmbers() {
    ctx.clearRect(0, 0, width, height);

    for (let index = 0; index < embers.length; index += 1) {
      const ember = embers[index];

      ember.sway += ember.swaySpeed;
      ember.rotation += ember.rotationSpeed;
      ember.x += Math.sin(ember.sway) * 0.36 + ember.speedX;
      ember.y -= ember.speedY;
      ember.alpha += (Math.random() - 0.5) * ember.flicker;

      if (ember.y < -50 || ember.x < -70 || ember.x > width + 70) {
        embers[index] = createEmber(true);
        continue;
      }

      drawEmber(ember);
    }

    ctx.shadowBlur = 0;
    animationId = requestAnimationFrame(animateEmbers);
  }

  function startAnimation() {
    if (!animationId) {
      animateEmbers();
    }
  }

  function stopAnimation() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  let resizeTimeout = null;

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resizeCanvas();
    }, 120);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAnimation();
    } else {
      startAnimation();
    }
  });

  resizeCanvas();
  startAnimation();
}

function setupTracker() {
  const trackerRoot = document.querySelector("[data-tracker-key]");
  if (!trackerRoot) return;

  const trackerKey = trackerRoot.getAttribute("data-tracker-key")?.trim();
  const progressContainer = trackerRoot.querySelector("#progress-container");
  const progressBar = trackerRoot.querySelector("#progress-bar");
  const progressText = trackerRoot.querySelector("[data-progress-text]");
  const resetButton = trackerRoot.querySelector("[data-reset-tracker]");
  const checkboxes = Array.from(
    trackerRoot.querySelectorAll("#steps input[type='checkbox']")
  );

  if (!trackerKey || !progressContainer || !progressBar || checkboxes.length === 0) {
    return;
  }

  function getSavedValue(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function setSavedValue(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* localStorage unavailable */
    }
  }

  function removeSavedValue(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* localStorage unavailable */
    }
  }

  function updateProgress() {
    const total = checkboxes.length;
    const done = checkboxes.filter((checkbox) => checkbox.checked).length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

    progressBar.style.width = `${percent}%`;
    progressContainer.setAttribute("role", "progressbar");
    progressContainer.setAttribute("aria-valuemin", "0");
    progressContainer.setAttribute("aria-valuemax", "100");
    progressContainer.setAttribute("aria-valuenow", String(percent));

    if (progressText) {
      progressText.textContent = `${done} of ${total} complete`;
    }
  }

  checkboxes.forEach((checkbox, index) => {
    const saved = getSavedValue(`${trackerKey}_${index}`);
    checkbox.checked = saved === "true";

    checkbox.addEventListener("change", () => {
      setSavedValue(`${trackerKey}_${index}`, String(checkbox.checked));
      updateProgress();
    });
  });

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      const confirmed = window.confirm("Reset all saved progress for this map?");
      if (!confirmed) return;

      checkboxes.forEach((checkbox, index) => {
        checkbox.checked = false;
        removeSavedValue(`${trackerKey}_${index}`);
      });

      updateProgress();
    });
  }

  updateProgress();
}

function setCurrentYear() {
  const yearNode = document.getElementById("currentYear");
  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("loaded");

  setupSearch();
  setupZombieCursor();
  setupEmbers();
});

function setupSearch() {
  const searchInput = document.getElementById("search");
  const cards = Array.from(document.querySelectorAll(".card"));

  if (!searchInput || cards.length === 0) return;

  function filterCards() {
    const input = searchInput.value.trim().toLowerCase();

    cards.forEach((card) => {
      const dataName = (card.getAttribute("data-name") || "").toLowerCase();
      const heading = (card.querySelector("h3")?.textContent || "").toLowerCase();
      const text = (card.querySelector("p")?.textContent || "").toLowerCase();

      const searchableText = `${dataName} ${heading} ${text}`.trim();
      const isMatch = searchableText.includes(input);

      card.style.display = isMatch ? "" : "none";
    });
  }

  searchInput.addEventListener("input", filterCards);
  filterCards();
}

function setupZombieCursor() {
  const hand = document.querySelector(".zombie-hand");

  if (!hand) return;

  const supportsCustomCursor =
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (!supportsCustomCursor) return;

  let mouseX = 0;
  let mouseY = 0;
  let rafId = null;
  let isVisible = false;

  function renderCursor() {
    hand.style.left = `${mouseX}px`;
    hand.style.top = `${mouseY}px`;

    if (!isVisible) {
      hand.style.opacity = "1";
      isVisible = true;
    }

    rafId = null;
  }

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!rafId) {
      rafId = requestAnimationFrame(renderCursor);
    }
  });

  document.addEventListener("mouseleave", () => {
    hand.style.opacity = "0";
    isVisible = false;
  });

  document.addEventListener("mouseenter", () => {
    if (!isVisible) {
      hand.style.opacity = "1";
      isVisible = true;
    }
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
    return window.innerWidth <= 760 ? 70 : 110;
  }

  function emberColor() {
    const colors = [
      { fill: "255,190,95", glow: "255,170,70" },
      { fill: "255,140,55", glow: "255,115,35" },
      { fill: "255,215,150", glow: "255,180,90" },
      { fill: "255,105,35", glow: "255,80,20" },
      { fill: "185,185,185", glow: "255,150,60" }
    ];

    return colors[Math.floor(Math.random() * colors.length)];
  }

  function createEmber(fromBottom = false) {
    const warm = emberColor();
    const size = Math.random() * 3.2 + 1.2;

    return {
      x: Math.random() * width,
      y: fromBottom ? height + Math.random() * 120 : Math.random() * height,
      baseSize: size,
      width: size * (Math.random() * 1.7 + 0.8),
      height: size * (Math.random() * 1.2 + 0.8),
      speedY: Math.random() * 0.9 + 0.25,
      speedX: (Math.random() - 0.5) * 0.55,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.03 + 0.008,
      alpha: Math.random() * 0.45 + 0.28,
      flicker: Math.random() * 0.04 + 0.01,
      rotation: Math.random() * Math.PI,
      rotationSpeed: (Math.random() - 0.5) * 0.01,
      fill: warm.fill,
      glow: warm.glow
    };
  }

  function rebuildEmbers() {
    const targetCount = getEmberCount();
    embers = [];

    for (let i = 0; i < targetCount; i += 1) {
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
    ctx.shadowBlur = ember.baseSize * 8;
    ctx.shadowColor = `rgba(${ember.glow}, ${Math.min(1, alpha + 0.18)})`;

    ctx.beginPath();
    ctx.ellipse(0, 0, ember.width, ember.height, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 240, 210, ${alpha * 0.32})`;
    ctx.beginPath();
    ctx.ellipse(
      -ember.width * 0.15,
      -ember.height * 0.12,
      ember.width * 0.35,
      ember.height * 0.28,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
  }

  function animateEmbers() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < embers.length; i += 1) {
      const ember = embers[i];

      ember.sway += ember.swaySpeed;
      ember.rotation += ember.rotationSpeed;
      ember.x += Math.sin(ember.sway) * 0.35 + ember.speedX;
      ember.y -= ember.speedY;
      ember.alpha += (Math.random() - 0.5) * ember.flicker;

      if (ember.y < -40 || ember.x < -60 || ember.x > width + 60) {
        embers[i] = createEmber(true);
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

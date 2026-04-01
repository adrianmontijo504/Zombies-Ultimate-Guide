(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("loaded");
  });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =========================
     SEARCH
  ========================= */
  const searchInput = document.getElementById("search");
  const cards = Array.from(document.querySelectorAll(".card"));
  const fadeDuration = 220;
  const fadeTimers = new WeakMap();

  function getCardSearchText(card) {
    const dataName = card.dataset.name || card.getAttribute("data-name") || "";
    const title = card.querySelector("h3")?.textContent || "";
    const description = card.querySelector("p")?.textContent || "";
    const imageAlt = card.querySelector("img")?.alt || "";
    return `${dataName} ${title} ${description} ${imageAlt}`.toLowerCase().trim();
  }

  const searchableCards = cards.map((card) => ({
    element: card,
    text: getCardSearchText(card)
  }));

  function showCard(card) {
    clearTimeout(fadeTimers.get(card));
    card.hidden = false;

    requestAnimationFrame(() => {
      card.classList.remove("is-hidden");
      card.classList.add("is-visible");
    });
  }

  function hideCard(card) {
    clearTimeout(fadeTimers.get(card));
    card.classList.remove("is-visible");
    card.classList.add("is-hidden");

    const timer = setTimeout(() => {
      if (card.classList.contains("is-hidden")) {
        card.hidden = true;
      }
    }, fadeDuration);

    fadeTimers.set(card, timer);
  }

  function filterCards() {
    const query = (searchInput?.value || "").trim().toLowerCase();

    searchableCards.forEach(({ element, text }) => {
      const match = query === "" || text.includes(query);
      if (match) {
        showCard(element);
      } else {
        hideCard(element);
      }
    });
  }

  if (searchInput && searchableCards.length) {
    searchInput.addEventListener("input", filterCards);
    filterCards();
  }

  /* =========================
     CHECKLIST PROGRESS
  ========================= */
  const stepsContainer = document.getElementById("steps");
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");

  if (stepsContainer) {
    const checkboxes = Array.from(
      stepsContainer.querySelectorAll('input[type="checkbox"]')
    );

    const storageKey = `zombies-guide-progress:${window.location.pathname}`;

    function saveProgress() {
      const values = checkboxes.map((checkbox) => checkbox.checked);
      localStorage.setItem(storageKey, JSON.stringify(values));
    }

    function loadProgress() {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return;

      try {
        const values = JSON.parse(saved);
        checkboxes.forEach((checkbox, index) => {
          checkbox.checked = Boolean(values[index]);
        });
      } catch (error) {
        console.error("Could not load saved progress:", error);
      }
    }

    function updateProgress() {
      const total = checkboxes.length;
      const complete = checkboxes.filter((checkbox) => checkbox.checked).length;
      const percent = total === 0 ? 0 : (complete / total) * 100;

      if (progressBar) {
        progressBar.style.width = `${percent}%`;
      }

      if (progressText) {
        progressText.textContent = `${complete} / ${total} complete`;
      }
    }

    loadProgress();
    updateProgress();

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        saveProgress();
        updateProgress();
      });
    });
  }

  /* =========================
     ZOMBIE HAND
  ========================= */
  const hand = document.querySelector(".zombie-hand");
  const canUseCustomCursor =
    hand &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !reduceMotion;

  if (canUseCustomCursor) {
    let mouseX = window.innerWidth * 0.5;
    let mouseY = window.innerHeight * 0.5;
    let currentX = mouseX;
    let currentY = mouseY;
    let handVisible = false;

    hand.style.opacity = "0";

    function animateHand() {
      currentX += (mouseX - currentX) * 0.18;
      currentY += (mouseY - currentY) * 0.18;

      hand.style.left = `${currentX}px`;
      hand.style.top = `${currentY}px`;

      requestAnimationFrame(animateHand);
    }

    window.addEventListener(
      "mousemove",
      (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;

        if (!handVisible) {
          handVisible = true;
          hand.style.opacity = "1";
        }
      },
      { passive: true }
    );

    window.addEventListener("mouseleave", () => {
      handVisible = false;
      hand.style.opacity = "0";
    });

    window.addEventListener("mouseenter", () => {
      handVisible = true;
      hand.style.opacity = "1";
    });

    animateHand();
  }

  /* =========================
     PARTICLES
  ========================= */
  const canvas = document.getElementById("particles");

  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationId = null;
    let running = true;
    let particles = [];

    const COLORS = [
      [255, 200, 110],
      [255, 145, 55],
      [255, 105, 35],
      [255, 225, 170],
      [165, 165, 165],
      [115, 115, 115]
    ];

    function setCanvasSize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function particleCount() {
      return Math.max(55, Math.min(125, Math.round((width * height) / 9500)));
    }

    function randomColor() {
      return COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    function makeParticle(fromTop = false) {
      const color = randomColor();

      return {
        x: Math.random() * width,
        y: fromTop ? -30 : Math.random() * height,
        size: Math.random() * 2.8 + 0.8,
        speedY: Math.random() * 1.4 + 0.35,
        speedX: (Math.random() - 0.5) * 0.55,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.03 + 0.008,
        opacity: Math.random() * 0.45 + 0.2,
        lifeFade: Math.random() * 0.001 + 0.0007,
        glow: Math.random() > 0.45,
        stretch: Math.random() * 1.8 + 1,
        color
      };
    }

    function buildParticles() {
      particles = [];
      const count = particleCount();

      for (let i = 0; i < count; i += 1) {
        particles.push(makeParticle(false));
      }
    }

    function rgba(color, alpha) {
      return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
    }

    function drawParticle(particle) {
      const fill = rgba(particle.color, particle.opacity);

      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(Math.sin(particle.sway) * 0.25);

      if (particle.glow) {
        ctx.shadowBlur = 12;
        ctx.shadowColor = fill;
      }

      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.ellipse(0, 0, particle.size, particle.size * particle.stretch, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function updateParticle(particle, index) {
      particle.sway += particle.swaySpeed;
      particle.x += Math.sin(particle.sway) * 0.35 + particle.speedX;
      particle.y += particle.speedY;
      particle.opacity -= particle.lifeFade;

      if (
        particle.y > height + 30 ||
        particle.x < -30 ||
        particle.x > width + 30 ||
        particle.opacity <= 0.04
      ) {
        particles[index] = makeParticle(true);
      }
    }

    function animate() {
      if (!running) return;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i += 1) {
        updateParticle(particles[i], i);
        drawParticle(particles[i]);
      }

      animationId = requestAnimationFrame(animate);
    }

    function start() {
      if (running && animationId) return;
      running = true;
      animate();
    }

    function stop() {
      running = false;

      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    }

    setCanvasSize();
    buildParticles();
    start();

    let resizeTimeout;

    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setCanvasSize();
        buildParticles();
      }, 100);
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });
  }
})();

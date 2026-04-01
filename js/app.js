const searchInput = document.getElementById("search");

if (searchInput) {
  searchInput.addEventListener("keyup", function () {
    const input = this.value.toLowerCase();
    const cards = document.querySelectorAll(".card");

    cards.forEach((card) => {
      const name = (card.getAttribute("data-name") || "").toLowerCase();
      card.style.display = name.includes(input) ? "block" : "none";
    });
  });
}

document.addEventListener("mousemove", (e) => {
  const hand = document.querySelector(".zombie-hand");
  if (hand) {
    hand.style.left = `${e.clientX}px`;
    hand.style.top = `${e.clientY}px`;
  }
});

const canvas = document.getElementById("particles");

if (canvas) {
  const ctx = canvas.getContext("2d", { alpha: true });

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const isMobile = window.innerWidth <= 760;
  const emberCount = isMobile ? 45 : 70;
  const embers = [];

  function emberColor() {
    const colors = [
      { fill: "255,190,95", glow: "255,165,70" },
      { fill: "255,135,45", glow: "255,110,35" },
      { fill: "255,220,160", glow: "255,190,110" },
      { fill: "255,95,25", glow: "255,75,18" }
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function createEmber(fromBottom = false) {
    const warm = emberColor();
    const size = Math.random() * 2.4 + 1.2;

    return {
      x: Math.random() * canvas.width,
      y: fromBottom ? canvas.height + Math.random() * 80 : Math.random() * canvas.height,
      width: size * (Math.random() * 1.5 + 0.7),
      height: size * (Math.random() * 1.1 + 0.7),
      speedY: Math.random() * 0.85 + 0.3,
      speedX: (Math.random() - 0.5) * 0.45,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.025 + 0.008,
      alpha: Math.random() * 0.35 + 0.28,
      flicker: Math.random() * 0.025 + 0.008,
      rotation: Math.random() * Math.PI,
      rotationSpeed: (Math.random() - 0.5) * 0.008,
      fill: warm.fill,
      glow: warm.glow
    };
  }

  for (let i = 0; i < emberCount; i += 1) {
    embers.push(createEmber(false));
  }

  function drawEmber(ember) {
    ctx.save();
    ctx.translate(ember.x, ember.y);
    ctx.rotate(ember.rotation);

    const alpha = Math.max(0.08, Math.min(1, ember.alpha));
    ctx.fillStyle = `rgba(${ember.fill}, ${alpha})`;
    ctx.shadowBlur = 8;
    ctx.shadowColor = `rgba(${ember.glow}, ${Math.min(0.9, alpha + 0.15)})`;

    ctx.beginPath();
    ctx.ellipse(0, 0, ember.width, ember.height, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function animateEmbers() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < embers.length; i += 1) {
      const ember = embers[i];

      ember.sway += ember.swaySpeed;
      ember.rotation += ember.rotationSpeed;
      ember.x += Math.sin(ember.sway) * 0.25 + ember.speedX;
      ember.y -= ember.speedY;
      ember.alpha += (Math.random() - 0.5) * ember.flicker;

      if (
        ember.y < -30 ||
        ember.x < -30 ||
        ember.x > canvas.width + 30
      ) {
        embers[i] = createEmber(true);
        continue;
      }

      drawEmber(ember);
    }

    ctx.shadowBlur = 0;
    requestAnimationFrame(animateEmbers);
  }

  animateEmbers();
}

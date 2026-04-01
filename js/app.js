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
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const isMobile = window.innerWidth <= 760;
  const emberCount = isMobile ? 120 : 180;
  const embers = [];

  function emberColor() {
    const colors = [
      { fill: "255,210,120", glow: "255,190,90" },
      { fill: "255,170,70", glow: "255,145,50" },
      { fill: "255,125,45", glow: "255,95,25" },
      { fill: "255,95,25", glow: "255,70,15" },
      { fill: "255,230,170", glow: "255,200,120" }
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function createEmber(fromBottom = false) {
    const warm = emberColor();
    const size = Math.random() * 4.8 + 1.8;

    return {
      x: Math.random() * canvas.width,
      y: fromBottom ? canvas.height + Math.random() * 160 : Math.random() * canvas.height,
      baseSize: size,
      width: size * (Math.random() * 2.3 + 0.9),
      height: size * (Math.random() * 1.5 + 0.8),
      speedY: Math.random() * 1.5 + 0.45,
      speedX: (Math.random() - 0.5) * 0.9,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.05 + 0.012,
      alpha: Math.random() * 0.5 + 0.35,
      flicker: Math.random() * 0.07 + 0.02,
      rotation: Math.random() * Math.PI,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      fill: warm.fill,
      glow: warm.glow,
      trail: Math.random() > 0.45
    };
  }

  for (let i = 0; i < emberCount; i += 1) {
    embers.push(createEmber(false));
  }

  function drawEmber(ember) {
    ctx.save();
    ctx.translate(ember.x, ember.y);
    ctx.rotate(ember.rotation);

    const alpha = Math.max(0, Math.min(1, ember.alpha));

    if (ember.trail) {
      const trailGradient = ctx.createLinearGradient(0, ember.height * 3.2, 0, 0);
      trailGradient.addColorStop(0, `rgba(${ember.glow}, 0)`);
      trailGradient.addColorStop(0.35, `rgba(${ember.glow}, ${alpha * 0.18})`);
      trailGradient.addColorStop(1, `rgba(${ember.glow}, ${alpha * 0.42})`);

      ctx.fillStyle = trailGradient;
      ctx.shadowBlur = ember.baseSize * 10;
      ctx.shadowColor = `rgba(${ember.glow}, ${Math.min(1, alpha + 0.2)})`;

      ctx.beginPath();
      ctx.ellipse(
        0,
        ember.height * 1.45,
        ember.width * 0.45,
        ember.height * 2.8,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.fillStyle = `rgba(${ember.fill}, ${alpha})`;
    ctx.shadowBlur = ember.baseSize * 11;
    ctx.shadowColor = `rgba(${ember.glow}, ${Math.min(1, alpha + 0.22)})`;

    ctx.beginPath();
    ctx.ellipse(0, 0, ember.width, ember.height, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 245, 225, ${alpha * 0.42})`;
    ctx.beginPath();
    ctx.ellipse(
      -ember.width * 0.12,
      -ember.height * 0.12,
      ember.width * 0.38,
      ember.height * 0.3,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
  }

  function animateEmbers() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < embers.length; i += 1) {
      const ember = embers[i];

      ember.sway += ember.swaySpeed;
      ember.rotation += ember.rotationSpeed;
      ember.x += Math.sin(ember.sway) * 0.55 + ember.speedX;
      ember.y -= ember.speedY;
      ember.alpha += (Math.random() - 0.5) * ember.flicker;

      if (
        ember.y < -60 ||
        ember.x < -80 ||
        ember.x > canvas.width + 80
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

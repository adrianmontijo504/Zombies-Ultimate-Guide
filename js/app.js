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
  const emberCount = isMobile ? 70 : 110;
  const embers = [];

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
      x: Math.random() * canvas.width,
      y: fromBottom ? canvas.height + Math.random() * 120 : Math.random() * canvas.height,
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

  for (let i = 0; i < emberCount; i += 1) {
    embers.push(createEmber(false));
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
    ctx.ellipse(-ember.width * 0.15, -ember.height * 0.12, ember.width * 0.35, ember.height * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function animateEmbers() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < embers.length; i += 1) {
      const ember = embers[i];

      ember.sway += ember.swaySpeed;
      ember.rotation += ember.rotationSpeed;
      ember.x += Math.sin(ember.sway) * 0.35 + ember.speedX;
      ember.y -= ember.speedY;
      ember.alpha += (Math.random() - 0.5) * ember.flicker;

      if (
        ember.y < -40 ||
        ember.x < -60 ||
        ember.x > canvas.width + 60
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

const searchInput = document.getElementById("search");
if (searchInput) {
  searchInput.addEventListener("keyup", function () {
    const input = this.value.toLowerCase();
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
      const name = (card.getAttribute("data-name") || "").toLowerCase();
      card.style.display = name.includes(input) ? "block" : "none";
    });
  });
}

// flame cursor
document.addEventListener("mousemove", e => {
  const flame = document.querySelector(".cursor-flame");
  if (flame) {
    flame.style.left = e.clientX + "px";
    flame.style.top = e.clientY + "px";
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

  const particles = [];
  const particleCount = 70;

  function randomAshColor() {
    const colors = [
      "rgba(255, 180, 80, 0.85)",
      "rgba(255, 120, 40, 0.80)",
      "rgba(255, 210, 140, 0.70)",
      "rgba(160, 160, 160, 0.45)",
      "rgba(110, 110, 110, 0.35)"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function createParticle(resetFromTop = false) {
    return {
      x: Math.random() * canvas.width,
      y: resetFromTop ? -20 : Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speedY: Math.random() * 1.6 + 0.6,
      speedX: (Math.random() - 0.5) * 0.8,
      drift: Math.random() * 0.03 + 0.01,
      sway: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.5 + 0.3,
      color: randomAshColor()
    };
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(createParticle(false));
  }

  function drawParticle(p) {
    ctx.beginPath();
    ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${p.opacity})`);
    ctx.shadowBlur = 12;
    ctx.shadowColor = p.color;
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.sway += p.drift;
      p.x += Math.sin(p.sway) * 0.4 + p.speedX;
      p.y += p.speedY;

      p.opacity -= 0.0015;

      if (
        p.y > canvas.height + 20 ||
        p.x < -20 ||
        p.x > canvas.width + 20 ||
        p.opacity <= 0.05
      ) {
        particles[i] = createParticle(true);
        continue;
      }

      drawParticle(p);
    }

    ctx.shadowBlur = 0;
    requestAnimationFrame(animateParticles);
  }

  animateParticles();
}

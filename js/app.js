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

/* flame cursor */
document.addEventListener("mousemove", (e) => {
  const flame = document.querySelector(".cursor-flame");
  if (flame) {
    flame.style.left = `${e.clientX}px`;
    flame.style.top = `${e.clientY}px`;
  }
});

/* falling ash particles */
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
  const particleCount = 90;

  function randomAshColor() {
    const colors = [
      "rgba(255, 180, 80, 0.92)",
      "rgba(255, 120, 40, 0.86)",
      "rgba(255, 210, 140, 0.75)",
      "rgba(170, 170, 170, 0.45)",
      "rgba(120, 120, 120, 0.34)"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function createParticle(resetFromTop = false) {
    return {
      x: Math.random() * canvas.width,
      y: resetFromTop ? -20 : Math.random() * canvas.height,
      size: Math.random() * 3.6 + 1,
      speedY: Math.random() * 1.8 + 0.55,
      speedX: (Math.random() - 0.5) * 0.8,
      drift: Math.random() * 0.03 + 0.01,
      sway: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.5 + 0.3,
      color: randomAshColor()
    };
  }

  for (let i = 0; i < particleCount; i += 1) {
    particles.push(createParticle(false));
  }

  function drawParticle(particle) {
    ctx.beginPath();
    ctx.fillStyle = particle.color.replace(/[\d.]+\)$/, `${particle.opacity})`);
    ctx.shadowBlur = 12;
    ctx.shadowColor = particle.color;
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i += 1) {
      const particle = particles[i];

      particle.sway += particle.drift;
      particle.x += Math.sin(particle.sway) * 0.4 + particle.speedX;
      particle.y += particle.speedY;
      particle.opacity -= 0.0013;

      if (
        particle.y > canvas.height + 20 ||
        particle.x < -20 ||
        particle.x > canvas.width + 20 ||
        particle.opacity <= 0.05
      ) {
        particles[i] = createParticle(true);
        continue;
      }

      drawParticle(particle);
    }

    ctx.shadowBlur = 0;
    requestAnimationFrame(animateParticles);
  }

  animateParticles();
}

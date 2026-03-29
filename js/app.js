// SEARCH
document.getElementById("search").addEventListener("keyup", function() {
  let input = this.value.toLowerCase();
  let cards = document.querySelectorAll(".card");

  cards.forEach(card => {
    let name = card.getAttribute("data-name");
    card.style.display = name.includes(input) ? "block" : "none";
  });
});

// CURSOR GLOW
document.addEventListener("mousemove", e => {
  const glow = document.querySelector(".cursor-glow");
  glow.style.left = e.clientX + "px";
  glow.style.top = e.clientY + "px";
});

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

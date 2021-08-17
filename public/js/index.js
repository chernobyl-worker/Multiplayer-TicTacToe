// Name field Useless for now...

const online = document.querySelector('#online');
const offline = document.querySelector('#offline');
const playerName = document.querySelector('.name-for-online-game');

online.addEventListener("click", (e) => {
  playerName.style.display = "block";
});

offline.addEventListener("click", () => {
  playerName.style.display = "none";
});
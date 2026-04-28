const screens = document.querySelectorAll(".screen");
const chooseSweetBtns = document.querySelectorAll(".choose-sweet-btn");
const startButton = document.getElementById("start-btn");
const gameNode = document.getElementById("game-container");
const timeEl = document.getElementById("time");
const scoreEl = document.getElementById("score");
const message = document.getElementById("message");

let seconds = 0;
let score = 0;
let selectedSweet = {};
let timerInterval;

let playerName = "";
const nameInput = document.getElementById("player-name");

let maxTime = 30;

startButton.addEventListener("click", () => {
  if (nameInput.value.trim() === "") {
    alert("Enter your name!");
    return;
  }

  playerName = nameInput.value;

  screens[0].classList.remove("visible");
  screens[1].classList.add("visible");
});

chooseSweetBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const img = btn.querySelector("img");
    const src = img.getAttribute("src");
    const alt = img.getAttribute("alt");

    selectedSweet = { src, alt };

    screens[1].classList.remove("visible");
    screens[2].classList.add("visible");

    startGame();
    setTimeout(createSweet, 1000);
  });
});

function startGame() {
  seconds = 0;
  score = 0;

  clearInterval(timerInterval);

  scoreEl.innerHTML = "Score: 0";
  timeEl.innerHTML = `Time: ${maxTime}`;

  const sweets = document.querySelectorAll(".sweet");
  sweets.forEach((sweet) => sweet.remove());

  timerInterval = setInterval(increaseTime, 1000);
}

function increaseTime() {
  seconds++;

  let remaining = maxTime - seconds;

  if (remaining <= 0) {
    endGame();
    return;
  }

  remaining = remaining < 10 ? `0${remaining}` : remaining;

  timeEl.innerHTML = `Time: ${remaining}`;
}

function createSweet() {
  const { x, y } = getRandomLocation();

  const sweet = document.createElement("img");
  sweet.classList.add("sweet");
  sweet.src = selectedSweet.src;
  sweet.alt = selectedSweet.alt;

  sweet.style.top = `${y}px`;
  sweet.style.left = `${x}px`;
  sweet.style.transform = `rotate(${Math.random() * 360}deg)`;

  sweet.addEventListener("click", catchSweet);

  gameNode.appendChild(sweet);
}

function getRandomLocation() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const x = Math.random() * (width - 200) + 100;
  const y = Math.random() * (height - 200) + 100;

  return { x, y };
}

function playBiteSound() {
  const audio = document.getElementById("bite");
  audio.play();
}

function catchSweet() {
  playBiteSound();
  increaseScore();

  this.remove();
  addSweets();
}

function addSweets() {
  setTimeout(createSweet, 1000);
  setTimeout(createSweet, 1500);
}

function increaseScore() {
  score++;

  if (score > 19) {
    message.classList.add("visible");
  }

  scoreEl.innerHTML = `Score: ${score}`;
}

function endGame() {
  clearInterval(timerInterval);

  alert(`Game Over! ${playerName}, your score: ${score}`);

  saveResult().then(() => {
    loadScores();
  });

  screens[2].classList.remove("visible");
  screens[0].classList.add("visible");

  nameInput.value = "";
}

function saveResult() {
  return fetch("/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: playerName,
      score: score,
    }),
  });
}

function loadScores() {
  fetch("/scores")
    .then((res) => res.json())
    .then((data) => {
      const list = document.getElementById("leaderboard");
      list.innerHTML = "";

      data.forEach((item, index) => {
        const li = document.createElement("li");
        li.innerText = `${index + 1}. ${item.name} — ${item.score}`;
        list.appendChild(li);
      });
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadScores();
});

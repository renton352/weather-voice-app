const characterSelect = document.getElementById("character-select");
const backgroundSelect = document.getElementById("background-select");
const characterImg = document.getElementById("character-img");
const backgroundImg = document.getElementById("background-img");
const serifDiv = document.getElementById("serif");

async function loadCharacters() {
  const res = await fetch("data/characters.json");
  const characters = await res.json();
  characters.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    characterSelect.appendChild(opt);
  });
}

async function loadBackgrounds() {
  const backgrounds = ["bg_morning.jpg", "bg_afternoon.jpg", "bg_night.jpg"];
  backgrounds.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    backgroundSelect.appendChild(opt);
  });
}

async function loadCharacterData(name) {
  try {
    const res = await fetch(`data/${name}.json`);
    const data = await res.json();
    const now = new Date();
    const hour = now.getHours();
    const time = hour < 10 ? "morning" : hour < 17 ? "afternoon" : "night";
    const weather = await getWeather();
    const key = `${time}_${weather}`;
    characterImg.src = `images/${name}_${data[key].expression}.png`;
    serifDiv.textContent = data[key].serif;
  } catch (err) {
    console.error("データ読み込みエラー:", err);
    serifDiv.textContent = "セリフの読み込みに失敗しました";
  }
}

async function getWeather() {
  const key = "a8bc86e4c135f3c44f72bb4b957aa213";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=Tokyo&appid=${key}&units=metric&lang=ja`;
  const res = await fetch(url);
  const json = await res.json();
  const id = json.weather[0].id;
  if (id < 600) return "cloudy";
  if (id < 700) return "snowy";
  return "sunny";
}

characterSelect.addEventListener("change", () => {
  const char = characterSelect.value;
  loadCharacterData(char);
});
backgroundSelect.addEventListener("change", () => {
  backgroundImg.src = "images/" + backgroundSelect.value;
});

loadCharacters().then(() => {
  const url = new URLSearchParams(window.location.search);
  const selected = url.get("character") || "alice";
  characterSelect.value = selected;
  loadCharacterData(selected);
});
loadBackgrounds();

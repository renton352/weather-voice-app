
async function init() {
  const character = getQueryParam("character") || "alice";
  try {
    const characterList = await fetch("data/characters.json").then(res => res.json());
    const select = document.getElementById("characterSelect");
    characterList.forEach(c => {
      const option = document.createElement("option");
      option.value = c.id;
      option.textContent = c.name;
      if (c.id === character) option.selected = true;
      select.appendChild(option);
    });

    const weather = await getWeather();
    const time = getTimePeriod();
    const charData = await fetch(`data/${character}.json`).then(res => res.json());

    const key = `${time}_${weather}`;
    const data = charData[key] || {};
    document.getElementById("characterImg").src = `images/${data.image || 'default.png'}`;
    document.getElementById("serif").textContent = data.text || "セリフがありません";
    document.getElementById("backgroundImg").src = `images/bg_${time}.png`;
  } catch (err) {
    console.error("初期化エラー:", err);
    document.getElementById("serif").textContent = "セリフの読み込みに失敗しました";
  }
}

function getQueryParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

function getTimePeriod() {
  const hour = new Date().getHours();
  if (hour < 6) return "night";
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "night";
}

async function getWeather() {
  const apiKey = "a8bc86e4c135f3c44f72bb4b957aa213";
  const city = "Tokyo";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=ja`;
  const res = await fetch(url);
  const data = await res.json();
  return data.weather[0].main.toLowerCase(); // e.g., "clear", "clouds", "rain"
}

window.addEventListener("DOMContentLoaded", init);

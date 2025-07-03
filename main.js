const apiKey = "a8bc86e4c135f3c44f72bb4b957aa213";
const city = "Tokyo";

document.addEventListener("DOMContentLoaded", async () => {
  const characterSelect = document.getElementById("characterSelect");
  const backgroundSelect = document.getElementById("backgroundSelect");

  const charactersRes = await fetch("data/characters.json");
  const characters = await charactersRes.json();

  characters.forEach((char) => {
    const option = document.createElement("option");
    option.value = char;
    option.textContent = char.charAt(0).toUpperCase() + char.slice(1);
    characterSelect.appendChild(option);
  });

  characterSelect.value = getURLParam("character") || characters[0];

  backgroundSelect.addEventListener("change", () => {
    const bg = backgroundSelect.value;
    document.getElementById("backgroundImage").src = bg !== "default" ? `img/${bg}` : "";
  });

  characterSelect.addEventListener("change", () => {
    updateContent();
  });

  updateContent();
});

function getURLParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

async function updateContent() {
  const character = document.getElementById("characterSelect").value;

  document.getElementById("message").textContent = "セリフを読み込み中…";

  const timeSlot = getTimeSlot();
  const weather = await getWeather();

  loadCharacterData(character, timeSlot, weather);
}

function getTimeSlot() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "night";
}

async function getWeather() {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&lang=ja`);
    const data = await res.json();
    const id = data.weather[0].id;

    if (id < 600) return "rain"; // 雨や曇り
    if (id < 700) return "snow"; // 雪
    if (id < 800) return "cloudy";
    if (id === 800) return "clear";
    return "cloudy";
  } catch (e) {
    console.error("天気取得エラー", e);
    return "clear"; // fallback
  }
}

function getBackgroundImageName(timeSlot, weather) {
  return `img/bg_${timeSlot}_${weather}.png`;
}

async function loadCharacterData(characterName, timeSlot, weather) {
  try {
    const res = await fetch(`data/${characterName}.json`);
    const data = await res.json();

    const expressionKey = `${timeSlot}_${weather}`;
    const expression = data.expressions?.[expressionKey] || data.defaultExpression || "normal";
    const message = data.messages?.[expressionKey] || data.defaultMessage || "こんにちは！";

    document.getElementById("characterImage").src = `img/${characterName}_${expression}.png`;
    document.getElementById("backgroundImage").src = getBackgroundImageName(timeSlot, weather);
    document.getElementById("message").textContent = message;
  } catch (error) {
    console.error("データ読み込みエラー:", error);
    document.getElementById("message").textContent = "セリフの読み込みに失敗しました";
  }
}
